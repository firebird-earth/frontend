import { createReducer } from '@reduxjs/toolkit';
import { initialState } from './state';
import * as actions from './actions';
import { handleLayerOrdering } from './utils/ordering';
import { handleValueRange } from './utils/valueRange';
import { handleOpacity } from './utils/opacity';
import { isLayersTab, isFiremetricsTab } from '../../../constants/maps/index';
import { findLayer, findCategory } from './utils/utils';

import { paneCounters } from './state';

function handleToggleExclusive(state: LayersState, categoryId: string, layerId: number): void {
  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  const exclusiveCategories = ['basemaps', 'scenarios'];

  if (exclusiveCategories.includes(categoryId)) {
    const category = state.categories[categoryId];
    if (!category) return;

    const clickedAlreadyActive = category.layers.find(l => l.id === layerId)?.active;

    category.layers.forEach(l => {
      if (clickedAlreadyActive) {
        // If clicked layer was already active, turn it OFF
        l.active = false;
      } else {
        // Otherwise, only the clicked layer is active
        l.active = (l.id === layerId);
      }
    });

    return;
  }

  if (isLayersTab(categoryId)) {
    const clickedAlreadyActive = state.categories[categoryId]?.layers.find(l => l.id === layerId)?.active;

    Object.entries(state.categories).forEach(([catId, cat]) => {
      if (isLayersTab(catId)) {
        cat.layers.forEach(l => {
          if (clickedAlreadyActive) {
            l.active = false;
          } else {
            l.active = (catId === categoryId && l.id === layerId);
          }
        });
      }
    });

    return;
  }

  if (isFiremetricsTab(categoryId)) {
    const clickedAlreadyActive = state.categories[categoryId]?.layers.find(l => l.id === layerId)?.active;

    Object.entries(state.categories).forEach(([catId, cat]) => {
      if (isFiremetricsTab(catId)) {
        cat.layers.forEach(l => {
          if (clickedAlreadyActive) {
            l.active = false;
          } else {
            l.active = (catId === categoryId && l.id === layerId);
          }
        });
      }
    });

    return;
  }
}

function handleBasemapToggle(state: LayersState, categoryId: string, layerId: number): void {
  const category = findCategory(state, categoryId);
  if (!category) return;

  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  // Basemaps are exclusive - only one can be active at a time
  category.layers.forEach(l => {
    l.active = l.id === layerId;
  });
}

export const layersReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(actions.toggleLayer, (state, action) => {
      const { categoryId, layerId } = action.payload;

      if (categoryId === 'basemaps') {
        handleBasemapToggle(state, categoryId, layerId);
      } else {
        const category = state.categories[categoryId];
        if (!category) return;

        const layer = category.layers.find(l => l.id === layerId);
        if (!layer) return;

        console.log("---> toggleLayer:",{layer:layer.name, id:layer.id, pane:layer.pane, order:layer.order}) 

        if (!layer.active && !layer.order) {
          layer.order = ++paneCounters[layer.pane];
        }        
        layer.active = !layer.active;
      }
    })
    .addCase(actions.toggleSingleLayer, (state, action) => {
      const { categoryId, layerId } = action.payload;

      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      console.log("---> toggleSingleLayer:",{name:layer.name, layer:layer.id, pane:layer.pane, order: layer.order})

      if (!layer.active && !layer.order) {
        layer.order = ++paneCounters[layer.pane];
      }
      handleToggleExclusive(state, categoryId, layerId);
    })
    .addCase(actions.setLayerOpacity, (state, action) => {
      const { categoryId, layerId, opacity } = action.payload;
      handleOpacity(state, categoryId, layerId, opacity);
    })
    .addCase(actions.bringLayerToFront, (state, action) => {
      const { categoryId, layerId } = action.payload;
      handleLayerOrdering(state, categoryId, layerId, 'front');
    })
    .addCase(actions.sendLayerToBack, (state, action) => {
      const { categoryId, layerId } = action.payload;
      handleLayerOrdering(state, categoryId, layerId, 'back');
    })
    .addCase(actions.bringLayerForward, (state, action) => {
      const { categoryId, layerId } = action.payload;
      handleLayerOrdering(state, categoryId, layerId, 'forward');
    })
    .addCase(actions.sendLayerBackward, (state, action) => {
      const { categoryId, layerId } = action.payload;
      handleLayerOrdering(state, categoryId, layerId, 'backward');
    })
    .addCase(actions.setLayerBounds, (state, action) => {
      const { categoryId, layerId, bounds } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.bounds = bounds;
    })
    .addCase(actions.clearActiveLayers, (state) => {
      Object.entries(state.categories).forEach(([categoryId, category]) => {
        if (categoryId !== 'basemaps') {
          category.layers.forEach(layer => {
            layer.active = false;
          });
        }
      });
    })
    .addCase(actions.setLayerValueRange, (state, action) => {
      const { categoryId, layerId, min, max } = action.payload;
      handleValueRange(state, categoryId, layerId, min, max);
    })
    .addCase(actions.initLayerValueRange, (state, action) => {
      const { categoryId, layerId, min, max } = action.payload;
      handleValueRange(state, categoryId, layerId, min, max, true);
    })
    .addCase(actions.setShowMapValues, (state, action) => {
      const { categoryId, layerId, showValues } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.showValues = showValues;

      // Turn off showValues for all other layers
      Object.values(state.categories).forEach(cat => {
        cat.layers.forEach(l => {
          if (l !== layer) {
            l.showValues = false;
          }
        });
      });
    })
    .addCase(actions.setLayerMetadata, (state, action) => {
      const { categoryId, layerId, metadata } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.metadata = metadata;
    })
    .addCase(actions.setLayerLoading, (state, action) => {
      const { categoryId, layerId, loading } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.loading = loading;
    })
    .addCase(actions.setLayerPane, (state, action) => {
      const { categoryId, layerId, pane } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.pane = pane;
    })
    .addCase(actions.setLayerOrder, (state, action) => {
      const { categoryId, layerId, order } = action.payload;
      const layer = findLayer(state, categoryId, layerId);
      if (layer) {
        layer.order = order;
      }
    })
    .addCase(actions.setLayerLegendInfo, (state, action) => {
      const { categoryId, layerId, colorScheme, units } = action.payload;
      const layer = findLayer(state, categoryId, layerId);
      if (layer) {
        layer.colorScheme = colorScheme;
        layer.units = units;
      }
    })
    .addCase(actions.setLayerLegend, (state, action) => {
      const { categoryId, layerId, legend } = action.payload;
      const layer = findLayer(state, categoryId, layerId);
      if (layer) {
        layer.legend = legend;
      }
    })
    .addCase(actions.addLayer, (state, action) => {
      const { categoryId, layer } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;
      category.layers.push(layer);
    });
});