import { LayerType } from '../../types/map';
import { LayerCategory } from '../../store/slices/layersSlice/types';
import { createInitialCategory } from '../../store/slices/layersSlice/utils/utils';
import { STATES_LAYER, COUNTIES_LAYER, FEDERAL_LANDS_LAYER, USFS_LANDS_LAYER, USFWS_LANDS_LAYER } from '../urls';

export const JURISDICTIONS = {
  STATES: {
    name: 'States',
    type: LayerType.ArcGISFeatureService,
    source: STATES_LAYER,
    description: 'State boundaries from US Census Bureau',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        { 
          label: 'State Boundary',
          color: '#374151',
          weight: 2,
          fillColor: 'none',
          fillOpacity: 0.1
        }
      ]
    }
  },
  COUNTIES: {
    name: 'Counties',
    type: LayerType.ArcGISFeatureService,
    source: COUNTIES_LAYER,
    description: 'County boundaries from US Census Bureau',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'County Boundary',
          color: '#374151',
          weight: 1,
          fillColor: 'none',
          fillOpacity: 0.1
        }
      ]
    }
  },
  FEDERAL_LANDS: {
    name: 'US Federal Lands',
    type: LayerType.ArcGISFeatureService,
    source: FEDERAL_LANDS_LAYER,
    description: 'Federal land boundaries',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'Federal Land',
          color: '#4B5563',
          weight: 1,
          fillColor: '#4B5563',
          fillOpacity: 0.1
        }
      ]
    }
  },
  USFS: {
    name: 'US Forest Service',
    type: LayerType.ArcGISFeatureService,
    source: USFS_LANDS_LAYER,
    description: 'National Forest System lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'National Forest System Land',
          color: '#166534',
          weight: 1,
          fillColor: '#166534',
          fillOpacity: 0.15
        }
      ]
    }
  },
  USFWS: {
    name: 'US Fish and Wildlife',
    type: LayerType.ArcGISFeatureService,
    source: USFWS_LANDS_LAYER,
    description: 'USFWS managed lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'Fish and Wildlife Service Land',
          color: '#0369a1',
          weight: 1,
          fillColor: '#0369a1',
          fillOpacity: 0.15
        }
      ]
    }
  },
  BLM: {
    name: 'Bureau of Land Management',
    type: LayerType.Vector,
    source: 'USFS Land Management',
    description: 'BLM managed lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'BLM Land',
          color: '#92400E',
          weight: 1,
          fillColor: '#92400E',
          fillOpacity: 0.15
        }
      ]
    }
  },
  NPS: {
    name: 'National Park Service',
    type: LayerType.Vector,
    source: 'USFS Land Management',
    description: 'NPS managed lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'National Park Service Land',
          color: '#064E3B',
          weight: 1,
          fillColor: '#064E3B',
          fillOpacity: 0.15
        }
      ]
    }
  },
  BOR: {
    name: 'Bureau of Reclamation',
    type: LayerType.Vector,
    source: 'USFS Land Management',
    description: 'BOR managed lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'Bureau of Reclamation Land',
          color: '#1E40AF',
          weight: 1,
          fillColor: '#1E40AF',
          fillOpacity: 0.15
        }
      ]
    }
  },
  BIA: {
    name: 'Bureau of Indian Affairs',
    type: LayerType.Vector,
    source: 'USFS Land Management',
    description: 'BIA managed lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'Bureau of Indian Affairs Land',
          color: '#7C2D12',
          weight: 1,
          fillColor: '#7C2D12',
          fillOpacity: 0.15
        }
      ]
    }
  },
  STATE: {
    name: 'State Owned',
    type: LayerType.Vector,
    source: 'USFS Land Management',
    description: 'State managed lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'State Managed Land',
          color: '#1F2937',
          weight: 1,
          fillColor: '#1F2937',
          fillOpacity: 0.15
        }
      ]
    }
  },
  PRIVATE: {
    name: 'Private Land',
    type: LayerType.Vector,
    source: 'USFS Land Management',
    description: 'Privately owned lands',
    units: 'category',
    colorScheme: 'none',
    legend: {
      items: [
        {
          label: 'Private Land',
          color: '#6B7280',
          weight: 1,
          fillColor: '#6B7280',
          fillOpacity: 0.15
        }
      ]
    }
  }
} as const;

// Layer category constant
export const JURISDICTIONS_CATEGORY: LayerCategory = createInitialCategory('jurisdictions', 'Jurisdictions', [
  JURISDICTIONS.STATES,
  JURISDICTIONS.COUNTIES,
  JURISDICTIONS.FEDERAL_LANDS,
  JURISDICTIONS.USFS,
  JURISDICTIONS.USFWS,
  JURISDICTIONS.BLM,
  JURISDICTIONS.NPS,
  JURISDICTIONS.BOR,
  JURISDICTIONS.BIA,
  JURISDICTIONS.STATE,
  JURISDICTIONS.PRIVATE
]);