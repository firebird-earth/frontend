import { createAction } from '@reduxjs/toolkit';
import { 
  ToggleLayerPayload,
  SetLayerOpacityPayload,
  SetLayerBoundsPayload,
  SetLayerValueRangePayload,
  InitializeLayerValueRangePayload
} from './types';

// Layer actions
export const toggleLayer = createAction<ToggleLayerPayload>('layers/toggleLayer');
export const toggleSingleLayer = createAction<ToggleLayerPayload>('layers/toggleSingleLayer');
export const setLayerOpacity = createAction<SetLayerOpacityPayload>('layers/setLayerOpacity');
export const setLayerBounds = createAction<SetLayerBoundsPayload>('layers/setLayerBounds');
export const clearActiveLayers = createAction('layers/clearActiveLayers');
export const setLayerValueRange = createAction<SetLayerValueRangePayload>('layers/setLayerValueRange');
export const initializeLayerValueRange = createAction<InitializeLayerValueRangePayload>('layers/initializeLayerValueRange');

// Layer ordering actions
export const bringLayerToFront = createAction<ToggleLayerPayload>('layers/bringLayerToFront');
export const sendLayerToBack = createAction<ToggleLayerPayload>('layers/sendLayerToBack');
export const bringLayerForward = createAction<ToggleLayerPayload>('layers/bringLayerForward');
export const sendLayerBackward = createAction<ToggleLayerPayload>('layers/sendLayerBackward');

// Slope rendering actions
export const setSlopeRenderingRule = createAction<string>('layers/setSlopeRenderingRule');