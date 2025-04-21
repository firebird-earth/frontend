import L from 'leaflet';
import { GeoJSON } from 'geojson';

// Non-serializable raster data.
export interface RasterData {
  rasterArray: Int16Array | Float32Array;
  width: number;
  height: number;
  noDataValue: number | null;
}

// Bounds formats
export type RawBounds = [number, number, number, number]; // [minX, minY, maxX, maxY] in source CRS
export type LeafletBounds = [[number, number], [number, number]]; // [[south, west], [north, east]] in WGS84

export interface GeoTiffBounds {
  rawBounds: RawBounds;
  leafletBounds: LeafletBounds;
  leafletBoundsLatLng: L.LatLngBounds;
  sourceCRS: string;
  transform?: number[];
  tiepoint?: number[];
  pixelScale?: number[];
}

// Serializable metadata that can be stored in Redux
export interface GeoTiffMetadata {
  width: number;
  height: number;
  noDataValue: number | null;
  compression: number | null;
  bitsPerSample: number[];
  resolution: {
    x: number;
    y: number;
  };
  projection: {
    sourceCRS?: string;
    tiepoint?: number[];
    scale?: number[];
    transform?: number[];    
    matrix?: number[];
    origin: [number, number] | null;
  };
  rawBounds: RawBounds;
  leafletBounds: LeafletBounds;
  stats?: {
    min: number;
    max: number;
    mean: number;
    totalPixels: number;  
    validCount: number;
    zeroCount: number;
    noDataCount: number;
  };
}

