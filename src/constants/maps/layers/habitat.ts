import { LayerMetadata } from '../types';

export const HABITAT = {
  MULE_DEER: {
    name: 'Mule Deer',
    description: 'Mule deer habitat areas',
    units: 'category',
    colorScheme: 'none'
  },
  SAGE_GROUSE: {
    name: 'Gunnison Sage Grouse',
    description: 'Gunnison sage grouse habitat',
    units: 'category',
    colorScheme: 'none'
  },
  MIGRATION_CORRIDORS: {
    name: 'Migration Corridors',
    description: 'Wildlife migration corridors',
    units: 'category',
    colorScheme: 'none'
  },
  LYNX_UNITS: {
    name: 'Lynx Analysis Units (LAU)',
    description: 'Lynx habitat analysis units',
    units: 'category',
    colorScheme: 'none'
  }
} as const;