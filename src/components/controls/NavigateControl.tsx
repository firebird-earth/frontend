import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { navigateToLocation } from '../../utils/map';
import SelectAOIDialog from '../aoi/SelectAOIDialog';

interface NavigateControlProps {
  position?: L.ControlPosition;
}

const NavigateControl: React.FC<NavigateControlProps> = ({ position = 'topright' }) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!controlRef.current) {
      const NavigateControl = L.Control.extend({
        options: {
          position
        },
        onAdd: () => {
          const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-navigate');
          
          const button = document.createElement('button');
          button.title = 'Navigate to AOI';
          
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `;

          button.addEventListener('click', () => {
            if (!currentAOI) {
              setShowDialog(true);
              return;
            }

            if ('location' in currentAOI) {
              // User AOI
              navigateToLocation({
                id: parseInt(currentAOI.id),
                name: currentAOI.name,
                coordinates: currentAOI.location.center
              });
            } else if ('coordinates' in currentAOI) {
              // Static location
              navigateToLocation(currentAOI);
            }
          });

          container.appendChild(button);
          return container;
        }
      });

      const navigateControl = new NavigateControl();
      map.addControl(navigateControl);
      controlRef.current = navigateControl;
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, position, currentAOI]);

  return (
    <>
      {showDialog && (
        <SelectAOIDialog onClose={() => setShowDialog(false)} />
      )}
    </>
  );
};

export default NavigateControl;