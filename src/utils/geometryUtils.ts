import { GeoJSON } from 'geojson';
import L from 'leaflet';
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
  const additionalBufferMeters = defaultRadius; // 8 miles in meters

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
    
    console.log(`Extracted ${points.length} points from boundary`);
    
    // Find the bounding box of the polygon
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    
    for (const point of points) {
      minLat = Math.min(minLat, point[0]);
      maxLat = Math.max(maxLat, point[0]);
      minLng = Math.min(minLng, point[1]);
      maxLng = Math.max(maxLng, point[1]);
    }
    
    // Calculate the center of the bounding box
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const boundaryCenter: [number, number] = [centerLat, centerLng];
    
    console.log('Boundary bounding box:', { minLat, maxLat, minLng, maxLng });
    console.log('Boundary center:', boundaryCenter);
    
    // Find the maximum distance from the center to any point on the boundary
    let maxDistance = 0;
    let furthestPoint = null;
    
    for (const point of points) {
      const dist = distance(boundaryCenter, point);
      if (dist > maxDistance) {
        maxDistance = dist;
        furthestPoint = point;
      }
    }
    
    console.log('Maximum distance from center:', maxDistance);
    console.log('Furthest point:', furthestPoint);
    
    // Create the boundary circle
    const boundaryCircle = {
      center: boundaryCenter,
      radius: maxDistance
    };
    
    // Add the additional buffer (8 miles) to the boundary circle radius
    const bufferRadius = boundaryCircle.radius + additionalBufferMeters;
    
    // Return the buffer circle with the boundary circle
    return {
      center: boundaryCenter,
      radius: bufferRadius,
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