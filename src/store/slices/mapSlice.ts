import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapState {
  center: [number, number];
  zoom: number;
  activeLocationId: number | null;
}

const initialState: MapState = {
  center: [-114, 41.5], // [longitude, latitude] - Centered on the western United States
  zoom: 5, // Zoomed out to show multiple states
  activeLocationId: null
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action: PayloadAction<[number, number]>) => {
      state.center = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setActiveLocation: (state, action: PayloadAction<number>) => {
      state.activeLocationId = action.payload;
    },
    clearActiveLocation: (state) => {
      state.activeLocationId = null;
    }
  },
});

export const { 
  setCenter, 
  setZoom,
  setActiveLocation,
  clearActiveLocation
} = mapSlice.actions;

export default mapSlice.reducer;