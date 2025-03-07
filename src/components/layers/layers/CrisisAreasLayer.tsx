import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { CRISIS_AREAS_LAYER } from '../../../constants/mapLayers';
import { useAppSelector } from '../../../hooks/useAppSelector';

interface CrisisAreasLayerProps {
  active: boolean;
}

const CrisisAreasLayer: React.FC<CrisisAreasLayerProps> = ({ active }) => {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);
  const opacityRef = useRef<number>(1.0); // Store the current opacity
  
  // Get the layer opacity from Redux store
  const opacity = useAppSelector(state => {
    const category = state.layers.categories.wildfire;
    if (!category) return 1.0; // Default opacity
    const layer = category.layers.find(l => l.name === 'Wildfire Crisis Areas');
    return layer?.opacity ?? 1.0; // Default to 1.0 if not specified
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
      // Create a feature layer for the Crisis Areas
      const layer = EsriLeaflet.featureLayer({
        url: CRISIS_AREAS_LAYER,
        simplifyFactor: 0.35,
        precision: 5,
        where: "1=1",
        style: function() {
          return {
            color: '#ef4444',
            weight: 1,
            fillColor: '#ef4444',
            fillOpacity: 0.25 * opacity, // Apply opacity to fillOpacity
            opacity: opacity // Apply opacity to stroke opacity
          };
        }
      });

      layer.addTo(map);
      layerRef.current = layer;
      opacityRef.current = opacity;

      // Handle errors
      layer.on('error', (error) => {
        console.warn('Error loading Crisis Areas:', error);
      });
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
    // For Esri layers, we need to recreate the layer when opacity changes
    // since there's no direct setOpacity method
    if (layerRef.current && opacityRef.current !== opacity) {
      // Remove the old layer
      map.removeLayer(layerRef.current);
      
      // Create a new layer with the updated opacity
      const layer = EsriLeaflet.featureLayer({
        url: CRISIS_AREAS_LAYER,
        simplifyFactor: 0.35,
        precision: 5,
        where: "1=1",
        style: function() {
          return {
            color: '#ef4444',
            weight: 1,
            fillColor: '#ef4444',
            fillOpacity: 0.25 * opacity,
            opacity: opacity
          };
        }
      });

      layer.addTo(map);
      layerRef.current = layer;
      opacityRef.current = opacity;
      
      // Handle errors
      layer.on('error', (error) => {
        console.warn('Error loading Crisis Areas:', error);
      });
    }
  }, [opacity, map]);

  return null;
};

export default CrisisAreasLayer;