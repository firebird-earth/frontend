// src/services/geotiffService/colorizeRaster.ts

import { hexToRgb, GeoTiffNoDataColor } from '../utils/colors';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[ColorizeRaster]', ...args); }
}

/**
 * Equal-interval (linear) color classification
 */
function linearColorizeImage(
  rasterArray: number[],
  width: number,
  height: number,
  noDataValue: number | null,
  scheme: string[],
  domain: [number, number],
  valueRange: { min: number; max: number }
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');
  const imageData = ctx.createImageData(width, height);

  const [dMin, dMax] = domain;
  const fullRange = dMax - dMin;
  const bucketCount = scheme.length;

  for (let i = 0; i < rasterArray.length; i++) {
    const value = rasterArray[i];
    const base = i * 4;

    // Binary scheme: treat 0 as transparent
    if (bucketCount === 1 && value === 0) {
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    // Skip invalid or out-of-range
    if (
      value === undefined ||
      isNaN(value) ||
      !isFinite(value) ||
      (noDataValue !== null && value === noDataValue) ||
      value < dMin ||
      value > dMax ||
      (valueRange && (value < valueRange.min || value > valueRange.max))
    ) {
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    const normalized = fullRange === 0
      ? 0
      : (value - dMin) / fullRange;
    const clampedNorm = Math.min(Math.max(normalized, 0), 1);
    const idx = Math.min(
      Math.floor(clampedNorm * bucketCount),
      bucketCount - 1
    );

    const hex = scheme[idx];
    if (!hex || !hex.startsWith('#')) {
      console.warn('Invalid hex color at index', idx, hex);
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    const { r, g, b } = hexToRgb(hex);
    imageData.data[base + 0] = r;
    imageData.data[base + 1] = g;
    imageData.data[base + 2] = b;
    imageData.data[base + 3] = 255;
  }

  return imageData;
}

/**
 * Quantile (equal-count) color classification with percentile interpolation
 */
function quantileColorizeImage(
  rasterArray: number[],
  width: number,
  height: number,
  noDataValue: number | null,
  scheme: string[],
  domain: [number, number],
  valueRange: { min: number; max: number }
): ImageData {
  const [dMin, dMax] = domain;
  // collect valid values
  const validVals = rasterArray.filter(v =>
    v !== undefined && !isNaN(v) && isFinite(v) &&
    (noDataValue === null || v !== noDataValue) &&
    v >= dMin && v <= dMax &&
    !(valueRange && (v < valueRange.min || v > valueRange.max))
  );
  if (validVals.length === 0) {
    return linearColorizeImage(rasterArray, width, height, noDataValue, scheme, domain, valueRange);
  }

  const sorted = validVals.slice().sort((a, b) => a - b);
  const N = sorted.length;
  const bucketCount = scheme.length;
  // compute percentile-interpolated thresholds
  const thresholds: number[] = [];
  for (let i = 1; i < bucketCount; i++) {
    const p = i / bucketCount;
    const idx = p * (N - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const weight = idx - lo;
    const t = sorted[lo] + weight * (sorted[hi] - sorted[lo]);
    thresholds.push(t);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < rasterArray.length; i++) {
    const value = rasterArray[i];
    const base = i * 4;

    // Skip invalid or out-of-range
    if (
      value === undefined ||
      isNaN(value) ||
      !isFinite(value) ||
      (noDataValue !== null && value === noDataValue) ||
      value < dMin ||
      value > dMax ||
      (valueRange && (value < valueRange.min || value > valueRange.max))
    ) {
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    if (bucketCount === 1 && value === 0) {
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    // determine bucket index
    let idx = 0;
    while (idx < thresholds.length && value > thresholds[idx]) {
      idx++;
    }

    const hex = scheme[idx];
    if (!hex || !hex.startsWith('#')) {
      console.warn('Invalid hex color at index', idx, hex);
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }
    const { r, g, b } = hexToRgb(hex);
    imageData.data[base + 0] = r;
    imageData.data[base + 1] = g;
    imageData.data[base + 2] = b;
    imageData.data[base + 3] = 255;
  }

  return imageData;
}

/**
 * Main: choose linear or quantile classification
 */
export function colorizeRasterImage(
  rasterArray: number[],
  width: number,
  height: number,
  noDataValue: number | null,
  scheme: string[],
  domain: [number, number],
  valueRange: { min: number; max: number },
  quantizeColors = false
): ImageData {
  if (quantizeColors) {
    log('Using quantile color classification');
    return quantileColorizeImage(rasterArray, width, height, noDataValue, scheme, domain, valueRange);
  } else {
    log('Using linear color classification');
    return linearColorizeImage(rasterArray, width, height, noDataValue, scheme, domain, valueRange);
  }
}
