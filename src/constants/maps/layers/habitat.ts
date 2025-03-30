import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';

export const HABITAT = {
  MULE_DEER: {
    name: 'Mule Deer',
    description: 'Mule deer habitat areas',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#2E7D32',
          weight: 1,
          fillColor: '#2E7D32',
          fillOpacity: 0.2,
          label: 'Mule Deer Habitat'
        }
      ]
    }
  },
  SAGE_GROUSE: {
    name: 'Gunnison Sage Grouse',
    description: 'Gunnison sage grouse habitat',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#9C27B0',
          weight: 1,
          fillColor: '#9C27B0',
          fillOpacity: 0.2,
          label: 'Sage Grouse Habitat'
        }
      ]
    }
  },
  MIGRATION_CORRIDORS: {
    name: 'Migration Corridors',
    description: 'Wildlife migration corridors',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#1976D2',
          weight: 2,
          fillColor: '#1976D2',
          fillOpacity: 0.15,
          label: 'Migration Corridor'
        }
      ]
    }
  },
  LYNX_UNITS: {
    name: 'Lynx Analysis Units (LAU)',
    description: 'Lynx habitat analysis units',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          color: '#F57C00',
          weight: 1,
          fillColor: '#F57C00',
          fillOpacity: 0.2,
          label: 'Lynx Analysis Unit'
        }
      ]
    }
  }
} as const;

// Layer category constant
export const HABITAT_CATEGORY: LayerCategory = createInitialCategory('habitat', 'Habitat', [
  { 
    name: HABITAT.MULE_DEER.name, 
    type: LayerType.Vector,
    colorScheme: HABITAT.MULE_DEER.colorScheme
  },
  { 
    name: HABITAT.SAGE_GROUSE.name, 
    type: LayerType.Vector,
    colorScheme: HABITAT.SAGE_GROUSE.colorScheme
  },
  { 
    name: HABITAT.MIGRATION_CORRIDORS.name, 
    type: LayerType.Vector,
    colorScheme: HABITAT.MIGRATION_CORRIDORS.colorScheme
  },
  { 
    name: HABITAT.LYNX_UNITS.name, 
    type: LayerType.Vector,
    colorScheme: HABITAT.LYNX_UNITS.colorScheme
  }
]);