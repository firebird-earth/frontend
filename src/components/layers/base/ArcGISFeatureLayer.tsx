import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { LayerType } from '../../../types/map';
import { useAppSelector } from '../../../hooks/useAppSelector';

interface LayerConfig {
  name: string;
  description: string;
  source: string;
  type: LayerType;
  legend?: {
    items: Array<{
      color: string;
      weight: number;
      fillColor: string;
      fillOpacity: number;
      label: string;
    }>;
  };
}

interface FeatureLayerProps {
  active: boolean;
  opacity?: number;
  url: string;
  style?: L.PathOptions;
  simplifyFactor?: number;
  precision?: number;
  where?: string;
  onError?: (error: Error) => void;
}

export function createFeatureLayer(categoryId: string, config: LayerConfig) {
  
  // Get the style from the first legend item if it exists
  const baseStyle = config.legend?.items[0] || {
    color: '#374151',
    weight: 1,
    fillColor: '#374151',
    fillOpacity: 0.1
  };

  const FeatureLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    // Get opacity from Redux store
    const opacity = useAppSelector(state => {
      const category = state.layers.categories[categoryId];
      if (!category) return 1.0;
      const layer = category.layers.find(l => l.name === config.name);
      return layer?.opacity ?? 1.0;
    });

    return (
      <FeatureLayer
        active={active}
        opacity={opacity}
        url={config.source}
        style={baseStyle}
      />
    );
  };

  FeatureLayerInstance.displayName = `${config.name}Layer`;
  return FeatureLayerInstance;
}

const FeatureLayer: React.FC<FeatureLayerProps> = ({
  active,
  opacity = 1,
  url,
  style = {
    color: '#374151',
    weight: 1,
    fillColor: '#374151',
    fillOpacity: 0.1,
    opacity: 1
  },
  simplifyFactor = 0.35,
  precision = 5,
  where = "1=1",
  onError
}) => {
  const map = useMap();
  const layerRef = useRef<EsriLeaflet.FeatureLayer | null>(null);
  const opacityRef = useRef<number>(opacity);
  const baseStyleRef = useRef(style);

  // Helper to combine base style with opacity
  const getStyleWithOpacity = (baseStyle: L.PathOptions, opacity: number): L.PathOptions => ({
    ...baseStyle,
    opacity: opacity,
    fillOpacity: (baseStyle.fillOpacity || 0.1) * opacity
  });

  // Update opacity when it changes
  useEffect(() => {
    if (!layerRef.current || opacityRef.current === opacity) return;
    
    opacityRef.current = opacity;
    
    layerRef.current.setStyle(getStyleWithOpacity(baseStyleRef.current, opacity));
  }, [opacity]);

  // Create or remove layer
  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    if (!layerRef.current) {
      // Store the base style
      baseStyleRef.current = style;

      const layer = new EsriLeaflet.FeatureLayer({
        url,
        simplifyFactor,
        precision,
        where,
        style: getStyleWithOpacity(style, opacity),
        minZoom: 4,
        maxZoom: 16,
        timeFilter: false,
        cacheLayers: true,
        fields: ['OBJECTID'],
        fetchAllFeatures: false,
        maxFeatures: 2000,
        ignoreRenderer: true,
        tolerance: 5,
        deduplicate: true,
        snapToZoom: true,
        interactive: false,
        bubblingMouseEvents: false,
        pane: 'overlayPane',
        attribution: null
      });

      layer.on('error', (error) => {
        console.error('Feature layer error:', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to load layer'));
        }
      });

      layer.addTo(map);
      layerRef.current = layer;
      opacityRef.current = opacity;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map, url, simplifyFactor, precision, where, style]);

  return null;
};

export default FeatureLayer;