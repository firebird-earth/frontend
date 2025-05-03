/**
 * Evaluates a bound AST by executing pixelwise operations over raster data.
 *
 * Input:
 *   - AST where all LayerNodes are already bound to RasterData (with source, metadata, etc.)
 *
 * Output:
 *   - RasterData: raster array resulting from evaluating the expression
 *   - GeoTiffMetadata: metadata for the output raster, derived from source layers
 *     (augmented with an `isBinary` flag if the result is purely binary and optional `maskLayerName` when a mask() was applied)
 *
 * Notes:
 *   - Assumes all input rasters are aligned (same grid, same resolution).
 *   - Supports raster math, logic operations, masking, and simple functions.
 *   - Vector-based operations must already be rasterized before evaluation.
 */

import { ASTNode } from './parser';
import { GeoTiffMetadata } from '../types/geotiff';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[EvalExpression]', ...args);
  }
}

export interface RasterData {
  rasterArray: Int16Array | Float32Array | Uint8Array | number[];
  width: number;
  height: number;
  noDataValue: number | null;
}

export interface EvaluateResult {
  data: RasterData;
  metadata: GeoTiffMetadata & { isBinary: boolean; maskLayerName?: string };
}

export async function evaluateAST(
  ast: ASTNode,
  outputNoDataValue: number = NaN
): Promise<EvaluateResult> {
  log('Calling evaluateAST with boundAst:', ast);

  // Prepare raster dimensions
  const { rows, cols } = getRasterSizeFromInput(ast);
  const total = rows * cols;
  const rasterArray = new Float32Array(total);

  // Evaluate pixelwise, mapping:
  //   true  -> 1
  //   false -> noDataValue
  for (let r = 0; r < rows; r++) {
    const rowOffset = r * cols;
    for (let c = 0; c < cols; c++) {
      const idx = rowOffset + c;
      const value = evaluateAtPixel(ast, r, c, outputNoDataValue);
      let num: number | null;
      if (typeof value === 'boolean') {
        num = value ? 1 : null;
      } else {
        num = value as number;
      }
      rasterArray[idx] = (num == null || isNaN(num))
        ? outputNoDataValue
        : Number(num);
    }
  }

  log('Evaluation result (first 10 pixels):', rasterArray.slice(0, 10));

  // Detect if output is binary (only 1 values present, aside from NoData)
  const unique = new Set<number>();
  for (let i = 0; i < rasterArray.length; i++) {
    const v = rasterArray[i];
    if (v === outputNoDataValue || isNaN(v)) continue;
    unique.add(v);
    if (unique.size > 1) break;
  }
  const isBinary = unique.size === 1 && [...unique][0] === 1;

  // Detect mask operator to include mask layer name (first parameter)
  let maskLayerName: string | undefined;
  if ((ast as any).type === 'function' && (ast as any).name === 'mask') {
    const img = (ast as any).args[0];
    if (img.type === 'layer') {
      maskLayerName = (img as any).name;
    }
  }

  // Extract and augment metadata
  const baseMetadata = extractMetadata(ast);
  const metadata: GeoTiffMetadata & { isBinary: boolean; maskLayerName?: string } = {
    ...baseMetadata,
    isBinary,
    ...(maskLayerName !== undefined ? { maskLayerName } : {})
  };

  return {
    data: { rasterArray, width: cols, height: rows, noDataValue: outputNoDataValue },
    metadata
  };
}

function evaluateAtPixel(
  ast: ASTNode,
  r: number,
  c: number,
  outputNoDataValue: number
): number | boolean | null {
  if ((ast as any).type === 'literal') {
    return (ast as any).value;
  }

  if ((ast as any).type === 'layer') {
    const layer = ast as any;
    if (!layer.source) {
      throw new Error(`Layer "${layer.name}" not bound to raster source`);
    }
    const idx = r * layer.source.width + c;
    return layer.source.rasterArray[idx];
  }

  // binary or logical op
  if ('op' in ast && 'left' in ast && 'right' in ast) {
    const left = evaluateAtPixel((ast as any).left, r, c, outputNoDataValue);
    const right = evaluateAtPixel((ast as any).right, r, c, outputNoDataValue);
    const ln = typeof left === 'number' ? left : NaN;
    const rn = typeof right === 'number' ? right : NaN;
    switch ((ast as any).op) {
      case '+':  return ln + rn;
      case '-':  return ln - rn;
      case '*':  return ln * rn;
      case '/':  return ln / rn;
      case '>':  return ln > rn;
      case '<':  return ln < rn;
      case '>=': return ln >= rn;
      case '<=': return ln <= rn;
      case '==': return ln === rn;
      case '!=': return ln !== rn;
      case '&&':
      case 'AND': return Boolean(left) && Boolean(right);
      case '||':
      case 'OR':  return Boolean(left) || Boolean(right);
      default:
        throw new Error(`Unsupported operator: ${(ast as any).op}`);
    }
  }

  // unary
  if ('op' in ast && 'operand' in ast) {
    const v = evaluateAtPixel((ast as any).operand, r, c, outputNoDataValue);
    switch ((ast as any).op) {
      case '-': return -(v as number);
      case '!': return !v;
      default:
        throw new Error(`Unsupported unary operator: ${(ast as any).op}`);
    }
  }

  // function
  if ((ast as any).type === 'function') {
    if ((ast as any).name === 'mask') {
      const [img, cond] = (ast as any).args;
      const cv = evaluateAtPixel(cond, r, c, outputNoDataValue);
      return cv
        ? evaluateAtPixel(img, r, c, outputNoDataValue)
        : outputNoDataValue;
    }
    throw new Error(`Unsupported function: ${(ast as any).name}`);
  }

  throw new Error(`Unsupported AST node: ${(ast as any).op ?? (ast as any).type}`);
}

function getRasterSizeFromInput(ast: ASTNode): { rows: number; cols: number } {
  if ((ast as any).type === 'layer' && (ast as any).source) {
    const layer = ast as any;
    return { rows: layer.source.height, cols: layer.source.width };
  }
  if ('op' in ast && 'left' in ast && 'right' in ast) {
    return getRasterSizeFromInput((ast as any).left);
  }
  if ('op' in ast && 'operand' in ast) {
    return getRasterSizeFromInput((ast as any).operand);
  }
  if ((ast as any).type === 'function') {
    return getRasterSizeFromInput((ast as any).args[0]);
  }
  throw new Error('Cannot determine raster size from AST');
}

function extractMetadata(ast: ASTNode): GeoTiffMetadata {
  if ((ast as any).type === 'layer') {
    const layer = ast as any;
    if (!layer.source.metadata) {
      throw new Error(`Layer "${layer.name}" missing metadata`);
    }
    return layer.source.metadata;
  }
  if ('op' in ast && 'left' in ast && 'right' in ast) {
    return extractMetadata((ast as any).left);
  }
  if ('op' in ast && 'operand' in ast) {
    return extractMetadata((ast as any).operand);
  }
  if ((ast as any).type === 'function') {
    const src = (ast as any).args.find((a: any) => a.type === 'layer');
    if (!src) {
      throw new Error(`No metadata source in function "${(ast as any).name}"`);
    }
    return extractMetadata(src);
  }
  throw new Error(`Unsupported AST node for metadata: ${(ast as any).op ?? (ast as any).type}`);
}
