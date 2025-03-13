import { RootState } from '../../index';

// Category selectors
export const selectFireMetricsState = (state: RootState) => state.firemetrics;
export const selectCategories = (state: RootState) => state.firemetrics.categories;

export const selectLandscapeRisk = (state: RootState) => state.firemetrics.categories.landscapeRisk;
export const selectFuels = (state: RootState) => state.firemetrics.categories.fuels;
export const selectValueAtRisk = (state: RootState) => state.firemetrics.categories.valueAtRisk;

// Layer selectors
export const selectLandscapeRiskLayers = (state: RootState) => state.firemetrics.categories.landscapeRisk.layers;
export const selectFuelsLayers = (state: RootState) => state.firemetrics.categories.fuels.layers;
export const selectValueAtRiskLayers = (state: RootState) => state.firemetrics.categories.valueAtRisk.layers;