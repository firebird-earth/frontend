import { createReducer } from '@reduxjs/toolkit';
import { initialState } from './state';
import * as actions from './actions';
import { handleBasemapToggle } from './utils/basemaps';
import { handleLayersTabToggle } from './utils/layers';

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
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (layer) {
        layer.opacity = Math.max(0, Math.min(1, opacity));
      }
    })
    .addCase(actions.bringLayerToFront, (state, action) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff') return;

      const highestOrder = Math.max(
        ...Object.values(state.categories)
          .flatMap(cat => cat.layers)
          .filter(l => l.type === 'geotiff' && l.order !== undefined)
          .map(l => l.order!)
      );
      
      layer.order = highestOrder + 10;
    })
    .addCase(actions.sendLayerToBack, (state, action) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff') return;

      const lowestOrder = Math.min(
        ...Object.values(state.categories)
          .flatMap(cat => cat.layers)
          .filter(l => l.type === 'geotiff' && l.order !== undefined)
          .map(l => l.order!)
      );
      
      layer.order = lowestOrder - 10;
    })
    .addCase(actions.bringLayerForward, (state, action) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff' || layer.order === undefined) return;

      const allGeoTiffLayers = Object.values(state.categories)
        .flatMap(cat => cat.layers)
        .filter(l => l.type === 'geotiff' && l.order !== undefined)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const currentIndex = allGeoTiffLayers.findIndex(l => l.id === layer.id);
      if (currentIndex < allGeoTiffLayers.length - 1) {
        const nextLayer = allGeoTiffLayers[currentIndex + 1];
        const tempOrder = layer.order;
        layer.order = nextLayer.order;
        nextLayer.order = tempOrder;
      }
    })
    .addCase(actions.sendLayerBackward, (state, action) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff' || layer.order === undefined) return;

      const allGeoTiffLayers = Object.values(state.categories)
        .flatMap(cat => cat.layers)
        .filter(l => l.type === 'geotiff' && l.order !== undefined)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const currentIndex = allGeoTiffLayers.findIndex(l => l.id === layer.id);
      if (currentIndex > 0) {
        const prevLayer = allGeoTiffLayers[currentIndex - 1];
        const tempOrder = layer.order;
        layer.order = prevLayer.order;
        prevLayer.order = tempOrder;
      }
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
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (layer && layer.valueRange) {
        layer.valueRange.min = min;
        layer.valueRange.max = max;
      }
    })
    .addCase(actions.initializeLayerValueRange, (state, action) => {
      const { categoryId, layerId, min, max } = action.payload;
      const category = state.categories[categoryId];
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (layer) {
        layer.valueRange = {
          min,
          max,
          defaultMin: min,
          defaultMax: max
        };
      }
    })
    .addCase(actions.setSlopeRenderingRule, (state, action) => {
      state.slopeRenderingRule = action.payload;
    });
});

export default layersReducer;