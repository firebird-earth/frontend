import { LayerMetadata } from '../types';

export const WATER = {
  WATERSHEDS_L8: {
    name: 'Watersheds L8',
    description: 'Level 8 watershed boundaries',
    units: 'category',
    colorScheme: 'none'
  },
  WATERSHEDS_L10: {
    name: 'Watersheds L10',
    description: 'Level 10 watershed boundaries',
    units: 'category',
    colorScheme: 'none'
  },
  WATERSHEDS_L12: {
    name: 'Watersheds L12',
    description: 'Level 12 watershed boundaries',
    units: 'category',
    colorScheme: 'none'
  },
  WATERWAYS_EPHEMERAL: {
    name: 'Waterways Ephemeral',
    description: 'Ephemeral waterways',
    units: 'category',
    colorScheme: 'none'
  },
  WATERWAYS_INTERMITTENT: {
    name: 'Waterways Intermittent',
    description: 'Intermittent waterways',
    units: 'category',
    colorScheme: 'none'
  },
  WATERWAYS_PERENNIAL: {
    name: 'Waterways Perennial',
    description: 'Perennial waterways',
    units: 'category',
    colorScheme: 'none'
  },
  WATER_BODIES: {
    name: 'Lakes, Wetlands and Ponds',
    description: 'Major water bodies',
    units: 'category',
    colorScheme: 'none'
  }
} as const;