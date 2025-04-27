import { Location, MapLayer } from '../types/map';
import { store } from '../store';
import { setCenter, setZoom } from '../store/slices/mapSlice';
import { calculateBufferCircle } from './geometry';

export function navigateToLocation(location: Location): void {
  const dispatch = store.dispatch;

  // Validate location and coordinates
  if (!location || !location.coordinates) {
    console.error("Cannot navigate: invalid location or missing coordinates", location);
    return;
  }

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
  const radiusInKm = bufferCircle.bufferedRadius / 1000;
  const baseZoom = Math.floor(14 - Math.log2(radiusInKm));
  
  // Clamp zoom between 11 and 16 for better visibility
  dispatch(setZoom(Math.min(Math.max(baseZoom, 11), 16)));
}

/**
 * Zooms the map to fit the bounds of a layer
 * @param layer The layer to zoom to
 */
export function zoomToLayer(layer: MapLayer): void {
  const dispatch = store.dispatch;

  // If the layer has bounds, use them
  if (layer.bounds) {
    // Extract bounds
    const [[south, west], [north, east]] = layer.bounds;
    
    // Create a fake location object to use with navigateToLocation
    const fakeLocation: Location = {
      id: -1, // Use a negative ID to indicate this is not a real location
      name: layer.name,
      coordinates: [(west + east) / 2, (north + south) / 2], // [lng, lat] center
      boundary: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south]
            ]]
          }
        }]
      }
    };
    
    // Use the same navigation logic as when a layer is turned on
    navigateToLocation(fakeLocation);
    return;
  }

  // For GeoTIFF layers without bounds, use default bounds for Mountain Village
  if (layer.type === 'geotiff') {
    // Default bounds for Mountain Village area
    const defaultBounds: [[number, number], [number, number]] = [
      [37.912210, -107.876614], // [south, west]
      [37.952210, -107.836614]  // [north, east]
    ];
    
    // Create a fake location object with the default bounds
    const fakeLocation: Location = {
      id: -1,
      name: layer.name,
      coordinates: [-107.856614, 37.932210], // Mountain Village center
      boundary: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[
              [defaultBounds[0][1], defaultBounds[0][0]],
              [defaultBounds[1][1], defaultBounds[0][0]],
              [defaultBounds[1][1], defaultBounds[1][0]],
              [defaultBounds[0][1], defaultBounds[1][0]],
              [defaultBounds[0][1], defaultBounds[0][0]]
            ]]
          }
        }]
      }
    };
    
    // Use the same navigation logic
    navigateToLocation(fakeLocation);
    return;
  }

  // For other layer types without bounds, use a default location
  const defaultLocation: Location = {
    id: -1,
    name: layer.name,
    coordinates: [-107.856614, 37.932210], // Mountain Village center
    boundary: null
  };
  
  navigateToLocation(defaultLocation);
}