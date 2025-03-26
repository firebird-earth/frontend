import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { STATES_LAYER, COUNTIES_LAYER, FEDERAL_LANDS_LAYER, USFS_LANDS_LAYER, USFWS_LANDS_LAYER } from '../../urls';

export const JURISDICTIONS = {
  STATES: {
    name: 'States',
    description: 'State boundaries from US Census Bureau',
    units: 'category',
    source: STATES_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
    legend: {
      items: [
        { 
          color: '#374151',
          weight: 2,
          fillColor: 'none',
          fillOpacity: 0.1,
          label: 'State Boundary'
        }
      ]
    }
  },
  COUNTIES: {
    name: 'Counties',
    description: 'County boundaries from US Census Bureau',
    units: 'category',
    source: COUNTIES_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
    legend: {
      items: [
        {
          color: '#374151',
          weight: 1,
          fillColor: 'none',
          fillOpacity: 0.1,
          label: 'County Boundary'
        }
      ]
    }
  },
  FEDERAL_LANDS: {
    name: 'US Federal Lands',
    description: 'Federal land boundaries',
    units: 'category',
    source: FEDERAL_LANDS_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
    legend: {
      items: [
        {
          color: '#4B5563',
          weight: 1,
          fillColor: '#4B5563',
          fillOpacity: 0.1,
          label: 'Federal Land'
        }
      ]
    }
  },
  USFS: {
    name: 'US Forest Service',
    description: 'National Forest System lands',
    units: 'category',
    source: USFS_LANDS_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
    legend: {
      items: [
        {
          color: '#166534',
          weight: 1,
          fillColor: '#166534',
          fillOpacity: 0.15,
          label: 'National Forest System Land'
        }
      ]
    }
  },
  USFWS: {
    name: 'US Fish and Wildlife',
    description: 'USFWS managed lands',
    units: 'category',
    source: USFWS_LANDS_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
    legend: {
      items: [
        {
          color: '#0369a1',
          weight: 1,
          fillColor: '#0369a1',
          fillOpacity: 0.15,
          label: 'Fish and Wildlife Service Land'
        }
      ]
    }
  },
  BLM: {
    name: 'Bureau of Land Management',
    description: 'BLM managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    legend: {
      items: [
        {
          color: '#92400E',
          weight: 1,
          fillColor: '#92400E',
          fillOpacity: 0.15,
          label: 'BLM Land'
        }
      ]
    }
  },
  NPS: {
    name: 'National Park Service',
    description: 'NPS managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    legend: {
      items: [
        {
          color: '#064E3B',
          weight: 1,
          fillColor: '#064E3B',
          fillOpacity: 0.15,
          label: 'National Park Service Land'
        }
      ]
    }
  },
  BOR: {
    name: 'Bureau of Reclamation',
    description: 'BOR managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    legend: {
      items: [
        {
          color: '#1E40AF',
          weight: 1,
          fillColor: '#1E40AF',
          fillOpacity: 0.15,
          label: 'Bureau of Reclamation Land'
        }
      ]
    }
  },
  BIA: {
    name: 'Bureau of Indian Affairs',
    description: 'BIA managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    legend: {
      items: [
        {
          color: '#7C2D12',
          weight: 1,
          fillColor: '#7C2D12',
          fillOpacity: 0.15,
          label: 'Bureau of Indian Affairs Land'
        }
      ]
    }
  },
  STATE: {
    name: 'State Owned',
    description: 'State managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    legend: {
      items: [
        {
          color: '#1F2937',
          weight: 1,
          fillColor: '#1F2937',
          fillOpacity: 0.15,
          label: 'State Managed Land'
        }
      ]
    }
  },
  PRIVATE: {
    name: 'Private Land',
    description: 'Privately owned lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
    legend: {
      items: [
        {
          color: '#6B7280',
          weight: 1,
          fillColor: '#6B7280',
          fillOpacity: 0.15,
          label: 'Private Land'
        }
      ]
    }
  }
} as const;