import { FIRE_METRICS } from './firemetrics';
import { MAP_LAYERS } from './layers';

// Tab enum and category mapping
export enum Tab {
  HOME = 'home',
  LAYERS = 'layers',
  FIREMETRICS = 'firemetrics',
}

export const CATEGORY_TAB_MAPPING = {
  basemaps: Tab.LAYERS,
  jurisdictions: Tab.LAYERS,
  wildfire: Tab.LAYERS,
  elevation: Tab.LAYERS,
  landscape: Tab.LAYERS,
  transportation: Tab.LAYERS,
  water: Tab.LAYERS,
  infrastructure: Tab.LAYERS,
  restorationClass: Tab.LAYERS,
  habitat: Tab.LAYERS,
  valueAtRisk: Tab.FIREMETRICS,
  landscapeRisk: Tab.FIREMETRICS,
  fuels: Tab.FIREMETRICS
} as const;

export const isHomeTab = (categoryId: string): boolean => CATEGORY_TAB_MAPPING[categoryId] === Tab.HOME;
export const isLayersTab = (categoryId: string): boolean => categoryId !== 'basemaps' && CATEGORY_TAB_MAPPING[categoryId] === Tab.LAYERS;
export const isFiremetricsTab = (categoryId: string): boolean => CATEGORY_TAB_MAPPING[categoryId] === Tab.FIREMETRICS;

export { FIRE_METRICS, MAP_LAYERS };