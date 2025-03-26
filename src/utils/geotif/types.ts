import { GeoJSON } from 'geojson';

export interface BufferCircleResult {
  center: [number, number]; // [lat, lng]
  radius: number; // meters
  boundaryCircle?: {
    center: [number, number]; // [lat, lng]
    radius: number; // meters
  };
}

export interface GeoTiffMetadata {
  metadata: {
    standard: {
      imageWidth: number;
      imageHeight: number;
      bitsPerSample: number[];
      compression: number | null;
      modelTransform: {
        matrix?: number[];
        tiepoint?: number[];
        origin: [number, number] | null;
      };
      resolution: {
        x: number;
        y: number;
      };
      noData: number | null;
      nonNullValues: number;
      totalPixels: number;
      zeroCount: number;
      crs: string;
      projectionName: string;
      datum: string;
      rawBounds?: [number, number, number, number]; // [minX, minY, maxX, maxY] in source CRS
      data?: Int16Array | Float32Array;
      bounds?: L.LatLngBounds;
      sourceCRS?: string;
      tiepoint?: number[];
      scale?: number[];
      transform?: number[];
    };
    custom: {
      units?: string;
      description?: string;
    };
  };
  range: {
    min: number;
    max: number;
    mean: number;
  };
}

// Updated here to store Leaflet-friendly bounds
// [ [south, west], [north, east] ] in WGS84
export interface GeoTiffBounds {
  bounds: [[number, number], [number, number]];
  sourceCRS: string;
  transform?: number[];
  tiepoint?: number[];
  pixelScale?: number[];
}