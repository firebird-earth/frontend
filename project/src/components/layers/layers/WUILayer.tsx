import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { WUI_LAYER } from '../../../constants/mapLayers';

interface WUILayerProps {
  active: boolean;
}

const WUILayer: React.FC<WUILayerProps> = ({ active }) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const wuiLayer = L.tileLayer(WUI_LAYER, {
      attribution: 'USFS WUI 2020',
      maxZoom: 16,
      opacity: 0.7
    });

    map.addLayer(wuiLayer);
    layerRef.current = wuiLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map]);

  return null;
};

export default WUILayer