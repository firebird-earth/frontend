import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  expression: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'scenario-a',
    name: 'Scenario A', 
    description: 'Areas with high burn probability',
    expression: `"Canopy Bulk Density" > 25`
  },
  {
    id: 'scenario-b',
    name: 'Scenario B',
    description: 'Areas with high canopy bulk density',
    expression: `mask("Canopy Bulk Density", "Canopy Bulk Density" > 25)`
  },
  {
    id: 'scenario-c',
    name: 'Scenario C',
    description: 'High risk areas',
    expression: `"Canopy Bulk Density" > 25 AND "Burn Probability" > 6`
  },
  {
    id: 'scenario-d',
    name: 'Scenario D',
    description: 'High risk areas',
    expression: `"Slope Steepness" < 45`
  }
];

// Layer category constant
export const SCENARIOS_CATEGORY: LayerCategory = createInitialCategory('scenarios', 'Scenarios', []);