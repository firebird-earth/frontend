import { useAppSelector } from './useAppSelector';
import { MapLayer } from '../types/map';

export function useLayerValueRange(categoryId?: string, layerId?: number) {
  return useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.valueRange;
  });
}
