/**
 * Binds raster and vector layer references in an AST by fetching them from a provided cache
 * and rasterizing any vector-based functions (e.g. mask, distance_to, category, etc).
 *
 * Input:
 *   - AST produced by `parseExpression()`
 *   - LayerCache: object with `get(name: string)` → Promise<Raster | Vector | { data: Raster }>
 *
 * Output:
 *   - AST with all LayerNode `source` fields populated with RasterData or Vector
 *   - Vector-to-raster functions are resolved to synthetic BoundLayerNode (with sourceType: 'raster')
 */

import { ASTNode, ASTNodeMap, LayerNode, FunctionNode } from './parser';
import { rasterizeVectorFunction, Raster } from './rasterize';
import { RasterData, GeoTiffMetadata } from '../types/geotiff';
import { clipRasterToBounds, isGeospatiallyAligned } from './alignraster';

export interface Vector {}

export interface BoundLayerNode extends LayerNode {
  source?: RasterData | (Vector & { metadata?: GeoTiffMetadata });
  sourceType?: 'raster' | 'vector';
  error?: Error;
}

export interface LayerDataCache {
  get(name: string): Promise<any>;
}

const rasterizationFunctions = ['mask', 'label', 'category', 'distance_to', 'edge', 'within'];

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function bindLayers(
  ast: ASTNode | ASTNodeMap,
  cache: LayerDataCache,
  onProgress?: (layerName: string) => void
): Promise<ASTNode | ASTNodeMap> {
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

  await Promise.all(Array.from(layerNames).map(async name => {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const layer = await cache.get(name, 'aoiBufferBounds'); 

        console.log('---------->[binder] layer', layer);

        const resolved =
          layer &&
          typeof layer === 'object' &&
          'data' in layer &&
          ArrayBuffer.isView(layer.data) &&
          'width' in layer &&
          'height' in layer
            ? layer
            : 'data' in layer && 'width' in layer.data
              ? { ...layer.data, metadata: layer.metadata }
              : layer;

        layerResults.set(name, resolved);
        onProgress?.(name);

        const isVector = resolved && Array.isArray(resolved.features);

        if (!referenceRaster && !isVector) {
          referenceRaster = resolved;
        }

        if (isVector) {
          for (const fn of rasterizationFunctions) {
            const syntheticId = `__${fn}_${name}`;
            if (!rasterizedResults.has(syntheticId)) {
              rasterizedResults.set(
                syntheticId,
                rasterizeVectorFunction(fn, name, resolved, referenceRaster?.metadata ?? null)
              );
            }
          }
        }
        return;
      } catch (err) {
        attempts++;
        console.error(`[binder] Failed to fetch layer "${name}" (attempt ${attempts}):`, err);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to fetch layer "${name}" after ${maxAttempts} attempts: ${err instanceof Error ? err.message : String(err)}`);
        }
        await delay(500);
      }
    }
  }));

  for (const name of layerNames) {
    if (!layerResults.has(name)) {
      throw new Error(`Missing required layer: ${name}`);
    }
  }

  if (referenceRaster) {
    for (const [name, layer] of layerResults) {
      if ('source' in layer && layer.source && 'rasterArray' in layer.source) {
        const sourceRaster = layer.source;

        if (isGeospatiallyAligned(sourceRaster, referenceRaster)) {
          if (sourceRaster.width !== referenceRaster.width || sourceRaster.height !== referenceRaster.height) {
            console.warn(`[binder] Geospatially aligned but size mismatch for "${name}", clipping to reference bounds`);
            const clippedSource = clipRasterToBounds(sourceRaster, referenceRaster);
            const clippedLayer = { ...layer, source: clippedSource };
            layerResults.set(name, clippedLayer);
          }
        } else {
          throw new Error(`Layer "${name}" is not geospatially aligned with the reference grid.`);
        }
      }
    }
  }

  async function walk(node: ASTNode): Promise<ASTNode> {
    if (visited.has(node)) return visited.get(node)!;

    if (node.type === 'layer') {
      const entry = layerResults.get(node.name);
      const bound: BoundLayerNode = 'source' in node || 'error' in node ? node : {
        ...node,
        ...(entry instanceof Error
          ? { error: entry }
          : {
              source: entry,
              sourceType: Array.isArray(entry?.features) ? 'vector' : 'raster'
            })
      };
      visited.set(node, bound);
      return bound;
    }

    if (node.type === 'function' && rasterizationFunctions.includes(node.name)) {
      const args = await Promise.all(node.args.map(walk));
      const out: FunctionNode = {
        ...node,
        args
      };
      visited.set(node, out);
      return out;
    }

    if ('op' in node) {
      if ('left' in node && 'right' in node) {
        if (!node.left || !node.right) {
          throw new Error(`Operator ${node.op} missing left or right operand`);
        }
        const newLeft = await walk(node.left);
        const newRight = await walk(node.right);
        const out = {
          ...node,
          left: newLeft,
          right: newRight
        };
        visited.set(node, out);
        return out;
      }
      if ('expr' in node) {
        const out = { ...node, expr: await walk(node.expr) };
        visited.set(node, out);
        return out;
      }
      if ('condition' in node && 'trueExpr' in node && 'falseExpr' in node) {
        const out = {
          ...node,
          condition: await walk(node.condition),
          trueExpr: await walk(node.trueExpr),
          falseExpr: await walk(node.falseExpr)
        };
        visited.set(node, out);
        return out;
      }
      if ('layer' in node) {
        const out: any = {
          ...node,
          layer: await walk(node.layer)
        };
        if ('values' in node) out.values = await Promise.all(node.values.map(walk));
        if ('low' in node && 'high' in node) {
          out.low = await walk(node.low);
          out.high = await walk(node.high);
        }
        visited.set(node, out);
        return out;
      }
    }

    if (typeof node === 'object' && !('type' in node) && !('op' in node)) {
      const out: ASTNodeMap = {};
      for (const key in node) {
        out[key] = await walk(node[key]);
      }
      return out;
    }

    return node;
  }

  return await walk(ast);
}
