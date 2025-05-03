import L from 'leaflet';import { GeoJSON } from 'geojson';
import proj4 from 'proj4';
import { BoundingBox } from '../type/map';
import { leafletMap } from '../globals';

// Register projection
proj4.defs('EPSG:26913', '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs');

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[geometry]', ...args);
  }
}

interface BufferCircleResult {
  center: [number, number];          // [lat, lng]
  boundaryRadius?: number;           // meters
  bufferedRadius: number;            // meters
  bufferedBounds: BoundingBox;       // lat/lng bounds of buffered circle
}

export function calculateBufferCircle(
  center: [number, number],
  boundary: GeoJSON.FeatureCollection | null,
  defaultBufferRadiusMiles: number = 8
): BufferCircleResult {
  const defaultRadius = defaultBufferRadiusMiles * 1609.34;
  const bufferMeters = defaultRadius;

  log('boundary:', boundary)
  
  if (!boundary || !boundary.features || boundary.features.length === 0) {
    log('no boundary provided, use location center')
    const bufferedBounds = approximateBoundingBox(center, defaultRadius);
    return { center, bufferedRadius: defaultRadius, bufferedBounds };
  }

  try {
    const points: [number, number][] = [];
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
            const lat = coord[1];
            const lng = coord[0];
            points.push([lat, lng]);
            bounds.minLat = Math.min(bounds.minLat, lat);
            bounds.maxLat = Math.max(bounds.maxLat, lat);
            bounds.minLng = Math.min(bounds.minLng, lng);
            bounds.maxLng = Math.max(bounds.maxLng, lng);
          });
        });
      }
    });

    if (points.length === 0) {
      const bufferedBounds = approximateBoundingBox(center, defaultRadius);
      return { center, bufferedRadius: defaultRadius, bufferedBounds };
    }

    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const boundaryCenter: [number, number] = [centerLat, centerLng];

    let maxDistance = 0;
    for (const point of points) {
      const dist = distance(boundaryCenter, point);
      if (dist > maxDistance) maxDistance = dist;
    }

    const bufferedRadius = maxDistance + bufferMeters;
    const bufferedBounds = approximateBoundingBox(boundaryCenter, bufferedRadius);

    return {
      center: boundaryCenter,
      boundaryRadius: maxDistance,
      bufferedRadius,
      bufferedBounds
    };
  } catch {
    const bufferedBounds = approximateBoundingBox(center, defaultRadius);
    return { center, bufferedRadius: defaultRadius, bufferedBounds };
  }
}

function distance(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const a1 = Math.sin(dLat / 2) ** 2 +
             Math.cos(lat1) * Math.cos(lat2) *
             Math.sin(dLng / 2) ** 2;

  return 6371000 * 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
}

function approximateBoundingBox(center: [number, number], radiusMeters: number): BoundingBox {
  const lat = center[0];
  const lng = center[1];
  const earthRadius = 6371000;

  const deltaLat = (radiusMeters / earthRadius) * (180 / Math.PI);
  const deltaLng = (radiusMeters / (earthRadius * Math.cos(lat * Math.PI / 180))) * (180 / Math.PI);

  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLng: lng - deltaLng,
    maxLng: lng + deltaLng
  };
}

export function addBufferCircleToMap(bufferCircle: {
  center: [number, number],
  bufferedRadius: number
}) {
  const map = window.leafletMap;
  L.circle(bufferCircle.center, {
    radius: bufferCircle.bufferedRadius,
    color: 'blue',
    fillOpacity: 0.2
  }).addTo(map);
}
