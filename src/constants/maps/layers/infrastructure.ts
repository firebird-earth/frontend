import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';

export const INFRASTRUCTURE = {
  BUILDINGS: {
    name: 'Buildings',
    description: 'Building footprints and structures',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#424242',
          weight: 1,
          fillColor: '#424242',
          fillOpacity: 0.2,
          label: 'Building'
        }
      ]
    }
  },
  POWER_LINES: {
    name: 'Power Transmission Lines',
    description: 'Power transmission line corridors',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#FDD835',
          weight: 1.5,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'Transmission Line'
        }
      ]
    }
  },
  HIGH_VOLTAGE_LINES: {
    name: 'High Voltage Power Transmission Lines',
    description: 'High voltage power transmission corridors',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#F57F17',
          weight: 2,
          fillColor: 'none',
          fillOpacity: 0,
          label: 'High Voltage Line'
        }
      ]
    }
  }
} as const;

// Layer category constant
export const INFRASTRUCTURE_CATEGORY: LayerCategory = createInitialCategory('infrastructure', 'Infrastructure', [
  { 
    name: INFRASTRUCTURE.BUILDINGS.name, 
    type: LayerType.Vector,
    colorScheme: INFRASTRUCTURE.BUILDINGS.colorScheme
  },
  { 
    name: INFRASTRUCTURE.POWER_LINES.name, 
    type: LayerType.Vector,
    colorScheme: INFRASTRUCTURE.POWER_LINES.colorScheme
  },
  { 
    name: INFRASTRUCTURE.HIGH_VOLTAGE_LINES.name, 
    type: LayerType.Vector,
    colorScheme: INFRASTRUCTURE.HIGH_VOLTAGE_LINES.colorScheme
  }
]);