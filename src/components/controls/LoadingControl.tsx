import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

interface LoadingControlProps {
  position?: L.ControlPosition;
  message: string; // Required prop now
  show: boolean;
}

const LoadingControl: React.FC<LoadingControlProps> = ({ 
  position = 'topleft',
  message,
  show
}) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!controlRef.current) {
      const LoadingControl = L.Control.extend({
        options: {
          position
        },
        onAdd: () => {
          const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-loading');
          containerRef.current = container;
          
          // Style the container
          container.style.display = show ? 'flex' : 'none';
          container.style.background = 'rgba(255, 255, 255, 0.9)';
          container.style.padding = '7px 15px 7px 10px'; // Added 5px to right padding
          container.style.borderRadius = '4px';
          container.style.border = '2px solid rgba(0, 0, 0, 0.2)';
          container.style.fontSize = '13px';
          container.style.fontWeight = '500';
          container.style.color = '#374151';
          container.style.whiteSpace = 'nowrap';
          container.style.alignItems = 'center';
          container.style.gap = '12px'; 
          container.style.margin = '0';
          container.style.transform = 'scale(0.9)'; // Scale down the entire container
          container.style.transformOrigin = 'left top'; // Keep position aligned with other controls
          
          // Create spinner icon
          const spinner = document.createElement('div');
          spinner.innerHTML = `
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          `;
          
          // Create message element
          const text = document.createElement('span');
          text.textContent = message;
          text.style.transform = 'scale(1.11111)'; // Counter the container scale to keep text size the same (1/0.9)
          
          container.appendChild(spinner);
          container.appendChild(text);
          
          return container;
        }
      });

      const control = new LoadingControl();
      map.addControl(control);
      controlRef.current = control;
    }

    // Update visibility and message
    if (containerRef.current) {
      containerRef.current.style.display = show ? 'flex' : 'none';
      const textElement = containerRef.current.querySelector('span');
      if (textElement) {
        textElement.textContent = message;
      }
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, position, message, show]);

  return null;
};

export default LoadingControl;