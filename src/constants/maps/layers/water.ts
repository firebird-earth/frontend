import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';

export const WATER = {
  WATERSHEDS_L8: {
    name: 'Watersheds L8',
    description: 'Level 8 watershed boundaries',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#0288D1',
          weight: 2,
          fillColor: '#0288D1',
          fillOpacity: 0.1,
          label: 'Level 8 Watershed'
        }
      ]
    }
  },
  WATERSHEDS_L10: {
    name: 'Watersheds L10',
    description: 'Level 10 watershed boundaries',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#0277BD',
          weight: 1.5,
          fillColor: '#0277BD',
          fillOpacity: 0.1,
          label: 'Level 10 Watershed'
        }
      ]
    }
  },
  WATERSHEDS_L12: {
    name: 'Watersheds L12',
    description: 'Level 12 watershed boundaries',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#01579B',
          weight: 1,
          fillColor: '#01579B',
          fillOpacity: 0.1,
          label: 'Level 12 Watershed'
        }
      ]
    }
  },
  WATERWAYS_EPHEMERAL: {
    name: 'Waterways Ephemeral',
    description: 'Ephemeral waterways',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#81D4FA',
          weight: 1,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'Ephemeral Stream'
        }
      ]
    }
  },
  WATERWAYS_INTERMITTENT: {
    name: 'Waterways Intermittent',
    description: 'Intermittent waterways',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#4FC3F7',
          weight: 1.5,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'Intermittent Stream'
        }
      ]
    }
  },
  WATERWAYS_PERENNIAL: {
    name: 'Waterways Perennial',
    description: 'Perennial waterways',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#03A9F4',
          weight: 2,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'Perennial Stream'
        }
      ]
    }
  },
  WATER_BODIES: {
    name: 'Lakes, Wetlands and Ponds',
    description: 'Major water bodies',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#0288D1',
          weight: 1,
          fillColor: '#0288D1',
          fillOpacity: 0.2,
          label: 'Water Body'
        }
      ]
    }
  }
} as const;

// Layer category constant
export const WATER_CATEGORY: LayerCategory = createInitialCategory('water', 'Water', [
  { 
    name: WATER.WATERSHEDS_L8.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATERSHEDS_L8.colorScheme
  },
  { 
    name: WATER.WATERSHEDS_L10.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATERSHEDS_L10.colorScheme
  },
  { 
    name: WATER.WATERSHEDS_L12.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATERSHEDS_L12.colorScheme
  },
  { 
    name: WATER.WATERWAYS_EPHEMERAL.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATERWAYS_EPHEMERAL.colorScheme
  },
  { 
    name: WATER.WATERWAYS_INTERMITTENT.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATERWAYS_INTERMITTENT.colorScheme
  },
  { 
    name: WATER.WATERWAYS_PERENNIAL.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATERWAYS_PERENNIAL.colorScheme
  },
  { 
    name: WATER.WATER_BODIES.name, 
    type: LayerType.Vector,
    colorScheme: WATER.WATER_BODIES.colorScheme
  }
]);