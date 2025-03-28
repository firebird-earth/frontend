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

export interface SetShowMapValuesPayload {
  categoryId: string;
  layerId: number;
  showValues: boolean;
}

export interface SetLayerMetadataPayload {
  categoryId: string;
  layerId: number;
  metadata: {
    width: number;
    height: number;
    bounds: [[number, number], [number, number]];
    noDataValue: number | null;
    sourceCRS: string;
    tiepoint: number[];
    scale: number[];
    transform?: number[];
    rawBounds?: [number, number, number, number];
    stats?: {
      min: number;
      max: number;
      mean: number;
      validCount: number;
      noDataCount: number;
      zeroCount: number;
    };
  };
  range: {
    min: number;
    max: number;
    mean: number;
  };
}

export interface SetLayerLoadingPayload {
  categoryId: string;
  layerId: number;
  loading: boolean;
}