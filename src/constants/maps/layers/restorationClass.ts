import { LayerMetadata } from '../types';

export const RESTORATION_CLASS = {
  MODERATE_DEPARTURE: {
    name: 'Moderate Departure Veg. Conditions Class',
    description: 'Moderate vegetation departure conditions',
    units: 'category',
    colorScheme: 'none'
  },
  SIGNIFICANT_DEPARTURE: {
    name: 'Significant Departure Veg. Condition Class',
    description: 'Significant vegetation departure conditions',
    units: 'category',
    colorScheme: 'none'
  }
} as const;