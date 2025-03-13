import { MapLayer } from '../../../types/map';

export interface LayerCategory {
  id: string;
  name: string;
  layers: MapLayer[];
}

export interface LayersState {
  categories: {
    [key: string]: LayerCategory;
  };
  loading: boolean;
  error: string | null;
  slopeRenderingRule: string;
}

export interface ToggleLayerPayload {
  categoryId: string;
  layerId: number;
}

export interface SetLayerOpacityPayload {
  categoryId: string;
  layerId: number;
  opacity: number;
}

export interface SetLayerBoundsPayload {
  categoryId: string;
  layerId: number;
  bounds: [[number, number], [number, number]];
}

export interface SetLayerValueRangePayload {
  categoryId: string;
  layerId: number;
  min: number;
  max: number;
}

export interface InitializeLayerValueRangePayload {
  categoryId: string;
  layerId: number;
  min: number;
  max: number;
}