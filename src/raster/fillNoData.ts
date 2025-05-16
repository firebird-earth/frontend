/**
 * Fills NoData (holes) in a raster array using focal mean (moving-window).
 *
 * @param arr - original raster data as Float32Array
 * @param width - number of columns (x-dimension)
 * @param height - number of rows (y-dimension)
 * @param noDataValue - value representing NoData in the array
 * @param windowRadius - radius of the square window for averaging (default 1 = 3×3)
 * @returns new Float32Array with NoData values replaced by mean of neighbors
 */
export function fillNoDataFocalMean(
  arr: Float32Array,
  width: number,
  height: number,
  noDataValue: number,
  windowRadius = 1
): Float32Array {
  // Create a copy of the original data
  const out = new Float32Array(arr);
  // Helper to compute linear index
  const getIndex = (x: number, y: number) => y * width + x;

  // Iterate through each cell
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y);
      // Only fill where value equals NoData
      if (arr[idx] === noDataValue) {
        let sum = 0;
        let count = 0;
        // Examine neighbors in the window
        for (let dy = -windowRadius; dy <= windowRadius; dy++) {
          for (let dx = -windowRadius; dx <= windowRadius; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            // Check bounds
            if (xx >= 0 && xx < width && yy >= 0 && yy < height) {
              const neighborVal = arr[getIndex(xx, yy)];
              if (neighborVal !== noDataValue) {
                sum += neighborVal;
                count++;
              }
            }
          }
        }
        // If we found at least one valid neighbor, assign the mean
        if (count > 0) {
          out[idx] = sum / count;
        }
      }
    }
  }

  return out;
}
