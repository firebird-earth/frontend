import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';

const MapController = () => {
  const map = useMap();
  const { center, zoom } = useAppSelector(state => state.map);

  useEffect(() => {
    map.setView([center[1], center[0]], zoom, {
      animate: true,
      duration: 1
    });
  }, [map, center, zoom]);

  return null;
};

export default MapController;