// referenceRaster.ts

import type { GeoTiffMetadata, RasterData } from '../types/geotiff';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[ReferenceRaster]', ...args); }
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
