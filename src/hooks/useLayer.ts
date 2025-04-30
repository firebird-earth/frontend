import { useAppSelector } from './useAppSelector';
import { MapLayer } from '../types/map';

import { useAppSelector } from './useAppSelector';
import { MapLayer } from '../types/map';

export function useLayer(categoryId: string, layerId: number): MapLayer | null {
  return useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.id === layerId);
  });
}

export function useLayerFromCategory(categoryId: string, layerName: string): MapLayer | null {
  return useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.name === layerName);
  });
}
