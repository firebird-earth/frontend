// walkAST.ts
import { ASTNode, ASTNodeMap, FunctionNode, LayerNode } from './parser';
import { RasterData } from '../types/geotiff';
import { BoundLayerNode } from './binder';

const rasterizationFunctions = ['mask', 'label', 'category', 'distance_to', 'edge', 'within'];

export async function walkAST(
  node: ASTNode,
  layerResults: Map<string, any>,
  rasterizedResults: Map<string, Promise<RasterData>>,
  visited = new Map<ASTNode, ASTNode>()
): Promise<ASTNode> {
  if (visited.has(node)) return visited.get(node)!;

  if (node.type === 'layer') {
    const entry = layerResults.get(node.name);
    const bound: BoundLayerNode =
      'source' in node || 'error' in node
        ? (node as any)
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
      const layerArg = (await walkAST(fnNode.args[0], layerResults, rasterizedResults)) as BoundLayerNode;
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
      const args = await Promise.all(fnNode.args.map(arg => walkAST(arg, layerResults, rasterizedResults)));
      const out: FunctionNode = { ...fnNode, args };
      visited.set(node, out);
      return out;
    }
  }

  if ('op' in node) {
    if ('left' in node && 'right' in node) {
      const left = await walkAST(node.left!, layerResults, rasterizedResults, visited);
      const right = await walkAST(node.right!, layerResults, rasterizedResults, visited);
      const out = { ...node, left, right };
      visited.set(node, out);
      return out;
    }
    if ('expr' in node) {
      const out = { ...node, expr: await walkAST(node.expr!, layerResults, rasterizedResults, visited) };
      visited.set(node, out);
      return out;
    }
    if ('condition' in node && 'trueExpr' in node && 'falseExpr' in node) {
      const out = {
        ...node,
        condition: await walkAST(node.condition!, layerResults, rasterizedResults, visited),
        trueExpr: await walkAST(node.trueExpr!, layerResults, rasterizedResults, visited),
        falseExpr: await walkAST(node.falseExpr!, layerResults, rasterizedResults, visited),
      };
      visited.set(node, out);
      return out;
    }
    if ('layer' in node) {
      const out: any = { ...node, layer: await walkAST(node.layer!, layerResults, rasterizedResults, visited) };
      if ('values' in node) out.values = await Promise.all((node as any).values.map(v => walkAST(v, layerResults, rasterizedResults, visited)));
      if ('low' in node && 'high' in node) {
        out.low = await walkAST((node as any).low, layerResults, rasterizedResults, visited);
        out.high = await walkAST((node as any).high, layerResults, rasterizedResults, visited);
      }
      visited.set(node, out);
      return out;
    }
  }

  if (typeof node === 'object' && !('type' in node) && !('op' in node)) {
    const m: ASTNodeMap = {};
    for (const k in node) {
      m[k] = await walkAST((node as any)[k], layerResults, rasterizedResults, visited);
    }
    return m;
  }

  return node;
}
