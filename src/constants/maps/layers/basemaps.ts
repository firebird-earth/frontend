import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';
import { TILE_LAYERS } from '../../urls';

export const BASEMAPS = {
  STREET: {
    name: 'Street',
    type: LayerType.Basemap,
    source: TILE_LAYERS.STREET,
    description: 'OpenStreetMap standard style',
    units: '',
    colorScheme: 'none',
    maxZoom: 22,
    minZoom: 4,
    attribution: '© OpenStreetMap contributors'
  },
  STREET_LIGHT: {
    name: 'Street (light)',
    type: LayerType.Basemap,
    source: TILE_LAYERS.STREET_LIGHT,
    description: 'Light-colored street map style',
    units: '',
    colorScheme: 'none',
    maxZoom: 22,
    minZoom: 4,
    attribution: '© CartoDB'
  },
  TERRAIN: {
    name: 'Terrain',
    type: LayerType.Basemap,
    source: TILE_LAYERS.TERRAIN,
    description: 'Topographic map style',
    units: '',
    colorScheme: 'none',
    maxZoom: 22,
    minZoom: 4,
    attribution: '© OpenTopoMap'
  },
  SATELLITE: {
    name: 'Satellite',
    type: LayerType.Basemap,
    source: TILE_LAYERS.SATELLITE,
    description: 'Aerial/satellite imagery',
    units: '',
    colorScheme: 'none',
    maxZoom: 22,
    minZoom: 4,
    attribution: '© Esri'
  },
  TOPO: {
    name: 'Topographic',
    type: LayerType.Basemap,
    source: TILE_LAYERS.TOPO,
    description: 'USGS topographic map style',
    units: '',
    colorScheme: 'none',
    maxZoom: 22,
    minZoom: 4,
    attribution: '© USGS'
  }
} as const;

// Layer category constant
export const BASEMAPS_CATEGORY: LayerCategory = createInitialCategory('basemaps', 'Basemaps', [
  { ...BASEMAPS.TOPO, active: true },
  BASEMAPS.STREET,
  BASEMAPS.STREET_LIGHT,
  BASEMAPS.TERRAIN,
  BASEMAPS.SATELLITE
]);