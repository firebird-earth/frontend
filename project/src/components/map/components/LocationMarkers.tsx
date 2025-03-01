import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setCurrentAOI } from '../../../store/slices/aoiSlice';
import { showAOIPanel } from '../../../store/slices/uiSlice';

const LocationMarkers: React.FC = () => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const { currentAOI } = useAppSelector(state => state.aoi);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Clean up existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Only show marker for current AOI
    if (currentAOI) {
      const markerOptions = {
        interactive: true,
        keyboard: false,
        title: '',
        alt: '',
        riseOnHover: true,
        bubblingMouseEvents: false
      };

      // Get coordinates based on AOI type
      let coords: [number, number];
      if ('location' in currentAOI) {
        // User AOI
        coords = currentAOI.location.center;
      } else {
        // Static location
        coords = currentAOI.coordinates;
      }

      const marker = L.marker(
        [coords[1], coords[0]],
        markerOptions
      );

      marker.on('click', () => {
        if (marker.getElement()) {
          marker.getElement()!.blur();
        }
        dispatch(setCurrentAOI(currentAOI));
        dispatch(showAOIPanel());
      });

      marker.addTo(map);
      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [currentAOI, map, dispatch]);

  return null;
};

export default LocationMarkers;