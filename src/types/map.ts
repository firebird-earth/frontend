import L from 'leaflet';
import { GeoJSON } from 'geojson';
import { ElementType } from 'react';
import { MapIcon } from 'lucide-react';

export enum MapPane {
  OverlayPane = 'overlayPane',
  ScenariosPane = 'scenariosPane',
  FiremetricsPane = 'firemetricsPane',
  LayersPane = 'layersPane',
  TilePane = 'tilePane'
}

// Define pane z-index values
export const PaneZIndex = {
  'overlayPane': 400,      // Default Leaflet overlay pane
  'scenariosPane': 350,    // Custom pane for fire metrics
  'firemetricsPane': 300,  // Custom pane for fire metrics
  'layersPane': 250,       // Custom pane for other layers
  'tilePane': 200
};

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

export enum LayerType {
  Basemap = 'basemap',
  GeoTiff = 'geoTiff',
  ArcGISImageService = 'ArcGIS_imageService',
  ArcGISFeatureService = 'ArcGIS_featureService',
  TileLayer = 'tileLayer',
  Ignitions = 'ignitionsLayer',
  WMS = 'wms',
  Vector = 'vector',
  Raster = 'raster',
}

export const isGeoTiffLayer = (layer: { type: LayerType }) => layer.type === LayerType.GeoTiff;
export const isRasterLayer = (layer: { type: LayerType }) => layer.type === LayerType.Raster;
export const isArcGISImageService = (layer: { type: LayerType }) => layer.type === LayerType.ArcGISImageService;
export const isFeatureLayer = (layer: { type: LayerType }) =>
  layer.type === LayerType.ArcGISFeatureService || layer.type === LayerType.Vector;
export const isTileLayer = (layer: { type: LayerType }) => layer.type === LayerType.TileLayer;

export interface MapLayer {
  id: number;
  name: string;
  icon: MapIcon;
  type: LayerType;
  source: string;
  renderingRule?: string;
  pane?: MapPane;
  order?: number;
  description?: string;
  attribution?: string;
  expression?: string;
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

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
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

export interface QueryExpression {
  name: string;
  description: string;
  expression: string;
}
