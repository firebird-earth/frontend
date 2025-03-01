import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import uiReducer from './slices/uiSlice';
import layersReducer from './slices/layersSlice';
import aoiReducer from './slices/aoiSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    ui: uiReducer,
    layers: layersReducer,
    aoi: aoiReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;