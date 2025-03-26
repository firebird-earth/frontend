import { MapServiceConfig } from './types';

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