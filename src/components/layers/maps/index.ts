import { createDynamicLayer } from '../base/ArcGISDynamicLayer';
import { createFeatureLayer } from '../base/ArcGISFeatureLayer';
import { createTileLayer } from '../base/TileLayer';
import { createGeoTiffLayer } from '../base/GeoTiffFactory';
import { ELEVATION, ELEVATION_CATEGORY } from '../../../constants/maps/layers/elevation';
import { JURISDICTIONS, JURISDICTIONS_CATEGORY } from '../../../constants/maps/layers/jurisdictions';
import { WILDFIRE, WILDFIRE_CATEGORY } from '../../../constants/maps/layers/wildfire';
import { FIRE_METRICS } from '../../../constants/maps';
import { LANDSCAPE_RISK_CATEGORY } from '../../../constants/maps/firemetrics/landscapeRisk';
import { FUELS_CATEGORY } from '../../../constants/maps/firemetrics/fuels';

// ---------------- FIREMETRICS TAB ----------------

// GeoTiff Layers (Landscape Risk)
export const BurnProbabilityLayer = createGeoTiffLayer(LANDSCAPE_RISK_CATEGORY.id, FIRE_METRICS.LANDSCAPE_RISK.BURN_PROBABILITY);
export const FlameLengthLayer = createGeoTiffLayer(LANDSCAPE_RISK_CATEGORY.id, FIRE_METRICS.LANDSCAPE_RISK.FLAME_LENGTH);

// GeoTiff Layers (Fuels)
export const CanopyBulkDensityLayer = createGeoTiffLayer(FUELS_CATEGORY.id, FIRE_METRICS.FUELS.CANOPY_BULK_DENSITY);
export const CanopyCoverLayer = createGeoTiffLayer(FUELS_CATEGORY.id, FIRE_METRICS.FUELS.CANOPY_COVER);
export const CanopyHeightLayer = createGeoTiffLayer(FUELS_CATEGORY.id, FIRE_METRICS.FUELS.CANOPY_HEIGHT);
export const MortalityLayer = createGeoTiffLayer(FUELS_CATEGORY.id, FIRE_METRICS.FUELS.MORTALITY);

// ---------------- LAYERS TAB ----------------

// Feature Layers (Jurisdictions)
export const StatesLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.STATES);
export const CountiesLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.COUNTIES);
export const FederalLandsLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.FEDERAL_LANDS);
export const USFSLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.USFS);
export const USFWSLayer = createFeatureLayer(JURISDICTIONS_CATEGORY.id, JURISDICTIONS.USFWS);

// Dynamic Layers (Elevation)
export const ElevationLayer = createDynamicLayer(ELEVATION_CATEGORY.id, ELEVATION.ELEVATION);
export const HillshadeLayer = createDynamicLayer(ELEVATION_CATEGORY.id, ELEVATION.HILLSHADE);
export const AspectLayer = createDynamicLayer(ELEVATION_CATEGORY.id, ELEVATION.ASPECT);
export const SlopeLayer = createDynamicLayer(ELEVATION_CATEGORY.id, ELEVATION.SLOPE);
export const ContourLayer = createDynamicLayer(ELEVATION_CATEGORY.id, ELEVATION.CONTOUR);

// Feature Layers (Wildfire)
export const CrisisAreasLayer = createFeatureLayer(WILDFIRE_CATEGORY.id, WILDFIRE.CRISIS_AREAS);

// Tile Layers (Wildfire)
export const WUILayer = createTileLayer(WILDFIRE_CATEGORY.id, WILDFIRE.WUI);

// Export base components
export { default as GeoTiffLayer } from '../base/GeoTiffLayer';
export { default as GeoTiffLegend } from '../base/GeoTiffLegend';

// Export factory functions
export { createDynamicLayer } from '../base/ArcGISDynamicLayer';
export { createFeatureLayer } from '../base/ArcGISFeatureLayer';
export { createTileLayer } from '../base/TileLayer';
export { createGeoTiffLayer } from '../base/GeoTiffFactory';