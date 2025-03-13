import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface TileLayerProps {
  active: boolean;
  opacity?: number;
  url: string;
  maxZoom?: number;
  attribution?: string;
  className?: string;
}

const TileLayer: React.FC<TileLayerProps> = ({
  active,
  opacity = 1,
  url,
  maxZoom = 22,
  attribution,
  className
}) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
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
      const layer = L.tileLayer(url, {
        attribution,
        maxZoom,
        opacity,
        className
      });

      map.addLayer(layer);
      layerRef.current = layer;
      opacityRef.current = opacity;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map, url, maxZoom, attribution, className]);

  // Separate effect to handle opacity changes
  useEffect(() => {
    if (layerRef.current && opacityRef.current !== opacity) {
      layerRef.current.setOpacity(opacity);
      opacityRef.current = opacity;
    }
  }, [opacity]);

  return null;
};

export default TileLayer;