import { LayerType } from '../../types/map';
import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { STORAGE } from '../urls';
import { colorSchemes } from '../colors';

export const VALUE_AT_RISK = {
  name: 'valueAtRisk',
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
    units: '% of structures burned',
    colorScheme: colorSchemes.greenYellowRed,
  },
  STRUCTURE_BURN_INFLUENCE: {
    name: 'Structure Burn Influence',
    description: 'Structure burn influence zones',
    units: 'index',
    colorScheme: 'none',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute'
  },
  STRUCTURE_BURN_FREQUENCY: {
    name: 'Structure Burn Exposure',
    description: 'Frequency of structures burning',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/structure_burn_exposure.tif`,
    units: '% of fires that burn structures',
    colorScheme: colorSchemes.greenYellowRed,
  },
} as const;

// Layer category constant
export const VALUE_AT_RISK_CATEGORY: LayerCategory = createInitialCategory('valueAtRisk', 'Value At Risk', [
  VALUE_AT_RISK.FIRESHEDS,
  VALUE_AT_RISK.STRUCTURE_BURN_HAZARD,
  VALUE_AT_RISK.STRUCTURE_BURN_FREQUENCY,
  VALUE_AT_RISK.STRUCTURE_BURN_INFLUENCE,
]);