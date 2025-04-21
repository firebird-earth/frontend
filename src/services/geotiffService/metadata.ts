// src/services/geotiffService/metadata.ts

import * as GeoTIFF from 'geotiff';
import { GeoTiffMetadata } from './types';
import { validateGeoTiff } from './validation';
import { getGeoTiffBounds } from './bounds';

// Debug configuration
const MetadataConfig = {
  debug: true
} as const;

export function setMetadataDebug(enabled: boolean) {
  (MetadataConfig as any).debug = enabled;
}

// Validation function for GeoTiffMetadata
function isValidGeoTiffMetadata(data: any): data is GeoTiffMetadata {
  const requiredKeys: (keyof GeoTiffMetadata)[] = ['width', 'height', 'noDataValue', 'bitsPerSample', 'compression', 'resolution', 'projection', 'rawBounds', 'stats'];
  return requiredKeys.every(key => key in data);
}

export async function extractGeoTiffMetadata(file: File): Promise<GeoTiffMetadata> {
  try {
    if (MetadataConfig.debug) {
      console.log('Starting GeoTIFF metadata extraction...');
      console.log('File:', file.name, file.size, 'bytes', file.type);
    }

    const arrayBuffer = await file.arrayBuffer();
    validateGeoTiff(arrayBuffer);

    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();

    if (!image) {
      throw new Error('No image found in GeoTIFF');
    }

    // Log raw file directory contents
    if (MetadataConfig.debug) {
      console.log('Raw file directory:', image.fileDirectory);
      console.log('ModelPixelScaleTag:', {
        raw: image.fileDirectory.ModelPixelScaleTag,
        type: image.fileDirectory.ModelPixelScaleTag ? image.fileDirectory.ModelPixelScaleTag.constructor.name : 'undefined',
        length: image.fileDirectory.ModelPixelScaleTag ? image.fileDirectory.ModelPixelScaleTag.length : 0,
        values: image.fileDirectory.ModelPixelScaleTag ? Array.from(image.fileDirectory.ModelPixelScaleTag) : []
      });

      console.log('GeoTIFF image loaded:', {
        width: image.getWidth(),
        height: image.getHeight(),
        samplesPerPixel: image.fileDirectory.SamplesPerPixel,
        bitsPerSample: image.fileDirectory.BitsPerSample,
        compression: image.fileDirectory.Compression,
        photometric: image.fileDirectory.PhotometricInterpretation
      });
    }

    const width = image.getWidth();
    const height = image.getHeight();
    if (MetadataConfig.debug) {
      console.log('Reading raster data...');
    }
    const rasters = await image.readRasters();
    const data = rasters[0] as Int16Array | Float32Array;

    if (!data) {
      throw new Error('No raster data found');
    }

    if (MetadataConfig.debug) {
      console.log('Raw data statistics:', {
        length: data.length,
        type: data.constructor.name
      });
    }

    // Get the GDAL_NODATA value
    const rawNoData = image.fileDirectory.GDAL_NODATA;
    if (MetadataConfig.debug) {
      console.log('Raw GDAL_NODATA value:', rawNoData);
    }
    
    const noDataValue = rawNoData !== undefined
      ? Number(rawNoData.replace('\x00', ''))
      : null;
    
    if (MetadataConfig.debug) {
      console.log('Parsed NODATA value:', noDataValue);
    }

    // Get bounds information
    const boundsInfo = await getGeoTiffBounds(image);

    // Calculate resolution based on available information
    let resolution = { x: NaN, y: NaN };

    if (image.fileDirectory.ModelPixelScaleTag) {
      // Use ModelPixelScaleTag if available (typically for GeoTIFFs)
      const scale = image.fileDirectory.ModelPixelScaleTag;
      resolution = {
        x: Math.abs(scale[0]),
        y: Math.abs(scale[1])
      };
    } else if (boundsInfo.rawBounds) {
      // Calculate resolution from bounds and dimensions
      const [minX, minY, maxX, maxY] = boundsInfo.rawBounds;
      const latSpan = Math.abs(maxY - minY);
      const lngSpan = Math.abs(maxX - minX);
      
      // For geographic coordinates (degrees), convert to approximate meters
      const isGeographic = boundsInfo.sourceCRS === 'EPSG:4326';
      if (isGeographic) {
        // At the equator, 1 degree ≈ 111,319.5 meters
        const metersPerDegree = 111319.5;
        const centerLat = (maxY + minY) / 2;
        const lngCorrection = Math.cos(centerLat * Math.PI / 180);
        
        resolution = {
          x: (lngSpan * metersPerDegree * lngCorrection) / width,
          y: (latSpan * metersPerDegree) / height
        };
      } else {
        // For projected coordinates (already in meters)
        resolution = {
          x: lngSpan / width,
          y: latSpan / height
        };
      }
    }

    if (MetadataConfig.debug) {
      console.log('Resolution:', resolution);
    }

    // Calculate statistics
    if (MetadataConfig.debug) {
      console.log('Computing raster statistics...');
    }
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let validCount = 0;
    let noDataCount = 0;
    let zeroCount = 0;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (value !== undefined && !isNaN(value) && isFinite(value)) {
        if (noDataValue !== null && value === noDataValue) {
          noDataCount++;
          continue;
        }
        if (value === 0) {
          zeroCount++;
        }
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        validCount++;
      }
    }

    const mean = validCount > 0 ? sum / validCount : 0;

    if (MetadataConfig.debug) {
      console.log('Data statistics:', {
        min,
        max,
        mean,
        validCount,
        noDataCount,
        zeroCount,
        totalPixels: width * height,
        resolution
      });
    }

    if (image.fileDirectory.GDAL_METADATA) {
      if (MetadataConfig.debug) {
        console.log('Raw GDAL metadata:', image.fileDirectory.GDAL_METADATA);
      }
      try {
        const metadata = image.fileDirectory.GDAL_METADATA;
      } catch (e) {
        console.warn('Failed to parse GDAL metadata:', e);
      }
    }

    // Convert BitsPerSample to a proper array of numbers
    const bitsPerSample = Array.isArray(image.fileDirectory.BitsPerSample) 
      ? Array.from(image.fileDirectory.BitsPerSample).map(Number)
      : [Number(image.fileDirectory.BitsPerSample)];

    // Construct the final metadata object
    const metadata = {
      width,
      height,
      noDataValue,
      bitsPerSample: bitsPerSample,
      compression: image.fileDirectory.Compression || null,
      resolution,
      projection: {
        sourceCRS: boundsInfo.sourceCRS,
        tiepoint: boundsInfo.tiepoint,
        scale: boundsInfo.pixelScale,
        transform: boundsInfo.transform,
        matrix: boundsInfo.transform,
        origin: boundsInfo.transform ? [boundsInfo.transform[3], boundsInfo.transform[7]] : null
      },
      rawBounds: boundsInfo.rawBounds,
      leafletBounds: boundsInfo.leafletBounds,
      stats: {
        min,
        max,
        mean,
        totalPixels: width * height,
        validCount,
        zeroCount,
        noDataCount
      }
    } satisfies GeoTiffMetadata;

    if (!isValidGeoTiffMetadata(metadata)) {
      throw new Error('Invalid GeoTiffMetadata: Missing or incorrect properties');
    }

    if (MetadataConfig.debug) {
      console.log('Final metadata:', metadata);
    }

    return metadata;
  } catch (error) {
    console.error('GeoTIFF Metadata extraction failed:', error);
    throw error;
  }
}
