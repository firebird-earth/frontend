import * as GeoTIFF from 'geotiff';
import proj4 from 'proj4';
import { validateGeoTiff } from './validation';
import { GeoTiffMetadata } from './types';

// Re-export everything
export * from './loaders';
export * from './validation';
export * from './bounds';
export * from './metadata';

// Helper to safely parse TIFF data
export async function safeParseGeoTiff(arrayBuffer: ArrayBuffer): Promise<GeoTIFF.GeoTIFF> {
  try {
    // Basic TIFF structure validation
    validateGeoTiff(arrayBuffer);
    
    // Parse the TIFF
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    if (!tiff) {
      throw new Error('Failed to parse TIFF data');
    }
    
    return tiff;
  } catch (error) {
    console.error('Error parsing TIFF:', error);
    throw new Error(`Failed to parse TIFF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to create bounds from bbox coordinates
export function createBoundsFromBbox(bbox: string): [[number, number], [number, number]] {
  const [west, south, east, north] = bbox.split(',').map(Number);
  return [[south, west], [north, east]];
}

/*
// Register common CRS definitions
export function registerCommonCRS() {
  // Web Mercator (EPSG:3857)
  if (!proj4.defs('EPSG:3857')) {
    proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs');
  }

  // WGS84 (EPSG:4326)
  if (!proj4.defs('EPSG:4326')) {
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
  }

  // NAD83 (EPSG:4269)
  if (!proj4.defs('EPSG:4269')) {
    proj4.defs('EPSG:4269', '+proj=longlat +datum=NAD83 +no_defs');
  }
}

// Initialize common CRS definitions
registerCommonCRS();
*/