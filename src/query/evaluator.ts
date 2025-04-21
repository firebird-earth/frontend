/**
 * Evaluates a bound AST and produces a resulting raster.
 *
 * Input:
 *   - AST where all layer nodes have been resolved (contain `source` RasterData)
 *
 * Output:
 *   - A new RasterData containing the result of the expression
 *
 * Assumptions:
 *   - All raster layers have the same dimensions and alignment
 *   - Vector layers have been rasterized or masked in preprocessing
 */

import { ASTNode } from './parser';

export interface RasterData {
  data: Int16Array | Float32Array | Uint8Array | number[];
  width: number;
  height: number;
  noDataValue: number | null;
}

export async function evaluateAST(ast: ASTNode, outputNoDataValue: number = NaN): Promise<RasterData> {
  //console.debug('AST before getRasterSize:', JSON.stringify(ast, null, 2));
  const { rows, cols } = getRasterSize(ast);
  const total = rows * cols;
  const output = new Float32Array(total);

  let validPixelCount = 0;
  let zeroValuePixelCount = 0;
  let oneValuePixelCount = 0;
  let noDataPixelCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const value = evaluateAtPixel(ast, r, c);
      const numeric = typeof value === 'boolean' ? (value ? 1 : 0) : value;
      const index = r * cols + c;

      if (numeric == null || isNaN(numeric)) {
        output[index] = outputNoDataValue;
        noDataPixelCount++;
      } else {
        const num = Number(numeric);
        output[index] = num;
        validPixelCount++;
        if (num === 0) zeroValuePixelCount++;
        else if (num === 1) oneValuePixelCount++;
      }
    }
  }

  const isBinary = validPixelCount === (zeroValuePixelCount + oneValuePixelCount);

  console.debug('Result Stats:', {
    totalPixelCount: total,
    zeroValuePixelCount,
    oneValuePixelCount,
    validDataPixelCount: validPixelCount,
    noDataPixelCount,
    outputType: isBinary ? 'binary (0/1)' : 'range/mask',
    check: isBinary
      ? `0 + 1 + noData = ${zeroValuePixelCount + oneValuePixelCount + noDataPixelCount} / ${total}`
      : `0 + valid + noData = ${zeroValuePixelCount + validPixelCount + noDataPixelCount} / ${total}`
  });

  return {
    data: output,
    width: cols,
    height: rows,
    noDataValue: outputNoDataValue
  };
}

function evaluateAtPixel(node: ASTNode, row: number, col: number): number | boolean | null {
  if ('value' in node) return node.value;

  if (node.type === 'layer') {
    const source = (node as any).source as RasterData;
    if (!source || !source.rasterArray) {
      throw new Error(`Layer '${node.name}' has no source raster`);
    }
    if (row >= source.height || col >= source.width) return null;
    const index = row * source.width + col;
    const raw = source.rasterArray[index];
    if (raw === undefined || isNaN(raw) || raw === source.noDataValue || raw === Number(source.noDataValue)) return null;
    return raw;
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
        case '>': return (left as number) > (right as number);
        case '<': return (left as number) < (right as number);
        case '>=': return (left as number) >= (right as number);
        case '<=': return (left as number) <= (right as number);
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
    const { name, args } = node;
    const evaluatedArgs = args.map(arg => evaluateAtPixel(arg, row, col));

    if (evaluatedArgs.includes(null)) return null;

    switch (name) {
      case 'abs':
        if (evaluatedArgs.length !== 1) throw new Error('abs() expects 1 argument');
        return Math.abs(evaluatedArgs[0] as number);
      case 'min':
        if (evaluatedArgs.length < 1) throw new Error('min() expects at least 1 argument');
        return Math.min(...(evaluatedArgs as number[]));
      case 'max':
        if (evaluatedArgs.length < 1) throw new Error('max() expects at least 1 argument');
        return Math.max(...(evaluatedArgs as number[]));
      case 'mask':
        if (evaluatedArgs.length !== 2) throw new Error('mask(layer, condition) expects 2 arguments');
        return evaluatedArgs[1] ? evaluatedArgs[0] : null;
      default:
        throw new Error(`Unsupported function: ${name}`);
    }
  }

  return null;
}

function getRasterSize(node: ASTNode): { rows: number; cols: number } {
  if (node.type === 'layer' && 'source' in node) {
    const raster = (node as any).source as RasterData;
    if (raster && typeof raster.width === 'number' && typeof raster.height === 'number') {
      return { rows: raster.height, cols: raster.width };
    }
  }

  if (node.type === 'function' && node.args.length > 0) {
    for (const arg of node.args) {
      const size = getRasterSize(arg);
      if (size.rows > 0 && size.cols > 0) return size;
    }
  }

  if ('op' in node) {
    for (const key of ['expr', 'left', 'right', 'condition', 'trueExpr', 'falseExpr', 'layer', 'low', 'high']) {
      if ((node as any)[key]) {
        const size = getRasterSize((node as any)[key]);
        if (size.rows > 0 && size.cols > 0) return size;
      }
    }
    if ('args' in node) {
      for (const arg of node.args) {
        const size = getRasterSize(arg);
        if (size.rows > 0 && size.cols > 0) return size;
      }
    }
  }

  return { rows: 0, cols: 0 };
}
