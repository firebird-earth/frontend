import { LayerMetadata } from '../types';
import { SERVICE_LAYERS } from '../../urls';

export const WILDFIRE = {
  WUI: {
    name: 'WUI',
    description: 'Wildland Urban Interface',
    units: 'category',
    source: 'USFS WUI 2020',
    colorScheme: 'none'
  },
  CRISIS_AREAS: {
    name: 'Wildfire Crisis Areas',
    description: 'USFS Wildfire Crisis Strategy areas',
    units: 'category',
    source: 'USFS Wildfire Crisis Strategy',
    colorScheme: 'none'
  }
} as const;