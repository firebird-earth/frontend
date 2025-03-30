import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';
import { WUI_LAYER, CRISIS_AREAS_LAYER } from '../../../constants/urls';

export const WILDFIRE = {
  WUI: {
    name: 'WUI',
    description: 'Wildland Urban Interface',
    units: 'category',
    source: WUI_LAYER,
    colorScheme: 'none',
    type: 'tileLayer',
    legend: {
      items: [
        { color: 'rgba(239, 68, 68, 0.7)', label: 'Interface - Housing density > 6.17 units/km²' },
        { color: 'rgba(249, 115, 22, 0.7)', label: 'Intermix - Housing density > 6.17 units/km² & Vegetation > 50%' },
        { color: 'rgba(234, 179, 8, 0.7)', label: 'Very Low Density - Housing density 0-6.17 units/km²' },
        { color: 'rgba(132, 204, 22, 0.7)', label: 'Vegetated - No housing & Vegetation > 50%' },
        { color: 'rgba(34, 197, 94, 0.7)', label: 'Non-Vegetated - No housing & Vegetation < 50%' },
        { color: 'rgba(16, 185, 129, 0.7)', label: 'Water' }
      ]
    }
  },
  CRISIS_AREAS: {
    name: 'Wildfire Crisis Areas',
    description: 'USFS Wildfire Crisis Strategy areas',
    units: 'category',
    source: CRISIS_AREAS_LAYER,
    colorScheme: 'none',
    type: 'ArcGIS_featureService',
    legend: {
      items: [
        {
          color: '#ef4444',
          weight: 1,
          fillColor: '#ef4444',
          fillOpacity: 0.25,
          label: 'Crisis Strategy Area'
        }
      ]
    }
  },
  PRIORITY_AREAS: {
    name: 'Priority Treatment Areas',
    description: 'Priority areas for wildfire treatment',
    units: 'category',
    colorScheme: 'none',
    type: 'vector'
  }
} as const;

// Layer category constant
export const WILDFIRE_CATEGORY: LayerCategory = createInitialCategory('wildfire', 'Wildfire', [
  { 
    name: WILDFIRE.WUI.name, 
    type: LayerType.TileLayer, 
    source: WUI_LAYER, 
    colorScheme: WILDFIRE.WUI.colorScheme 
  },
  { 
    name: WILDFIRE.CRISIS_AREAS.name, 
    type: LayerType.ArcGISFeatureService, 
    source: CRISIS_AREAS_LAYER, 
    colorScheme: WILDFIRE.CRISIS_AREAS.colorScheme 
  },
  { 
    name: WILDFIRE.PRIORITY_AREAS.name, 
    type: LayerType.Vector 
  }
]);