import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { CRISIS_AREAS_LAYER } from '../../../constants/mapLayers';

interface CrisisAreasLayerProps {
  active: boolean;
}

const CrisisAreasLayer: React.FC<CrisisAreasLayerProps> = ({ active }) => {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

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
          fillOpacity: 0.25,
          opacity: 1
        };
      }
    });

    layer.addTo(map);
    layerRef.current = layer;

    // Handle errors
    layer.on('error', (error) => {
      console.warn('Error loading Crisis Areas:', error);
    });

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map]);

  return null;
};

export default CrisisAreasLayer