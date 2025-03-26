import { LayerMetadata } from '../types';
import { WUI_LAYER, CRISIS_AREAS_LAYER } from '../../urls';

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
  }
} as const;