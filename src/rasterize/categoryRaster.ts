import * as turf from '@turf/turf';

/**
 * Compute a raster assigning numeric category codes based on a feature property.
 *
 * @param features Array of turf.Feature (in WebMercator coords)
 * @param width Raster width in pixels
 * @param height Raster height in pixels
 * @param minX Left coordinate of origin
 * @param maxY Top coordinate of origin
 * @param pixelWidth Pixel width in projection units
 * @param pixelHeight Negative pixel height in projection units
 * @param attributeField Property name to extract from feature.properties (defaults to 'type')
 * @returns Float32Array of category codes per pixel (0 if none)
 */
export function computeCategoryRaster(
  features: turf.Feature[],
  width: number,
  height: number,
  minX: number,
  maxY: number,
  pixelWidth: number,
  pixelHeight: number,
  attributeField?: string
): Float32Array {
  const total = width * height;
  const halfX = pixelWidth / 2;
  const halfY = Math.abs(pixelHeight) / 2;
  const data = new Float32Array(total);
  const categoryMap = new Map<string, number>();
  let nextCode = 1;

  for (let row = 0; row < height; row++) {
    const y = maxY - (row * Math.abs(pixelHeight) + halfY);
    for (let col = 0; col < width; col++) {
      const x = minX + (col * pixelWidth + halfX);
      const pt = turf.point([x, y]);
      const idx = row * width + col;
      for (const feature of features) {
        if (turf.booleanPointInPolygon(pt, feature)) {
          const key = feature.properties?.[attributeField ?? 'type'];
          if (typeof key === 'string') {
            if (!categoryMap.has(key)) {
              categoryMap.set(key, nextCode++);
            }
            data[idx] = categoryMap.get(key)!;
          }
          break;
        }
      }
    }
  }

  return data;
}
