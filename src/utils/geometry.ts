import { GeoJSON } from 'geojson';
import L from 'leaflet';
import proj4 from 'proj4';
import { GeoTiffBounds } from './geotif/types';

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
    // Extract all points from the boundary - do this only once
    const points: [number, number][] = []; // [lat, lng]
    const bounds = {
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity
    };
    
    boundary.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(ring => {
          ring.forEach(coord => {
            // GeoJSON coordinates are [longitude, latitude]
            const lat = coord[1];
            const lng = coord[0];
            points.push([lat, lng]);
            
            // Update bounds while we iterate
            bounds.minLat = Math.min(bounds.minLat, lat);
            bounds.maxLat = Math.max(bounds.maxLat, lat);
            bounds.minLng = Math.min(bounds.minLng, lng);
            bounds.maxLng = Math.max(bounds.maxLng, lng);
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
    
    console.debug('Boundary analysis:', {
      points: points.length,
      bounds
    });
    
    // Calculate the center of the bounding box
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const boundaryCenter: [number, number] = [centerLat, centerLng];
    
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
    
    console.debug('Circle calculation:', {
      center: boundaryCenter,
      maxRadius: maxDistance,
      furthestPoint
    });
    
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