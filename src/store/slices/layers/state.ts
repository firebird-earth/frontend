import { LayersState } from './types';
import { LayerType, MapLayer } from '../../../types/map';
import { TILE_LAYERS, WUI_LAYER, CRISIS_AREAS_LAYER, GEOTIFF_LAYERS } from '../../../constants/urls';
import { createInitialCategory } from '../common/utils/utils';
import { JURISDICTIONS, JURISDICTIONS_CATEGORY } from '../../../constants/maps/layers/jurisdictions';
import { BASEMAPS, BASEMAPS_CATEGORY } from '../../../constants/maps/layers/basemaps';
import { WILDFIRE, WILDFIRE_CATEGORY } from '../../../constants/maps/layers/wildfire';
import { ELEVATION, ELEVATION_CATEGORY } from '../../../constants/maps/layers/elevation';
import { FIRE_METRICS } from '../../../constants/maps/firemetrics';
import { VALUE_AT_RISK, VALUE_AT_RISK_CATEGORY } from '../../../constants/maps/firemetrics/valueAtRisk';
import { LANDSCAPE_RISK, LANDSCAPE_RISK_CATEGORY } from '../../../constants/maps/firemetrics/landscapeRisk';
import { FUELS, FUELS_CATEGORY } from '../../../constants/maps/firemetrics/fuels';
import { HABITAT, HABITAT_CATEGORY } from '../../../constants/maps/layers/habitat';
import { LANDSCAPE, LANDSCAPE_CATEGORY } from '../../../constants/maps/layers/landscape';
import { TRANSPORTATION, TRANSPORTATION_CATEGORY } from '../../../constants/maps/layers/transportation';
import { WATER, WATER_CATEGORY } from '../../../constants/maps/layers/water';
import { INFRASTRUCTURE, INFRASTRUCTURE_CATEGORY } from '../../../constants/maps/layers/infrastructure';
import { RESTORATION_CLASS, RESTORATION_CLASS_CATEGORY } from '../../../constants/maps/layers/restorationClass';
import { SCENARIOS, SCENARIOS_CATEGORY } from '../../../constants/maps/layers/scenarios';
import L from 'leaflet';

// Create a WeakMap to store Leaflet layer instances
export const leafletLayerMap = new Map<number, L.Layer>();

// Track the last used order number for each pane
export const paneCounters: Record<string, number> = {
  firemetricsPane: 0,
  layersPane: 0
};

export const initialState: LayersState = {
  categories: {
    scenarios: SCENARIOS_CATEGORY,
    valueAtRisk: VALUE_AT_RISK_CATEGORY,
    landscapeRisk: LANDSCAPE_RISK_CATEGORY,
    fuels: FUELS_CATEGORY,
      
    basemaps: BASEMAPS_CATEGORY,
    jurisdictions: JURISDICTIONS_CATEGORY,
    wildfire: WILDFIRE_CATEGORY,
    elevation: ELEVATION_CATEGORY,
    landscape: LANDSCAPE_CATEGORY,
    transportation: TRANSPORTATION_CATEGORY,
    infrastructure: INFRASTRUCTURE_CATEGORY,
    water: WATER_CATEGORY,
    restorationClass: RESTORATION_CLASS_CATEGORY,
    habitat: HABITAT_CATEGORY
  },
  
  loading: false,
  error: null,
  slopeRenderingRule: 'Hillshade Gray'
};