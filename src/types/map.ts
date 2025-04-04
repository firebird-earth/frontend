import { GeoJSON } from 'geojson';
import L from 'leaflet';

export enum LayerType {
  Basemap = 'basemap',
  ArcGISFeatureService = 'ArcGIS_featureService',
  ArcGISMapService = 'ArcGIS_mapService',
  ArcGISImageService = 'ArcGIS_imageService',
  DynamicService = 'dynamicService',
  GeoTiff = 'geoTiff',
  WMS = 'wms',
  Vector = 'vector',
  Raster = 'raster',
  TileLayer = 'tileLayer',
  Placeholder = 'placeholder'
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

// Serializable bounds format
export type SerializableBounds = [[number, number], [number, number]]; // [[south, west], [north, east]]

// Serializable metadata that can be stored in Redux
export interface GeoTiffMetadataRedux {
  width: number;
  height: number;
  bounds: SerializableBounds;
  noDataValue: number | null;
  sourceCRS: string;
  tiepoint: number[];
  scale: number[];
  transform?: number[];
  rawBounds?: [number, number, number, number]; // [minX, minY, maxX, maxY] in source CRS
  resolution: {
    x: number;
    y: number;
  };
  stats?: {
    min: number;
    max: number;
    mean: number;
    validCount: number;
    noDataCount: number;
    zeroCount: number;
  };
}

// Non-serializable data kept in memory
export interface GeoTiffRasterData {
  data: Int16Array | Float32Array;
  width: number;
  height: number;
  noDataValue: number | null;
}

export interface MapLayer {
  id: number;
  name: string;
  type: LayerType;
  source: string;
  active: boolean;
  loading?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
  order?: number;
  bounds?: SerializableBounds;
  valueRange?: {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
  };
  renderingRule?: string;
  showValues?: boolean;
  metadata?: GeoTiffMetadataRedux;
  colorScheme?: string;
  domain?: [number, number];
  units?: string;
  legend?: Legend;
  pane?: string;
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