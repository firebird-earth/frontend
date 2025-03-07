import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import { useAppSelector } from '../../hooks/useAppSelector';

// Register UTM projections for all zones
for (let zone = 1; zone <= 60; zone++) {
  proj4.defs(`EPSG:326${zone}`, `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`);
}

interface CoordinateControlProps {
  position?: L.ControlPosition;
}

// Helper function to convert decimal degrees to DMS format
function toDMS(degrees: number, direction: 'NS' | 'EW'): string {
  const absolute = Math.abs(degrees);
  const d = Math.floor(absolute);
  const m = Math.floor((absolute - d) * 60);
  const s = Math.round(((absolute - d) * 60 - m) * 60);
  
  const dir = direction === 'NS' 
    ? degrees >= 0 ? 'N' : 'S'
    : degrees >= 0 ? 'E' : 'W';

  return `${d}°${m}'${s}"${dir}`;
}

const CoordinateControl: React.FC<CoordinateControlProps> = ({ position = 'bottomleft' }) => {
  const map = useMap();
  const [coordinates, setCoordinates] = useState<string>('');
  const controlRef = useRef<L.Control | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const { coordinates: coordSettings } = useAppSelector(state => 
    state.settings.settings?.preferences.map || { coordinates: { show: false, format: 'latlon-dd' } }
  );

  // Create the control class
  const CustomControl = L.Control.extend({
    options: {
      position
    },
    onAdd: () => {
      const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-coordinates');
      containerRef.current = container;
      return container;
    }
  });

  // Effect for handling coordinate updates
  useEffect(() => {
    if (!coordSettings.show) {
      map.getContainer().classList.remove('coordinates-enabled');
      return;
    }

    map.getContainer().classList.add('coordinates-enabled');

    const updateCoordinates = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      let formattedCoords = '';

      switch (coordSettings.format) {
        case 'latlon-dd':
          formattedCoords = `${lat.toFixed(6)}°${lat >= 0 ? 'N' : 'S'}, ${lng.toFixed(6)}°${lng >= 0 ? 'E' : 'W'}`;
          break;

        case 'latlon-dms':
          formattedCoords = `${toDMS(lat, 'NS')}, ${toDMS(lng, 'EW')}`;
          break;

        case 'utm':
          const zone = Math.floor((lng + 180) / 6) + 1;
          const hemisphere = lat >= 0 ? 'N' : 'S';
          const [easting, northing] = proj4(`EPSG:326${zone}`, [lng, lat]);
          formattedCoords = `${zone}${hemisphere} ${Math.round(easting)}E ${Math.round(northing)}N`;
          break;
      }

      setCoordinates(formattedCoords);
    };

    map.on('mousemove', updateCoordinates);

    return () => {
      map.off('mousemove', updateCoordinates);
      map.getContainer().classList.remove('coordinates-enabled');
    };
  }, [map, coordSettings.show, coordSettings.format]);

  // Effect for managing the control
  useEffect(() => {
    if (!coordSettings.show) {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
      return;
    }

    if (!controlRef.current) {
      const control = new CustomControl();
      map.addControl(control);
      controlRef.current = control;
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, coordSettings.show]);

  // Effect for updating the container text
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.textContent = coordinates;
    }
  }, [coordinates]);

  return null;
};

export default CoordinateControl;