import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';

export const LANDSCAPE = {
  SLOPE: {
    name: 'Slope Steepness',
    description: 'Terrain slope steepness in degrees',
    units: 'degrees',
    source: 'USGS 3DEP',
    colorScheme: 'slopeGradient',
    type: 'dynamic',
    service: 'slope',
    legend: {
      items: [
        {
          color: '#D0D0D0',
          label: 'Flat (0-5°)'
        },
        {
          color: '#F8C129',
          label: 'Moderate (20-25°)'
        },
        {
          color: '#E30F05',
          label: 'Steep (40-45°)'
        }
      ]
    }
  },
  TIMBER_BASE: {
    name: 'Timber Base',
    description: 'Timber base areas',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#2E7D32',
          weight: 1,
          fillColor: '#2E7D32',
          fillOpacity: 0.2,
          label: 'Timber Base Area'
        }
      ]
    }
  },
  ROADLESS: {
    name: 'Roadless Areas',
    description: 'Inventoried roadless areas',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#795548',
          weight: 1,
          fillColor: '#795548',
          fillOpacity: 0.2,
          label: 'Roadless Area'
        }
      ]
    }
  },
  WILDERNESS: {
    name: 'Wilderness Areas',
    description: 'Designated wilderness areas',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#004D40',
          weight: 1,
          fillColor: '#004D40',
          fillOpacity: 0.2,
          label: 'Wilderness Area'
        }
      ]
    }
  },
  CULTURAL: {
    name: 'Cultural Areas',
    description: 'Cultural and historic areas',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#C2185B',
          weight: 1,
          fillColor: '#C2185B',
          fillOpacity: 0.2,
          label: 'Cultural Area'
        }
      ]
    }
  }
} as const;

// Layer category constant
export const LANDSCAPE_CATEGORY: LayerCategory = createInitialCategory('landscape', 'Landscape', [
  { 
    name: LANDSCAPE.TIMBER_BASE.name, 
    type: LayerType.Vector,
    colorScheme: LANDSCAPE.TIMBER_BASE.colorScheme
  },
  { 
    name: LANDSCAPE.ROADLESS.name, 
    type: LayerType.Vector,
    colorScheme: LANDSCAPE.ROADLESS.colorScheme
  },
  { 
    name: LANDSCAPE.WILDERNESS.name, 
    type: LayerType.Vector,
    colorScheme: LANDSCAPE.WILDERNESS.colorScheme
  },
  { 
    name: LANDSCAPE.CULTURAL.name, 
    type: LayerType.Vector,
    colorScheme: LANDSCAPE.CULTURAL.colorScheme
  }
]);