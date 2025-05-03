import { Location, MapLayer } from '../types/map';
import { store } from '../store';
import { calculateBufferCircle, addBufferCircleToMap } from './geometry';
import L from 'leaflet';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[navigate]', ...args);
  }
}

function getCircleBounds(center: [number, number], radiusMeters: number): L.LatLngBounds {
  const lat = center[0];
  const lng = center[1];
  const latRadius = (radiusMeters / 111320); // degrees latitude per meter
  const lngRadius = radiusMeters / (40075000 * Math.cos((lat * Math.PI) / 180) / 360); // degrees longitude

  return L.latLngBounds(
    [lat - latRadius, lng - lngRadius],
    [lat + latRadius, lng + lngRadius]
  );
}

export function navigateToLocation(location: Location, bufferCircleRadiusMiles = 8): void {
  if (!location || !location.coordinates) {
    console.error("Cannot navigate: invalid location or missing coordinates", location);
    return;
  }

  log('navigateToLocation', location);

  const coordinates: [number, number] = location.coordinates;

  const bufferCircle = calculateBufferCircle(
    [coordinates[1], coordinates[0]],
    location.boundary,
    bufferCircleRadiusMiles
  );

  //addBufferCircleToMap(bufferCircle);

  const map = window.leafletMap;
  if (!map) {
    console.error("Leaflet map is not available");
    return;
  }

  const bounds = getCircleBounds(bufferCircle.center, bufferCircle.bufferedRadius);
  const padding = map.getSize().y * 0.05;

  map.fitBounds(bounds, {
    padding: [padding, padding]
  });
}
