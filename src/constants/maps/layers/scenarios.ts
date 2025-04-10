import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';

export const SCENARIOS = {
  name: 'scenarios',
  label: 'Scenarios',
  description: 'Scenario evaluation results',
  type: LayerType.GeoTiff,
  source: '',
  units: '',
  colorScheme: 'redYellowGreen'
} as const;

// Layer category constant
export const SCENARIOS_CATEGORY: LayerCategory = createInitialCategory('scenarios', 'Scenarios', []);