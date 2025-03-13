import React, { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { showAOIPanel, toggleLegend } from '../../store/slices/uiSlice';
import { setCoordinates, clearAOI } from '../../store/slices/home/actions';
import { clearActiveLocation } from '../../store/slices/mapSlice';
import { clearActiveLayers } from '../../store/slices/layersSlice';

const MapClickHandler: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isCreatingAOI } = useAppSelector(state => state.ui);
  const { coordinates } = useAppSelector(state => state.home.aoi);
  const markerRef = useRef<L.Marker | null>(null);
  
  const map = useMapEvents({
    click(e) {
      if (!isCreatingAOI) return;

      // Clear any existing AOI and active location
      dispatch(clearAOI());
      dispatch(clearActiveLocation());
      
      // Clear all active layers to prevent GeoTIFF loading errors
      dispatch(clearActiveLayers());
      
      // Close the legend panel if it's open
      dispatch(toggleLegend(false));

      const coords: [number, number] = [e.latlng.lng, e.latlng.lat];
      
      // Remove existing marker if any
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      // Create new marker
      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], {
        interactive: false
      }).addTo(map);

      dispatch(setCoordinates(coords));
      dispatch(showAOIPanel());
    }
  });

  // Handle marker creation/removal based on coordinates and isCreatingAOI state
  useEffect(() => {
    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Create new marker if we have coordinates and are creating AOI
    if (isCreatingAOI && coordinates) {
      markerRef.current = L.marker(
        [coordinates[1], coordinates[0]],
        { interactive: false }
      ).addTo(map);
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [coordinates, isCreatingAOI, map]);

  return null;
};

export default MapClickHandler;