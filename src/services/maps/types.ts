import { Map, LatLngBounds } from 'leaflet';

export interface MapServiceParams {
  bbox?: string;
  bboxSR?: string;
  size?: string;
  imageSR?: string;
  format?: string;
  pixelType?: string;
  noData?: string;
  interpolation?: string;
  renderingRule?: string;
  f?: string;
}

export interface MapServiceConfig {
  baseUrl: string;
  defaultParams: Partial<MapServiceParams>;
}

export interface MapServiceOptions {
  bounds: LatLngBounds;
  width?: number;
  height?: number;
  map: Map;
}