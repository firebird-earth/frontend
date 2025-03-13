export interface FireMetricsState {
  categories: {
    landscapeRisk: {
      active: boolean;
      layers: {
        flameLengthActive: boolean;
        burnProbabilityActive: boolean;
        fireIntensityActive: boolean;
        suppressionDifficultyActive: boolean;
        transmissionIndexActive: boolean;
        transmissionInfluenceActive: boolean;
      };
    };
    fuels: {
      active: boolean;
      layers: {
        canopyBulkDensityActive: boolean;
        canopyCoverActive: boolean;
        canopyHeightActive: boolean;
        mortalityActive: boolean;
      };
    };
    valueAtRisk: {
      active: boolean;
      layers: {
        fireshedsActive: boolean;
        structureBurnFrequencyActive: boolean;
        structureBurnHazardActive: boolean;
        structureBurnInfluenceActive: boolean;
      };
    };
  };
}