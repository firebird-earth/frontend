/**
 * Binds raster and vector layer references in an AST by fetching them from a provided cache
 * and rasterizing vector-based functions (e.g. mask, distance_to, category, etc).
 *
 * Input:
 *   - AST produced by `parseExpression()`
 *   - LayerCache: object with `get(name: string)` → Promise<Raster | Vector | { data: Raster }>
 *
 * Output:
 *   - AST with all LayerNode `source` fields populated with RasterData or Vector
 *   - Vector-to-raster functions are resolved to synthetic BoundLayerNode (with sourceType: 'raster')
 */

import { RasterData, GeoTiffMetadata } from '../types/geotiff';
import { ASTNode, ASTNodeMap, LayerNode, FunctionNode } from './parser';
import { Raster } from '../rasterize/rasterize';
import { clipRasterToBounds, isGeospatiallyAligned } from '../rasterize/alignRaster';
import { buildReferenceRasterFromMetadata } from '../rasterize/referenceRaster';
import RasterWorker from '../rasterize/rasterize.worker.ts?worker';

export interface Vector {}

export interface BoundLayerNode extends LayerNode {
  source?: RasterData | (Vector & { metadata?: GeoTiffMetadata });
  sourceType?: 'raster' | 'vector';
  error?: Error;
}

export interface LayerDataCache {
  get(name: string, boundsOption?: string): Promise<any>;
}

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[BindExpression]', ...args);
}

const rasterizationFunctions = ['mask', 'label', 'category', 'distance_to', 'edge', 'within'];

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

// --- START of worker-based rasterizer helper updates ---

let _rasterReqId = 0;
const rasterWorker = new RasterWorker();

function rasterizeInWorker(
  fnName: string,
  layerName: string,
  vectorData: Vector,
  referenceMetadata?: GeoTiffMetadata,
  attributeField?: string
): Promise<Raster> {
  const id = ++_rasterReqId;
  return new Promise((resolve, reject) => {
    function handler(e: MessageEvent<any>) {
      const d = e.data as { id: number; success: boolean; payload?: any; error?: string };
      if (d.id !== id) return;
      rasterWorker.removeEventListener('message', handler);
      if (!d.success) return reject(new Error(d.error));
      resolve(d.payload as Raster);
    }
    rasterWorker.addEventListener('message', handler);
    rasterWorker.postMessage({ id, fnName, layerName, vectorData, referenceMetadata, attributeField });
  });
}

// --- END of worker-based rasterizer helper updates ---

function collectRasterFns(ast: ASTNode | ASTNodeMap): Map<string, Set<string>> {
  const needed = new Map<string, Set<string>>();
  function recurse(node: ASTNode | ASTNodeMap) {
    if (!node || typeof node !== 'object') return;
    if ('type' in node && node.type === 'function' && rasterizationFunctions.includes(node.name)) {
      const fn = node.name;
      const firstArg = (node as FunctionNode).args[0];
      if (firstArg && firstArg.type === 'layer') {
        const set = needed.get(firstArg.name) ?? new Set<string>();
        set.add(fn);
        needed.set(firstArg.name, set);
      }
    }
    for (const child of Object.values(node as any)) {
      recurse(child);
    }
  }
  recurse(ast);
  return needed;
}

export async function bindLayers(
  ast: ASTNode | ASTNodeMap,
  cache: LayerDataCache,
  onProgress?: (layerName: string) => void
): Promise<ASTNode | ASTNodeMap> {
  const neededFnsByLayer = collectRasterFns(ast);

  const visited = new Map<ASTNode, ASTNode>();
  const layerNames = new Set<string>();
  const layerResults = new Map<string, any>();
  const rasterizedResults = new Map<string, Promise<RasterData>>();
  let referenceRaster: RasterData | null = null;

  function collectLayers(node: ASTNode | ASTNodeMap) {
    if (typeof node !== 'object' || !node) return;
    if ('type' in node && node.type === 'layer') {
      layerNames.add(node.name);
    } else if ('op' in node || 'type' in node) {
      Object.values(node).forEach(collectLayers);
    } else {
      Object.values(node as ASTNodeMap).forEach(collectLayers);
    }
  }
  collectLayers(ast);

  await Promise.all(
    Array.from(layerNames).map(async name => {
      let attempts = 0;
      while (attempts < 2) {
        try {
          const layer = await cache.get(name, 'aoiBufferBounds');
          log('[binder] layer', layer);

          const resolved =
            layer && typeof layer === 'object' && 'data' in layer && ArrayBuffer.isView(layer.data) && 'width' in layer && 'height' in layer
              ? layer
              : 'data' in layer && 'width' in layer.data
              ? { ...layer.data, metadata: layer.metadata }
              : layer;

          layerResults.set(name, resolved);
          onProgress?.(name);

          const isVector = Array.isArray((resolved as any).features);
          if (!referenceRaster && !isVector) {
            referenceRaster = resolved as RasterData;
          }

          if (isVector) {
            // Use a clear name for the raw feature-layer metadata
            const featureLayerMeta = (resolved as any).metadata as any;

            // Build our reference grid once from that metadata, before any rasterization
            if (!referenceRaster) {
              referenceRaster = buildReferenceRasterFromMetadata(featureLayerMeta);
            }

            // Always draw against that single referenceRaster’s metadata
            const refMeta = referenceRaster.metadata;

            const needed = neededFnsByLayer.get(name) || new Set<string>();
            for (const fn of needed) {
              const id = `__${fn}_${name}`;
              if (!rasterizedResults.has(id)) {
                rasterizedResults.set(id, rasterizeInWorker(fn, name, resolved, refMeta));
              }
            }
          }

          return;
        } catch (err) {
          attempts++;
          console.error(`[binder] Failed to fetch layer "${name}" (attempt ${attempts})`, err);
          if (attempts >= 2) throw err;
          await delay(500);
        }
      }
    })
  );

  for (const name of layerNames) {
    if (!layerResults.has(name)) throw new Error(`Missing required layer: ${name}`);
  }

  if (referenceRaster) {
    for (const [name, layer] of layerResults) {
      if ('source' in layer && layer.source && 'rasterArray' in layer.source) {
        const sr = layer.source as RasterData;
        if (isGeospatiallyAligned(sr, referenceRaster)) {
          if (sr.width !== referenceRaster.width || sr.height !== referenceRaster.height) {
            console.warn(`[binder] size mismatch for "${name}", clipping`);
            const clipped = clipRasterToBounds(sr as any, referenceRaster);
            layerResults.set(name, { ...layer, source: clipped });
          }
        } else {
          throw new Error(`Layer "${name}" is not aligned with reference grid.`);
        }
      }
    }
  }

  // If we still have no raster yet, build one from the first vector layer’s metadata
  if (!referenceRaster) {
    for (const [name, entry] of layerResults) {
      if (Array.isArray((entry as any).features) && entry.metadata) {
        referenceRaster = buildReferenceRasterFromMetadata(entry.metadata as any);
        break;
      }
    }
  }

  async function walk(node: ASTNode): Promise<ASTNode> {
    if (visited.has(node)) return visited.get(node)!;

    if (node.type === 'layer') {
      const entry = layerResults.get(node.name);
      const bound: BoundLayerNode =
        'source' in node || 'error' in node
          ? node as any
          : {
              ...node,
              ...(entry instanceof Error
                ? { error: entry }
                : { source: entry, sourceType: Array.isArray((entry as any).features) ? 'vector' : 'raster' }),
            };
      visited.set(node, bound);
      return bound;
    }

    if (node.type === 'function' && rasterizationFunctions.includes(node.name)) {
      const fnNode = node as FunctionNode;
      if (fnNode.args.length === 1) {
        const layerArg = (await walk(fnNode.args[0])) as BoundLayerNode;
        const syntheticId = `__${fnNode.name}_${layerArg.name}`;
        const raster = await rasterizedResults.get(syntheticId)!;
        const bound: BoundLayerNode = {
          type: 'layer',
          name: syntheticId,
          source: raster,
          sourceType: 'raster',
        };
        visited.set(node, bound);
        return bound;
      } else {
        const args = await Promise.all(fnNode.args.map(walk));
        const out: FunctionNode = { ...fnNode, args };
        visited.set(node, out);
        return out;
      }
    }

    // handle binary / unary ops
    if ('op' in node) {
      if ('left' in node && 'right' in node) {
        const left = await walk(node.left!);
        const right = await walk(node.right!);
        const out = { ...node, left, right };
        visited.set(node, out);
        return out;
      }
      if ('expr' in node) {
        const out = { ...node, expr: await walk(node.expr!) };
        visited.set(node, out);
        return out;
      }
      if ('condition' in node && 'trueExpr' in node && 'falseExpr' in node) {
        const out = {
          ...node,
          condition: await walk(node.condition!),
          trueExpr: await walk(node.trueExpr!),
          falseExpr: await walk(node.falseExpr!),
        };
        visited.set(node, out);
        return out;
      }
      if ('layer' in node) {
        const out: any = { ...node, layer: await walk(node.layer!) };
        if ('values' in node) out.values = await Promise.all((node as any).values.map(walk));
        if ('low' in node && 'high' in node) {
          out.low = await walk((node as any).low);
          out.high = await walk((node as any).high);
        }
        visited.set(node, out);
        return out;
      }
    }

    // object map
    if (typeof node === 'object' && !('type' in node) && !('op' in node)) {
      const m: ASTNodeMap = {};
      for (const k in node) {
        m[k] = await walk((node as any)[k]);
      }
      return m;
    }

    return node;
  }

  return await walk(ast);
}
