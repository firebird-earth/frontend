import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';

export const VALUE_AT_RISK = {
  name: 'valueAtRisk',
  label: 'Value at Risk',
  FIRESHEDS: {
    name: 'Firesheds',
    description: 'Fireshed boundaries',
    units: 'category',
    colorScheme: 'none'
  },
  STRUCTURE_BURN_FREQUENCY: {
    name: 'Structure Burn Frequency',
    description: 'Frequency of structure burning',
    units: 'fires/year',
    colorScheme: 'none'
  },
  STRUCTURE_BURN_HAZARD: {
    name: 'Structure Burn Hazard',
    description: 'Structure burn hazard levels',
    units: 'level',
    colorScheme: 'none'
  },
  STRUCTURE_BURN_INFLUENCE: {
    name: 'Structure Burn Influence',
    description: 'Structure burn influence zones',
    units: 'index',
    colorScheme: 'none'
  }
} as const;

// Layer category constant
export const VALUE_AT_RISK_CATEGORY: LayerCategory = createInitialCategory('valueAtRisk', 'Value At Risk', [
  { 
    name: VALUE_AT_RISK.FIRESHEDS.name, 
    type: LayerType.Vector 
  },
  { 
    name: VALUE_AT_RISK.STRUCTURE_BURN_FREQUENCY.name, 
    type: LayerType.Vector 
  },
  { 
    name: VALUE_AT_RISK.STRUCTURE_BURN_HAZARD.name, 
    type: LayerType.Vector 
  },
  { 
    name: VALUE_AT_RISK.STRUCTURE_BURN_INFLUENCE.name, 
    type: LayerType.Vector 
  }
]);