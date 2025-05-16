// referenceRaster.ts
import type { Raster, RasterMetadata } from "./types";
import type { GeoTiffMetadata, RasterData } from '../types/geotiff';
import { RESOLUTION, NODATA_VALUE } from '../globals';
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[ReferenceRaster]', ...args); }
}

/**
 * Builds a reference raster grid to which all other rasters/vectors will be aligned.
 *
 * Uses a default resolution of 30 (meters) and default CRS of EPSG:3857 (WGS84 / Pseudo-Mercator).
 *
 * @param bounds [minX, minY, maxX, maxY] in the target CRS units.
 * @param resolution resolution of each pixel (in same units as CRS), default 30.
 * @param crs target coordinate reference system (e.g., "EPSG:3857").
 * @param noDataValue value to use for no-data cells, default -9999.
 */
export function buildReferenceRaster(
  bounds: [number, number, number, number],
  resolution: number = RESOLUTION,
  crs: string = "EPSG:3857",
  noDataValue: number = NODATA_VALUE
): Raster {
  const [minX, minY, maxX, maxY] = bounds;
  const width = Math.ceil((maxX - minX) / resolution);
  const height = Math.ceil((maxY - minY) / resolution);

  // Initialize all cells to noDataValue
  const rasterArray = new Float32Array(width * height).fill(noDataValue);

  const metadata: RasterMetadata = {
    width,
    height,
    noDataValue,
    resolution: { x: resolution, y: resolution },
    projection: { sourceCRS: crs, origin: [minX, maxY] },
    rawBounds: bounds,
    // Additional metadata fields (e.g., bitsPerSample, compression) can be added as needed
  };

  return { rasterArray, width, height, metadata };
}

/**
 * Build an empty reference raster grid from feature‐layer metadata.
 * Uses projected extents for rawBounds (so it lines up in Web-Mercator)
 * and geographic extents for leafletBounds.
 */
export function buildReferenceRasterFromMetadata(m: {
  width: number;
  height: number;
  originX: number;
  originY: number;
  pixelWidth: number;
  pixelHeight: number;
  bounds: [number, number, number, number];
  noDataValue?: number;
}): RasterData {
  const { width, height, originX, originY, pixelWidth, pixelHeight, bounds: geoBounds } = m;

  // Projected grid bounds (in map projection units)
  const projMinX = originX;
  const projMaxY = originY;
  const projMaxX = originX + pixelWidth * width;
  const projMinY = originY + pixelHeight * height;

  // Geographic envelope for leaflet
  const [geoMinX, geoMinY, geoMaxX, geoMaxY] = geoBounds;

  const metadata: GeoTiffMetadata = {
    width,
    height,
    noDataValue: (m.noDataValue ?? -9999),
    compression: null,
    bitsPerSample: [],
    resolution: { x: pixelWidth, y: Math.abs(pixelHeight) },
    projection: { origin: [originX, originY] as any },
    rawBounds: [projMinX, projMinY, projMaxX, projMaxY],
    leafletBounds: [
      [geoMinY, geoMinX],
      [geoMaxY, geoMaxX]
    ],
    stats: {
      min: 0,
      max: 0,
      mean: 0,
      totalPixels: width * height,
      validCount: width * height,
      zeroCount: 0,
      noDataCount: 0
    }
  };

  log('metadata:', metadata)
  
  return {
    rasterArray: new Float32Array(width * height),
    width,
    height,
    noDataValue: metadata.noDataValue,
    metadata
  };
}
