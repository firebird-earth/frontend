import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setCurrentAOI } from '../../store/slices/home/actions';
import { showAOIPanel } from '../../store/slices/uiSlice';
import SelectAOIDialog from '../aoi/SelectAOIDialog';

const LocationMarkers: React.FC = () => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const { current: currentAOI } = useAppSelector(state => state.home.aoi);
  const markerRef = useRef<L.Marker | null>(null);
  const [showDialog, setShowDialog] = useState(false);

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
        
        // Show dialog if no AOI is selected
        if (!currentAOI) {
          setShowDialog(true);
          return;
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

  return (
    <>
      {showDialog && (
        <SelectAOIDialog onClose={() => setShowDialog(false)} />
      )}
    </>
  );
};

export default LocationMarkers;