import { LayersState } from './types';
import { LayerType } from '../../../types/map';
import { TILE_LAYERS, WUI_LAYER, CRISIS_AREAS_LAYER, GEOTIFF_LAYERS } from '../../../constants/urls';
import { createInitialCategory } from '../common/utils/utils';
import { JURISDICTIONS } from '../../../constants/maps/layers/jurisdictions';
import { WILDFIRE } from '../../../constants/maps/layers/wildfire';
import { ELEVATION } from '../../../constants/maps/layers/elevation';

export const initialState: LayersState = {
  categories: {
    basemaps: createInitialCategory('basemaps', 'Basemaps', [
      { name: 'Topographic', active: true, type: LayerType.Basemap, source: TILE_LAYERS.TOPO },
      { name: 'Street', type: LayerType.Basemap, source: TILE_LAYERS.STREET },
      { name: 'Street (light)', type: LayerType.Basemap, source: TILE_LAYERS.STREET_LIGHT },
      { name: 'Terrain', type: LayerType.Basemap, source: TILE_LAYERS.TERRAIN },
      { name: 'Satellite', type: LayerType.Basemap, source: TILE_LAYERS.SATELLITE }
    ]),
    jurisdictions: createInitialCategory('jurisdictions', 'Jurisdictions', [
      { name: JURISDICTIONS.STATES.name, type: LayerType.ArcGISFeatureService, source: JURISDICTIONS.STATES.source },
      { name: JURISDICTIONS.COUNTIES.name, type: LayerType.ArcGISFeatureService, source: JURISDICTIONS.COUNTIES.source },
      { name: JURISDICTIONS.FEDERAL_LANDS.name, type: LayerType.ArcGISFeatureService, source: JURISDICTIONS.FEDERAL_LANDS.source },
      { name: JURISDICTIONS.USFS.name, type: LayerType.ArcGISFeatureService, source: JURISDICTIONS.USFS.source },
      { name: JURISDICTIONS.USFWS.name, type: LayerType.ArcGISFeatureService, source: JURISDICTIONS.USFWS.source },
      { name: JURISDICTIONS.BLM.name, type: LayerType.Vector },
      { name: JURISDICTIONS.NPS.name, type: LayerType.Vector },
      { name: JURISDICTIONS.BOR.name, type: LayerType.Vector },
      { name: JURISDICTIONS.BIA.name, type: LayerType.Vector },
      { name: JURISDICTIONS.STATE.name, type: LayerType.Vector },
      { name: JURISDICTIONS.PRIVATE.name, type: LayerType.Vector }
    ]),
    wildfire: createInitialCategory('wildfire', 'Wildfire', [
      { name: WILDFIRE.WUI.name, type: LayerType.TileLayer, source: WUI_LAYER },
      { name: WILDFIRE.CRISIS_AREAS.name, type: LayerType.ArcGISFeatureService, source: CRISIS_AREAS_LAYER },
      { name: 'Priority Treatment Areas', type: LayerType.Vector }
    ]),
    elevation: createInitialCategory('elevation', 'Elevation', [
      { name: ELEVATION.ELEVATION.name, type: LayerType.ArcGISImageService, source: ELEVATION.ELEVATION.source, renderingRule: ELEVATION.ELEVATION.renderingRule, order: 1 },
      { name: ELEVATION.SLOPE.name, type: LayerType.ArcGISImageService, source: ELEVATION.SLOPE.source, renderingRule: ELEVATION.SLOPE.renderingRule, order: 2 },
      { name: ELEVATION.ASPECT.name, type: LayerType.ArcGISImageService, source: ELEVATION.ASPECT.source, renderingRule: ELEVATION.ASPECT.renderingRule, order: 3 },
      { name: ELEVATION.HILLSHADE.name, type: LayerType.ArcGISImageService, source: ELEVATION.HILLSHADE.source, renderingRule: ELEVATION.HILLSHADE.renderingRule, order: 4 },
      { name: ELEVATION.CONTOUR.name, type: LayerType.ArcGISImageService, source: ELEVATION.CONTOUR.source, renderingRule: ELEVATION.CONTOUR.renderingRule, order: 5 }
    ]),
    valueAtRisk: createInitialCategory('valueAtRisk', 'Value At Risk', [
      { name: 'Firesheds', type: LayerType.Vector },
      { name: 'Structure Burn Frequency', type: LayerType.Vector },
      { name: 'Structure Burn Hazard', type: LayerType.Vector },
      { name: 'Structure Burn Influence', type: LayerType.Vector }
    ]),
    landscapeRisk: createInitialCategory('landscapeRisk', 'Landscape Risk', [
      { name: 'Fire Intensity', type: LayerType.Vector },
      { name: 'Flame Length', type: LayerType.GeoTiff, source: GEOTIFF_LAYERS.FLAME_LENGTH, active: false, order: 10 },
      { name: 'Suppression Difficulty', type: LayerType.Vector },
      { name: 'Transmission Index', type: LayerType.Vector },
      { name: 'Transmission Influence', type: LayerType.Vector }
    ]),
    firemetrics: createInitialCategory('firemetrics', 'Fire Metrics', [
      { name: 'Burn Probability', type: LayerType.GeoTiff, source: GEOTIFF_LAYERS.BURN_PROBABILITY, active: false, order: 20 }
    ]),
    fuels: createInitialCategory('fuels', 'Fuels', [
      { name: 'Canopy Bulk Density', type: LayerType.GeoTiff, source: GEOTIFF_LAYERS.CANOPY_BULK_DENSITY, active: false, order: 30 },
      { name: 'Canopy Cover', type: LayerType.GeoTiff, source: GEOTIFF_LAYERS.CANOPY_COVER, active: false, order: 40 },
      { name: 'Canopy Height', type: LayerType.GeoTiff, source: GEOTIFF_LAYERS.CANOPY_HEIGHT, active: false, order: 50 },
      { name: 'Mortality', type: LayerType.Placeholder, source: '', active: false, order: 60 }
    ]),
    landscape: createInitialCategory('landscape', 'Landscape', [
      { name: 'Timber Base', type: LayerType.Vector },
      { name: 'Roadless Areas', type: LayerType.Vector },
      { name: 'Wilderness Areas', type: LayerType.Vector },
      { name: 'Cultural Areas', type: LayerType.Vector }
    ]),
    transportation: createInitialCategory('transportation', 'Transportation', [
      { name: 'State DOT Roads', type: LayerType.Vector },
      { name: 'County Roads', type: LayerType.Vector },
      { name: 'National Forest Service Roads', type: LayerType.Vector }
    ]),
    water: createInitialCategory('water', 'Water', [
      { name: 'Watersheds L8', type: LayerType.Vector },
      { name: 'Watersheds L10', type: LayerType.Vector },
      { name: 'Watersheds L12', type: LayerType.Vector },
      { name: 'Waterways Ephemeral', type: LayerType.Vector },
      { name: 'Waterways Intermittent', type: LayerType.Vector },
      { name: 'Waterways Perennial', type: LayerType.Vector },
      { name: 'Lakes, Wetlands and Ponds', type: LayerType.Vector }
    ]),
    infrastructure: createInitialCategory('infrastructure', 'Infrastructure', [
      { name: 'Buildings', type: LayerType.Vector },
      { name: 'Power Transmission Lines', type: LayerType.Vector },
      { name: 'High Voltage Power Transmission Lines', type: LayerType.Vector }
    ]),
    restorationClass: createInitialCategory('restorationClass', 'Restoration Class', [
      { name: 'Moderate Departure Veg. Conditions Class', type: LayerType.Vector },
      { name: 'Significant Departure Veg. Condition Class', type: LayerType.Vector }
    ]),
    habitat: createInitialCategory('habitat', 'Habitat', [
      { name: 'Mule Deer', type: LayerType.Vector },
      { name: 'Gunnison Sage Grouse', type: LayerType.Vector },
      { name: 'Migration Corridors', type: LayerType.Vector },
      { name: 'Lynx Analysis Units (LAU)', type: LayerType.Vector }
    ])
  },
  loading: false,
  error: null,
  slopeRenderingRule: 'Hillshade Gray'
};
