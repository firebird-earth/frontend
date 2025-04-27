import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/layers/utils/utils';
import { GEOTIFF_LAYERS } from '../../../constants/urls';
import { colorSchemes } from '../../../constants/colors';
import { STORAGE } from '../../../constants/urls';

export const FUELS = {
  name: 'fuels',
  label: 'Fuels',
  CANOPY_BULK_DENSITY: {
    name: 'Canopy Bulk Density',
    description: 'Forest canopy bulk density',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/cbd.tif`,
    units: 'kg/m³',
    colorScheme: colorSchemes.greenYellowRed.name
  },
  CANOPY_COVER: {
    name: 'Canopy Cover',
    description: 'Forest canopy cover percentage',
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/canopy_cover.tif`,
    units: 'percent',
    colorScheme: colorSchemes.canopyCover.name,
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
    type: LayerType.GeoTiff,
    source: `${STORAGE}/{aoi}/canopy_height.tif`,
    units: 'meters',
    colorScheme: colorSchemes.greenYellowRed.name,
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
    type: LayerType.GeoTiff,
    source: 'USFS Forest Health Technology Enterprise Team',
    units: 'percent',
    colorScheme: colorSchemes.greenYellowRed.name,
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