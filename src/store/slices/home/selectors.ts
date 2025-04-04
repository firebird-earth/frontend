import type { RootState } from '../types/store';

// AOI selectors
export const selectCurrentAOI = (state: RootState) => state.home.aoi.current;
export const selectCoordinates = (state: RootState) => state.home.aoi.coordinates;
export const selectIsCreatingAOI = (state: RootState) => state.home.aoi.isCreating;
export const selectShowAOIPanel = (state: RootState) => state.home.aoi.showPanel;

// Section selectors
export const selectSections = (state: RootState) => state.home.sections;

// Location selectors
export const selectActiveLocationId = (state: RootState) => state.home.location.activeId;

// Grid selectors
export const selectGrid = (state: RootState) => state.home.grid;