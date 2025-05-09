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
    units: 'Multiple of average',
    valueFormat: "{value:.0f} x",
    domain: [1, 0], // 1, noDataValue
    colorScheme: colorSchemes.brewerGreenToRed7,
  },
  FLAME_LENGTH: {
    name: 'Flame Length',
    description: 'Conditional flame length',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/flame_length.tif`,
    units: 'Feet',
    valueFormatMin: "{value:.0f} feet",
    valueFormatMax: "> {value:.0f} feet",
    domain: [1, 12], // Flame length range in feet
    colorScheme: colorSchemes.brewerGreenToRed4,
  },
  FIRE_INTENSITY: {
    name: 'Fire Intensity',
    description: 'Fire intensity levels',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute',
    units: 'level',
    colorScheme: 'none',
  },
  SUPPRESSION_DIFFICULTY: {
    name: 'Suppression Difficulty',
    description: 'Difficulty of fire suppression',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/suppression_difficulty.tif`,
    units: 'Supression Difficulty Index',
    valueFormat: "{value:.0f}",
    colorScheme: colorSchemes.brewerGreenToRed6,
  },
  EXPLOSIVE_FIRE_RISK: {
    name: 'Explosive Fire Risk',
    description: 'Explosive Fire Risk',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/explosive_fire_risk.tif`,
    units: 'Acres burned in 2 hours',
    valueFormatMin: "{value:.0f} acres",   
    valueFormatMax: "> {value:.0f} acres",
    domain: [1, 250], 
    colorScheme: colorSchemes.brewerGreenToRed7,
  },
  TRANSMISSION_INFLUENCE: {
    name: 'Transmission Influence',
    description: 'Fire transmission influence',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute',
    units: 'index',
    colorScheme: 'none',
  }
} as const;

// Layer category constant
export const LANDSCAPE_RISK_CATEGORY: LayerCategory = createInitialCategory('landscapeRisk', 'Landscape Risk', [
  LANDSCAPE_RISK.IGNITIONS,
  LANDSCAPE_RISK.SUPPRESSION_DIFFICULTY,
  LANDSCAPE_RISK.BURN_PROBABILITY,
  LANDSCAPE_RISK.FLAME_LENGTH,
  LANDSCAPE_RISK.FIRE_INTENSITY,
  LANDSCAPE_RISK.EXPLOSIVE_FIRE_RISK,
  LANDSCAPE_RISK.TRANSMISSION_INFLUENCE,
]);
