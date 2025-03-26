import React from 'react';
import GeoTiffLayer from './GeoTiffLayer';
import GeoTiffLegend from './GeoTiffLegend';
import { LayerType } from '../../../types/map';

interface LayerConfig {
  name: string;
  description: string;
  source: string;
  type: LayerType;
  colorScheme: string;
  units: string;
}

export function createGeoTiffLayer(categoryId: string, config: LayerConfig) {
  const GeoTiffLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    return (
      <GeoTiffLayer
        active={active}
        url={config.source}
        categoryId={categoryId}
      />
    );
  };

  GeoTiffLayerInstance.Legend = () => (
    <GeoTiffLegend
      url={config.source}
      categoryId={categoryId}
      colorScheme={config.colorScheme}
      units={config.units}
    />
  );

  GeoTiffLayerInstance.displayName = `${config.name}Layer`;
  return GeoTiffLayerInstance;
}