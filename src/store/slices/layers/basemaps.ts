import { LayersState } from './types';
import { findLayer, findCategory } from './common';

export function handleBasemapToggle(state: LayersState, categoryId: string, layerId: number): void {
  const category = findCategory(state, categoryId);
  if (!category) return;

  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  // Basemaps are exclusive - only one can be active at a time
  category.layers.forEach(l => {
    l.active = l.id === layerId;
  });
}