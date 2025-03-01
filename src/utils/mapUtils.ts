import { Location } from '../types/map';
import { store } from '../store';
import { setCenter, setZoom } from '../store/slices/mapSlice';
import { calculateBufferCircle } from './geometryUtils';

export function navigateToLocation(location: Location): void {
  const dispatch = store.dispatch;

  // Get coordinates based on location type
  const coordinates: [number, number] = location.coordinates;
  
  // Calculate buffer circle
  const bufferCircle = calculateBufferCircle(
    [coordinates[1], coordinates[0]], // Convert to [lat, lng]
    location.boundary,
    8
  );
  
  // Set center to the circle's center
  dispatch(setCenter([bufferCircle.center[1], bufferCircle.center[0]])); // Convert back to [lng, lat]
  
  // Calculate appropriate zoom level based on radius
  const radiusInKm = bufferCircle.radius / 1000;
  const baseZoom = Math.floor(14 - Math.log2(radiusInKm));
  
  // Clamp zoom between 11 and 16 for better visibility
  dispatch(setZoom(Math.min(Math.max(baseZoom, 11), 16)));
}