/**
 * raster/maskRaster.ts
 *
 * Masks out all pixels outside a circular AOI, keeping the full raster footprint.
 * Recomputes metadata.stats after masking.
 *
 * Supported projections:
 * - Any CRS recognized by proj4 via metadata.projection.sourceCRS (e.g. 'EPSG:4326',
 *   'EPSG:3857', 'EPSG:26913'). Defaults to 'EPSG:3857' if missing.
 * - `center` is [latitude, longitude] in EPSG:4326 degrees.
 * - `radiusMeters` is a ground-distance radius in metres.
 *
 * Notes on Web Mercator (EPSG:3857):
 * Map-units in EPSG:3857 are not true metres except at the equator. We correct for
 * this by scaling the radius by 1/cos(latitude) when the raster CRS is Web Mercator,
 * so that a 1 000 m circle in ground-distance really spans 1 000 m on the sphere.
 */

import { RasterData } from '../types/geotiff';
import { GeoTiffMetadata } from '../types/geotiff';
import { computeMetadataStats } from '../services/geotiffService/metadata';
import proj4 from 'proj4';

const DEBUG = false;
function log(...args: any[]) {
  if (DEBUG) { console.log('[maskRasterToCircle]', ...args); }
}

export interface MaskRasterCircleResult {
  data: RasterData;
  metadata: GeoTiffMetadata;
}

/**
 * Debug scan: counts zeros and values in (0,1) for troubleshooting.
 */
function debugScanArray(
  arr: Int16Array | Float32Array | Uint8Array | number[],
  nodata: number
): void {
  let zeroCount = 0;
  let ltOneCount = 0;
  let firstLtOneIdx = -1;

  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v === 0) {
      zeroCount++;
    } else if (v !== nodata && !isNaN(v as number) && v < 1) {
      if (ltOneCount === 0) firstLtOneIdx = i;
      ltOneCount++;
    }
  }

  log(`debugScan zeroCount=${zeroCount}`);
  log(`debugScan <1 count=${ltOneCount}` +
      (ltOneCount > 0
        ? ` (first at idx ${firstLtOneIdx} = ${arr[firstLtOneIdx]})`
        : ''));
}

export function maskRasterToCircle(
  raster: RasterData,
  metadata: GeoTiffMetadata,
  center: [number, number],
  radiusMeters: number
): MaskRasterCircleResult {
  const { rasterArray, width, height } = raster;
  const [lat, lon] = center;
  const nodata = metadata.noDataValue!;

  // 1) Determine raster CRS (default to Web Mercator)
  const srcCRS = metadata.projection.sourceCRS ?? 'EPSG:3857';

  // 2) Reproject AOI center into raster CRS units
  const [centerX, centerY] = proj4('EPSG:4326', srcCRS, [lon, lat]);

  // 3) Compute pixel‐grid conversion
  const [minX, minY, maxX, maxY] = metadata.rawBounds;
  const pxW = (maxX - minX) / width;
  const pxH = (maxY - minY) / height;
  const centerPxX = (centerX - minX) / pxW;
  const centerPxY = (maxY - centerY) / pxH;

  // 4) Adjust radius for Web Mercator distortion if needed
  const latRad = (lat * Math.PI) / 180;
  const scaleFactor = srcCRS.includes('3857') ? 1 / Math.cos(latRad) : 1;
  const radiusProj = radiusMeters * scaleFactor;
  const radiusSq = radiusProj * radiusProj;

  // 5) Allocate output array of same type
  const ArrayClass = rasterArray.constructor as {
    new (length: number): typeof rasterArray;
  };
  const outArray = new ArrayClass(width * height);
  outArray.fill(nodata);
  
  // 6) Mask: keep pixels inside the circle, else write nodata
  for (let y = 0; y < height; y++) {
    const rowOff = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOff + x;
      const dx = (x - centerPxX) * metadata.resolution.x;
      const dy = (y - centerPxY) * metadata.resolution.y;
      outArray[idx] =
        dx * dx + dy * dy <= radiusSq ? rasterArray[idx] : nodata;
    }
  }

  // 7) DEBUG: scan for any stray zeros or fractional values
  debugScanArray(outArray, nodata);

  // 8) Recompute stats, skipping exactly our nodata value
  const newStats = computeMetadataStats(outArray, nodata);

  log('newStats', newStats);

  return {
      data: {
        rasterArray: outArray,
        width,
        height,
        noDataValue: nodata
      },
      metadata: {
        // first spread all of the old metadata…
        ...metadata,
        // then overwrite noDataValue…
        noDataValue: nodata,
        // …and *finally* overwrite stats with newStats
        stats: newStats
      }
    };
}
