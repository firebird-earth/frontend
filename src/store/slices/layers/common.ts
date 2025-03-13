import { LayerCategory, LayersState } from './types';
import { MapLayer } from '../../../types/map';

export function createInitialCategory(
  id: string,
  name: string,
  layers: Partial<MapLayer>[]
): LayerCategory {
  return {
    id,
    name,
    layers: layers.map((layer, index) => ({
      id: index + 1,
      name: '',
      type: 'tile',
      source: '',
      active: false,
      ...layer
    }))
  };
}

export function findLayer(state: LayersState, categoryId: string, layerId: number): MapLayer | undefined {
  return state.categories[categoryId]?.layers.find(l => l.id === layerId);
}

export function findCategory(state: LayersState, categoryId: string): LayerCategory | undefined {
  return state.categories[categoryId];
}

export function isLayersTabCategory(categoryId: string): boolean {
  return !['basemaps', 'firemetrics', 'fuels'].includes(categoryId);
}

export function isFireMetricsTabCategory(categoryId: string): boolean {
  return ['firemetrics', 'fuels'].includes(categoryId);
}