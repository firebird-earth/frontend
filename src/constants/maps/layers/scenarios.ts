import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';
import { QueryExpression } from '../../../types/map'
import { MapPane } from '../../../types/map';
import { LayerType, MapLayer } from '../../../types/map';

export const scenarios: QueryExpression[] = [
  {
    name: 'Scenario A', 
    description: 'Areas with high burn probability',
    expression: `"Canopy Bulk Density" > 10`
  },
  {
    name: 'Scenario B',
    description: 'Areas with high canopy bulk density',
    expression: `mask("Canopy Bulk Density", "Canopy Bulk Density" > 25)`
  },
  {
    name: 'Scenario C',
    description: 'High risk areas',
    expression: `"Canopy Bulk Density" > 25 AND "Burn Probability" > 6`
  },
  {
    name: 'Scenario D',
    description: 'High risk areas',
    expression: `"Slope Steepness" < 45`
  },
  {
    name: 'Scenario E',
    description: 'High risk areas',
    expression: `"Slope Steepness" < 45 and distance_to("Federal Lands") < 0.25 miles`
  }
];

// Initialize scenario layers
const scenarioLayers = scenarios.map(scenario => ({
  name: scenario.name,
  type: LayerType.Raster,
  source: '',
  description: scenario.description,
  expression: scenario.expression,
  active: false,
  pane: MapPane.ScenariosPane
}));

// Layer category constant
export const SCENARIOS_CATEGORY: LayerCategory = createInitialCategory('scenarios', 'Scenarios', scenarioLayers);