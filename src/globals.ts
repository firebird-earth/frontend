import L from 'leaflet';

export const RESOLUTION = 30;        // meters per pixel
export const NODATA_VALUE = -9999;   // default nodata value

export const BUFFER_RADIUS = 7.93;    // miles

declare global {
  var leafletMap: L.Map | undefined;
}

export {};
