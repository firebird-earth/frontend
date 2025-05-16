import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { navigateToLocation } from '../../utils/navigate';
import SelectAOIDialog from '../aoi/SelectAOIDialog';

const NavigationButtonsControl: React.FC = () => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const currentAOIRef = useRef(currentAOI);
  const [showDialog, setShowDialog] = React.useState(false);

  // keep the ref up to date
  useEffect(() => {
    currentAOIRef.current = currentAOI;
  }, [currentAOI]);

  useEffect(() => {
    if (!controlRef.current) {
      const NavigationControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: () => {
          const container = L.DomUtil.create('div', 'leaflet-bar');
          container.style.margin = '0';

          // stack buttons vertically with a 4px gap
          container.style.display = 'flex';
          container.style.flexDirection = 'column';
          container.style.gap = '2px';

          // Buffer Button
          const bufferButton = L.DomUtil.create('a', '', container);
          bufferButton.href = '#';
          bufferButton.title = 'Jump to analysis area';
          bufferButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="22" y1="12" x2="18" y2="12"/>
              <line x1="6" y1="12" x2="2" y2="12"/>
              <line x1="12" y1="6" x2="12" y2="2"/>
              <line x1="12" y1="22" x2="12" y2="18"/>
            </svg>
          `;

          // AOI Button
          const aoiButton = L.DomUtil.create('a', '', container);
          aoiButton.href = '#';
          aoiButton.title = 'Jump to location';
          aoiButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `;

          // Style both buttons
          [aoiButton, bufferButton].forEach(button => {
            button.style.width = '25px';
            button.style.height = '25px';
            button.style.lineHeight = '25px';
            button.style.textAlign = 'center';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            
            const svg = button.querySelector('svg');
            if (svg) {
              svg.style.width = '16px';
              svg.style.height = '16px';
            }
          });

          // Click handlers
          aoiButton.onclick = e => {
            e.preventDefault();
            handleNavigate(-0.5); // Tight zoom
          };
          bufferButton.onclick = e => {
            e.preventDefault();
            handleNavigate(8); // Wide zoom with buffer
          };

          return container;
        }
      });

      const control = new NavigationControl();
      map.addControl(control);
      controlRef.current = control;
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map]);

  const handleNavigate = (bufferRadius: number) => {
    const aoi = currentAOIRef.current;
    if (!aoi) {
      setShowDialog(true);
      return;
    }

    if ('boundary' in aoi) {
      navigateToLocation({
        id: parseInt(aoi.id),
        name: aoi.name,
        coordinates: aoi.location.coordinates,
        boundary: aoi.boundary
      }, bufferRadius);
    } else {
      navigateToLocation(aoi, bufferRadius);
    }
  };

  return showDialog ? <SelectAOIDialog onClose={() => setShowDialog(false)} /> : null;
};

export default NavigationButtonsControl;
