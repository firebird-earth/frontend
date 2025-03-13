import { MapServiceConfig } from './types';

export const ELEVATION_SERVICE: MapServiceConfig = {
  baseUrl: 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage',
  defaultParams: {
    bboxSR: '3857',
    imageSR: '3857',
    format: 'png32',
    interpolation: 'RSP_BilinearInterpolation',
    f: 'image'
  }
};

export const SLOPE_SERVICE: MapServiceConfig = {
  baseUrl: 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage',
  defaultParams: {
    bboxSR: '3857',
    imageSR: '3857',
    format: 'png32',
    interpolation: 'RSP_BilinearInterpolation',
    renderingRule: JSON.stringify({
      rasterFunction: "Hillshade Gray"
    }),
    f: 'image'
  }
};

export const SLOPE_RENDERING_RULES = [
  { name: 'Hillshade Gray', rasterFunction: 'Hillshade Gray' },
  { name: 'Aspect Degrees', rasterFunction: 'Aspect Degrees' },
  { name: 'Slope Map', rasterFunction: 'Slope Map' },
  { name: 'Contour', rasterFunction: 'Contour' }
];