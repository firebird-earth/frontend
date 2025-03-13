import { LayerMetadata } from '../types';

export const VALUE_AT_RISK = {
  FIRESHEDS: {
    name: 'Firesheds',
    description: 'Fireshed boundaries',
    units: 'count',
    colorScheme: 'none'
  },
  STRUCTURE_BURN_FREQUENCY: {
    name: 'Structure Burn Frequency',
    description: 'Frequency of structure burning',
    units: 'fires/year',
    colorScheme: 'none'
  },
  STRUCTURE_BURN_HAZARD: {
    name: 'Structure Burn Hazard',
    description: 'Structure burn hazard levels',
    units: 'level',
    colorScheme: 'none'
  },
  STRUCTURE_BURN_INFLUENCE: {
    name: 'Structure Burn Influence',
    description: 'Structure burn influence zones',
    units: 'index',
    colorScheme: 'none'
  }
} as const;