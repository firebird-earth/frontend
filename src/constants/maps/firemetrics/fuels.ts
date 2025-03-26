import { LayerMetadata } from '../types';
import { GEOTIFF_LAYERS } from '../../urls';

export const FUELS = {
  CANOPY_COVER: {
    name: 'Canopy Cover',
    description: 'Forest canopy cover percentage',
    units: 'percent',
    source: 'LANDFIRE 2022',
    colorScheme: 'canopyCover'
  },
  CANOPY_HEIGHT: {
    name: 'Canopy Height',
    description: 'Forest canopy height',
    units: 'meters',
    source: 'LANDFIRE 2022',
    colorScheme: 'greenYellowRed'
  },
  CANOPY_BULK_DENSITY: {
    name: 'Canopy Bulk Density',
    description: 'Forest canopy bulk density',
    units: 'kg/m³',
    colorScheme: 'greenYellowRed',
    source: GEOTIFF_LAYERS.CANOPY_BULK_DENSITY
  },
  MORTALITY: {
    name: 'Mortality',
    description: 'Tree mortality risk',
    units: 'percent',
    source: 'USFS Forest Health Technology Enterprise Team',
    colorScheme: 'greenYellowRed'
  }
} as const;