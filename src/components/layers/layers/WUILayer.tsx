import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { WUI_LAYER } from '../../../constants/mapLayers';
import { useAppSelector } from '../../../hooks/useAppSelector';

interface WUILayerProps {
  active: boolean;
}

const WUILayer: React.FC<WUILayerProps> = ({ active }) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const opacityRef = useRef<number>(0.7); // Store the current opacity
  
  // Get the layer opacity from Redux store
  const opacity = useAppSelector(state => {
    const category = state.layers.categories.wildfire;
    if (!category) return 0.7; // Default opacity
    const layer = category.layers.find(l => l.name === 'WUI');
    return layer?.opacity ?? 0.7; // Default to 0.7 if not specified
  });

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
      const wuiLayer = L.tileLayer(WUI_LAYER, {
        attribution: 'USFS WUI 2020',
        maxZoom: 16,
        opacity: opacity
      });

      map.addLayer(wuiLayer);
      layerRef.current = wuiLayer;
      opacityRef.current = opacity;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map]);

  // Separate effect to handle opacity changes
  useEffect(() => {
    // Only update opacity if the layer exists and opacity has changed
    if (layerRef.current && opacityRef.current !== opacity) {
      layerRef.current.setOpacity(opacity);
      opacityRef.current = opacity;
    }
  }, [opacity]);

  return null;
};

export default WUILayer;