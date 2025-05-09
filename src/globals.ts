import L from 'leaflet';

// Fixed-resolution constant for rasterization (in meters per pixel)
export const RESOLUTION = 30;

declare global {
  var leafletMap: L.Map | undefined;
}

export {};
