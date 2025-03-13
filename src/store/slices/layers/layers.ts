import { LayersState } from './types';
import { findLayer, findCategory, isLayersTabCategory } from './common';

export function handleLayersTabToggle(state: LayersState, categoryId: string, layerId: number): void {
  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  // For layers tab categories:
  // 1. Turn off all layers in the layers tab (except basemaps and FireMetrics tab layers)
  // 2. Toggle the clicked layer
  Object.entries(state.categories).forEach(([catId, cat]) => {
    if (isLayersTabCategory(catId)) {
      cat.layers.forEach(l => {
        if (catId === categoryId && l.id === layerId) {
          l.active = !l.active;
        } else {
          l.active = false;
        }
      });
    }
  });

  // Update rendering rule for elevation layers
  if (categoryId === 'elevation' && layer.renderingRule) {
    state.slopeRenderingRule = layer.renderingRule;
  }
}