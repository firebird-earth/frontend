import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';
import { ELEVATION_SERVICE } from '../../../services/maps/services';
import { colorSchemes } from '../../../constants/colors';

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
    colorScheme: colorSchemes.greenYellowRed.name,
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(ELEVATION_RULE),
    domain: [0, 4000] // Elevation range in meters
  },
  SLOPE: {
    name: 'Slope Steepness',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'degrees',
    colorScheme: colorSchemes.slopeGradient.name,
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(SLOPE_RULE),
    domain: [0, 45] // Slope range in degrees
  },
  HILLSHADE: {
    name: 'Hillshade',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'category',
    colorScheme: '',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(HILLSHADE_RULE),
    domain: [0, 255] // Hillshade intensity range
  },
  ASPECT: {
    name: 'Aspect',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'degrees',
    colorScheme: colorSchemes.redBlue.name,
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(ASPECT_RULE),
    domain: [0, 360] // Aspect range in degrees
  },
  CONTOUR: {
    name: 'Contour',
    description: 'USGS 3DEP Elevation',
    source: ELEVATION_SERVICE.baseUrl,
    units: 'meters',
    colorScheme: '',
    type: LayerType.ArcGISImageService,
    renderingRule: JSON.stringify(CONTOUR_RULE),
    domain: [0, 4000] // Contour range in meters
  }
} as const;

// Layer category constant
export const ELEVATION_CATEGORY: LayerCategory = createInitialCategory('elevation', 'Elevation', [
  { 
    name: ELEVATION.ELEVATION.name, 
    type: LayerType.ArcGISImageService, 
    source: ELEVATION.ELEVATION.source, 
    renderingRule: ELEVATION.ELEVATION.renderingRule, 
    colorScheme: ELEVATION.ELEVATION.colorScheme, 
    order: 1 
  },
  { 
    name: ELEVATION.SLOPE.name, 
    type: LayerType.ArcGISImageService, 
    source: ELEVATION.SLOPE.source, 
    renderingRule: ELEVATION.SLOPE.renderingRule, 
    colorScheme: ELEVATION.SLOPE.colorScheme, 
    order: 2 
  },
  { 
    name: ELEVATION.ASPECT.name, 
    type: LayerType.ArcGISImageService, 
    source: ELEVATION.ASPECT.source, 
    renderingRule: ELEVATION.ASPECT.renderingRule, 
    colorScheme: ELEVATION.ASPECT.colorScheme, 
    order: 3 
  },
  { 
    name: ELEVATION.HILLSHADE.name, 
    type: LayerType.ArcGISImageService, 
    source: ELEVATION.HILLSHADE.source, 
    renderingRule: ELEVATION.HILLSHADE.renderingRule, 
    colorScheme: ELEVATION.HILLSHADE.colorScheme, 
    order: 4 
  },
  { 
    name: ELEVATION.CONTOUR.name, 
    type: LayerType.ArcGISImageService, 
    source: ELEVATION.CONTOUR.source, 
    renderingRule: ELEVATION.CONTOUR.renderingRule, 
    colorScheme: ELEVATION.CONTOUR.colorScheme, 
    order: 5 
  }
]);
