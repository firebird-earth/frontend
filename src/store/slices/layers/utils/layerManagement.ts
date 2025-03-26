import { LayersState } from '../types';
import { findLayer, findCategory, isLayersTabCategory, isFireMetricsTabCategory } from '../../common/utils/utils';

export function handleLayersTabToggle(state: LayersState, categoryId: string, layerId: number): void {
  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  // Special handling for FireMetrics and Fuels categories
  if (isFireMetricsTabCategory(categoryId)) {
    // Turn off all layers in FireMetrics categories
    Object.entries(state.categories).forEach(([catId, cat]) => {
      if (isFireMetricsTabCategory(catId)) {
        cat.layers.forEach(l => {
          l.active = l.id === layerId && catId === categoryId;
        });
      }
    });
    return;
  }

  // For all other categories:
  // 1. Turn off all layers in all categories (except basemaps and FireMetrics tab layers)
  // 2. Toggle the clicked layer
  Object.entries(state.categories).forEach(([catId, cat]) => {
    if (isLayersTabCategory(catId)) {
      cat.layers.forEach(l => {
        if (catId === categoryId && l.id === layerId) {
          // Toggle the clicked layer
          l.active = !l.active;
          
          // If this is an elevation layer being activated, update the rendering rule
          if (l.active && categoryId === 'elevation' && l.renderingRule) {
            state.slopeRenderingRule = l.renderingRule;
          }
        } else {
          // Turn off all other layers
          l.active = false;
        }
      });
    }
  });
}