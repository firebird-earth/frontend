// collectASTLayers.ts
import { ASTNode, ASTNodeMap, FunctionNode } from './parser';

const rasterizationFunctions = ['mask', 'label', 'category', 'distance_to', 'edge', 'within'];

export function collectRasterFns(ast: ASTNode | ASTNodeMap): Map<string, Set<string>> {
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
    Object.values(node as any).forEach(recurse);
  }
  recurse(ast);
  return needed;
}

export function collectLayerNames(ast: ASTNode | ASTNodeMap): Set<string> {
  const names = new Set<string>();
  function recurse(node: ASTNode | ASTNodeMap) {
    if (typeof node !== 'object' || !node) return;
    if ('type' in node && node.type === 'layer') {
      names.add(node.name);
    } else if ('op' in node || 'type' in node) {
      Object.values(node).forEach(recurse);
    } else {
      Object.values(node as ASTNodeMap).forEach(recurse);
    }
  }
  recurse(ast);
  return names;
}
