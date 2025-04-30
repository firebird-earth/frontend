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

export interface SetShowMapValuesPayload {
  categoryId: string;
  layerId: number;
  showValues: boolean;
}

export interface SetLayerMetadataPayload {
  categoryId: string;
  layerId: number;
  metadata: GeoTiffMetadata;
}

export interface SetLayerLoadingPayload {
  categoryId: string;
  layerId: number;
  loading: boolean;
}

export interface SetLayerPanePayload {
  categoryId: string;
  layerId: number;
  pane: string;
}

export interface SetLayerOrderPayload {
  categoryId: string;
  layerId: number;
  order: number;
}

export interface SetLayerLegendInfoPayload {
  categoryId: string;
  layerId: number;
  colorScheme: string;
  units: string;
}