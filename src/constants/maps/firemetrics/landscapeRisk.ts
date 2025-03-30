import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';
import { GEOTIFF_LAYERS } from '../../../constants/urls';
import { colorSchemes } from '../../../constants/colors';

export const LANDSCAPE_RISK = {
  name: 'Landscape Risk',
  BURN_PROBABILITY: {
    name: 'Burn Probability',
    description: 'Annual burn probability',
    units: 'probability',
    source: GEOTIFF_LAYERS.BURN_PROBABILITY,
    colorScheme: colorSchemes.burnProbability.name
  },
  FLAME_LENGTH: {
    name: 'Flame Length',
    description: 'Conditional flame length',
    units: 'feet',
    source: 'USFS Fire Modeling Institute',
    colorScheme: colorSchemes.fireIntensity.name,
    domain: [0, 100] // Flame length range in feet
  },
  FIRE_INTENSITY: {
    name: 'Fire Intensity',
    description: 'Fire intensity levels',
    units: 'level',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none',
    domain: [0, 6] // Fire intensity levels
  },
  SUPPRESSION_DIFFICULTY: {
    name: 'Suppression Difficulty',
    description: 'Difficulty of fire suppression',
    units: 'index',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none',
    domain: [0, 5] // Suppression difficulty index
  },
  TRANSMISSION_INDEX: {
    name: 'Transmission Index',
    description: 'Fire transmission index',
    units: 'index',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none',
    domain: [0, 100] // Transmission index range
  },
  TRANSMISSION_INFLUENCE: {
    name: 'Transmission Influence',
    description: 'Fire transmission influence',
    units: 'index',
    source: 'USFS Fire Modeling Institute',
    colorScheme: 'none',
    domain: [0, 100] // Transmission influence range
  }
} as const;

// Layer category constant
export const LANDSCAPE_RISK_CATEGORY: LayerCategory = createInitialCategory('landscapeRisk', 'Landscape Risk', [
  { 
    name: LANDSCAPE_RISK.BURN_PROBABILITY.name, 
    type: LayerType.GeoTiff, 
    source: LANDSCAPE_RISK.BURN_PROBABILITY.source, 
    active: false, 
    colorScheme: LANDSCAPE_RISK.BURN_PROBABILITY.colorScheme,
    domain: LANDSCAPE_RISK.BURN_PROBABILITY.domain,
    order: 20 
  },
  { 
    name: LANDSCAPE_RISK.FIRE_INTENSITY.name, 
    type: LayerType.Vector 
  },
  { 
    name: LANDSCAPE_RISK.FLAME_LENGTH.name, 
    type: LayerType.GeoTiff, 
    source: GEOTIFF_LAYERS.FLAME_LENGTH, 
    active: false, 
    colorScheme: LANDSCAPE_RISK.FLAME_LENGTH.colorScheme, 
    order: 10 
  },
  { 
    name: LANDSCAPE_RISK.SUPPRESSION_DIFFICULTY.name, 
    type: LayerType.Vector 
  },
  { 
    name: LANDSCAPE_RISK.TRANSMISSION_INDEX.name, 
    type: LayerType.Vector 
  },
  { 
    name: LANDSCAPE_RISK.TRANSMISSION_INFLUENCE.name, 
    type: LayerType.Vector 
  }
]);
