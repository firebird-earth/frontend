import { LayerMetadata } from '../types';
import { GEOTIFF_LAYERS } from '../../urls';

export const LANDSCAPE_RISK = {
  FLAME_LENGTH: {
    name: 'Flame Length',
    description: 'Conditional flame length',
    units: 'feet',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'fireIntensity'
  },
  BURN_PROBABILITY: {
    name: 'Burn Probability',
    description: 'Annual burn probability',
    units: 'probability',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'burnProbability',
    source: GEOTIFF_LAYERS.BURN_PROBABILITY
  },
  FIRE_INTENSITY: {
    name: 'Fire Intensity',
    description: 'Fire intensity levels',
    units: 'level',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none'
  },
  SUPPRESSION_DIFFICULTY: {
    name: 'Suppression Difficulty',
    description: 'Difficulty of fire suppression',
    units: 'index',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none'
  },
  TRANSMISSION_INDEX: {
    name: 'Transmission Index',
    description: 'Fire transmission index',
    units: 'index',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none'
  },
  TRANSMISSION_INFLUENCE: {
    name: 'Transmission Influence',
    description: 'Fire transmission influence',
    units: 'index',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none'
  }
} as const;