import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';
import { GEOTIFF_LAYERS } from '../../../constants/urls';
import { colorSchemes } from '../../../constants/colors';
import { STORAGE } from '../../../constants/urls';

export const LANDSCAPE_RISK = {
  name: 'landscapeRisk',
  label: 'Landscape Risk',
  BURN_PROBABILITY: {
    name: 'Burn Probability',
    description: 'Annual burn probability',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/burn_probability.tif`,
    units: 'probability',
    colorScheme: colorSchemes.burnProbability.name
  },
  FLAME_LENGTH: {
    name: 'Flame Length',
    description: 'Conditional flame length',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/flame_length.tif`,
    units: 'feet',
    colorScheme: colorSchemes.fireIntensity.name,
    domain: [0, 100] // Flame length range in feet
  },
  FIRE_INTENSITY: {
    name: 'Fire Intensity',
    description: 'Fire intensity levels',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute',
    units: 'level',
    colorScheme: 'none',
    domain: [0, 6] // Fire intensity levels
  },
  SUPPRESSION_DIFFICULTY: {
    name: 'Suppression Difficulty',
    description: 'Difficulty of fire suppression',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute',
    units: 'index',
    colorScheme: 'none',
    domain: [0, 5] // Suppression difficulty index
  },
  TRANSMISSION_INDEX: {
    name: 'Explosive Fire Risk',
    description: 'Explosive Fire Risk',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/explosive_fire_risk.tif`,
    units: 'burned acres in two hours',
    colorScheme: colorSchemes.greenYellowRed.name,
    domain: [0, 100] // Transmission index range
  },
  TRANSMISSION_INFLUENCE: {
    name: 'Transmission Influence',
    description: 'Fire transmission influence',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute',
    units: 'index',
    colorScheme: 'none',
    domain: [0, 100] // Transmission influence range
  }
} as const;

// Layer category constant
export const LANDSCAPE_RISK_CATEGORY: LayerCategory = createInitialCategory('landscapeRisk', 'Landscape Risk', [
  LANDSCAPE_RISK.BURN_PROBABILITY,
  LANDSCAPE_RISK.FLAME_LENGTH,
  LANDSCAPE_RISK.FIRE_INTENSITY,
  LANDSCAPE_RISK.TRANSMISSION_INDEX,
  LANDSCAPE_RISK.TRANSMISSION_INFLUENCE,
  LANDSCAPE_RISK.SUPPRESSION_DIFFICULTY
]);
