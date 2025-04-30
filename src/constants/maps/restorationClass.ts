import { LayerType } from '../../types/map';
import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';

export const RESTORATION_CLASS = {
  MODERATE_DEPARTURE: {
    name: 'Moderate Departure Veg. Conditions Class',
    type: LayerType.Vector,
    source: 'USFS Vegetation',
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
    type: LayerType.Vector,
    source: 'USFS Vegetation',
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
  RESTORATION_CLASS.MODERATE_DEPARTURE,
  RESTORATION_CLASS.SIGNIFICANT_DEPARTURE
]);