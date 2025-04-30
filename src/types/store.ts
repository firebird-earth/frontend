import { FirebaseUserSettings } from './settings';
import { HomeState } from '../store/slices/home/types';
import { LayersState } from '../store/slices/layersSlice/types';

export interface RootState {
  ui: {
    activeTab: 'home' | 'layers' | 'firemetrics';
    isNavOpen: boolean;
    isLegendOpen: boolean;
    theme: 'light' | 'dark';
    showSettings: boolean;
    isCreatingAOI: boolean;
    showAOIPanel: boolean;
    sections: { [key: string]: boolean };
    isCancellingTooltip: boolean;
  };
  map: {
    center: [number, number];
    zoom: number;
    activeLocationId: number | null;
  };
  home: HomeState;
  layers: LayersState;
  settings: {
    settings: FirebaseUserSettings | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
  };
}