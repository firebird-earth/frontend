// referenceRaster.ts
import type { RasterData } from '../types/geotiff';
import type { GeoTiffMetadata } from '../types/geotiff';
import { NODATA_VALUE } from '../globals';
import { validateMetadata } from '../services/geotiffService/validateMetadata';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[ReferenceRaster]', ...args);
}

/**
 * Builds a reference raster grid to which all other rasters/vectors will be aligned.
 * @param bounds [minX, minY, maxX, maxY] in the target CRS units.
 * @param resolution resolution of each pixel (in same units as CRS).
 * @param crs target coordinate reference system (e.g., "EPSG:3857").
 * @param noDataValue value to use for no-data cells.
 */
export function buildReferenceRaster(
  bounds: [number, number, number, number],
  resolution: number,
  crs: string,
  noDataValue: number
): RasterData {
  const [minX, minY, maxX, maxY] = bounds;
  const width = Math.ceil((maxX - minX) / resolution);
  const height = Math.ceil((maxY - minY) / resolution);

  const rasterArray = new Float32Array(width * height).fill(noDataValue);

  const metadata: GeoTiffMetadata = {
    width,
    height,
    noDataValue,
    compression: null,
    bitsPerSample: [],
    resolution: { x: resolution, y: resolution },
    projection: { sourceCRS: crs, origin: [minX, maxY] },
    rawBounds: bounds,
    leafletBounds: [
      [minY, minX],
      [maxY, maxX]
    ],
    /*
    stats: {
      min: noDataValue,
      max: noDataValue,
      mean: noDataValue,
      totalPixels: width * height,
      validCount: 0,
      zeroCount: 0,
      noDataCount: width * height
    }
    */
  };

  validateMetadata(metadata);
  log('buildReferenceRaster:', metadata);

  return { rasterArray, width, height, noDataValue, metadata };
}

/**
 * Builds a reference raster grid from existing GeoTiffMetadata.
 * Expects metadata to include full GeoTiff fields: resolution, projection.sourceCRS,
 * projection.origin, rawBounds, leafletBounds.
 */
export function buildReferenceRasterFromMetadata(m: GeoTiffMetadata): RasterData {
  const { width, height, resolution, projection, rawBounds } = m;
  const originX = projection.origin?.[0];
  const originY = projection.origin?.[1];

  if (originX == null || originY == null) {
    throw new Error('Metadata projection.origin must be defined.');
  }

  const pixelWidth = resolution.x;
  const pixelHeight = resolution.y;

  // Compute projected grid bounds
  const minX = originX;
  const maxY = originY;
  const maxX = originX + pixelWidth * width;
  const minY = originY - pixelHeight * height;

  const rasterArray = new Float32Array(width * height).fill(m.noDataValue ?? NODATA_VALUE);

  const metadata: GeoTiffMetadata = {
    width,
    height,
    noDataValue: m.noDataValue ?? NODATA_VALUE,
    compression: m.compression ?? null,
    bitsPerSample: m.bitsPerSample ?? [],
    resolution: { x: pixelWidth, y: pixelHeight },
    projection: { sourceCRS: projection.sourceCRS!, origin: [originX, originY] },
    rawBounds: [minX, minY, maxX, maxY],
    leafletBounds: m.leafletBounds,
    stats: m.stats || {
      min: 0,
      max: 0,
      mean: 0,
      totalPixels: width * height,
      validCount: width * height,
      zeroCount: 0,
      noDataCount: 0
    }
  };

  validateMetadata(metadata);
  log('buildReferenceRasterFromMetadata:', metadata);

  return { rasterArray, width, height, noDataValue: metadata.noDataValue!, metadata };
}
