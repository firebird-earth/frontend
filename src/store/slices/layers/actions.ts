import { createAction } from '@reduxjs/toolkit';
import { 
  ToggleLayerPayload,
  SetLayerOpacityPayload,
  SetLayerBoundsPayload,
  SetLayerValueRangePayload,
  SetShowMapValuesPayload,
  SetLayerMetadataPayload,
  SetLayerLoadingPayload,
  SetLayerPanePayload,
  SetLayerOrderPayload,
  SetLayerLegendInfoPayload,
  SetLayerLegendPayload,
} from './types';

// Layer actions
export const toggleLayer = createAction<ToggleLayerPayload>('layers/toggleLayer');
export const toggleSingleLayer = createAction<ToggleLayerPayload>('layers/toggleSingleLayer');
export const setLayerOpacity = createAction<SetLayerOpacityPayload>('layers/setLayerOpacity');
export const setLayerBounds = createAction<SetLayerBoundsPayload>('layers/setLayerBounds');
export const clearActiveLayers = createAction('layers/clearActiveLayers');
export const setLayerValueRange = createAction<SetLayerValueRangePayload>('layers/setLayerValueRange');
export const initLayerValueRange = createAction<SetLayerValueRangePayload>('layers/initLayerValueRange');
export const setShowMapValues = createAction<SetShowMapValuesPayload>('layers/setShowMapValues');
export const setLayerMetadata = createAction<SetLayerMetadataPayload>('layers/setLayerMetadata');
export const setLayerLoading = createAction<SetLayerLoadingPayload>('layers/setLayerLoading');
export const setLayerPane = createAction<SetLayerPanePayload>('layers/setLayerPane');
export const setLayerOrder = createAction<SetLayerOrderPayload>('layers/setLayerOrder');
export const setLayerLegendInfo = createAction<SetLayerLegendInfoPayload>('layers/setLayerLegendInfo');
export const setLayerLegend = createAction<SetLayerLegendPayload>('layers/setLayerLegend');

// Add Layer action
export const addLayer = createAction<{categoryId: string; layer: any}>('layers/addLayer');

// Layer ordering actions
export const bringLayerToFront = createAction<ToggleLayerPayload>('layers/bringLayerToFront');
export const sendLayerToBack = createAction<ToggleLayerPayload>('layers/sendLayerToBack');
export const bringLayerForward = createAction<ToggleLayerPayload>('layers/bringLayerForward');
export const sendLayerBackward = createAction<ToggleLayerPayload>('layers/sendLayerBackward');