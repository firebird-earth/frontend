import { LayersState } from '../types';
import { findLayer, findCategory } from '../../common/utils/utils';
import { isLayersTab, isFiremetricsTab } from '../../../../constants/maps';

export function handleLayersTabToggle(state: LayersState, categoryId: string, layerId: number): void {
  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  // Special handling for FireMetrics
  if (isFiremetricsTab(categoryId)) {
    // Turn off all layers in FireMetrics categories
    Object.entries(state.categories).forEach(([catId, cat]) => {
      if (isFiremetricsTab(catId)) {
        cat.layers.forEach(l => {
          l.active = l.id === layerId && catId === categoryId;
        });
      }
    });
    return;
  }

  // For all other categories:
  // 1. Turn off all layers in the same category (except basemaps)
  // 2. Toggle the clicked layer
  Object.entries(state.categories).forEach(([catId, cat]) => {
    if (catId === categoryId) {
      cat.layers.forEach(l => {
        if (l.id === layerId) {
          // Toggle the clicked layer
          l.active = !l.active;
          
          // If this is an elevation layer being activated, update the rendering rule
          if (l.active && categoryId === 'elevation' && l.renderingRule) {
            state.slopeRenderingRule = l.renderingRule;
          }
        } else {
          // Turn off other layers in same category
          l.active = false;
        }
      });
    }
  });
}