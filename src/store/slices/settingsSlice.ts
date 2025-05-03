import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  SettingsState, 
  FirebaseUserSettings,
  UpdateSettingsPayload,
  ThemeSettings,
  MapSettings,
  NavigationSettings,
  DisplaySettings
} from '../../types/settings';

const createDefaultSettings = (userId: string): FirebaseUserSettings => ({
  id: userId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    theme: {
      mode: 'light',
      updatedAt: new Date().toISOString()
    },
    map: {
      controls: {
        showScale: true,
        showNorthArrow: true,
        showZoomControls: true
      },
      grid: {
        show: false,
        size: 10,
        unit: 'acres'
      },
      coordinates: {
        show: true,
        format: 'latlon-dd'
      },
      lastLocation: {
        center: [-114, 41.5],
        zoom: 5
      },
      updatedAt: new Date().toISOString()
    },
    navigation: {
      defaultTab: 'home',
      expandedSections: ['aois', 'treatments', 'scenarios'],
      updatedAt: new Date().toISOString()
    },
    display: {
      showLegend: true,
      showNavigation: true,
      updatedAt: new Date().toISOString()
    }
  }
});

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  initialized: false
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    initializeSettings: (state, action: PayloadAction<string>) => {
      if (!state.settings) {
        state.settings = createDefaultSettings(action.payload);
      }
      state.initialized = true;
    },
    setSettings: (state, action: PayloadAction<FirebaseUserSettings>) => {
      state.settings = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateSettings: (state, action: PayloadAction<UpdateSettingsPayload>) => {
      if (!state.settings) return;

      const now = new Date().toISOString();
      const { theme, map, navigation, display } = action.payload;

      if (theme) {
        state.settings.preferences.theme = {
          ...state.settings.preferences.theme,
          ...theme,
          updatedAt: now
        };
      }

      if (map) {
        state.settings.preferences.map = {
          ...state.settings.preferences.map,
          ...map,
          updatedAt: now
        };
      }

      if (navigation) {
        state.settings.preferences.navigation = {
          ...state.settings.preferences.navigation,
          ...navigation,
          updatedAt: now
        };
      }

      if (display) {
        state.settings.preferences.display = {
          ...state.settings.preferences.display,
          ...display,
          updatedAt: now
        };
      }

      state.settings.updatedAt = now;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  initializeSettings,
  setSettings,
  updateSettings,
  setLoading,
  setError
} = settingsSlice.actions;

export default settingsSlice.reducer;