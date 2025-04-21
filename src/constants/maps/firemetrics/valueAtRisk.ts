import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';
import { STORAGE } from '../../../constants/urls';
import { colorSchemes } from '../../../constants/colors';

export const VALUE_AT_RISK = {
  name: 'valueAtRisk',
  label: 'Value at Risk',
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
    source: `${STORAGE}/TMV/structure_burn_risk.tif`,
    units: '% of Structures Burned',
    colorScheme: colorSchemes.greenYellowRed.name,
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
    units: 'fires/year',
    colorScheme: 'none',
    type: LayerType.Vector,
    source: 'USFS Fire Modeling Institute'
  },
} as const;

// Layer category constant
export const VALUE_AT_RISK_CATEGORY: LayerCategory = createInitialCategory('valueAtRisk', 'Value At Risk', [
  VALUE_AT_RISK.FIRESHEDS,
  VALUE_AT_RISK.STRUCTURE_BURN_HAZARD,
  VALUE_AT_RISK.STRUCTURE_BURN_INFLUENCE,
  VALUE_AT_RISK.STRUCTURE_BURN_FREQUENCY,
]);