import { GeoJSON } from 'geojson';
import { BufferCircleResult } from './types';

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
export function distance(a: [number, number], b: [number, number]): number {
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