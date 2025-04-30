import { HomeState } from './types';

export const initialState: HomeState = {
  sections: {
    aois: true,
    scenarios: true,
    treatments: true
  },
  aoi: {
    current: null,
    coordinates: null,
    isCreating: false,
    showPanel: false
  },
  location: {
    activeId: null
  },
  grid: {
    show: false,
    size: 100,
    unit: 'acres'
  }
};