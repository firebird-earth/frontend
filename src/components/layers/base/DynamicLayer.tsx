import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { MapServiceConfig, MapServiceOptions, MapServiceParams } from '../../../services/maps/types';

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
  layer?: any; // Layer from Redux store
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
  layerId,
  layer
}) => {
  const map = useMap();
  const layerRef = useRef<EsriLeaflet.ImageMapLayer | null>(null);
  const opacityRef = useRef<number>(opacity);

  // Create or update layer
  useEffect(() => {
    if (!active) {
      console.log(`[DynamicLayer] Removing layer ${categoryId}-${layerId}`);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    try {
      // Parse the rendering rule if it's a non-empty string
      let parsedRule: any = {};
      if (renderingRule && renderingRule.trim()) {
        try {
          parsedRule = typeof renderingRule === 'string' ? 
            JSON.parse(renderingRule) : renderingRule;
        } catch (e) {
          console.error('Failed to parse rendering rule:', e);
        }
      }

      // Create new layer if it doesn't exist or if rendering rule changed
      if (!layerRef.current || JSON.stringify(layerRef.current.options.renderingRule) !== JSON.stringify(parsedRule)) {
        console.log(`[DynamicLayer] Creating/updating layer ${categoryId}-${layerId}:`, {
          url: serviceConfig.serviceUrl,
          renderingRule: parsedRule,
          order: layer?.order,
          opacity
        });

        // Create the layer
        const newLayer = EsriLeaflet.imageMapLayer({
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
          attribution: null,
          // Set z-index based on layer order
          pane: 'overlayPane',
          zIndex: layer?.order || 0
        });

        // Add error handling
        newLayer.on('error', (error: any) => {
          console.error('Layer error:', error);
          if (onError) {
            onError(new Error(`Failed to load layer: ${error.error?.message || 'Unknown error'}`));
          }
        });

        // Add to map
        newLayer.addTo(map);
        
        // Store reference and update opacity ref
        layerRef.current = newLayer;
        opacityRef.current = opacity;

        // Notify parent about layer creation
        if (onLayerCreate) {
          onLayerCreate(newLayer);
        }

        console.log(`[DynamicLayer] Layer ${categoryId}-${layerId} created with z-index:`, layer?.order);
      } else if (opacityRef.current !== opacity) {
        // Just update opacity if that's all that changed
        console.log(`[DynamicLayer] Updating opacity for ${categoryId}-${layerId}:`, opacity);
        layerRef.current.setOpacity(opacity);
        opacityRef.current = opacity;
      }

      // Update z-index when layer order changes
      if (layerRef.current && layer?.order !== undefined) {
        console.log(`[DynamicLayer] Updating z-index for ${categoryId}-${layerId}:`, layer.order);
        
        // Get the layer container
        const container = layerRef.current.getContainer();
        if (container) {
          // Set z-index on the container element
          container.style.zIndex = String(layer.order);
          console.log(`[DynamicLayer] Z-index updated for ${categoryId}-${layerId}:`, {
            order: layer.order,
            actualZIndex: container.style.zIndex
          });
        }
      }
    } catch (error) {
      console.error('Failed to create/update layer:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to create layer'));
      }
    }

    return () => {
      if (layerRef.current) {
        console.log(`[DynamicLayer] Cleaning up layer ${categoryId}-${layerId}`);
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [
    map,
    active,
    serviceConfig,
    renderingRule,
    opacity,
    onError,
    onLayerCreate,
    categoryId,
    layerId,
    layer?.order // Add layer.order as dependency
  ]);

  return null;
};

export default DynamicLayer;