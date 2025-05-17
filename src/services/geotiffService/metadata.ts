// src/services/geotiffService/metadata.ts

import * as GeoTIFF from 'geotiff';
import { GeoTiffMetadata } from './types';
import { validateGeoTiff } from './validateGeoTiff';
import { getGeoTiffBounds } from './bounds';

const DEBUG = false;
function log(...args: any[]) {
  if (DEBUG) { console.log('[Metadata]', ...args); }
}

// Validation function for GeoTiffMetadata
function isValidGeoTiffMetadata(data: any): data is GeoTiffMetadata {
  const requiredKeys: (keyof GeoTiffMetadata)[] = [
    'width', 'height', 'noDataValue', 'bitsPerSample',
    'compression', 'resolution', 'projection', 'rawBounds', 'stats'
  ];
  return requiredKeys.every(key => key in data);
}

export async function extractGeoTiffMetadata(file: File): Promise<GeoTiffMetadata> {
  try {
    log('Starting GeoTIFF metadata extraction...');
    log('File:', file.name, file.size, 'bytes', file.type);

    const arrayBuffer = await file.arrayBuffer();
    validateGeoTiff(arrayBuffer);

    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    if (!image) throw new Error('No image found in GeoTIFF');

    // Log raw file directory contents
    log('Raw file directory:', image.fileDirectory);
    log('ModelPixelScaleTag:', {
      raw: image.fileDirectory.ModelPixelScaleTag,
      type: image.fileDirectory.ModelPixelScaleTag
        ? image.fileDirectory.ModelPixelScaleTag.constructor.name
        : 'undefined',
      length: image.fileDirectory.ModelPixelScaleTag
        ? image.fileDirectory.ModelPixelScaleTag.length
        : 0,
      values: image.fileDirectory.ModelPixelScaleTag
        ? Array.from(image.fileDirectory.ModelPixelScaleTag)
        : []
    });

    log('GeoTIFF image loaded:', {
      width: image.getWidth(),
      height: image.getHeight(),
      samplesPerPixel: image.fileDirectory.SamplesPerPixel,
      bitsPerSample: image.fileDirectory.BitsPerSample,
      compression: image.fileDirectory.Compression,
      photometric: image.fileDirectory.PhotometricInterpretation
    });

    const width = image.getWidth();
    const height = image.getHeight();
    log('Reading raster data...');
    const rasters = await image.readRasters();
    const data = rasters[0] as Int16Array | Float32Array;
    if (!data) throw new Error('No raster data found');

    log('Raw data statistics:', { length: data.length, type: data.constructor.name });

    // Get the GDAL_NODATA value
    const rawNoData = image.fileDirectory.GDAL_NODATA;
    log('Raw GDAL_NODATA value:', rawNoData);
    const noDataValue = rawNoData !== undefined
      ? Number(rawNoData.replace('\x00', ''))
      : null;
    log('Parsed NODATA value:', noDataValue);

    // Get bounds information
    const boundsInfo = await getGeoTiffBounds(image);

    // Calculate resolution
    let resolution = { x: NaN, y: NaN };
    if (image.fileDirectory.ModelPixelScaleTag) {
      const scale = image.fileDirectory.ModelPixelScaleTag;
      resolution = { x: Math.abs(scale[0]), y: Math.abs(scale[1]) };
    } else if (boundsInfo.rawBounds) {
      const [minX, minY, maxX, maxY] = boundsInfo.rawBounds;
      const latSpan = Math.abs(maxY - minY);
      const lngSpan = Math.abs(maxX - minX);
      const isGeographic = boundsInfo.sourceCRS === 'EPSG:4326';
      if (isGeographic) {
        const metersPerDegree = 111319.5;
        const centerLat = (maxY + minY) / 2;
        const lngCorrection = Math.cos(centerLat * Math.PI / 180);
        resolution = {
          x: (lngSpan * metersPerDegree * lngCorrection) / width,
          y: (latSpan * metersPerDegree) / height
        };
      } else {
        resolution = { x: lngSpan / width, y: latSpan / height };
      }
    }
    log('Resolution:', resolution);

    // Compute statistics using shared utility
    log('Computing raster statistics...');
    const stats = computeMetadataStats(data, noDataValue);
    const { min, max, mean, validCount, noDataCount, zeroCount, totalPixels } = stats;
    log('Data statistics:', { min, max, mean, validCount, noDataCount, zeroCount, totalPixels, resolution });

    if (image.fileDirectory.GDAL_METADATA) {
      log('Raw GDAL metadata:', image.fileDirectory.GDAL_METADATA);
      try {
        const metadata = image.fileDirectory.GDAL_METADATA;
      } catch (e) {
        console.warn('Failed to parse GDAL metadata:', e);
      }
    }

    // Convert BitsPerSample
    const bitsPerSample = Array.isArray(image.fileDirectory.BitsPerSample)
      ? Array.from(image.fileDirectory.BitsPerSample).map(Number)
      : [Number(image.fileDirectory.BitsPerSample)];

    // Construct final metadata object
    const metadata = {
      width,
      height,
      noDataValue,
      bitsPerSample,
      compression: image.fileDirectory.Compression || null,
      resolution,
      projection: {
        sourceCRS: boundsInfo.sourceCRS,
        tiepoint: boundsInfo.tiepoint,
        scale: boundsInfo.pixelScale,
        transform: boundsInfo.transform,
        matrix: boundsInfo.transform,
        origin: boundsInfo.transform
          ? [boundsInfo.transform[3], boundsInfo.transform[7]]
          : [boundsInfo.rawBounds[0], boundsInfo.rawBounds[3]]
      },
      rawBounds: boundsInfo.rawBounds,
      leafletBounds: boundsInfo.leafletBounds,
      stats: stats
    } satisfies GeoTiffMetadata;

    if (!isValidGeoTiffMetadata(metadata)) {
      throw new Error('Invalid GeoTiffMetadata: Missing or incorrect properties');
    }

    log('Final metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('GeoTIFF Metadata extraction failed:', error);
    throw error;
  }
}

/**
 * Computes raster statistics for metadata.stats.
 * Includes debug logging of the first few "valid" pixel values
 * to catch any unexpected zeros or sub-1 values.
 *
 * @param array         the raster values array (typed array or number[])
 * @param noDataValue   the value representing no-data in the array
 * @returns             a stats object compatible with GeoTiffMetadata['stats']
 */
export function computeMetadataStats(
  array: Int16Array | Float32Array | Uint8Array | number[],
  noDataValue: number | null
): GeoTiffMetadata['stats'] {
  const totalPixels = array.length;
  let validCount = 0;
  let noDataCount = 0;
  let zeroCount = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  // DEBUG: capture first few valid values
  const sampleVals: number[] = [];

  for (let i = 0; i < array.length; i++) {
    const v = array[i];
    if (
      v === undefined ||
      v === null ||
      isNaN(v as number) ||
      !isFinite(v as number) ||
      (noDataValue !== null && v === noDataValue)
    ) {
      noDataCount++;
    } else {
      validCount++;
      sum += (v as number);
      if (v < min) min = v as number;
      if (v > max) max = v as number;
      if (v === 0) zeroCount++;
      if (sampleVals.length < 5) sampleVals.push(v as number);
    }
  }

  const mean = validCount > 0 ? sum / validCount : 0;

  log(`totalPixels=${totalPixels}, validCount=${validCount}, noDataCount=${noDataCount}, zeroCount=${zeroCount}`);
  log(`sample of first valid values: [${sampleVals.join(', ')}]`);
  log(`computed min=${min}, max=${max}, mean=${mean}`);

  return {
    min,
    max,
    mean,
    totalPixels,
    validCount,
    noDataCount,
    zeroCount
  };
}
