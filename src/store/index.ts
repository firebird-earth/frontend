import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice'; // Import settingsReducer early
import layersReducer from './slices/layers'; // Import layersReducer before other reducers that might depend on it
import mapReducer from './slices/mapSlice';
import homeReducer from './slices/home';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    map: mapReducer,
    home: homeReducer,
    layers: layersReducer,
    settings: settingsReducer
  },
});

export type AppDispatch = typeof store.dispatch;