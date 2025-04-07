import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';
import { GEOTIFF_LAYERS } from '../../../constants/urls';
import { colorSchemes } from '../../../constants/colors';
import { STORAGE } from '../../../constants/urls';

export const FUELS = {
  name: 'fuels',
  label: 'Fules',
  CANOPY_BULK_DENSITY: {
    name: 'Canopy Bulk Density',
    description: 'Forest canopy bulk density',
    units: 'kg/m³',
    source: `${STORAGE}/TMV/cbd.tif`,
    colorScheme: colorSchemes.greenYellowRed.name,
    type: LayerType.GeoTiff,
  },
  CANOPY_COVER: {
    name: 'Canopy Cover',
    description: 'Forest canopy cover percentage',
    units: 'percent',
    source: `${STORAGE}/TMV/canopy_cover.tif`,
    colorScheme: colorSchemes.canopyCover.name,
    type: LayerType.GeoTiff,
    domain: [0, 100], // Canopy cover percentage range
    legend: {
      items: [
        { color: '#edf8e9', label: '0-20%' },
        { color: '#bae4b3', label: '20-40%' },
        { color: '#74c476', label: '40-60%' },
        { color: '#31a354', label: '60-80%' },
        { color: '#006d2c', label: '80-100%' }
      ]
    }
  },
  CANOPY_HEIGHT: {
    name: 'Canopy Height',
    description: 'Forest canopy height',
    units: 'meters',
    source: `${STORAGE}/TMV/canopy_height.tif`,
    colorScheme: colorSchemes.greenYellowRed.name,
    type: LayerType.GeoTiff,
    domain: [0, 50], // Canopy height range in meters
    legend: {
      items: [
        { color: '#1a9850', label: '0-10m' },
        { color: '#a6d96a', label: '10-20m' },
        { color: '#ffffbf', label: '20-30m' },
        { color: '#fdae61', label: '30-40m' },
        { color: '#d73027', label: '40-50m' }
      ]
    }
  },
  MORTALITY: {
    name: 'Mortality',
    description: 'Tree mortality risk',
    units: 'percent',
    source: 'USFS Forest Health Technology Enterprise Team',
    colorScheme: colorSchemes.greenYellowRed.name,
    type: LayerType.GeoTiff,
    domain: [0, 100], // Mortality percentage range
    legend: {
      items: [
        { color: '#1a9850', label: '0-20%' },
        { color: '#a6d96a', label: '20-40%' },
        { color: '#ffffbf', label: '40-60%' },
        { color: '#fdae61', label: '60-80%' },
        { color: '#d73027', label: '80-100%' }
      ]
    }
  }
} as const;

// Layer category constant
export const FUELS_CATEGORY: LayerCategory = createInitialCategory('fuels', 'Fuels', [
  FUELS.CANOPY_BULK_DENSITY,
  FUELS.CANOPY_COVER,
  FUELS.CANOPY_HEIGHT,
  FUELS.MORTALITY
]);