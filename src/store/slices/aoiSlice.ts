import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AOI } from '../../types/aoi';

interface AOIState {
  currentAOI: AOI | null;
  coordinates: [number, number] | null;
}

const initialState: AOIState = {
  currentAOI: null,
  coordinates: null
};

const aoiSlice = createSlice({
  name: 'aoi',
  initialState,
  reducers: {
    setCurrentAOI: (state, action: PayloadAction<AOI | null>) => {
      state.currentAOI = action.payload;
      // When setting a new AOI, update coordinates to its location
      if (action.payload) {
        if ('location' in action.payload) {
          state.coordinates = action.payload.location.center;
        } else if ('coordinates' in action.payload) {
          state.coordinates = action.payload.coordinates;
        }
      } else {
        state.coordinates = null;
      }
    },
    setCoordinates: (state, action: PayloadAction<[number, number]>) => {
      state.coordinates = action.payload;
      state.currentAOI = null;
    },
    clearAOI: (state) => {
      state.currentAOI = null;
      state.coordinates = null;
    }
  }
});

export const { 
  setCurrentAOI,
  setCoordinates,
  clearAOI
} = aoiSlice.actions;

export default aoiSlice.reducer;