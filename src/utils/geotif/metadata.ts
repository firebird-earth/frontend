import * as GeoTIFF from 'geotiff';
import { GeoTiffMetadata } from './types';
import { validateGeoTiff } from './validation';
import { getGeoTiffBounds } from './bounds';

// Debug configuration
const MetadataConfig = {
  debug: false
} as const;

export function setMetadataDebug(enabled: boolean) {
  (MetadataConfig as any).debug = enabled;
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

    // Calculate resolution from bounds and dimensions if ModelPixelScaleTag is missing
    let resolution = { x: NaN, y: NaN };
    if (image.fileDirectory.ModelPixelScaleTag) {
      const scale = image.fileDirectory.ModelPixelScaleTag;
      resolution = {
        x: Math.abs(scale[0]),
        y: Math.abs(scale[1])
      };
    } else if (boundsInfo.rawBounds) {
      // Calculate from raw bounds (in source CRS units) and image dimensions
      const [minX, minY, maxX, maxY] = boundsInfo.rawBounds;
      resolution = {
        x: Math.abs(maxX - minX) / width,
        y: Math.abs(maxY - minY) / height
      };
      if (MetadataConfig.debug) {
        console.log('Calculated resolution from bounds:', resolution);
      }
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

    // Get custom metadata
    const customMetadata = {
      units: '',
      description: ''
    };

    if (image.fileDirectory.GDAL_METADATA) {
      if (MetadataConfig.debug) {
        console.log('Raw GDAL metadata:', image.fileDirectory.GDAL_METADATA);
      }
      try {
        const metadata = image.fileDirectory.GDAL_METADATA;
        const unitsMatch = metadata.match(/<Item name="units">(.*?)<\/Item>/);
        const descMatch = metadata.match(/<Item name="description">(.*?)<\/Item>/);
        
        if (unitsMatch) customMetadata.units = unitsMatch[1];
        if (descMatch) customMetadata.description = descMatch[1];
        
        if (MetadataConfig.debug) {
          console.log('Parsed custom metadata:', customMetadata);
        }
      } catch (e) {
        console.warn('Failed to parse GDAL metadata:', e);
      }
    }

    // Construct the final metadata object
    const metadata: GeoTiffMetadata = {
      metadata: {
        standard: {
          imageWidth: width,
          imageHeight: height,
          bitsPerSample: image.fileDirectory.BitsPerSample || [],
          compression: image.fileDirectory.Compression || null,
          modelTransform: {
            matrix: boundsInfo.transform,
            tiepoint: boundsInfo.tiepoint,
            origin: boundsInfo.transform ? [boundsInfo.transform[3], boundsInfo.transform[7]] : null
          },
          resolution,
          noData: noDataValue,
          nonNullValues: validCount,
          totalPixels: width * height,
          zeroCount,
          noDataCount,
          crs: boundsInfo.sourceCRS,
          projectionName: '',
          datum: '',
          rawBounds: boundsInfo.rawBounds,
          sourceCRS: boundsInfo.sourceCRS,
          tiepoint: boundsInfo.tiepoint,
          scale: boundsInfo.pixelScale,
          transform: boundsInfo.transform
        },
        custom: customMetadata
      },
      range: {
        min,
        max,
        mean
      }
    };

    if (MetadataConfig.debug) {
      console.log('Final metadata:', {
        dimensions: `${width}x${height}`,
        bounds: boundsInfo.bounds,
        sourceCRS: boundsInfo.sourceCRS,
        resolution,
        stats: {
          min,
          max,
          mean,
          validCount,
          noDataCount,
          zeroCount
        }
      });
    }

    return metadata;
  } catch (error) {
    console.error('GeoTIFF Metadata extraction failed:', error);
    throw error;
  }
}