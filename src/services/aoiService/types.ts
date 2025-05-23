import { GeoJSON } from 'geojson';

export interface AOI {
  id: string;
  name: string;
  description: string;
  location: {
    coordinates: [number, number];
    zoom: number;
  };
  boundary?: GeoJSON.FeatureCollection;
  center: [number, number];
  boundaryRadius: number;
  bufferedRadius: number;
  bufferedBounds: BoundingBox;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAOIInput {
  name: string;
  description: string;
  location: {
    coordinates: [number, number];
    zoom: number;
  };
  boundary?: GeoJSON.FeatureCollection;
  tags: string[];
}

export interface UpdateAOIInput {
  name?: string;
  description?: string;
  location?: {
    center: [number, number];
    zoom: number;
  };
  boundary?: GeoJSON.FeatureCollection;
  tags?: string[];
}

export type AOIState = {
  aois: AOI[];
  loading: boolean;
  error: string | null;
};