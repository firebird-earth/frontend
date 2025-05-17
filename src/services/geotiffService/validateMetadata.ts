// metadataValidator.ts
import { GeoTiffMetadata } from './types/geotiff';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[validateMetadata]', ...args); }
}

/**
 * Runtime validator for GeoTiffMetadata-like objects.
 * Throws an Error if validation fails.
 */
export function validateMetadata(meta: any): asserts meta is GeoTiffMetadata {
  const errors: string[] = [];

  // width & height
  if (typeof meta.width !== 'number' || meta.width <= 0) {
    errors.push(`width must be a positive number, got ${meta.width}`);
  }
  if (typeof meta.height !== 'number' || meta.height <= 0) {
    errors.push(`height must be a positive number, got ${meta.height}`);
  }

  // noDataValue
  if (typeof meta.noDataValue !== 'number' && meta.noDataValue !== null) {
    errors.push(`noDataValue must be number or null, got ${meta.noDataValue}`);
  }

  // resolution
  if (!meta.resolution || typeof meta.resolution.x !== 'number' || typeof meta.resolution.y !== 'number') {
    errors.push(`resolution must be {x: number, y: number}, got ${JSON.stringify(meta.resolution)}`);
  }

  // projection
  if (!meta.projection || typeof meta.projection.sourceCRS !== 'string') {
    errors.push(`projection.sourceCRS must be string, got ${meta.projection?.sourceCRS}`);
  }
  if (!Array.isArray(meta.projection.origin) || meta.projection.origin.length !== 2 ||
      typeof meta.projection.origin[0] !== 'number' || typeof meta.projection.origin[1] !== 'number') {
    errors.push(`projection.origin must be [number, number], got ${JSON.stringify(meta.projection?.origin)}`);
  }

  // rawBounds
  if (!Array.isArray(meta.rawBounds) || meta.rawBounds.length !== 4 ||
      !meta.rawBounds.every(n => typeof n === 'number')) {
    errors.push(`rawBounds must be [minX, minY, maxX, maxY], got ${JSON.stringify(meta.rawBounds)}`);
  }

  // leafletBounds
  if (!Array.isArray(meta.leafletBounds) || meta.leafletBounds.length !== 2 ||
      !Array.isArray(meta.leafletBounds[0]) || meta.leafletBounds[0].length !== 2 ||
      !Array.isArray(meta.leafletBounds[1]) || meta.leafletBounds[1].length !== 2 ||
      !meta.leafletBounds.flat().every(n => typeof n === 'number')) {
    errors.push(`leafletBounds must be [[south, west], [north, east]], got ${JSON.stringify(meta.leafletBounds)}`);
  }

/*
  // compression
  if (typeof meta.compression !== 'number' && meta.compression !== null) {
    errors.push(`compression must be number or null, got ${meta.compression}`);
  }

  // bitsPerSample
  if (!Array.isArray(meta.bitsPerSample) || !meta.bitsPerSample.every(n => typeof n === 'number')) {
    errors.push(`bitsPerSample must be number[], got ${JSON.stringify(meta.bitsPerSample)}`);
  }
*/
  if (errors.length) {
    throw new Error('Invalid metadata: ' + errors.join('; '));
  }

  log('metadata is valid')
}
