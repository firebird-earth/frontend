import { 
  createDynamicLayer 
} from '../base/ArcGISDynamicLayer';
import { 
  createFeatureLayer 
} from '../base/ArcGISFeatureLayer';
import {
  createTileLayer
} from '../base/TileLayer';
import {
  createGeoTiffLayer
} from '../base/GeoTiffFactory';
import { ELEVATION } from '../../../constants/maps/layers/elevation';
import { JURISDICTIONS } from '../../../constants/maps/layers/jurisdictions';
import { WILDFIRE } from '../../../constants/maps/layers/wildfire';
import { FIRE_METRICS } from '../../../constants/maps';

// ---------------- LAYERS TAB ----------------

// Feature Layers (Jurisdictions)
export const StatesLayer = createFeatureLayer('jurisdictions', JURISDICTIONS.STATES);
export const CountiesLayer = createFeatureLayer('jurisdictions', JURISDICTIONS.COUNTIES);
export const FederalLandsLayer = createFeatureLayer('jurisdictions', JURISDICTIONS.FEDERAL_LANDS);
export const USFSLayer = createFeatureLayer('jurisdictions', JURISDICTIONS.USFS);
export const USFWSLayer = createFeatureLayer('jurisdictions', JURISDICTIONS.USFWS);

// Feature Layers (Wildfire)
export const CrisisAreasLayer = createFeatureLayer('wildfire', WILDFIRE.CRISIS_AREAS);

// Tile Layers (Wildfire)
export const WUILayer = createTileLayer('wildfire', WILDFIRE.WUI);

// Dynamic Layers (Elevation)
export const ElevationLayer = createDynamicLayer('elevation', ELEVATION.ELEVATION);
export const HillshadeLayer = createDynamicLayer('elevation', ELEVATION.HILLSHADE);
export const AspectLayer = createDynamicLayer('elevation', ELEVATION.ASPECT);
export const SlopeLayer = createDynamicLayer('elevation', ELEVATION.SLOPE);
export const ContourLayer = createDynamicLayer('elevation', ELEVATION.CONTOUR);

// ---------------- FIREMETRICS TAB ----------------

// GeoTiff Layers (Landscape Risk)
export const BurnProbabilityLayer = createGeoTiffLayer('firemetrics', FIRE_METRICS.LANDSCAPE_RISK.BURN_PROBABILITY);
export const FlameLengthLayer = createGeoTiffLayer('firemetrics', FIRE_METRICS.LANDSCAPE_RISK.FLAME_LENGTH);

// GeoTiff Layers (Fuels)
export const CanopyBulkDensityLayer = createGeoTiffLayer('fuels', FIRE_METRICS.FUELS.CANOPY_BULK_DENSITY);
export const CanopyCoverLayer = createGeoTiffLayer('fuels', FIRE_METRICS.FUELS.CANOPY_COVER);
export const CanopyHeightLayer = createGeoTiffLayer('fuels', FIRE_METRICS.FUELS.CANOPY_HEIGHT);
export const MortalityLayer = createGeoTiffLayer('fuels', FIRE_METRICS.FUELS.MORTALITY);

// Export base components
export { default as GeoTiffLayer } from '../base/GeoTiffLayer';
export { default as GeoTiffLegend } from '../base/GeoTiffLegend';

// Export factory functions
export { createDynamicLayer } from '../base/ArcGISDynamicLayer';
export { createFeatureLayer } from '../base/ArcGISFeatureLayer';
export { createTileLayer } from '../base/TileLayer';
export { createGeoTiffLayer } from '../base/GeoTiffFactory';