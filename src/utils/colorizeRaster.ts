// utils/colorizeRaster.ts

import { hexToRgb, GeoTiffNoDataColor } from './colors';

/**
 * Converts a numeric raster array into an RGBA ImageData object using a color scheme.
 *
 * @param rasterArray - Flat array of raster values
 * @param width - Raster width in pixels
 * @param height - Raster height in pixels
 * @param noDataValue - NoData value to be treated as transparent
 * @param scheme - Resolved color scheme (array of hex strings)
 * @param domain - Full value domain used for normalization
 * @param valueRange - Min/max display limits for clipping
 */
export function colorizeRasterImage(
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
  const fullRange = domain[1] - domain[0];

  if (!Array.isArray(scheme) || scheme.length < 2) {
    throw new Error(`Invalid color scheme provided to colorizeRasterImage: ${JSON.stringify(scheme)}`);
  }

  for (let i = 0; i < rasterArray.length; i++) {
    const value = rasterArray[i];
    const idx = i * 4;

    if (
      value === undefined || isNaN(value) || !isFinite(value) ||
      (noDataValue !== null && value === noDataValue) ||
      value < valueRange.min || value > valueRange.max
    ) {
      imageData.data[idx + 0] = GeoTiffNoDataColor.r;
      imageData.data[idx + 1] = GeoTiffNoDataColor.g;
      imageData.data[idx + 2] = GeoTiffNoDataColor.b;
      imageData.data[idx + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    const clampedNormalized = Math.min(Math.max((value - domain[0]) / fullRange, 0), 1);
    const clampedIndex = Math.min(Math.floor(clampedNormalized * (scheme.length - 1)), scheme.length - 1);
    const hex = scheme[clampedIndex];

    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
      console.warn('Invalid hex color value:', hex, 'at index', clampedIndex);
      imageData.data[idx + 0] = GeoTiffNoDataColor.r;
      imageData.data[idx + 1] = GeoTiffNoDataColor.g;
      imageData.data[idx + 2] = GeoTiffNoDataColor.b;
      imageData.data[idx + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    const { r, g, b } = hexToRgb(hex);
    imageData.data[idx + 0] = r;
    imageData.data[idx + 1] = g;
    imageData.data[idx + 2] = b;
    imageData.data[idx + 3] = 255;
  }

  return imageData;
}
