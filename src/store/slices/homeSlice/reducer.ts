import { createReducer } from '@reduxjs/toolkit';
import { initialState } from './state';
import * as actions from './actions';

export const homeReducer = createReducer(initialState, (builder) => {
  builder
    // AOI reducers
    .addCase(actions.setCurrentAOI, (state, action) => {
      state.aoi.current = action.payload;
      if (action.payload && 'location' in action.payload) {
        state.aoi.coordinates = action.payload.location.coordinates;
      }
    })
    .addCase(actions.setCoordinates, (state, action) => {
      state.aoi.coordinates = action.payload;
      state.aoi.current = null;
    })
    .addCase(actions.clearAOI, (state) => {
      state.aoi.current = null;
      state.aoi.coordinates = null;
    })
    .addCase(actions.startCreatingAOI, (state) => {
      state.aoi.isCreating = true;
      state.aoi.showPanel = true;
    })
    .addCase(actions.stopCreatingAOI, (state) => {
      state.aoi.isCreating = false;
      state.aoi.showPanel = false;
    })
    .addCase(actions.showAOIPanel, (state) => {
      state.aoi.showPanel = true;
    })
    .addCase(actions.hideAOIPanel, (state) => {
      state.aoi.showPanel = false;
    })
    
    // Section reducers
    .addCase(actions.toggleSection, (state, action) => {
      state.sections[action.payload] = !state.sections[action.payload];
    })
    
    // Location reducers
    .addCase(actions.setActiveLocation, (state, action) => {
      state.location.activeId = action.payload;
    })
    .addCase(actions.clearActiveLocation, (state) => {
      state.location.activeId = null;
    })
    
    // Grid reducers
    .addCase(actions.toggleGrid, (state) => {
      state.grid.show = !state.grid.show;
    })
    .addCase(actions.setGridSize, (state, action) => {
      state.grid.size = action.payload;
    })
    .addCase(actions.setGridUnit, (state, action) => {
      state.grid.unit = action.payload;
    });
});

export default homeReducer;