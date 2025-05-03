import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { QueryExpression } from '../../types/map'
import { MapPane } from '../../types/map';
import { LayerType, MapLayer } from '../../types/map';
import { colorSchemes } from '../colors';

export const scenarios: QueryExpression[] = [
    {
      name: 'Scenario A', 
      description: 'Areas with high burn probability',
      expression: `"Canopy Bulk Density" > 10`,
      colorScheme: colorSchemes.binaryGreen,
      legend: {
        items: [
          {
            label: 'High Canopy Bulk Density',
            color: '#66bd63',
            weight: 1,
            fillColor: '#66bd63',
            fillOpacity: 1.0, 
          }
        ] 
      }
    },
    {
      name: 'High CBD',
      description: 'Areas with high canopy bulk density',
      expression: `mask("Canopy Bulk Density", "Canopy Bulk Density" > 10)`,
     },
    {
      name: 'Scenario C',
      description: 'High risk areas',
      expression: `"Canopy Bulk Density" > 10 AND "Burn Probability" > 6`,
      colorScheme: colorSchemes.binaryGreen,
      legend: {
        items: [
          {
            label: 'High CBD and Burn Probability',
            color: '#66bd63',
            weight: 1,
            fillColor: '#66bd63',
            fillOpacity: 1.0, 
          }
        ] 
      }
    },
    {
      name: 'Rx Burn Feasible',
      description: 'High risk areas',
      expression: `"Slope Steepness" < 25`,
      colorScheme: colorSchemes.binaryGreen,
      legend: {
        items: [
          {
            label: 'Rx Burn Feasible',
            color: '#66bd63',
            weight: 1,
            fillColor: '#66bd63',
            fillOpacity: 1.0, 
          }
        ] 
      }
    },
    {
      name: 'Scenario E',
      description: 'High risk areas',
      expression: `"Slope Steepness" < 45 and distance_to("Federal Lands") < 0.25 miles`,
      colorScheme: colorSchemes.binaryGreen,
      legend: {
        items: [
          {
            label: 'High Canopy Bulk Density',
            color: '#66bd63',
            weight: 1,
            fillColor: '#66bd63',
            fillOpacity: 1.0, 
          }
        ] 
      }
    }
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