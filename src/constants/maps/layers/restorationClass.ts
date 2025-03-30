import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';

export const RESTORATION_CLASS = {
  MODERATE_DEPARTURE: {
    name: 'Moderate Departure Veg. Conditions Class',
    description: 'Areas with moderate vegetation departure from historical conditions',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#FFA726',
          weight: 1,
          fillColor: '#FFA726',
          fillOpacity: 0.2,
          label: 'Moderate Departure'
        }
      ]
    }
  },
  SIGNIFICANT_DEPARTURE: {
    name: 'Significant Departure Veg. Condition Class',
    description: 'Areas with significant vegetation departure from historical conditions',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#EF5350',
          weight: 1,
          fillColor: '#EF5350',
          fillOpacity: 0.2,
          label: 'Significant Departure'
        }
      ]
    }
  }
} as const;

// Layer category constant
export const RESTORATION_CLASS_CATEGORY: LayerCategory = createInitialCategory('restorationClass', 'Restoration Class', [
  { 
    name: RESTORATION_CLASS.MODERATE_DEPARTURE.name, 
    type: LayerType.Vector,
    colorScheme: RESTORATION_CLASS.MODERATE_DEPARTURE.colorScheme
  },
  { 
    name: RESTORATION_CLASS.SIGNIFICANT_DEPARTURE.name, 
    type: LayerType.Vector,
    colorScheme: RESTORATION_CLASS.SIGNIFICANT_DEPARTURE.colorScheme
  }
]);