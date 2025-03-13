import { createReducer } from '@reduxjs/toolkit';
import { initialState } from './state';
import * as actions from './actions';

export const firemetricsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(actions.toggleCategory, (state, action) => {
      const category = state.categories[action.payload];
      category.active = !category.active;
    })
    .addCase(actions.toggleLayer, (state, action) => {
      const { category, layer } = action.payload;
      const layerKey = `${layer}Active` as keyof typeof state.categories[typeof category]['layers'];
      state.categories[category].layers[layerKey] = !state.categories[category].layers[layerKey];
    })
    .addCase(actions.setLayerActive, (state, action) => {
      const { category, layer, active } = action.payload;
      const layerKey = `${layer}Active` as keyof typeof state.categories[typeof category]['layers'];
      state.categories[category].layers[layerKey] = active;
    })
    .addCase(actions.clearActiveLayers, (state) => {
      Object.values(state.categories).forEach(category => {
        category.active = false;
        Object.keys(category.layers).forEach(layer => {
          category.layers[layer as keyof typeof category.layers] = false;
        });
      });
    });
});

export default firemetricsReducer;