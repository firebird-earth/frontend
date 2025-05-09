import * as turf from '@turf/turf';

/**
 * Compute a binary mask raster indicating pixels within any of the given features.
 *
 * @param features Array of turf.Feature (in WebMercator coords)
 * @param width Raster width in pixels
 * @param height Raster height in pixels
 * @param minX Left coordinate of origin
 * @param maxY Top coordinate of origin
 * @param pixelWidth Pixel width in projection units
 * @param pixelHeight Negative pixel height in projection units
 * @returns Float32Array mask (1 = inside, 0 = outside)
 */
export function computeWithinRaster(
  features: turf.Feature[],
  width: number,
  height: number,
  minX: number,
  maxY: number,
  pixelWidth: number,
  pixelHeight: number
): Float32Array {
  const total = width * height;
  const halfX = pixelWidth / 2;
  const halfY = Math.abs(pixelHeight) / 2;
  const mask = new Float32Array(total);

  for (let row = 0; row < height; row++) {
    const y = maxY - (row * Math.abs(pixelHeight) + halfY);
    for (let col = 0; col < width; col++) {
      const x = minX + (col * pixelWidth + halfX);
      const pt = turf.point([x, y]);
      const idx = row * width + col;
      mask[idx] = features.some(f => turf.booleanPointInPolygon(pt, f)) ? 1 : 0;
    }
  }

  return mask;
}