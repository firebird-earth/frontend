import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { navigateToLocation } from '../../utils/map';
import { locations } from '../../constants/locations';

const NavigateControl = () => {
  const map = useMap();
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!controlRef.current) {
      const NavigateControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: () => {
          const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-navigate');
          
          const button = document.createElement('button');
          button.title = 'Navigate to AOI';
          
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8"/>
              <path d="M8 12h8"/>
            </svg>
          `;

          button.addEventListener('click', () => {
            if (currentAOI) {
              if ('location' in currentAOI) {
                // User AOI
                navigateToLocation({
                  id: parseInt(currentAOI.id),
                  name: currentAOI.name,
                  coordinates: currentAOI.location.center
                });
              } else {
                // Static location
                navigateToLocation(currentAOI);
              }
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
  }, [map, currentAOI]);

  return null;
};

export default NavigateControl;