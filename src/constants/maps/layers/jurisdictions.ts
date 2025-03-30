import { LayerMetadata } from '../types';
import { LayerType } from '../../../types/map';
import { LayerCategory } from '../../../store/slices/layers/types';
import { createInitialCategory } from '../../../store/slices/common/utils/utils';
import { STATES_LAYER, COUNTIES_LAYER, FEDERAL_LANDS_LAYER, USFS_LANDS_LAYER, USFWS_LANDS_LAYER } from '../../../constants/urls';

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
    description: 'County boundaries from US Census Bureau',
    units: 'category',
    source: COUNTIES_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
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
    description: 'Federal land boundaries',
    units: 'category',
    source: FEDERAL_LANDS_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
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
    description: 'National Forest System lands',
    units: 'category',
    source: USFS_LANDS_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
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
    description: 'USFWS managed lands',
    units: 'category',
    source: USFWS_LANDS_LAYER,
    colorScheme: 'none',
    type: LayerType.ArcGISFeatureService,
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
    description: 'BLM managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
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
    description: 'NPS managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
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
    description: 'BOR managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
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
    description: 'BIA managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
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
    description: 'State managed lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
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
    description: 'Privately owned lands',
    units: 'category',
    colorScheme: 'none',
    type: LayerType.Vector,
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
  { 
    name: JURISDICTIONS.STATES.name, 
    type: LayerType.ArcGISFeatureService, 
    source: JURISDICTIONS.STATES.source, 
    colorScheme: JURISDICTIONS.STATES.colorScheme 
  },
  { 
    name: JURISDICTIONS.COUNTIES.name, 
    type: LayerType.ArcGISFeatureService, 
    source: JURISDICTIONS.COUNTIES.source, 
    colorScheme: JURISDICTIONS.COUNTIES.colorScheme 
  },
  { 
    name: JURISDICTIONS.FEDERAL_LANDS.name, 
    type: LayerType.ArcGISFeatureService, 
    source: JURISDICTIONS.FEDERAL_LANDS.source, 
    colorScheme: JURISDICTIONS.FEDERAL_LANDS.colorScheme 
  },
  { 
    name: JURISDICTIONS.USFS.name, 
    type: LayerType.ArcGISFeatureService, 
    source: JURISDICTIONS.USFS.source, 
    colorScheme: JURISDICTIONS.USFS.colorScheme 
  },
  { 
    name: JURISDICTIONS.USFWS.name, 
    type: LayerType.ArcGISFeatureService, 
    source: JURISDICTIONS.USFWS.source, 
    colorScheme: JURISDICTIONS.USFWS.colorScheme 
  },
  { 
    name: JURISDICTIONS.BLM.name, 
    type: LayerType.Vector 
  },
  { 
    name: JURISDICTIONS.NPS.name, 
    type: LayerType.Vector 
  },
  { 
    name: JURISDICTIONS.BOR.name, 
    type: LayerType.Vector 
  },
  { 
    name: JURISDICTIONS.BIA.name, 
    type: LayerType.Vector 
  },
  { 
    name: JURISDICTIONS.STATE.name, 
    type: LayerType.Vector 
  },
  { 
    name: JURISDICTIONS.PRIVATE.name, 
    type: LayerType.Vector 
  }
]);
