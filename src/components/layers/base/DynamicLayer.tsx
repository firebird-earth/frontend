import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { MapServiceConfig } from '../../../services/maps/types';

interface DynamicLayerProps {
  active: boolean;
  opacity?: number;
  serviceConfig: MapServiceConfig;
  renderingRule: string;
  className?: string;
  onError?: (error: Error) => void;
  onLayerCreate?: (layer: EsriLeaflet.ImageMapLayer) => void;
  categoryId: string;
  layerId: number;
}

const DynamicLayer: React.FC<DynamicLayerProps> = ({
  active,
  opacity = 1,
  serviceConfig,
  renderingRule,
  className = 'dynamic-layer',
  onError,
  onLayerCreate,
  categoryId,
  layerId
}) => {
  const map = useMap();
  const layerRef = useRef<EsriLeaflet.ImageMapLayer | null>(null);
  const opacityRef = useRef<number>(opacity);

  // Create or update layer
  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    try {
      // Parse the rendering rule if it's a string
      let parsedRule: any;
      try {
        parsedRule = typeof renderingRule === 'string' ? 
          JSON.parse(renderingRule) : renderingRule;
      } catch (e) {
        console.error('Failed to parse rendering rule:', e);
        parsedRule = renderingRule;
      }

      // Create new layer if it doesn't exist or if rendering rule changed
      if (!layerRef.current || layerRef.current.options.renderingRule !== parsedRule) {
        console.log('Creating new image layer:', {
          url: serviceConfig.serviceUrl,
          renderingRule: parsedRule
        });

        // Create the layer
        const layer = EsriLeaflet.imageMapLayer({
          url: serviceConfig.serviceUrl,
          opacity: opacity,
          useCors: false,
          renderingRule: parsedRule,
          format: 'png32',
          f: 'json',
          updateInterval: 300,
          updateWhenIdle: true,
          updateWhenZooming: false,
          maxZoom: 22,
          minZoom: 4,
          attribution: null
        });

        // Add error handling
        layer.on('error', (error: any) => {
          console.error('Layer error:', error);
          if (onError) {
            onError(new Error(`Failed to load layer: ${error.error?.message || 'Unknown error'}`));
          }
        });

        // Add to map
        layer.addTo(map);
        layerRef.current = layer;
        opacityRef.current = opacity;

        // Notify parent about layer creation
        if (onLayerCreate) {
          onLayerCreate(layer);
        }
      } else if (opacityRef.current !== opacity) {
        // Just update opacity if that's all that changed
        layerRef.current.setOpacity(opacity);
        opacityRef.current = opacity;
      }
    } catch (error) {
      console.error('Failed to create/update layer:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to create layer'));
      }
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, active, serviceConfig, renderingRule, opacity, onError, onLayerCreate]);

  return null;
};

export default DynamicLayer;