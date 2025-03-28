import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeTab: 'home' | 'layers' | 'firemetrics';
  isNavOpen: boolean;
  isLegendOpen: boolean;
  theme: 'light' | 'dark';
  showSettings: boolean;
  isCreatingAOI: boolean;
  showAOIPanel: boolean;
  sections: { [key: string]: boolean };
  isCancellingTooltip: boolean;
}

const initialState: UIState = {
  activeTab: 'home',
  isNavOpen: true,
  isLegendOpen: true,
  theme: 'light',
  showSettings: false,
  isCreatingAOI: false,
  showAOIPanel: false,
  sections: {
    aois: true,
    treatments: false,
    scenarios: false,
    basemaps: false,
    jurisdictions: false,
    wildfire: false,
    elevation: false,
    valueAtRisk: true,
    landscapeRisk: true,
    fuels: true,
    landscape: false,
    transportation: false,
    water: false,
    infrastructure: false,
    restorationClass: false,
    habitat: false
  },
  isCancellingTooltip: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'home' | 'layers' | 'firemetrics'>) => {
      state.activeTab = action.payload;
    },
    toggleNav: (state) => {
      state.isNavOpen = !state.isNavOpen;
    },
    toggleLegend: (state, action?: PayloadAction<boolean>) => {
      if (action?.payload !== undefined) {
        state.isLegendOpen = action.payload;
      } else {
        state.isLegendOpen = !state.isLegendOpen;
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    toggleSection: (state, action: PayloadAction<string>) => {
      state.sections[action.payload] = !state.sections[action.payload];
    },
    startCreatingAOI: (state) => {
      state.isCreatingAOI = true;
      state.showAOIPanel = true;
    },
    stopCreatingAOI: (state) => {
      state.isCreatingAOI = false;
      state.showAOIPanel = false;
    },
    showAOIPanel: (state) => {
      state.showAOIPanel = true;
    },
    hideAOIPanel: (state) => {
      state.showAOIPanel = false;
    },
    setIsCancellingTooltip: (state, action: PayloadAction<boolean>) => {
      state.isCancellingTooltip = action.payload;
    }
  },
});

export const { 
  setActiveTab, 
  toggleNav, 
  toggleLegend,
  setTheme,
  toggleSettings, 
  toggleSection,
  startCreatingAOI,
  stopCreatingAOI,
  showAOIPanel,
  hideAOIPanel,
  setIsCancellingTooltip
} = uiSlice.actions;

export default uiSlice.reducer;
