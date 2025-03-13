import L from 'leaflet';
import { MapServiceConfig, MapServiceOptions, MapServiceParams } from './types';

export function buildServiceUrl(service: MapServiceConfig, options: MapServiceOptions): string {
  const { bounds, width = 400, height = 400, map } = options;
  
  if (!map) {
    throw new Error('Map instance is required');
  }

  // Project bounds to Web Mercator (EPSG:3857)
  const sw = map.options.crs.project(L.latLng(bounds.getSouth(), bounds.getWest()));
  const ne = map.options.crs.project(L.latLng(bounds.getNorth(), bounds.getEast()));
  
  // Get bounds in minx,miny,maxx,maxy format
  const bbox = `${sw.x},${sw.y},${ne.x},${ne.y}`;

  console.log('Building service URL:', {
    service: service.baseUrl,
    bounds: bbox,
    size: `${width},${height}`,
    params: service.defaultParams
  });

  // Combine default and custom params
  const params: MapServiceParams = {
    ...service.defaultParams,
    bbox,
    size: `${width},${height}`
  };

  // Build query string
  const query = Object.entries(params)
    .map(([key, value]) => {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        return `${key}=${encodeURIComponent(value)}`;
      }
      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join('&');

  const url = `${service.baseUrl}?${query}`;
  console.log('Generated URL:', url);
  
  return url;
}