import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { buildServiceUrl } from '../../../services/maps';
import { MapServiceConfig } from '../../../services/maps/types';

interface DynamicLayerProps {
  active: boolean;
  opacity?: number;
  serviceConfig: MapServiceConfig;
  renderingRule: string;
  className?: string;
  onError?: (error: Error) => void;
}

const DynamicLayer: React.FC<DynamicLayerProps> = ({
  active,
  opacity = 1,
  serviceConfig,
  renderingRule,
  className = 'dynamic-layer',
  onError
}) => {
  const map = useMap();
  const layerRef = useRef<L.ImageOverlay | null>(null);
  const nextLayerRef = useRef<L.ImageOverlay | null>(null);
  const updateTimeoutRef = useRef<number | null>(null);
  const lastBoundsRef = useRef<string | null>(null);
  const loadingRef = useRef<boolean>(false);
  const opacityRef = useRef<number>(opacity);

  // Log layer lifecycle events
  useEffect(() => {
    console.log('DynamicLayer lifecycle event:', {
      renderingRule,
      active,
      opacity,
      hasExistingLayer: !!layerRef.current,
      hasNextLayer: !!nextLayerRef.current,
      timestamp: new Date().toISOString()
    });
  }, [active, opacity, renderingRule]);

  // Handle opacity changes separately
  useEffect(() => {
    if (layerRef.current && opacityRef.current !== opacity) {
      console.log('Updating layer opacity:', {
        renderingRule,
        from: opacityRef.current,
        to: opacity
      });
      
      layerRef.current.setOpacity(opacity);
      opacityRef.current = opacity;
    }
  }, [opacity, renderingRule]);

  useEffect(() => {
    if (!active) {
      console.log('Removing inactive layer:', {
        renderingRule,
        hadLayer: !!layerRef.current,
        hadNextLayer: !!nextLayerRef.current
      });

      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (nextLayerRef.current) {
        map.removeLayer(nextLayerRef.current);
        nextLayerRef.current = null;
      }
      return;
    }

    const updateLayer = async () => {
      if (loadingRef.current) {
        console.log('Layer update skipped - already loading:', renderingRule);
        return;
      }

      const bounds = map.getBounds();
      const paddedBounds = bounds.pad(0.1);

      const boundsString = `${paddedBounds.toBBoxString()}-${map.getSize().x}-${map.getSize().y}-${renderingRule}`;
      
      if (boundsString === lastBoundsRef.current) {
        console.log('Layer update skipped - bounds unchanged:', renderingRule);
        return;
      }
      
      console.log('Updating layer:', {
        renderingRule,
        bounds: boundsString,
        previousBounds: lastBoundsRef.current
      });

      lastBoundsRef.current = boundsString;

      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      try {
        loadingRef.current = true;
        const size = map.getSize();

        const config = {
          ...serviceConfig,
          defaultParams: {
            ...serviceConfig.defaultParams,
            renderingRule: JSON.stringify({
              rasterFunction: renderingRule
            })
          }
        };

        const url = buildServiceUrl(config, {
          bounds: paddedBounds,
          width: size.x,
          height: size.y,
          map
        });

        const exactBounds = L.latLngBounds(
          L.latLng(paddedBounds.getSouth(), paddedBounds.getWest()),
          L.latLng(paddedBounds.getNorth(), paddedBounds.getEast())
        );

        console.log('Creating new layer:', {
          renderingRule,
          url: url.substring(0, 100) + '...',
          bounds: exactBounds.toBBoxString()
        });

        const newLayer = L.imageOverlay(url, exactBounds, {
          opacity: opacity,
          interactive: false,
          className
        });

        newLayer.addTo(map);
        nextLayerRef.current = newLayer;

        if (layerRef.current) {
          console.log('Removing previous layer:', renderingRule);
          map.removeLayer(layerRef.current);
        }

        layerRef.current = nextLayerRef.current;
        nextLayerRef.current = null;

      } catch (error) {
        console.error('Error loading dynamic layer:', {
          renderingRule,
          error
        });
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to load layer'));
        }
      } finally {
        loadingRef.current = false;
      }
    };

    updateLayer();

    const handleMapChange = () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = window.setTimeout(updateLayer, 250);
    };

    map.on('moveend', handleMapChange);
    map.on('zoomend', handleMapChange);

    return () => {
      console.log('Cleaning up layer:', renderingRule);
      map.off('moveend', handleMapChange);
      map.off('zoomend', handleMapChange);
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (nextLayerRef.current) {
        map.removeLayer(nextLayerRef.current);
        nextLayerRef.current = null;
      }
    };
  }, [map, active, renderingRule, serviceConfig, className, onError, opacity]);

  return null;
};

export default DynamicLayer;