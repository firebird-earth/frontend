import { LayerType } from '../../types/map';
import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { STORAGE } from '../urls';
import { colorSchemes } from '../colors';

export const VALUE_AT_RISK = {
  name: 'structureRisk',
  label: 'Structure Risk',
  FIRESHEDS: {
    name: '24 Hour Fireshed',
    description: 'Fireshed boundaries',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute'
  },
  STRUCTURE_BURN_HAZARD: {
    name: 'Structure Burn Risk',
    description: 'Structure burn risk levels',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/structure_burn_risk.tif`,
    units: '% of Structures Burned',
    valueFormat: "{value:.0f}%",
    colorScheme: colorSchemes.brewerYellowToRed5,
  },
  STRUCTURE_BURN_FREQUENCY: {
    name: 'Structure Burn Exposure',
    description: 'Frequency of Structures Burned',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/structure_burn_exposure.tif`,
    units: '% of Fires that Burn Structures',
    valueFormat: "{value:.0f}%",
    valueFormatMin: "< {value:.0f}%",   
    colorScheme: colorSchemes.brewerYellowToRed5,
    //domain: [1, 0] // 1, noDataValue
  },
  STRUCTURE_BURN_INFLUENCE: {
    name: 'Structure Burn Influence',
    description: 'Structure burn influence zones',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/structure_burn_influence_3.tif`,
    units: 'Multiple of Average',
    valueFormat: "{value:.0f}x",
    colorScheme: colorSchemes.arcGISBlue4,
  },
} as const;

// Layer category constant
export const VALUE_AT_RISK_CATEGORY: LayerCategory = createInitialCategory('structureRisk', 'Structure Risk', [
  VALUE_AT_RISK.FIRESHEDS,
  VALUE_AT_RISK.STRUCTURE_BURN_HAZARD,
  VALUE_AT_RISK.STRUCTURE_BURN_FREQUENCY,
  VALUE_AT_RISK.STRUCTURE_BURN_INFLUENCE,
]);