import * as GeoTIFF from 'geotiff';
import { GeoTiffMetadata } from './types';
import { validateGeoTiff } from './validation';

export async function extractGeoTiffMetadata(file: File): Promise<GeoTiffMetadata> {
  try {
    console.log('Starting GeoTIFF metadata extraction...');
    console.log('File:', file.name, file.size, 'bytes', file.type);

    const arrayBuffer = await file.arrayBuffer();
    validateGeoTiff(arrayBuffer);

    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();

    if (!image) {
      throw new Error('No image found in GeoTIFF');
    }

    console.log('GeoTIFF image loaded:', {
      width: image.getWidth(),
      height: image.getHeight(),
      samplesPerPixel: image.fileDirectory.SamplesPerPixel,
      bitsPerSample: image.fileDirectory.BitsPerSample,
      compression: image.fileDirectory.Compression,
      photometric: image.fileDirectory.PhotometricInterpretation
    });

    const width = image.getWidth();
    const height = image.getHeight();
    console.log('Reading raster data...');
    const rasters = await image.readRasters();
    const data = rasters[0];

    if (!data) {
      throw new Error('No raster data found');
    }

    console.log('Raw data statistics:', {
      length: data.length,
      type: data.constructor.name
    });

    // Get the GDAL_NODATA value
    const rawNoData = image.fileDirectory.GDAL_NODATA;
    console.log('Raw GDAL_NODATA value:', rawNoData);
    
    const noDataValue = rawNoData !== undefined
      ? Number(rawNoData.replace('\x00', ''))
      : null;
    
    console.log('Parsed NODATA value:', noDataValue);

    // Calculate resolution and origin
    let resolution = { x: NaN, y: NaN };
    let origin: [number, number] | null = null;

    console.log('Model transformation tags:', {
      pixelScale: image.fileDirectory.ModelPixelScaleTag,
      tiepoint: image.fileDirectory.ModelTiepointTag,
      transform: image.fileDirectory.ModelTransformationTag
    });
    
    if (image.fileDirectory.ModelTransformationTag) {
      const matrix = image.fileDirectory.ModelTransformationTag;
      resolution = {
        x: Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]),
        y: Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5])
      };
      origin = [matrix[3], matrix[7]];
      console.log('Resolution and origin from ModelTransformationTag:', { resolution, origin });
    } else if (image.fileDirectory.ModelTiepointTag && image.fileDirectory.ModelPixelScaleTag) {
      const [scaleX, scaleY] = image.fileDirectory.ModelPixelScaleTag;
      const [i, j, k, x, y, z] = image.fileDirectory.ModelTiepointTag;
      resolution = {
        x: Math.abs(scaleX),
        y: Math.abs(scaleY)
      };
      origin = [x, y];
      console.log('Resolution and origin from ModelTiepointTag + ModelPixelScaleTag:', { resolution, origin });
    } else if (image.fileDirectory.ModelTiepointTag) {
      const [i, j, k, x, y, z] = image.fileDirectory.ModelTiepointTag;
      origin = [x, y];
      const bbox = image.getBoundingBox();
      if (bbox && bbox.length === 4) {
        const [minX, minY, maxX, maxY] = bbox;
        resolution = {
          x: Math.abs(maxX - minX) / width,
          y: Math.abs(maxY - minY) / height
        };
      }
      console.log('Resolution and origin from ModelTiepointTag + bbox:', { resolution, origin });
    } else {
      const bbox = image.getBoundingBox();
      if (bbox && bbox.length === 4) {
        const [minX, minY, maxX, maxY] = bbox;
        resolution = {
          x: Math.abs(maxX - minX) / width,
          y: Math.abs(maxY - minY) / height
        };
        origin = [minX, maxY];
        console.log('Resolution and origin from bbox:', { resolution, origin });
      }
    }

    // Get bounding box and log details
    const bbox = image.getBoundingBox();
    console.log('Raw bounding box:', bbox);
    
    if (bbox && bbox.length === 4) {
      const [minX, minY, maxX, maxY] = bbox;
      console.log('Bounding box coordinates:', {
        minX, minY, maxX, maxY,
        width: Math.abs(maxX - minX),
        height: Math.abs(maxY - minY)
      });
    } else {
      console.warn('Invalid or missing bounding box');
    }

    // Extract CRS information
    const geoKeys = image.geoKeys || {};
    console.log('GeoKeys:', geoKeys);
    
    let crs = 'Unknown';
    let projectionName = '';
    let datum = '';

    if (geoKeys.ProjectedCSTypeGeoKey) {
      crs = geoKeys.ProjectedCSTypeGeoKey.toString();
      projectionName = geoKeys.GTCitationGeoKey || '';
      projectionName = projectionName.replace(/^PCS Name = /, '');
      console.log('Projected CRS:', { crs, projectionName });
    } else if (geoKeys.GeographicTypeGeoKey) {
      crs = geoKeys.GeographicTypeGeoKey.toString();
      const geogCitation = geoKeys.GeogCitationGeoKey || '';
      const datumMatch = geogCitation.match(/Datum = ([^|]+)/);
      datum = datumMatch ? datumMatch[1] : '';
      console.log('Geographic CRS:', { crs, datum });
    }

    // Compute statistics
    console.log('Computing raster statistics...');
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let validCount = 0;
    let zeroCount = 0;
    let noDataCount = 0;
    let nanCount = 0;
    let infCount = 0;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (value !== undefined) {
        if (isNaN(value)) {
          nanCount++;
          continue;
        }
        if (!isFinite(value)) {
          infCount++;
          continue;
        }
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

    console.log('Data statistics:', {
      min,
      max,
      mean,
      validCount,
      zeroCount,
      noDataCount,
      nanCount,
      infCount,
      totalPixels: width * height
    });

    // Extract model transform information
    const modelTransform = {
      matrix: image.fileDirectory.ModelTransformationTag,
      tiepoint: image.fileDirectory.ModelTiepointTag,
      origin
    };

    // Get custom metadata
    const customMetadata = {
      units: '',
      description: ''
    };

    if (image.fileDirectory.GDAL_METADATA) {
      console.log('Raw GDAL metadata:', image.fileDirectory.GDAL_METADATA);
      try {
        const metadata = image.fileDirectory.GDAL_METADATA;
        const unitsMatch = metadata.match(/<Item name="units">(.*?)<\/Item>/);
        const descMatch = metadata.match(/<Item name="description">(.*?)<\/Item>/);
        
        if (unitsMatch) customMetadata.units = unitsMatch[1];
        if (descMatch) customMetadata.description = descMatch[1];
        
        console.log('Parsed custom metadata:', customMetadata);
      } catch (e) {
        console.warn('Failed to parse GDAL metadata:', e);
      }
    }

    const metadata: GeoTiffMetadata = {
      metadata: {
        standard: {
          imageWidth: width,
          imageHeight: height,
          bitsPerSample: image.fileDirectory.BitsPerSample || [],
          compression: image.fileDirectory.Compression || null,
          modelTransform,
          resolution,
          noData: noDataValue,
          nonNullValues: validCount,
          totalPixels: width * height,
          zeroCount,
          crs,
          projectionName,
          datum
        },
        custom: customMetadata
      },
      range: {
        min,
        max,
        mean
      }
    };

    console.log('Final metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('GeoTIFF Metadata extraction failed:', error);
    throw error;
  }
}