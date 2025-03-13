import { FireMetricsState } from './types';
import { GEOTIFF_LAYERS } from '../../../constants/urls';

// Define createInitialCategory locally since it's specific to firemetrics state
const createInitialCategory = (active: boolean, layers: Record<string, boolean>) => ({
  active,
  layers
});

export const initialState: FireMetricsState = {
  categories: {
    landscapeRisk: createInitialCategory(false, {
      flameLengthActive: false,
      burnProbabilityActive: false,
      fireIntensityActive: false,
      suppressionDifficultyActive: false,
      transmissionIndexActive: false,
      transmissionInfluenceActive: false
    }),
    fuels: createInitialCategory(false, {
      canopyBulkDensityActive: false,
      canopyCoverActive: false,
      canopyHeightActive: false,
      mortalityActive: false
    }),
    valueAtRisk: createInitialCategory(false, {
      fireshedsActive: false,
      structureBurnFrequencyActive: false,
      structureBurnHazardActive: false,
      structureBurnInfluenceActive: false
    })
  }
};