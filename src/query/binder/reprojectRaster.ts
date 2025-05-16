import L from 'leaflet';
import proj4 from 'proj4';
import { RasterData } from '../types/geotiff';
import { NODATA_VALUE } from '../../globals';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[reprojectRaster]', ...args);
  }
}

function getOrInferOrigin(metadata: any): [number, number] {
  if (metadata?.projection?.origin) return metadata.projection.origin;
  if (!metadata?.rawBounds) throw new Error('Cannot infer origin: rawBounds missing.');
  const [minX, , , maxY] = metadata.rawBounds;
  return [minX, maxY];
}

/**
 * Reprojects a source raster to match the grid, resolution, and CRS of a target reference raster.
 *
 * @param input - The source raster to be reprojected (may have a different CRS).
 * @param target - The reference raster whose CRS, resolution, and grid will define the output.
 * @returns A new RasterData object reprojected to align with the target raster grid.
 */
export async function reprojectRaster(
  input: RasterData,
  target: RasterData
): Promise<RasterData> {
  const inputCRS = input.metadata.projection.sourceCRS;
  const targetCRS = target.metadata.projection.sourceCRS;

  log('inputCRS', inputCRS);
  log('targetCRS', targetCRS);
  
  if (inputCRS === targetCRS) return input;

  if (!proj4.defs(inputCRS) || !proj4.defs(targetCRS)) {
    log('has target def?', !!proj4.defs(targetCRS));
    log('has input def? ', !!proj4.defs(inputCRS));
    throw new Error(`CRS definitions not loaded: ${inputCRS}, ${targetCRS}`);
  }

  log(`CRS mismatch detected: input=${inputCRS}, target=${targetCRS}`);
  log('target.bounds', target.metadata.rawBounds, 'target.crs', targetCRS);
  log('input.bounds', input.metadata.rawBounds, 'input.crs', inputCRS);

  const width = target.width;
  const height = target.height;
  const resX = target.metadata.resolution.x;
  const resY = target.metadata.resolution.y;
  const [originX, originY] = getOrInferOrigin(target.metadata);
  const noData = input.noDataValue ?? NODATA_VALUE;

  const outputArray = new Float32Array(width * height).fill(NODATA_VALUE);
  const projTransform = proj4(targetCRS, inputCRS).forward;

  const inputResX = input.metadata.resolution.x;
  const inputResY = input.metadata.resolution.y;
  const [inputOriginX, inputOriginY] = getOrInferOrigin(input.metadata);
  const inputWidth = input.width;
  const inputHeight = input.height;
  const inputArray = input.rasterArray;

  let minOffset = Infinity;
  let maxOffset = -Infinity;
  let anyValid = false;
  let validCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // sample at the center of each target pixel
      const px = originX + (x + 0.5) * resX;
      const py = originY - (y + 0.5) * resY;
      const [sx, sy] = projTransform([px, py]);

      // nearest‐neighbor via floor
      const srcX = Math.floor((sx - inputOriginX) / inputResX);
      const srcY = Math.floor((inputOriginY - sy) / inputResY);

      const dx = Math.abs(px - sx);
      const dy = Math.abs(py - sy);
      const offset = Math.sqrt(dx * dx + dy * dy);
      if (offset < minOffset) minOffset = offset;
      if (offset > maxOffset) maxOffset = offset;

      if (
        srcX >= 0 &&
        srcX < inputWidth &&
        srcY >= 0 &&
        srcY < inputHeight
      ) {
        anyValid = true;
        validCount++;
        const index = srcY * inputWidth + srcX;
        const val = inputArray[index];
        outputArray[y * width + x] = val === noData ? NODATA_VALUE : val;
      }
    }
  }

  if (!anyValid) {
    log(`All transformed coordinates [sx,sy] map outside input raster bounds ` +
      `(0 <= srcX < ${inputWidth}, 0 <= srcY < ${inputHeight}). No pixels sampled.`
    );
  }

  log(`Valid samples: ${validCount} / ${width * height}`);
  log(`Reprojection offset range: min=${minOffset.toFixed(3)} units, max=${maxOffset.toFixed(3)} units`);

  const [minX, minY, maxX, maxY] = target.metadata.rawBounds;
  const sw = L.CRS.EPSG3857.unproject(L.point(minX, minY));
  const ne = L.CRS.EPSG3857.unproject(L.point(maxX, maxY));
  const leafletBounds: [[number, number], [number, number]] = [
    [sw.lat, sw.lng],
    [ne.lat, ne.lng],
  ];

  log('Middle ten values:', outputArray.slice(Math.floor(outputArray.length / 2), Math.floor(outputArray.length / 2) + 10));

  return {
    rasterArray: outputArray,
    width,
    height,
    noDataValue: NODATA_VALUE,
    metadata: {
      ...input.metadata,
      ...target.metadata,
      noDataValue: NODATA_VALUE,
      leafletBounds,
    },
  };
}
