import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import uiReducer from './slices/uiSlice';
import layersReducer from './slices/layersSlice';
import settingsReducer from './slices/settingsSlice';
import homeReducer from './slices/home';
import firemetricsReducer from './slices/firemetrics';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    ui: uiReducer,
    layers: layersReducer,
    settings: settingsReducer,
    home: homeReducer,
    firemetrics: firemetricsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;