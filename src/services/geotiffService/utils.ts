import * as GeoTIFF from 'geotiff';
import proj4 from 'proj4';
import { validateGeoTiff } from './validateGeoTiff';
import { GeoTiffMetadata } from './types';

// Re-export everything
export * from './loaders';
export * from './validateGeoTiff';
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
