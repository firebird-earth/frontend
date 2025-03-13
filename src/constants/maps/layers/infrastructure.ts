import { LayerMetadata } from '../types';

export const INFRASTRUCTURE = {
  BUILDINGS: {
    name: 'Buildings',
    description: 'Building footprints',
    units: 'category',
    colorScheme: 'none'
  },
  POWER_LINES: {
    name: 'Power Transmission Lines',
    description: 'Power transmission lines',
    units: 'category',
    colorScheme: 'none'
  },
  HIGH_VOLTAGE_LINES: {
    name: 'High Voltage Power Transmission Lines',
    description: 'High voltage power transmission lines',
    units: 'category',
    colorScheme: 'none'
  }
} as const;