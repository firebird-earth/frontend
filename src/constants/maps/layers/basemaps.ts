import { LayerMetadata } from '../types';
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
  }
} as const;