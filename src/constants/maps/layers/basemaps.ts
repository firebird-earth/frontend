import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';
import { TILE_LAYERS } from '../../urls';

export const BASEMAPS = {
  STREET: {
    name: 'Street',
    description: 'OpenStreetMap standard style',
    units: '',
    source: TILE_LAYERS.STREET,
    colorScheme: 'none'
  },
  STREET_LIGHT: {
    name: 'Street (light)',
    description: 'Light-colored street map style',
    units: '',
    source: TILE_LAYERS.STREET_LIGHT,
    colorScheme: 'none'
  },
  TERRAIN: {
    name: 'Terrain',
    description: 'Topographic map style',
    units: '',
    source: TILE_LAYERS.TERRAIN,
    colorScheme: 'none'
  },
  SATELLITE: {
    name: 'Satellite',
    description: 'Aerial/satellite imagery',
    units: '',
    source: TILE_LAYERS.SATELLITE,
    colorScheme: 'none'
  },
  TOPO: {
    name: 'Topographic',
    description: 'USGS topographic map style',
    units: '',
    source: TILE_LAYERS.TOPO,
    colorScheme: 'none'
  }
} as const;

// Layer category constant
export const BASEMAPS_CATEGORY: LayerCategory = createInitialCategory('basemaps', 'Basemaps', [
  { 
    name: BASEMAPS.TOPO.name, 
    active: true, 
    type: LayerType.Basemap, 
    source: BASEMAPS.TOPO.source, 
    colorScheme: BASEMAPS.TOPO.colorScheme 
  },
  { 
    name: BASEMAPS.STREET.name, 
    type: LayerType.Basemap, 
    source: BASEMAPS.STREET.source, 
    colorScheme: BASEMAPS.STREET.colorScheme 
  },
  { 
    name: BASEMAPS.STREET_LIGHT.name, 
    type: LayerType.Basemap, 
    source: BASEMAPS.STREET_LIGHT.source, 
    colorScheme: BASEMAPS.STREET_LIGHT.colorScheme 
  },
  { 
    name: BASEMAPS.TERRAIN.name, 
    type: LayerType.Basemap, 
    source: BASEMAPS.TERRAIN.source, 
    colorScheme: BASEMAPS.TERRAIN.colorScheme 
  },
  { 
    name: BASEMAPS.SATELLITE.name, 
    type: LayerType.Basemap, 
    source: BASEMAPS.SATELLITE.source, 
    colorScheme: BASEMAPS.SATELLITE.colorScheme 
  }
]);