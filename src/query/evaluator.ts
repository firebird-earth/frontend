import { ASTNode } from './parser';
import { GeoTiffMetadata } from '../types/geotiff';

export interface RasterData {
  rasterArray: Int16Array | Float32Array | Uint8Array | number[];
  width: number;
  height: number;
  noDataValue: number | null;
}

export async function evaluateAST(
  ast: ASTNode,
  outputNoDataValue: number = NaN
): Promise<{ data: RasterData; metadata: GeoTiffMetadata }> {
  const { rows, cols } = getRasterSize(ast);
  const total = rows * cols;
  const rasterArray = new Float32Array(total);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const value = evaluateAtPixel(ast, r, c);
      const numeric = typeof value === 'boolean' ? (value ? 1 : 0) : value;
      const index = r * cols + c;
      rasterArray[index] = numeric == null || isNaN(numeric) ? outputNoDataValue : Number(numeric);
    }
  }

  const sourceMeta = extractMetadata(ast);
  const metadata: GeoTiffMetadata = {
    ...(sourceMeta || {}),
    width: cols,
    height: rows,
    noDataValue: outputNoDataValue
  };

  return {
    data: {
      rasterArray,
      width: cols,
      height: rows,
      noDataValue: outputNoDataValue
    },
    metadata
  };
}

function evaluateAtPixel(node: ASTNode, row: number, col: number): number | boolean | null {
  if ('value' in node) return node.value;

  if (node.type === 'layer') {
    const source = (node as any).source as RasterData;
    if (!source?.rasterArray) throw new Error(`Layer '${node.name}' has no source raster`);
    if (row >= source.height || col >= source.width) return null;
    const index = row * source.width + col;
    const raw = source.rasterArray[index];
    return raw === undefined || isNaN(raw) || raw === source.noDataValue ? null : raw;
  }

  if ('op' in node) {
    const { op } = node;
    if (op === 'neg') return -evaluateAtPixel(node.expr, row, col);
    if (op === 'NOT') return !evaluateAtPixel(node.expr, row, col);
    if (["+", "-", "*", "/"].includes(op)) {
      const left = evaluateAtPixel(node.left, row, col);
      const right = evaluateAtPixel(node.right, row, col);
      if (left == null || right == null) return null;
      if (op === '/' && right === 0) return null;
      return eval(`(${left})${op}(${right})`);
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
      const cond = evaluateAtPixel(node.condition, row, col);
      return cond ? evaluateAtPixel(node.trueExpr, row, col) : evaluateAtPixel(node.falseExpr, row, col);
    }
    if (op === 'in') {
      const val = evaluateAtPixel(node.layer, row, col);
      return node.values.some(v => v.value === val);
    }
    if (op === 'between') {
      const val = evaluateAtPixel(node.layer, row, col);
      const low = evaluateAtPixel(node.low, row, col);
      const high = evaluateAtPixel(node.high, row, col);
      return val >= low && val <= high;
    }
    if (op === 'isnull') return evaluateAtPixel(node.layer, row, col) == null;
    if (op === 'isnotnull') return evaluateAtPixel(node.layer, row, col) != null;
  }

  if (node.type === 'function') {
    const args = node.args.map(arg => evaluateAtPixel(arg, row, col));
    if (args.includes(null)) return null;
    switch (node.name) {
      case 'abs': return Math.abs(args[0] as number);
      case 'min': return Math.min(...(args as number[]));
      case 'max': return Math.max(...(args as number[]));
      case 'mask': return args.length === 2 ? (args[1] ? args[0] : null) : null;
      default: throw new Error(`Unsupported function: ${node.name}`);
    }
  }

  return null;
}

function getRasterSize(node: ASTNode): { rows: number; cols: number } {
  if (node.type === 'layer' && 'source' in node) {
    const src = (node as any).source as RasterData;
    if (src?.width && src?.height) return { rows: src.height, cols: src.width };
  }
  if ('args' in node) for (const arg of node.args) {
    const size = getRasterSize(arg);
    if (size.rows && size.cols) return size;
  }
  if ('op' in node) {
    const keys = ['expr', 'left', 'right', 'condition', 'trueExpr', 'falseExpr', 'layer', 'low', 'high'];
    for (const key of keys) {
      if ((node as any)[key]) {
        const size = getRasterSize((node as any)[key]);
        if (size.rows && size.cols) return size;
      }
    }
  }
  return { rows: 0, cols: 0 };
}

function extractMetadata(node: ASTNode): GeoTiffMetadata | null {
  if (node.type === 'layer' && (node as any).source?.metadata) {
    return (node as any).source.metadata;
  }
  if ('args' in node) for (const arg of node.args) {
    const meta = extractMetadata(arg);
    if (meta) return meta;
  }
  if ('op' in node) {
    const keys = ['expr', 'left', 'right', 'condition', 'trueExpr', 'falseExpr', 'layer', 'low', 'high'];
    for (const key of keys) {
      const child = (node as any)[key];
      if (child) {
        const meta = extractMetadata(child);
        if (meta) return meta;
      }
    }
  }
  return null;
}
