import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';

interface FeatureLayerProps {
  active: boolean;
  opacity?: number;
  url: string;
  style?: (feature?: any) => L.PathOptions;
  simplifyFactor?: number;
  precision?: number;
  where?: string;
  onError?: (error: Error) => void;
}

const FeatureLayer: React.FC<FeatureLayerProps> = ({
  active,
  opacity = 1,
  url,
  style,
  simplifyFactor = 0.35,
  precision = 5,
  where = "1=1",
  onError
}) => {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);
  const opacityRef = useRef<number>(opacity);

  // Create or remove the layer based on active state
  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    // Only create a new layer if one doesn't exist
    if (!layerRef.current) {
      const layer = EsriLeaflet.featureLayer({
        url,
        simplifyFactor,
        precision,
        where,
        style: style || (() => ({
          opacity,
          fillOpacity: opacity * 0.25
        }))
      });

      layer.addTo(map);
      layerRef.current = layer;
      opacityRef.current = opacity;

      // Handle errors
      layer.on('error', (error) => {
        console.warn('Error loading feature layer:', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to load layer'));
        }
      });
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map, url, simplifyFactor, precision, where, style]);

  // Separate effect to handle opacity changes
  useEffect(() => {
    // For Esri layers, we need to recreate the layer when opacity changes
    if (layerRef.current && opacityRef.current !== opacity) {
      map.removeLayer(layerRef.current);
      
      const layer = EsriLeaflet.featureLayer({
        url,
        simplifyFactor,
        precision,
        where,
        style: style || (() => ({
          opacity,
          fillOpacity: opacity * 0.25
        }))
      });

      layer.addTo(map);
      layerRef.current = layer;
      opacityRef.current = opacity;

      layer.on('error', (error) => {
        console.warn('Error loading feature layer:', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to load layer'));
        }
      });
    }
  }, [opacity, map, url, simplifyFactor, precision, where, style]);

  return null;
};

export default FeatureLayer;