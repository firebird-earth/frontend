import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';

export const HABITAT = {
  MULE_DEER: {
    name: 'Mule Deer',
    type: LayerType.Vector,
    source: 'USFS Wildlife Habitat',
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
    type: LayerType.Vector,
    source: 'USFS Wildlife Habitat',
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
    type: LayerType.Vector,
    source: 'USFS Wildlife Habitat',
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
    type: LayerType.Vector,
    source: 'USFS Wildlife Habitat',
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
  HABITAT.MULE_DEER,
  HABITAT.SAGE_GROUSE,
  HABITAT.MIGRATION_CORRIDORS,
  HABITAT.LYNX_UNITS
]);