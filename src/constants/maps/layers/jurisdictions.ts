import { LayerMetadata } from '../types';

export const JURISDICTIONS = {
  USFS: {
    name: 'US Forest Service',
    description: 'National Forest System lands',
    units: 'category',
    colorScheme: 'none'
  },
  BLM: {
    name: 'Bureau of Land Management',
    description: 'BLM managed lands',
    units: 'category',
    colorScheme: 'none'
  },
  USFWS: {
    name: 'US Fish and Wildlife',
    description: 'USFWS managed lands',
    units: 'category',
    colorScheme: 'none'
  },
  NPS: {
    name: 'National Park Service',
    description: 'NPS managed lands',
    units: 'category',
    colorScheme: 'none'
  },
  BOR: {
    name: 'Bureau of Reclamation',
    description: 'BOR managed lands',
    units: 'category',
    colorScheme: 'none'
  },
  BIA: {
    name: 'Bureau of Indian Affairs',
    description: 'BIA managed lands',
    units: 'category',
    colorScheme: 'none'
  },
  STATE: {
    name: 'State Owned',
    description: 'State managed lands',
    units: 'category',
    colorScheme: 'none'
  },
  PRIVATE: {
    name: 'Private Land',
    description: 'Privately owned lands',
    units: 'category',
    colorScheme: 'none'
  }
} as const;