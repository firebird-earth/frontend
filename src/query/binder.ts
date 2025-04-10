// geoQueryBinder.ts (Module)

/**
 * Binds raster and vector layer references in an AST by fetching them from a provided cache.
 *
 * Input:
 *   - AST produced by `parseExpression()`
 *   - LayerCache: object with `getLayer(name: string)` → Promise<Raster | Vector>
 *
 * Output:
 *   - New AST with all `LayerNode`s replaced with nodes of shape:
 *       { type: 'layer', name: 'burn', source: Raster | Vector }
 *     or
 *       { type: 'layer', name: 'burn', error: Error } if fetch fails
 *
 * Example:
 *   Input node:
 *     { op: 'AND', left: { type: 'layer', name: 'burn' }, right: { type: 'literal', value: 1 } }
 *
 *   Output node:
 *     {
 *       op: 'AND',
 *       left: { type: 'layer', name: 'burn', source: [Raster] },
 *       right: { type: 'literal', value: 1 }
 *     }
 *
 * Usage:
 *   const boundAST = await bindLayers(ast, myCache);
 */

import { ASTNode, ASTNodeMap, LayerNode } from './parser';

export interface Raster {}
export interface Vector {}

export interface BoundLayerNode extends LayerNode {
  source?: Raster | Vector;
  error?: Error;
}

export interface LayerCache {
  get(name: string): Promise<Raster | Vector>;
}

export async function bindLayers(
  ast: ASTNode | ASTNodeMap,
  cache: LayerCache,
  onProgress?: (layerName: string) => void
): Promise<ASTNode | ASTNodeMap> {
  const visited = new Map<ASTNode, ASTNode>();
  const layerNames = new Set<string>();

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

  const layerCache = new Map<string, Raster | Vector | Error>();
  await Promise.all(Array.from(layerNames).map(async name => {
    try {
      const layer = await cache.get(name);
      layerCache.set(name, layer);
      onProgress?.(name);
    } catch (err) {
      layerCache.set(name, err instanceof Error ? err : new Error(String(err)));
    }
  }));

  async function walk(node: ASTNode): Promise<ASTNode> {
    if (visited.has(node)) return visited.get(node)!;

    if (node.type === 'layer') {
      const entry = layerCache.get(node.name);
      const bound: BoundLayerNode = 'source' in node || 'error' in node ? node : {
        ...node,
        ...(entry instanceof Error ? { error: entry } : { source: entry })
      };
      visited.set(node, bound);
      return bound;
    }

    if ('op' in node) {
      if ('expr' in node) {
        const out = { ...node, expr: await walk(node.expr) };
        visited.set(node, out);
        return out;
      }
      if ('left' in node && 'right' in node) {
        const out = {
          ...node,
          left: await walk(node.left),
          right: await walk(node.right)
        };
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
      if ('args' in node) {
        const out = {
          ...node,
          args: await Promise.all(node.args.map(walk))
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
