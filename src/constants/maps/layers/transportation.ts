import { LayerMetadata } from '../types';

export const TRANSPORTATION = {
  STATE_ROADS: {
    name: 'State DOT Roads',
    description: 'State Department of Transportation roads',
    units: 'category',
    colorScheme: 'none'
  },
  COUNTY_ROADS: {
    name: 'County Roads',
    description: 'County maintained roads',
    units: 'category',
    colorScheme: 'none'
  },
  USFS_ROADS: {
    name: 'National Forest Service Roads',
    description: 'USFS maintained roads',
    units: 'category',
    colorScheme: 'none'
  }
} as const;