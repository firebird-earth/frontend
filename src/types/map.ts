import L from 'leaflet';
import { GeoJSON } from 'geojson';
import { ElementType } from 'react';
import { MapIcon } from 'lucide-react';

export enum LayerType {
  Basemap = 'basemap',
  GeoTiff = 'geoTiff',
  ArcGISImageService = 'ArcGIS_imageService',
  ArcGISFeatureService = 'ArcGIS_featureService',
  ArcGISMapService = 'ArcGIS_mapService',
  DynamicService = 'dynamicService',
  WMS = 'wms',
  Vector = 'vector',
  Raster = 'raster',
  TileLayer = 'tileLayer',
  Placeholder = 'placeholder'
}

export enum MapPane {
  OverlayPane = 'overlayPane',
  FiremetricsPane = 'firemetricsPane',
  LayersPane = 'layersPane',
  TilePane = 'tilePane'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Legend item interface
export interface LegendItem {
  color: string;
  weight: number;
  fillColor: string;
  fillOpacity: number;
  label: string;
}

// Legend interface
export interface Legend {
  items: LegendItem[];
}

export interface MapLayer {
  id: number;
  name: string;
  icon: MapIcon;
  type: LayerType;
  source: string;
  renderingRule?: string;
  pane?: MapPane;
  order?: number;
  attribution?: string;
  units?: string;
  domain?: [number, number];
  legend?: Legend;
  colorScheme?: string;
  active: boolean;
  loading?: boolean;
  minZoom?: number;
  maxZoom?: number;
  opacity?: number;
  valueRange?: {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
  };
  showValues?: boolean;
  
  bounds?: SerializableBounds;
  metadata?: GeoTiffMetadata;
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

export interface ColorScheme {
  name: string;
  displayName: string;
  description: string;
  buckets: number;
  colors: string[];
  type: 'sequential' | 'diverging' | 'qualitative';
}

export interface BufferCircleResult {
  center: [number, number]; // [lat, lng]
  radius: number; // meters
  boundaryCircle?: {
    center: [number, number]; // [lat, lng]
    radius: number; // meters
  };
}
