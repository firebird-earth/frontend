import { GeoTiffMetadata } from '../../types/geotiff';
import { MapServiceConfig } from '../maps/types';

export interface ArcTiffCache {
  arrayBuffer?: ArrayBuffer;
  metadata?: GeoTiffMetadata;
}

export interface ArcTiffServiceConfig {
  debug: boolean;
}

export interface ArcTiffExportParams {
  bbox: string;
  bboxSR: string;
  size: string;
  imageSR: string;
  format: string;
  pixelType: string;
  noData: string;
  compression: string;
  bandIds: string;
  mosaicRule: string;
  renderingRule: string;
  interpolation: string;
  f: string;
}