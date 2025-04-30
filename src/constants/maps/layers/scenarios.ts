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
      expression: `mask("Canopy Bulk Density", "Canopy Bulk Density" > 10)`
    },
    {
      name: 'Scenario C',
      description: 'High risk areas',
      expression: `"Canopy Bulk Density" > 10 AND "Burn Probability" > 6`
    },
    {
      name: 'Scenario D',
      description: 'High risk areas',
      expression: `"Slope Steepness" < 25`
    },
    {
      name: 'Scenario E',
      description: 'High risk areas',
      expression: `"Slope Steepness" < 45 and distance_to("Federal Lands") < 0.25 miles`
    }
  ];

  export const scenarioLegendBinary: Legend = {
    items: [
      {
        color: '#d73027',
        weight: 1,
        fillColor: '#d73027',
        fillOpacity: 1.0, 
        label: 'Viable Areas'
      }
    ]
  };

  // Initialize scenario layers
  export const scenarioLayers = scenarios.map(scenario => ({
    name: scenario.name,
    description: scenario.description,
    type: LayerType.Raster,
    source: '',
    expression: scenario.expression,
    active: false,
    pane: MapPane.FiremetricsPane
  }));

// Layer category constant
export const SCENARIOS_CATEGORY: LayerCategory = createInitialCategory('scenarios', 'Scenarios', scenarioLayers);