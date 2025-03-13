import { LayerMetadata } from '../types';

export const LANDSCAPE = {
  SLOPE: {
    name: 'Slope Steepness',
    description: 'Terrain slope steepness in degrees',
    units: 'degrees',
    source: 'USGS 3DEP',
    colorScheme: 'slopeGradient',
    type: 'dynamic',
    service: 'slope'
  },
  TIMBER_BASE: {
    name: 'Timber Base',
    description: 'Timber base areas',
    units: 'category',
    colorScheme: 'none'
  },
  ROADLESS: {
    name: 'Roadless Areas',
    description: 'Inventoried roadless areas',
    units: 'category',
    colorScheme: 'none'
  },
  WILDERNESS: {
    name: 'Wilderness Areas',
    description: 'Designated wilderness areas',
    units: 'category',
    colorScheme: 'none'
  },
  CULTURAL: {
    name: 'Cultural Areas',
    description: 'Cultural and historic areas',
    units: 'category',
    colorScheme: 'none'
  }
} as const;