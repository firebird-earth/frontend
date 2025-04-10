/**
 * Evaluates a bound AST and produces a resulting raster.
 *
 * Input:
 *   - AST where all layer nodes have been resolved (contain `source` Raster or Vector)
 *
 * Output:
 *   - A new raster containing the result of the expression
 *
 * Assumptions:
 *   - All raster layers have the same dimensions and alignment
 *   - Vector layers have been rasterized or masked in preprocessing
 *   - `Raster` is assumed to be a 2D array of numbers (or booleans)
 */

import { ASTNode } from './parser';

export type Raster = number[][];

export async function evaluateAST(ast: ASTNode): Promise<Raster> {
  const rows = getRasterSize(ast).rows;
  const cols = getRasterSize(ast).cols;

  const result: Raster = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[r][c] = evaluateAtPixel(ast, r, c);
    }
  }

  return result;
}

function evaluateAtPixel(node: ASTNode, row: number, col: number): number | boolean | null {
  if ('value' in node) return node.value;

  if (node.type === 'layer') {
    const source = (node as any).source;
    if (!source) {
      console.warn(`Layer '${node.name}' has no source raster`);
      return null;
    }
    const val = source?.[row]?.[col];
    return val ?? null;
  }

  if ('op' in node) {
    const { op } = node;
    if (op === 'neg') return -evaluateAtPixel(node.expr, row, col);
    if (op === 'NOT') return !evaluateAtPixel(node.expr, row, col);
    if (['+', '-', '*', '/'].includes(op)) {
      const left = evaluateAtPixel(node.left, row, col);
      const right = evaluateAtPixel(node.right, row, col);
      if (left == null || right == null) return null;
      if (op === '/' && right === 0) return null;
      switch (op) {
        case '+': return (left as number) + (right as number);
        case '-': return (left as number) - (right as number);
        case '*': return (left as number) * (right as number);
        case '/': return (left as number) / (right as number);
      }
    }
    if ([">", "<", ">=", "<=", "==", "!=", "AND", "OR"].includes(op)) {
      const left = evaluateAtPixel(node.left, row, col);
      const right = evaluateAtPixel(node.right, row, col);
      if (left == null || right == null) return null;
      switch (op) {
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '==': return left === right;
        case '!=': return left !== right;
        case 'AND': return Boolean(left) && Boolean(right);
        case 'OR': return Boolean(left) || Boolean(right);
      }
    }
    if (op === 'ternary') {
      const condition = evaluateAtPixel(node.condition, row, col);
      if (condition == null) return null;
      return condition ? evaluateAtPixel(node.trueExpr, row, col) : evaluateAtPixel(node.falseExpr, row, col);
    }
    if (op === 'in') {
      const layerVal = evaluateAtPixel(node.layer, row, col);
      if (layerVal == null) return null;
      return node.values.some(v => v.value === layerVal);
    }
    if (op === 'between') {
      const val = evaluateAtPixel(node.layer, row, col);
      const low = evaluateAtPixel(node.low, row, col);
      const high = evaluateAtPixel(node.high, row, col);
      if (val == null || low == null || high == null) return null;
      return val >= low && val <= high;
    }
    if (op === 'isnull') {
      const val = evaluateAtPixel(node.layer, row, col);
      return val == null;
    }
    if (op === 'isnotnull') {
      const val = evaluateAtPixel(node.layer, row, col);
      return val != null;
    }
    throw new Error(`Unsupported operator: ${op}`);
  }

  if (node.type === 'function') {
    const args = node.args.map(arg => evaluateAtPixel(arg, row, col));
    if (args.includes(null)) return null;
    switch (node.name) {
      case 'abs':
        if (args.length !== 1) throw new Error('abs() expects 1 argument');
        return Math.abs(args[0] as number);
      case 'min':
        if (args.length < 1) throw new Error('min() expects at least 1 argument');
        return Math.min(...(args as number[]));
      case 'max':
        if (args.length < 1) throw new Error('max() expects at least 1 argument');
        return Math.max(...(args as number[]));
      default:
        throw new Error(`Unsupported function: ${node.name}`);
    }
  }

  return null;
}

function getRasterSize(node: ASTNode): { rows: number, cols: number } {
  if (node.type === 'layer' && (node as any).source) {
    const raster = (node as any).source as Raster;
    if (Array.isArray(raster) && raster.length > 0 && Array.isArray(raster[0])) {
      return { rows: raster.length, cols: raster[0].length };
    } else {
      console.warn('Invalid raster format:', raster);
      return { rows: 0, cols: 0 };
    }
  }
  if ('op' in node) {
    for (const key of ['expr', 'left', 'right', 'condition', 'trueExpr', 'falseExpr', 'layer']) {
      if (key in node) return getRasterSize((node as any)[key]);
    }
    if ('args' in node && node.args.length) return getRasterSize(node.args[0]);
    if ('values' in node && node.values.length) return getRasterSize(node.values[0]);
  }
  return { rows: 0, cols: 0 };
}
