import { LayerType } from '../../types/map';
import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { GEOTIFF_LAYERS } from '../urls';
import { colorSchemes } from '../colors';
import { STORAGE } from '../urls';

export const LANDSCAPE_RISK = {
  name: 'landscapeRisk',
  label: 'Landscape Risk',
  
  IGNITIONS: {
    name: 'Ignitions',
    description: 'Potential ignition points',
    type: LayerType.Ignitions,
    units: 'points',
    colorScheme: colorSchemes.binaryRed,
    legend: {
      items: [
        {
          color: '#ef4444',
          weight: 1,
          fillColor: '#ef4444', 
          fillOpacity: 1,
          label: 'Fire Ignitions (1.7 million)'
        }
      ]
    }
  },
  BURN_PROBABILITY: {
    name: 'Burn Probability',
    description: 'Annual burn probability',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/burn_probability.tif`,
    units: 'Probability',
    colorScheme: colorSchemes.burnProbability
  },
  FLAME_LENGTH: {
    name: 'Flame Length',
    description: 'Conditional flame length',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/flame_length.tif`,
    units: 'Feet',
    colorScheme: colorSchemes.fireIntensity,
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
    units: 'Index Value',
    colorScheme: 'none',
    domain: [0, 5] // Suppression difficulty index
  },
  TRANSMISSION_INDEX: {
    name: 'Explosive Fire Risk',
    description: 'Explosive Fire Risk',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/explosive_fire_risk.tif`,
    units: 'Acres burned in 2 hours',
    colorScheme: colorSchemes.greenYellowRed,
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
  LANDSCAPE_RISK.IGNITIONS,
  LANDSCAPE_RISK.SUPPRESSION_DIFFICULTY,
  LANDSCAPE_RISK.BURN_PROBABILITY,
  LANDSCAPE_RISK.FLAME_LENGTH,
  LANDSCAPE_RISK.FIRE_INTENSITY,
  LANDSCAPE_RISK.TRANSMISSION_INDEX,
  LANDSCAPE_RISK.TRANSMISSION_INFLUENCE,
]);
