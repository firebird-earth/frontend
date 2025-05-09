import { hexToRgb, GeoTiffNoDataColor } from './colors';

/**
 * Converts a numeric raster array into an RGBA ImageData object using a color scheme.
 *
 * @param rasterArray - Flat array of raster values
 * @param width - Raster width in pixels
 * @param height - Raster height in pixels
 * @param noDataValue - NoData value to be treated as transparent
 * @param scheme - Resolved color scheme (array of hex strings)
 * @param domain - Full value domain used for normalization (e.g. [0,100])
 * @param valueRange - Current display limits for clipping (slider min/max)
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

  const [dMin, dMax] = domain;
  const fullRange = dMax - dMin;
  const bucketCount = scheme.length;

  if (!Array.isArray(scheme) || bucketCount < 1) {
    throw new Error(`Invalid color scheme provided: ${JSON.stringify(scheme)}`);
  }

  for (let i = 0; i < rasterArray.length; i++) {
    const value = rasterArray[i];
    const base = i * 4;

    // ────────────── BINARY-GREEN FIX ──────────────
    // if this is a 1-color scheme (i.e. boolean), treat 0 as transparent
    if (bucketCount === 1 && value === 0) {
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }
    // ───────────────────────────────────────────────

    // skip invalid or out-of-domain or outside current valueRange
    if (
      value === undefined ||
      isNaN(value) ||
      !isFinite(value) ||
      (noDataValue !== null && value === noDataValue) ||
      value < dMin ||
      value > dMax ||
      value < valueRange.min ||
      value > valueRange.max
    ) {
      imageData.data[base + 0] = GeoTiffNoDataColor.r;
      imageData.data[base + 1] = GeoTiffNoDataColor.g;
      imageData.data[base + 2] = GeoTiffNoDataColor.b;
      imageData.data[base + 3] = GeoTiffNoDataColor.a;
      continue;
    }

    // normalize across full domain
    const normalized = fullRange === 0
      ? 0
      : (value - dMin) / fullRange;
    const clampedNorm = Math.min(Math.max(normalized, 0), 1);

    // bucket so that top 1/bucketCount goes to last color
    const idx = Math.min(
      Math.floor(clampedNorm * bucketCount),
      bucketCount - 1
    );

    const hex = scheme[idx];
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
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
