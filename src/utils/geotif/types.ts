import { GeoJSON } from 'geojson';

export interface BufferCircleResult {
  center: [number, number]; // [lat, lng]
  radius: number; // meters
  boundaryCircle?: {
    center: [number, number]; // [lat, lng]
    radius: number; // meters
  };
}

export interface GeoTiffSummary {
  width: number;
  height: number;
  data: Float32Array | Uint16Array | Uint8Array;
  min: number;
  max: number;
  mean: number;
  noDataValue: number | null;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
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