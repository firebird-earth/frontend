import { GeoJSON } from 'geojson';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import proj4 from 'proj4';

// Register common projections
// NAD83 / UTM zone 13N (used in Colorado)
proj4.defs('EPSG:26913', '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs');

interface BufferCircleResult {
  center: [number, number]; // [lat, lng]
  radius: number; // meters
  boundaryCircle?: {
    center: [number, number]; // [lat, lng]
    radius: number; // meters
  };
}

export function calculateBufferCircle(
  center: [number, number], // [lat, lng]
  boundary: GeoJSON.FeatureCollection | null,
  defaultMiles: number = 8
): BufferCircleResult {
  // Convert miles to meters (1 mile = 1609.34 meters)
  const defaultRadius = defaultMiles * 1609.34;

  // If no boundary provided, return circle with default radius
  if (!boundary || !boundary.features || boundary.features.length === 0) {
    return {
      center,
      radius: defaultRadius
    };
  }

  try {
    // Extract all points from the boundary
    const points: [number, number][] = []; // [lat, lng]
    
    boundary.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(ring => {
          ring.forEach(coord => {
            // GeoJSON coordinates are [longitude, latitude]
            points.push([coord[1], coord[0]]);
          });
        });
      }
    });
    
    if (points.length === 0) {
      return {
        center,
        radius: defaultRadius
      };
    }
    
    // Find the minimum enclosing circle using Welzl's algorithm
    const result = findMinimumEnclosingCircle(points);
    
    console.log('Minimum enclosing circle:', result);
    
    // Add a 20% buffer to the radius
    const bufferRadius = result.radius * 1.2;
    
    // Create a boundary circle based on the minimum enclosing circle
    const boundaryCircle = {
      center: result.center,
      radius: result.radius
    };
    
    // Use the larger of calculated radius or default radius for the buffer circle
    return {
      center: result.center,
      radius: Math.max(bufferRadius, defaultRadius),
      boundaryCircle
    };
  } catch (error) {
    console.warn('Error calculating buffer circle:', error);
    // Fallback to default radius on error
    return {
      center,
      radius: defaultRadius
    };
  }
}

// Helper function to calculate the distance between two points
function distance(a: [number, number], b: [number, number]): number {
  const latA = a[0] * Math.PI / 180;
  const latB = b[0] * Math.PI / 180;
  const lngA = a[1] * Math.PI / 180;
  const lngB = b[1] * Math.PI / 180;
  
  // Haversine formula
  const dLat = latB - latA;
  const dLng = lngB - lngA;
  const a1 = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(latA) * Math.cos(latB) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1));
  
  // Earth radius in meters
  const R = 6371000;
  return R * c;
}

// Check if a point is inside a circle
function isPointInCircle(point: [number, number], circle: { center: [number, number], radius: number }): boolean {
  return distance(point, circle.center) <= circle.radius;
}

// Calculate the circle defined by three points
function circleFrom3Points(p1: [number, number], p2: [number, number], p3: [number, number]): { center: [number, number], radius: number } {
  // Convert to Cartesian coordinates for calculation
  // This is an approximation that works for small areas
  const p1x = p1[1] * Math.cos(p1[0] * Math.PI / 180) * 6371000;
  const p1y = p1[0] * 6371000;
  const p2x = p2[1] * Math.cos(p2[0] * Math.PI / 180) * 6371000;
  const p2y = p2[0] * 6371000;
  const p3x = p3[1] * Math.cos(p3[0] * Math.PI / 180) * 6371000;
  const p3y = p3[0] * 6371000;
  
  // Calculate the perpendicular bisector of p1p2
  const midP1P2x = (p1x + p2x) / 2;
  const midP1P2y = (p1y + p2y) / 2;
  const slopeP1P2 = (p2y - p1y) / (p2x - p1x);
  const perpSlopeP1P2 = -1 / slopeP1P2;
  
  // Calculate the perpendicular bisector of p2p3
  const midP2P3x = (p2x + p3x) / 2;
  const midP2P3y = (p2y + p3y) / 2;
  const slopeP2P3 = (p3y - p2y) / (p3x - p2x);
  const perpSlopeP2P3 = -1 / slopeP2P3;
  
  // Find the intersection of the two perpendicular bisectors
  const cx = (midP2P3y - midP1P2y + perpSlopeP1P2 * midP1P2x - perpSlopeP2P3 * midP2P3x) / (perpSlopeP1P2 - perpSlopeP2P3);
  const cy = midP1P2y + perpSlopeP1P2 * (cx - midP1P2x);
  
  // Convert back to [lat, lng]
  const centerLat = cy / 6371000;
  const centerLng = cx / (6371000 * Math.cos(centerLat * Math.PI / 180));
  
  // Calculate radius
  const center: [number, number] = [centerLat, centerLng];
  const radius = distance(center, p1);
  
  return { center, radius };
}

// Calculate the circle defined by two points (diameter)
function circleFrom2Points(p1: [number, number], p2: [number, number]): { center: [number, number], radius: number } {
  // Calculate midpoint
  const centerLat = (p1[0] + p2[0]) / 2;
  const centerLng = (p1[1] + p2[1]) / 2;
  const center: [number, number] = [centerLat, centerLng];
  
  // Calculate radius
  const radius = distance(center, p1);
  
  return { center, radius };
}

// Implementation of Welzl's algorithm for finding the minimum enclosing circle
function findMinimumEnclosingCircle(points: [number, number][]): { center: [number, number], radius: number } {
  // Shuffle the points to improve the algorithm's performance
  const shuffledPoints = [...points].sort(() => Math.random() - 0.5);
  
  // Base case: no points
  if (shuffledPoints.length === 0) {
    return { center: [0, 0], radius: 0 };
  }
  
  // Base case: one point
  if (shuffledPoints.length === 1) {
    return { center: shuffledPoints[0], radius: 0 };
  }
  
  // Base case: two points
  if (shuffledPoints.length === 2) {
    return circleFrom2Points(shuffledPoints[0], shuffledPoints[1]);
  }
  
  // Try to find a circle defined by the first two points
  let circle = circleFrom2Points(shuffledPoints[0], shuffledPoints[1]);
  
  // Check if all points are inside this circle
  for (let i = 2; i < shuffledPoints.length; i++) {
    if (!isPointInCircle(shuffledPoints[i], circle)) {
      // If not, try to find a circle defined by the first point and this point
      circle = circleFrom2Points(shuffledPoints[0], shuffledPoints[i]);
      
      // Check if all previous points are inside this circle
      for (let j = 1; j < i; j++) {
        if (!isPointInCircle(shuffledPoints[j], circle)) {
          // If not, the circle must be defined by these three points
          circle = circleFrom3Points(shuffledPoints[0], shuffledPoints[j], shuffledPoints[i]);
          
          // Check if all previous points are inside this circle
          for (let k = 1; k < j; k++) {
            if (!isPointInCircle(shuffledPoints[k], circle)) {
              // This shouldn't happen with three points defining the circle,
              // but if it does, fall back to a simpler approach
              circle = findApproximateMinimumEnclosingCircle(shuffledPoints);
              break;
            }
          }
        }
      }
    }
  }
  
  return circle;
}

// A simpler, approximate algorithm for finding the minimum enclosing circle
function findApproximateMinimumEnclosingCircle(points: [number, number][]): { center: [number, number], radius: number } {
  // Calculate the centroid
  let sumLat = 0;
  let sumLng = 0;
  
  for (const point of points) {
    sumLat += point[0];
    sumLng += point[1];
  }
  
  const centerLat = sumLat / points.length;
  const centerLng = sumLng / points.length;
  const center: [number, number] = [centerLat, centerLng];
  
  // Find the farthest point from the centroid
  let maxDistance = 0;
  
  for (const point of points) {
    const dist = distance(center, point);
    maxDistance = Math.max(maxDistance, dist);
  }
  
  return { center, radius: maxDistance };
}

export interface GeoTiffSummary {
  width: number;
  height: number;
  data: Float32Array | Uint16Array | Uint8Array;
  min: number;
  max: number;
  mean: number;
  noDataValue: number | null;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

export interface GeoTiffMetadata {
  metadata: {
    standard: {
      imageWidth: number;
      imageHeight: number;
      bitsPerSample: number[];
      compression: number | null;
      modelTransform: {
        matrix?: number[];
        tiepoint?: number[];
        origin: [number, number] | null;
      };
      resolution: {
        x: number;
        y: number;
      };
      noData: number | null;
      nonNullValues: number;
      totalPixels: number;
      zeroCount: number;
      crs: string;
      projectionName: string;
      datum: string;
    };
    custom: {
      units?: string;
      description?: string;
    };
  };
  range: {
    min: number;
    max: number;
    mean: number;
  };
}

// Updated here to store Leaflet-friendly bounds
// [ [south, west], [north, east] ] in WGS84
export interface GeoTiffBounds {
  bounds: [[number, number], [number, number]];
  sourceCRS: string;
  transform?: number[];
  tiepoint?: number[];
  pixelScale?: number[];
}

export async function loadGeoTiffFromUrl(url: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer> {
  try {
    console.log('Loading GeoTIFF from URL:', url);
    
    const fetchOptions: RequestInit = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/tiff,*/*'
      }
    };

    const headResponse = await fetch(url, { ...fetchOptions, method: 'HEAD' });
    if (!headResponse.ok) {
      throw new Error(`Failed to fetch file info: ${headResponse.status} ${headResponse.statusText}`);
    }
    
    const totalSize = parseInt(headResponse.headers.get('content-length') || '0', 10);
    if (totalSize === 0) {
      throw new Error('File size is 0 bytes');
    }

    console.log('GeoTIFF file size:', totalSize, 'bytes');
    console.log('Content-Type:', headResponse.headers.get('content-type'));

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (onProgress) {
        onProgress(Math.round((receivedLength / totalSize) * 100));
      }
    }

    console.log('GeoTIFF download complete:', receivedLength, 'bytes received');

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    return chunksAll.buffer;
  } catch (error) {
    console.error('Failed to load GeoTIFF:', error);
    throw error;
  }
}

export function validateGeoTiff(arrayBuffer: ArrayBuffer): void {
  console.log('Validating GeoTIFF structure...');
  
  if (arrayBuffer.byteLength < 8) {
    throw new Error('File too small to be a valid TIFF');
  }

  const dataView = new DataView(arrayBuffer);
  const byteOrder = dataView.getUint16(0, true);
  const isLittleEndian = byteOrder === 0x4949;
  const isBigEndian = byteOrder === 0x4D4D;
  
  console.log('Byte order:', isLittleEndian ? 'Little Endian (II)' : isBigEndian ? 'Big Endian (MM)' : 'Invalid');
  
  if (!isLittleEndian && !isBigEndian) {
    throw new Error(`Invalid byte order marker: 0x${byteOrder.toString(16)}`);
  }

  const magicNumber = dataView.getUint16(2, isLittleEndian);
  console.log('Magic number:', magicNumber);
  
  if (magicNumber !== 42 && magicNumber !== 43) {
    throw new Error(`Invalid TIFF magic number: ${magicNumber}`);
  }

  console.log('GeoTIFF validation successful');
}

export async function getGeoTiffBounds(image: GeoTIFF.GeoTIFFImage): Promise<GeoTiffBounds> {
  console.log('Calculating GeoTIFF bounds...');

  // Get coordinate transformation info
  const tiepoint = image.fileDirectory.ModelTiepointTag;
  const pixelScale = image.fileDirectory.ModelPixelScaleTag;
  const transform = image.fileDirectory.ModelTransformationTag;

  console.log('Coordinate transformation info:', {
    tiepoint: tiepoint ? Array.from(tiepoint) : null,
    pixelScale: pixelScale ? Array.from(pixelScale) : null,
    transform: transform ? Array.from(transform) : null
  });

  // Get GeoKeys for CRS information
  const geoKeys = image.geoKeys || {};
  console.log('GeoKeys:', geoKeys);

  // Determine source CRS
  let sourceCRS = 'EPSG:4326'; // Default to WGS84
  if (geoKeys.ProjectedCSTypeGeoKey) {
    sourceCRS = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`;
  } else if (geoKeys.GeographicTypeGeoKey) {
    sourceCRS = `EPSG:${geoKeys.GeographicTypeGeoKey}`;
  }
  console.log('Source CRS:', sourceCRS);

  const width = image.getWidth();
  const height = image.getHeight();
  console.log('Image dimensions:', { width, height });

  let west: number, south: number, east: number, north: number;

  if (transform) {
    // Use transformation matrix
    console.log('Using transformation matrix for bounds');
    const [a, b, c, x0, d, e, f, y0] = transform;
    
    west = x0;
    north = y0;
    east = x0 + (width * a);
    south = y0 + (height * e);
    
    console.log('Calculated bounds from transform:', { west, north, east, south });
  } else if (tiepoint && pixelScale) {
    // Use tiepoint and pixel scale
    console.log('Using tiepoint and pixel scale for bounds');
    const [i, j, k, x, y, z] = tiepoint;
    const [scaleX, scaleY] = pixelScale;
    
    west = x;
    north = y;
    east = x + (width * Math.abs(scaleX));
    south = y - (height * Math.abs(scaleY));
    
    console.log('Calculated bounds from tiepoint/scale:', { west, north, east, south });
  } else {
    // Fallback to bounding box
    console.log('Falling back to bounding box');
    const bbox = image.getBoundingBox();
    console.log('Raw bounding box:', bbox);
    
    if (!bbox || bbox.length !== 4) {
      throw new Error('Invalid bounding box');
    }
    
    [west, south, east, north] = bbox;
    console.log('Bounds from bounding box:', { west, south, east, north });
  }

  // Transform coordinates to WGS84 if needed
  if (sourceCRS !== 'EPSG:4326') {
    try {
      console.log('Transforming coordinates from', sourceCRS, 'to WGS84');
      
      // Register common projections if needed
      if (!proj4.defs(sourceCRS)) {
        console.log('Registering source CRS definition for', sourceCRS);
        
        // Add common CRS definitions here if needed
        if (sourceCRS === 'EPSG:26913') {
          proj4.defs('EPSG:26913', '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs');
        } else if (sourceCRS === 'EPSG:32613') {
          proj4.defs('EPSG:32613', '+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs');
        } else if (sourceCRS === 'EPSG:3857') {
          proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs');
        }
        // Add more projections as needed
      }

      const sw = proj4(sourceCRS, 'EPSG:4326', [west, south]);
      const ne = proj4(sourceCRS, 'EPSG:4326', [east, north]);
      
      console.log('Original coordinates:', {
        southwest: [west, south],
        northeast: [east, north]
      });
      
      [west, south] = sw;
      [east, north] = ne;
      
      console.log('Transformed coordinates:', {
        southwest: sw,
        northeast: ne
      });
    } catch (e) {
      console.error('Coordinate transformation failed:', e);
      console.warn('Falling back to default bounds for Mountain Village');
      
      // Fallback to Mountain Village bounds if transformation fails
      west = -107.87661399999999;
      south = 37.912209999999995;
      east = -107.836614;
      north = 37.95221;
    }
  }

  // Adjust bounds to maintain the correct aspect ratio based on pixel dimensions
  // This ensures the GeoTIFF renders as a square if the pixel dimensions are square
  if (width === height) {
    console.log('Adjusting bounds to maintain square aspect ratio');
    
    // Calculate center point
    const centerLat = (north + south) / 2;
    const centerLng = (east + west) / 2;
    
    // Calculate current width and height in degrees
    const currentWidth = Math.abs(east - west);
    const currentHeight = Math.abs(north - south);
    
    // Account for latitude distortion in longitude
    const latCorrectionFactor = Math.cos(centerLat * Math.PI / 180);
    
    // Calculate the ground distance ratio
    const groundDistanceRatio = (currentWidth * latCorrectionFactor) / currentHeight;
    
    console.log('Ground distance ratio:', groundDistanceRatio);
    
    // If the ratio is not close to 1.0 (allowing for some tolerance), adjust the bounds
    if (Math.abs(groundDistanceRatio - 1.0) > 0.05) {
      if (groundDistanceRatio > 1.0) {
        // Width is too large compared to height, adjust height
        const newHeight = currentWidth * latCorrectionFactor;
        const heightDiff = (newHeight - currentHeight) / 2;
        north += heightDiff;
        south -= heightDiff;
      } else {
        // Height is too large compared to width, adjust width
        const newWidth = currentHeight / latCorrectionFactor;
        const widthDiff = (newWidth - currentWidth) / 2;
        east += widthDiff;
        west -= widthDiff;
      }
      
      console.log('Adjusted bounds for square aspect ratio:', { west, south, east, north });
    }
  }

  console.log('Final WGS84 bounds:', { west, south, east, north });

  // Return Leaflet-friendly bounds: [[south, west], [north, east]]
  return {
    bounds: [[south, west], [north, east]],
    sourceCRS,
    transform,
    tiepoint,
    pixelScale
  };
}

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