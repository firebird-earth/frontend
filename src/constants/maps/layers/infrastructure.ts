import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';

export const INFRASTRUCTURE = {
  BUILDINGS: {
    name: 'Buildings',
    type: LayerType.Vector,
    source: 'USFS Infrastructure',
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
    type: LayerType.Vector,
    source: 'USFS Infrastructure',
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
    type: LayerType.Vector,
    source: 'USFS Infrastructure',
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
  INFRASTRUCTURE.BUILDINGS,
  INFRASTRUCTURE.POWER_LINES,
  INFRASTRUCTURE.HIGH_VOLTAGE_LINES
]);