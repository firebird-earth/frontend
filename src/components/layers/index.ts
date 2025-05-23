import { createTiffLayer } from './ArcGISTiffLayer';
import { createFeatureLayer } from './ArcGISFeatureLayer';
import { createTileLayer } from './TileLayer';
import { createGeoTiffLayer } from './GeoTiffLayer';
import { createQueryLayer } from './QueryLayer';
import { ELEVATION, ELEVATION_CATEGORY } from '../../constants/maps/elevation';
import { JURISDICTIONS, JURISDICTIONS_CATEGORY } from '../../constants/maps/jurisdictions';
import { WILDFIRE, WILDFIRE_CATEGORY } from '../../constants/maps/wildfire';
import { FIRE_METRICS } from '../../constants/maps';
import { LANDSCAPE_RISK_CATEGORY } from '../../constants/maps/landscapeRisk';
import { FUELS_CATEGORY } from '../../constants/maps/fuels';
import { scenarios } from '../../constants/maps/scenarios';

// ---------------- LAYERS TAB ----------------

// Feature Layers
export const StatesLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.STATES);
export const CountiesLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.COUNTIES);
export const FederalLandsLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.FEDERAL_LANDS);
export const USFSLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.USFS);
export const USFWSLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.USFWS);
export const CrisisAreasLayer = createFeatureLayer(WILDFIRE_CATEGORY.id, WILDFIRE.CRISIS_AREAS);

// Tiff Layers
export const ElevationLayer = createTiffLayer(ELEVATION_CATEGORY.id, ELEVATION.ELEVATION);
export const HillshadeLayer = createTiffLayer(ELEVATION_CATEGORY.id, ELEVATION.HILLSHADE);
export const AspectLayer = createTiffLayer(ELEVATION_CATEGORY.id, ELEVATION.ASPECT);
export const SlopeLayer = createTiffLayer(ELEVATION_CATEGORY.id, ELEVATION.SLOPE);
export const ContourLayer = createTiffLayer(ELEVATION_CATEGORY.id, ELEVATION.CONTOUR);

// Tile Layers
export const WUILayer = createTileLayer(WILDFIRE_CATEGORY.id, WILDFIRE.WUI);

// Query Layers
export const ScenarioLayers = scenarios.map(scenario => 
  createQueryLayer('scenarios', scenario)
);

// Export layer components
export { default as GeoTiffLayer } from './GeoTiffLayer';
export { default as GeoTiffLegend } from '../legend/GeoTiffLegend';

// Export factory functions
export { createGeoTiffLayer } from './GeoTiffLayer';
export { createTiffLayer } from './ArcGISTiffLayer';
export { createFeatureLayer } from './ArcGISFeatureLayer';
export { createTileLayer } from './TileLayer';
export { createQueryLayer } from './QueryLayer';