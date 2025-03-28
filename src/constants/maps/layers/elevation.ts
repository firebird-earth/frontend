import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { ELEVATION_SERVICE } from '../../../services/maps/services';

// Define rendering rules for each layer type

const ELEVATION_RULE = {
  "rasterFunction": "None",
  "rasterFunctionArguments": {
    "Raster": "$$"
  }
};

const SLOPE_RULE = {
  "rasterFunction": "Slope",
  "rasterFunctionArguments": {
    "Raster": "$$",
    "ZFactor": 1,
    "SlopeType": 0,
    "PixelSizeFactor": 1,
    "PixelSizePower": 1
  }
};

const HILLSHADE_RULE = {
  "rasterFunction": "Hillshade",
  "rasterFunctionArguments": {
    "Raster": "$$",
    "Azimuth": 315,
    "Altitude": 45,
    "ZFactor": 1
  }
};

const ASPECT_RULE = {
  "rasterFunction": "Aspect",
  "rasterFunctionArguments": {
    "Raster": "$$",
    "ZFactor": 1
  }
};

const CONTOUR_RULE = {
  "rasterFunction": "Contour",
  "rasterFunctionArguments": {
    "Raster": "$$",
    "ContourInterval": 100,
    "ShowContourLabels": true,
    "LabelDecimalPlaces": 0,
    "ContourStyle": "LINE",
    "LineWidth": 1,
    "LineColor": [100, 100, 100]
  }
};

export const ELEVATION = {
  ELEVATION: {
    name: 'Elevation',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'meters',
    colorScheme: 'none',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(ELEVATION_RULE)
  },
  SLOPE: {
    name: 'Slope Steepness',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'degrees',
    colorScheme: 'slopeGradient',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(SLOPE_RULE)
  },
  HILLSHADE: {
    name: 'Hillshade',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'category',
    colorScheme: 'none',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(HILLSHADE_RULE)
  },
  ASPECT: {
    name: 'Aspect',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'degrees',
    colorScheme: 'redBlue',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(ASPECT_RULE)
  },
  CONTOUR: {
    name: 'Contour',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'meters',
    colorScheme: 'none',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(CONTOUR_RULE)
  }
} as const;