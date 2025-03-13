import { createAction } from '@reduxjs/toolkit';

// Category actions
export const toggleCategory = createAction<'landscapeRisk' | 'fuels' | 'valueAtRisk'>('firemetrics/toggleCategory');

// Layer actions
export const toggleLayer = createAction<{
  category: 'landscapeRisk' | 'fuels' | 'valueAtRisk';
  layer: string;
}>('firemetrics/toggleLayer');

export const setLayerActive = createAction<{
  category: 'landscapeRisk' | 'fuels' | 'valueAtRisk';
  layer: string;
  active: boolean;
}>('firemetrics/setLayerActive');

export const clearActiveLayers = createAction('firemetrics/clearActiveLayers');