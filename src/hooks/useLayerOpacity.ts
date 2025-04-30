import { useAppSelector } from './useAppSelector';

export function useLayerOpacity(categoryId?: string, layerId?: number): number {
  return useAppSelector(state => {
    if (!categoryId || !layerId) return 1;
    const category = state.layers.categories[categoryId];
    if (!category) return 1;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.opacity ?? 1;
  });
}
