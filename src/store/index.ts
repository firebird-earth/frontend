import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice'; 
import layersReducer from './slices/layersSlice'; 
import mapReducer from './slices/mapSlice';
import homeReducer from './slices/homeSlice';

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