import { LayersState } from './types';
import { TILE_LAYERS, WUI_LAYER, CRISIS_AREAS_LAYER } from '../../../constants/urls';
import { createInitialCategory } from './utils/common';

export const initialState: LayersState = {
  categories: {
    basemaps: createInitialCategory('basemaps', 'Basemaps', [
      { name: 'Street', active: true, source: TILE_LAYERS.STREET },
      { name: 'Street (light)', source: TILE_LAYERS.STREET_LIGHT },
      { name: 'Terrain', source: TILE_LAYERS.TERRAIN },
      { name: 'Satellite', source: TILE_LAYERS.SATELLITE }
    ]),
    wildfire: createInitialCategory('wildfire', 'Wildfire', [
      { name: 'WUI', type: 'tile', source: WUI_LAYER },
      { name: 'Wildfire Crisis Areas', type: 'vector', source: CRISIS_AREAS_LAYER },
      { name: 'Priority Treatment Areas', type: 'vector' }
    ]),
    elevation: createInitialCategory('elevation', 'Elevation', [
      { 
        name: 'Hillshade', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Hillshade Gray'
      },
      { 
        name: 'Aspect', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Aspect Degrees'
      },
      { 
        name: 'Slope Steepness', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Slope Map'
      },
      { 
        name: 'Contour', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Contour'
      }
    ]),
    landscape: createInitialCategory('landscape', 'Landscape', [
      { name: 'Timber Base', type: 'vector' },
      { name: 'Roadless Areas', type: 'vector' },
      { name: 'Wilderness Areas', type: 'vector' },
      { name: 'Cultural Areas', type: 'vector' }
    ]),
    jurisdictions: createInitialCategory('jurisdictions', 'Jurisdictions', [
      { name: 'US Forest Service', type: 'vector' },
      { name: 'Bureau of Land Management', type: 'vector' },
      { name: 'US Fish and Wildlife', type: 'vector' },
      { name: 'National Park Service', type: 'vector' },
      { name: 'Bureau of Reclamation', type: 'vector' },
      { name: 'Bureau of Indian Affairs', type: 'vector' },
      { name: 'State Owned', type: 'vector' },
      { name: 'Private Land', type: 'vector' }
    ]),
    transportation: createInitialCategory('transportation', 'Transportation', [
      { name: 'State DOT Roads', type: 'vector' },
      { name: 'County Roads', type: 'vector' },
      { name: 'National Forest Service Roads', type: 'vector' }
    ]),
    water: createInitialCategory('water', 'Water', [
      { name: 'Watersheds L8', type: 'vector' },
      { name: 'Watersheds L10', type: 'vector' },
      { name: 'Watersheds L12', type: 'vector' },
      { name: 'Waterways Ephemeral', type: 'vector' },
      { name: 'Waterways Intermittent', type: 'vector' },
      { name: 'Waterways Perennial', type: 'vector' },
      { name: 'Lakes, Wetlands and Ponds', type: 'vector' }
    ]),
    infrastructure: createInitialCategory('infrastructure', 'Infrastructure', [
      { name: 'Buildings', type: 'vector' },
      { name: 'Power Transmission Lines', type: 'vector' },
      { name: 'High Voltage Power Transmission Lines', type: 'vector' }
    ]),
    restorationClass: createInitialCategory('restorationClass', 'Restoration Class', [
      { name: 'Moderate Departure Veg. Conditions Class', type: 'vector' },
      { name: 'Significant Departure Veg. Condition Class', type: 'vector' }
    ]),
    habitat: createInitialCategory('habitat', 'Habitat', [
      { name: 'Mule Deer', type: 'vector' },
      { name: 'Gunnison Sage Grouse', type: 'vector' },
      { name: 'Migration Corridors', type: 'vector' },
      { name: 'Lynx Analysis Units (LAU)', type: 'vector' }
    ])
  },
  loading: false,
  error: null,
  slopeRenderingRule: 'Hillshade Gray'
};