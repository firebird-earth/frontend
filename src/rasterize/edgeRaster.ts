import * as turf from '@turf/turf';

/**
 * Compute a binary edge raster by labeling pixels with feature index
 * and detecting neighbor-differences along boundaries.
 *
 * @param features Array of turf.Feature (in WebMercator coords)
 * @param width Raster width
 * @param height Raster height
 * @param minX Left coordinate of origin
 * @param maxY Top coordinate of origin
 * @param pixelWidth Pixel width in projection units
 * @param pixelHeight Negative pixel height in projection units
 * @returns Float32Array binary edge mask (1 = edge, 0 = background)
 */
export function computeEdgeRaster(
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

  // Step 1: label each pixel by feature index (1-based)
  const labels = new Uint16Array(total);
  for (let row = 0; row < height; row++) {
    const y = maxY - (row * Math.abs(pixelHeight) + halfY);
    for (let col = 0; col < width; col++) {
      const x = minX + (col * pixelWidth + halfX);
      const pt = turf.point([x, y]);
      const idx = row * width + col;
      for (let i = 0; i < features.length; i++) {
        if (turf.booleanPointInPolygon(pt, features[i])) {
          labels[idx] = i + 1;
          break;
        }
      }
    }
  }

  // Step 2: detect boundaries where neighbor labels differ
  const edgeData = new Float32Array(total);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = row * width + col;
      const lbl = labels[idx];
      if (lbl > 0) {
        const left  = col > 0           ? labels[idx - 1]     : 0;
        const right = col < width - 1   ? labels[idx + 1]     : 0;
        const up    = row > 0           ? labels[idx - width] : 0;
        const down  = row < height - 1  ? labels[idx + width] : 0;
        edgeData[idx] = (left !== lbl || right !== lbl || up !== lbl || down !== lbl) ? 1 : 0;
      }
    }
  }

  return edgeData;
}
