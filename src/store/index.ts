import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import uiReducer from './slices/uiSlice';
import layersReducer from './slices/layers';
import settingsReducer from './slices/settingsSlice';
import homeReducer from './slices/home';
import firemetricsReducer from './slices/firemetrics';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    map: mapReducer,
    home: homeReducer,
    firemetrics: firemetricsReducer,
    layers: layersReducer,
    settings: settingsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;