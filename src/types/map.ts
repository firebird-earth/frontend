import { GeoJSON } from 'geojson';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
}

export interface MapLayer {
  id: number;
  name: string;
  type: 'tile' | 'vector' | 'raster' | 'geotiff' | 'placeholder';
  source: string;
  active: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
  order?: number;
  bounds?: [[number, number], [number, number]]; // [[south, west], [north, east]]
  valueRange?: {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
  };
}

export interface LayerCategory {
  id: string;
  name: string;
  layers: MapLayer[];
}

export interface Location {
  id: number;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  boundary?: GeoJSON.FeatureCollection;
}

export type MapTheme = 'light' | 'dark';