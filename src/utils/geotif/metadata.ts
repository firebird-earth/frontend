import * as GeoTIFF from 'geotiff';
import { GeoTiffMetadata } from './types';
import { validateGeoTiff } from './validation';
import { getGeoTiffBounds } from './bounds';

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
    const data = rasters[0] as Int16Array | Float32Array;

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

    // Get GeoKeys for CRS information
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

    // Get transformation information
    const tiepoint = image.fileDirectory.ModelTiepointTag;
    const scale = image.fileDirectory.ModelPixelScaleTag;
    const transform = image.fileDirectory.ModelTransformationTag;

    console.log('Transformation info:', {
      tiepoint: tiepoint ? Array.from(tiepoint) : null,
      scale: scale ? Array.from(scale) : null,
      transform: transform ? Array.from(transform) : null
    });

    // Get bounds information
    const boundsInfo = await getGeoTiffBounds(image);

    // Calculate statistics
    console.log('Computing raster statistics...');
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

    console.log('Data statistics:', {
      min,
      max,
      mean,
      validCount,
      noDataCount,
      zeroCount,
      totalPixels: width * height
    });

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

    // Construct the final metadata object
    const metadata: GeoTiffMetadata = {
      metadata: {
        standard: {
          imageWidth: width,
          imageHeight: height,
          bitsPerSample: image.fileDirectory.BitsPerSample || [],
          compression: image.fileDirectory.Compression || null,
          modelTransform: {
            matrix: transform,
            tiepoint: tiepoint,
            origin: boundsInfo.transform ? [boundsInfo.transform[3], boundsInfo.transform[7]] : null
          },
          resolution: {
            x: scale ? Math.abs(scale[0]) : NaN,
            y: scale ? Math.abs(scale[1]) : NaN
          },
          noData: noDataValue,
          nonNullValues: validCount,
          totalPixels: width * height,
          zeroCount,
          crs,
          projectionName,
          datum,
          rawBounds: boundsInfo.rawBounds,
          sourceCRS: boundsInfo.sourceCRS,
          tiepoint,
          scale,
          transform
        },
        custom: customMetadata
      },
      range: {
        min,
        max,
        mean
      }
    };

    console.log('Final metadata:', {
      dimensions: `${width}x${height}`,
      bounds: boundsInfo.bounds,
      sourceCRS: boundsInfo.sourceCRS,
      stats: {
        min,
        max,
        mean,
        validCount,
        noDataCount,
        zeroCount
      }
    });

    return metadata;
  } catch (error) {
    console.error('GeoTIFF Metadata extraction failed:', error);
    throw error;
  }
}