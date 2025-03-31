import { createReducer } from '@reduxjs/toolkit';
import { initialState } from './state';
import * as actions from './actions';
import { handleBasemapToggle } from './utils/basemaps';
import { handleLayersTabToggle } from './utils/layerManagement';
import { handleLayerOrdering } from '../common/utils/ordering';
import { handleValueRange } from '../common/utils/valueRange';
import { handleOpacity } from '../common/utils/opacity';

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

        layer.active = !layer.active;
      }
    })
    .addCase(actions.toggleSingleLayer, (state, action) => {
      const { categoryId, layerId } = action.payload;

      if (categoryId === 'basemaps') {
        handleBasemapToggle(state, categoryId, layerId);
      } else {
        handleLayersTabToggle(state, categoryId, layerId);
      }
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
    .addCase(actions.initializeLayerValueRange, (state, action) => {
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
      const { categoryId, layerId, metadata} = action.payload;
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
    .addCase(actions.setSlopeRenderingRule, (state, action) => {
      state.slopeRenderingRule = action.payload;
    });
});