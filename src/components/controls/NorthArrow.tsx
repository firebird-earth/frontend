import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface NorthArrowProps {
  position?: L.ControlPosition;
}

const NorthArrow: React.FC<NorthArrowProps> = ({ position = 'bottomleft' }) => {
  const map = useMap();

  useEffect(() => {
    const NorthArrowControl = L.Control.extend({
      options: {
        position
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-north');
        
        // Create the arrow using SVG
        const arrowContainer = document.createElement('div');
        arrowContainer.className = 'text-gray-700';
        arrowContainer.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m5 12 7-7 7 7"/>
            <path d="M12 19V5"/>
          </svg>
        `;

        // Create the "N" label
        const label = document.createElement('div');
        label.className = 'text-[10px] font-medium text-gray-600 text-center mt-0.5';
        label.textContent = 'N';

        // Assemble the components
        container.appendChild(arrowContainer);
        container.appendChild(label);

        return container;
      }
    });

    const northArrow = new NorthArrowControl();
    map.addControl(northArrow);

    return () => {
      map.removeControl(northArrow);
    };
  }, [map, position]);

  return null;
};

export default NorthArrow;