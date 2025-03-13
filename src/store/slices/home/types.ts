import { GeoJSON } from 'geojson';

export interface HomeState {
  sections: {
    aois: boolean;
    scenarios: boolean;
    treatments: boolean;
  };
  aoi: {
    current: AOI | null;
    coordinates: [number, number] | null;
    isCreating: boolean;
    showPanel: boolean;
  };
  location: {
    activeId: number | null;
  };
  grid: {
    show: boolean;
    size: number;
    unit: 'acres' | 'meters';
  };
}

export interface AOI {
  id: string;
  name: string;
  description: string;
  location: {
    center: [number, number];
    zoom: number;
  };
  boundary?: GeoJSON.FeatureCollection;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}