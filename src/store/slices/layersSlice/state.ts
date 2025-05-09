import { LayersState } from './types';
import { LayerType, MapLayer } from '../../../types/map';
import { BASEMAP_LAYERS, WUI_LAYER, CRISIS_AREAS_LAYER, GEOTIFF_LAYERS } from '../../../constants/urls';
import { createInitialCategory } from '../common/utils/utils';
import { JURISDICTIONS, JURISDICTIONS_CATEGORY } from '../../../constants/maps/jurisdictions';
import { BASEMAPS, BASEMAPS_CATEGORY } from '../../../constants/maps/basemaps';
import { WILDFIRE, WILDFIRE_CATEGORY } from '../../../constants/maps/wildfire';
import { ELEVATION, ELEVATION_CATEGORY } from '../../../constants/maps/elevation';
import { FIRE_METRICS } from '../../../constants/maps/firemetrics';
import { VALUE_AT_RISK, VALUE_AT_RISK_CATEGORY } from '../../../constants/maps/structureRisk';
import { LANDSCAPE_RISK, LANDSCAPE_RISK_CATEGORY } from '../../../constants/maps/landscapeRisk';
import { FUELS, FUELS_CATEGORY } from '../../../constants/maps/fuels';
import { HABITAT, HABITAT_CATEGORY } from '../../../constants/maps/habitat';
import { LANDSCAPE, LANDSCAPE_CATEGORY } from '../../../constants/maps/landscape';
import { TRANSPORTATION, TRANSPORTATION_CATEGORY } from '../../../constants/maps/transportation';
import { WATER, WATER_CATEGORY } from '../../../constants/maps/water';
import { INFRASTRUCTURE, INFRASTRUCTURE_CATEGORY } from '../../../constants/maps/infrastructure';
import { RESTORATION_CLASS, RESTORATION_CLASS_CATEGORY } from '../../../constants/maps/restorationClass';
import { SCENARIOS_CATEGORY } from '../../../constants/maps/scenarios';
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
    landscapeRisk: LANDSCAPE_RISK_CATEGORY,
    structureRisk: VALUE_AT_RISK_CATEGORY,
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
  error: null
};