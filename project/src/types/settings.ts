// Base settings interface that will be stored in Firebase
export interface FirebaseUserSettings {
  id: string;           // User's UID from Firebase Auth
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
  preferences: {
    theme: {
      mode: 'light' | 'dark';
      updatedAt: string;
    };
    map: {
      controls: {
        showScale: boolean;
        showNorthArrow: boolean;
        showZoomControls: boolean;
      };
      lastLocation: {
        center: [number, number];
        zoom: number;
      };
      updatedAt: string;
    };
    navigation: {
      defaultTab: 'home' | 'layers' | 'firemetrics';
      expandedSections: string[];
      updatedAt: string;
    };
    display: {
      showLegend: boolean;
      showNavigation: boolean;
      updatedAt: string;
    };
  };
}

// Local state interface
export interface SettingsState {
  settings: FirebaseUserSettings | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Settings update types
export type ThemeSettings = FirebaseUserSettings['preferences']['theme'];
export type MapSettings = FirebaseUserSettings['preferences']['map'];
export type NavigationSettings = FirebaseUserSettings['preferences']['navigation'];
export type DisplaySettings = FirebaseUserSettings['preferences']['display'];

export type UpdateSettingsPayload = {
  theme?: Partial<Omit<ThemeSettings, 'updatedAt'>>;
  map?: Partial<Omit<MapSettings, 'updatedAt'>>;
  navigation?: Partial<Omit<NavigationSettings, 'updatedAt'>>;
  display?: Partial<Omit<DisplaySettings, 'updatedAt'>>;
};