import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { QueryExpression } from '../../types/map'
import { MapPane } from '../../types/map';
import { LayerType, MapLayer } from '../../types/map';
import { colorSchemes } from '../colors';

export const scenarios: QueryExpression[] = [
{
  name: 'Scenario A', 
  expression: `"Canopy Bulk Density" >= 10`,
},
{
  name: 'High CBD',
  expression: `mask("Canopy Bulk Density", "Canopy Bulk Density" >= 10)`,
 },
{
  name: 'Scenario B',
  expression: `"Canopy Bulk Density" >= 10 AND "Burn Probability" > 6`,
},
{
  name: 'Scenario C',
  expression: `mask("Canopy Bulk Density", "Canopy Bulk Density" >= 10 AND "Burn Probability" > 6)`,
},
{
  name: 'Rx Burn Feasible',
  expression: `"Slope Steepness" < 5`,
},
{
  name: 'Scenario D',
  expression: `mask("Canopy Bulk Density", "Slope Steepness" < 5)`,
},
{
  name: 'County Boundries',
  expression: `edge(Counties)`,
  colorScheme: colorSchemes.binaryGreen,
  legend: {
    items: [
      {
        label: 'County Boundary'
      }
    ] 
  }
},
{
  name: 'Distance to FedLand',
  expression: `distance_to("US Federal Lands")`,
  units: 'meters',
  valueFormat: "{value:.0f}",
  colorScheme: colorSchemes.brewerWhiteToBlue9,
},
{
  name: 'Close to FedLand',
  expression: `distance_to("US Federal Lands") >= .25 miles`,
}, 
{
  name: 'Thin Feasible',
  expression: `"Slope Steepness" < 25 AND distance_to("US Federal Lands") >= 0.25 miles`,
  //expression: `distance_to("US Federal Lands") >= 0.25 miles AND "Slope Steepness" < 25`,
  colorScheme: colorSchemes.binaryGreen,
  legend: {
    items: [
      {
        label: 'Thin Feasible'
      }
    ] 
  }
},
{
  name: 'Structure Burn Risk Reduction',
  expression: `mask("Structure Burn Risk", "Slope Steepness" < 25)`,
},
];

// Initialize scenario layers
export const scenarioLayers = scenarios.map(scenario => ({
  ...scenario,
  type: LayerType.Raster,
  source: '',
  active: false,
  pane: MapPane.FiremetricsPane
}));

console.log('scenarioLayers', scenarioLayers)

// Layer category constant
export const SCENARIOS_CATEGORY: LayerCategory = createInitialCategory('scenarios', 'Scenarios', scenarioLayers);