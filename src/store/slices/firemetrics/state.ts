import { FireMetricsState } from './types';
import { createInitialCategory } from '../common/utils/utils';

export const initialState: FireMetricsState = {
  categories: {
    landscapeRisk: {
      active: false,
      layers: {
        flameLengthActive: false,
        burnProbabilityActive: false,
        fireIntensityActive: false,
        suppressionDifficultyActive: false,
        transmissionIndexActive: false,
        transmissionInfluenceActive: false
      }
    },
    fuels: {
      active: false,
      layers: {
        canopyBulkDensityActive: false,
        canopyCoverActive: false,
        canopyHeightActive: false,
        mortalityActive: false
      }
    },
    valueAtRisk: {
      active: false,
      layers: {
        fireshedsActive: false,
        structureBurnFrequencyActive: false,
        structureBurnHazardActive: false,
        structureBurnInfluenceActive: false
      }
    }
  }
};