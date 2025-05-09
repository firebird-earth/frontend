import { LANDSCAPE_RISK } from './landscapeRisk';
import { VALUE_AT_RISK } from './structureRisk';
import { FUELS } from './fuels';

import { BASEMAPS } from './basemaps';
import { WILDFIRE } from './wildfire';
import { JURISDICTIONS } from './jurisdictions';
import { TRANSPORTATION } from './transportation';
import { WATER } from './water';
import { INFRASTRUCTURE } from './infrastructure';
import { RESTORATION_CLASS } from './restorationClass';
import { HABITAT } from './habitat';
import { LANDSCAPE } from './landscape';

export const MAP_LAYERS = {
  BASEMAPS,
  WILDFIRE,
  JURISDICTIONS,
  TRANSPORTATION,
  WATER,
  INFRASTRUCTURE,
  RESTORATION_CLASS,
  HABITAT,
  LANDSCAPE
} as const;

export {
  BASEMAPS,
  WILDFIRE,
  JURISDICTIONS,
  TRANSPORTATION,
  WATER,
  INFRASTRUCTURE,
  RESTORATION_CLASS,
  HABITAT,
  LANDSCAPE
};

export const FIRE_METRICS = {
  LANDSCAPE_RISK,
  VALUE_AT_RISK,
  FUELS
} as const;

export {
  LANDSCAPE_RISK,
  VALUE_AT_RISK,
  FUELS
};

// Tab enum and category mapping
export enum Tab {
  HOME = 'home',
  LAYERS = 'layers',
  FIREMETRICS = 'firemetrics',
}

export const CATEGORY_TAB_MAPPING = {
  scenarios: Tab.HOME,
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
  structureRisk: Tab.FIREMETRICS,
  landscapeRisk: Tab.FIREMETRICS,
  fuels: Tab.FIREMETRICS
} as const;

export const isHomeTab = (categoryId: string): boolean => CATEGORY_TAB_MAPPING[categoryId] === Tab.HOME;
export const isLayersTab = (categoryId: string): boolean => categoryId !== 'basemaps' && CATEGORY_TAB_MAPPING[categoryId] === Tab.LAYERS;
export const isFiremetricsTab = (categoryId: string): boolean => CATEGORY_TAB_MAPPING[categoryId] === Tab.FIREMETRICS;
