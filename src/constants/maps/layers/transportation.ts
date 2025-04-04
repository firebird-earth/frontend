import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';

export const TRANSPORTATION = {
  STATE_ROADS: {
    name: 'State DOT Roads',
    type: LayerType.Vector,
    source: 'USFS Transportation',
    description: 'State Department of Transportation roads',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#E53935',
          weight: 2,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'State Highway'
        }
      ]
    }
  },
  COUNTY_ROADS: {
    name: 'County Roads',
    type: LayerType.Vector,
    source: 'USFS Transportation',
    description: 'County maintained roads',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#FB8C00',
          weight: 1.5,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'County Road'
        }
      ]
    }
  },
  USFS_ROADS: {
    name: 'National Forest Service Roads',
    type: LayerType.Vector,
    source: 'USFS Transportation',
    description: 'USFS maintained roads',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#43A047',
          weight: 1,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'Forest Service Road'
        }
      ]
    }
  }
} as const;

// Layer category constant
export const TRANSPORTATION_CATEGORY: LayerCategory = createInitialCategory('transportation', 'Transportation', [
  TRANSPORTATION.STATE_ROADS,
  TRANSPORTATION.COUNTY_ROADS,
  TRANSPORTATION.USFS_ROADS
]);