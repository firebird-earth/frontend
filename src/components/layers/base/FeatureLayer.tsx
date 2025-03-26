import React, { useEffect, useRef, useState, useCallback } from 'react';
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

interface LayerMetadata {
  name: string;
  description: string;
  copyrightText?: string;
  defaultSymbol?: any;
  drawingInfo?: any;
  geometryType: string;
  sourceDescription?: string;
  fields: Array<{
    name: string;
    type: string;
    alias: string;
  }>;
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
  const layerRef = useRef<EsriLeaflet.FeatureLayer | null>(null);
  const opacityRef = useRef(opacity);
  const styleRef = useRef(style);
  const pendingUpdateRef = useRef<number | null>(null);
  const visibleFeaturesRef = useRef<Set<string>>(new Set());

  // Create base style once
  const baseStyle = useCallback((feature?: any) => {
    const customStyle = styleRef.current?.(feature) || {
      color: '#374151',
      weight: 1,
      fillColor: '#374151',
      fillOpacity: 0.1,
      opacity: 1
    };

    return {
      ...customStyle,
      opacity: opacityRef.current,
      fillOpacity: (customStyle.fillOpacity || 0.1) * opacityRef.current
    };
  }, []);

  // Update opacity with debouncing, only for visible features
  useEffect(() => {
    if (!layerRef.current || opacityRef.current === opacity) return;

    opacityRef.current = opacity;

    if (pendingUpdateRef.current) {
      cancelAnimationFrame(pendingUpdateRef.current);
    }

    pendingUpdateRef.current = requestAnimationFrame(() => {
      if (layerRef.current) {
        const bounds = map.getBounds();
        
        layerRef.current.eachFeature((feature) => {
          // Only update features that intersect with the current viewport
          if (feature.getBounds().intersects(bounds)) {
            feature.setStyle(baseStyle(feature.feature));
          }
        });
      }
      pendingUpdateRef.current = null;
    });
  }, [opacity, baseStyle, map]);

  // Update style ref when style prop changes
  useEffect(() => {
    styleRef.current = style;
  }, [style]);

  // Create or remove layer
  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      visibleFeaturesRef.current.clear();
      return;
    }

    if (!layerRef.current) {
      console.log('Creating feature layer for URL:', url);
      
      const layer = new EsriLeaflet.FeatureLayer({
        url,
        simplifyFactor,
        precision,
        where,
        style: baseStyle,
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

      // Track visible features on viewport changes
      layer.on('load', () => {
        const bounds = map.getBounds();
        visibleFeaturesRef.current.clear();
        
        layer.eachFeature((feature) => {
          if (feature.getBounds().intersects(bounds)) {
            visibleFeaturesRef.current.add(feature.feature.id);
          }
        });
      });

      layer.on('error', (error) => {
        console.error('Feature layer error:', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to load layer'));
        }
      });

      layer.addTo(map);
      layerRef.current = layer;
      
      console.log('Feature layer created and added to map');
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (pendingUpdateRef.current) {
        cancelAnimationFrame(pendingUpdateRef.current);
      }
      visibleFeaturesRef.current.clear();
    };
  }, [active, map, url, simplifyFactor, precision, where, baseStyle]);

  return null;
};

export default React.memo(FeatureLayer);