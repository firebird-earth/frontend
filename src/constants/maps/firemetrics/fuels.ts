import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';
import { GEOTIFF_LAYERS } from '../../../constants/urls';
import { colorSchemes } from '../../../constants/colors';

export const FUELS = {
  name: 'Fules',
  CANOPY_BULK_DENSITY: {
    name: 'Canopy Bulk Density',
    description: 'Forest canopy bulk density',
    units: 'kg/m³',
    source: GEOTIFF_LAYERS.CANOPY_BULK_DENSITY,
    colorScheme: colorSchemes.greenYellowRed.name,
  },
  CANOPY_COVER: {
    name: 'Canopy Cover',
    description: 'Forest canopy cover percentage',
    units: 'percent',
    source: GEOTIFF_LAYERS.CANOPY_COVER,
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
    units: 'meters',
    source: GEOTIFF_LAYERS.CANOPY_HEIGHT,
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
    units: 'percent',
    source: 'USFS Forest Health Technology Enterprise Team',
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
  { 
    name: FUELS.CANOPY_BULK_DENSITY.name,
    type: LayerType.GeoTiff,
    source: FUELS.CANOPY_BULK_DENSITY.source,
    colorScheme: FUELS.CANOPY_BULK_DENSITY.colorScheme,
    domain: FUELS.CANOPY_BULK_DENSITY.domain,
    active: false,
    order: 30
  },
  {
    name: FUELS.CANOPY_COVER.name,
    type: LayerType.GeoTiff,
    source: FUELS.CANOPY_COVER.source,
    colorScheme: FUELS.CANOPY_COVER.colorScheme,
    domain: FUELS.CANOPY_COVER.domain,
    active: false,
    order: 40
  },
  {
    name: FUELS.CANOPY_HEIGHT.name,
    type: LayerType.GeoTiff,
    source: FUELS.CANOPY_HEIGHT.source,
    colorScheme: FUELS.CANOPY_HEIGHT.colorScheme,
    domain: FUELS.CANOPY_HEIGHT.domain,
    active: false,
    order: 50
  },
  {
    name: FUELS.MORTALITY.name,
    type: LayerType.Placeholder,
    source: '',
    colorScheme: FUELS.MORTALITY.colorScheme,
    domain: FUELS.MORTALITY.domain,
    active: false,
    order: 60
  }
]);
