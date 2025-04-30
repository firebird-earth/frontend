import { LayerType } from '../../types/map';
import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { MapServiceConfig } from '../../services/maps/types';
import { colorSchemes } from '../colors';

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

export const ELEVATION_SERVICE: MapServiceConfig = {
  baseUrl: 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage',
  serviceUrl: 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer',
  defaultParams: {
    bboxSR: '3857',
    imageSR: '3857',
    format: 'png32',
    interpolation: 'RSP_BilinearInterpolation',
    f: 'image'
  }
};

export const ELEVATION = {
  ELEVATION: {
    name: 'Elevation',
    type: LayerType.ArcGISImageService,
    source: ELEVATION_SERVICE.serviceUrl,
    renderingRule: JSON.stringify(ELEVATION_RULE),
    description: 'USGS 3DEP Elevation',
    units: 'meters',
    colorScheme: colorSchemes.greenYellowRed.name,
    domain: [0, 4000], // Elevation range in meters
  },
  SLOPE: {
    name: 'Slope Steepness',
    type: LayerType.ArcGISImageService,
    source: ELEVATION_SERVICE.serviceUrl,
    renderingRule: JSON.stringify(SLOPE_RULE),
    description: 'USGS 3DEP Elevation',
    units: 'degrees',
    colorScheme: colorSchemes.slopeGradient.name,
    domain: [0, 45], // Slope range in degrees
  },
  HILLSHADE: {
    name: 'Hillshade',
    type: LayerType.ArcGISImageService,
    source: ELEVATION_SERVICE.serviceUrl,
    renderingRule: JSON.stringify(HILLSHADE_RULE),
    description: 'USGS 3DEP Elevation',
    units: 'category',
    colorScheme: '',
    domain: [0, 255], // Hillshade intensity range
  },
  ASPECT: {
    name: 'Aspect',
    type: LayerType.ArcGISImageService,
    source: ELEVATION_SERVICE.serviceUrl,
    renderingRule: JSON.stringify(ASPECT_RULE),
    description: 'USGS 3DEP Elevation',
    units: 'degrees',
    colorScheme: colorSchemes.redBlue.name,
    domain: [0, 360], // Aspect range in degrees
  },
  CONTOUR: {
    name: 'Contour',
    type: LayerType.ArcGISImageService,
    source: ELEVATION_SERVICE.serviceUrl,
    renderingRule: JSON.stringify(CONTOUR_RULE),
    description: 'USGS 3DEP Elevation',
    units: 'meters',
    colorScheme: '',
    domain: [0, 4000], // Contour range in meters
  }
} as const;

// Layer category constant
export const ELEVATION_CATEGORY: LayerCategory = createInitialCategory('elevation', 'Elevation', [
  ELEVATION.ELEVATION,
  ELEVATION.SLOPE,
  ELEVATION.ASPECT,
  ELEVATION.HILLSHADE,
  ELEVATION.CONTOUR
]);