import * as GeoTIFF from 'geotiff';
import proj4 from 'proj4';
import { validateGeoTiff } from './validation';
import { GeoTiffMetadata } from './types';
import { getGeoTiffBounds } from './bounds';
import { extractGeoTiffMetadata } from './metadata';

// Re-export everything
export * from './types';
export * from './loaders';
export * from './validation';
export * from './bounds';
export * from './circles';
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

// Helper to register UTM CRS definitions
export function registerUTMProjection(epsgCode: string) {
  // Only handle UTM codes
  if (!epsgCode.match(/^EPSG:(269|327)\d{2}$/)) {
    return;
  }

  // Extract zone number from EPSG code
  const zone = parseInt(epsgCode.slice(-2));
  if (isNaN(zone) || zone < 1 || zone > 60) {
    return;
  }

  // Determine hemisphere and datum
  const isNAD83 = epsgCode.startsWith('EPSG:269');
  const isNorth = epsgCode.startsWith('EPSG:269') || epsgCode.startsWith('EPSG:326');
  const hemisphere = isNorth ? '' : '+south';
  const datum = isNAD83 ? '+datum=NAD83' : '+datum=WGS84';

  // Create proj4 definition
  const proj4def = `+proj=utm +zone=${zone} ${hemisphere} ${datum} +units=m +no_defs`;

  // Register the CRS if not already defined
  if (!proj4.defs(epsgCode)) {
    proj4.defs(epsgCode, proj4def);
  }
}

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