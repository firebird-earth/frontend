import * as turf from '@turf/turf';

/**
 * Compute a raster of labels: each pixel is assigned the numeric property of the feature it falls within.
 *
 * @param features Array of turf.Feature (in WebMercator coords)
 * @param width Raster width in pixels
 * @param height Raster height in pixels
 * @param minX Left coordinate of origin
 * @param maxY Top coordinate of origin
 * @param pixelWidth Pixel width in projection units
 * @param pixelHeight Negative pixel height in projection units
 * @param attributeField Feature property name to use for labeling (default: 'id')
 * @returns Float32Array of label values per pixel
 */
export function computeLabelRaster(
  features: turf.Feature[],
  width: number,
  height: number,
  minX: number,
  maxY: number,
  pixelWidth: number,
  pixelHeight: number,
  attributeField: string = 'id'
): Float32Array {
  const total = width * height;
  const halfX = pixelWidth / 2;
  const halfY = Math.abs(pixelHeight) / 2;

  const data = new Float32Array(total);
  for (let row = 0; row < height; row++) {
    const y = maxY - (row * Math.abs(pixelHeight) + halfY);
    for (let col = 0; col < width; col++) {
      const x = minX + (col * pixelWidth + halfX);
      const pt = turf.point([x, y]);
      const idx = row * width + col;
      for (const feature of features) {
        if (turf.booleanPointInPolygon(pt, feature)) {
          const val = feature.properties?.[attributeField];
          if (typeof val === 'number') {
            data[idx] = val;
          }
          break;
        }
      }
    }
  }

  return data;
}