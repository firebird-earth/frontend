import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { calculateBufferCircle } from '../../../utils/geometry';
import { useAppSelector } from '../../../hooks/useAppSelector';

interface AOIBoundaryLayerProps {
  locationId: number;
  active: boolean;
  geojson: GeoJSON.FeatureCollection | null;
  center: [number, number]; // [lat, lng]
}

const AOIBoundaryLayer: React.FC<AOIBoundaryLayerProps> = ({ locationId, active, geojson, center }) => {
  const map = useMap();
  const boundaryRef = useRef<L.GeoJSON | null>(null);
  const bufferCircleRef = useRef<L.Circle | null>(null);
  const opacityRef = useRef<number>(1.0);
  
  const opacity = 1.0;

  // Create or remove layers based on active state and center
  useEffect(() => {
    if (!active || !center) {
      [boundaryRef, bufferCircleRef].forEach(ref => {
        if (ref.current) {
          map.removeLayer(ref.current);
          ref.current = null;
        }
      });
      return;
    }

    // Clean up existing layers
    [boundaryRef, bufferCircleRef].forEach(ref => {
      if (ref.current) {
        map.removeLayer(ref.current);
        ref.current = null;
      }
    });

    // Create boundary layer if geojson exists
    if (geojson) {
      try {
        const boundaryLayer = L.geoJSON(geojson, {
          interactive: false,
          style: {
            color: '#2563eb',
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0,
            opacity: opacity
          }
        });
        boundaryLayer.addTo(map);
        boundaryRef.current = boundaryLayer;
      } catch (error) {
        console.warn('Failed to create boundary layer:', error);
      }
    }

    // Calculate and create buffer circle
    const circleResult = calculateBufferCircle(center, geojson, 8);
    
    const bufferCircle = L.circle(circleResult.center, {
      interactive: false,
      radius: circleResult.radius,
      color: '#2563eb',
      weight: 2,
      fillColor: '#2563eb',
      fillOpacity: 0,
      opacity: opacity
    });

    bufferCircle.addTo(map);
    bufferCircleRef.current = bufferCircle;

    opacityRef.current = opacity;

    return () => {
      [boundaryRef, bufferCircleRef].forEach(ref => {
        if (ref.current) {
          map.removeLayer(ref.current);
          ref.current = null;
        }
      });
    };
  }, [active, geojson, center, map, opacity]);

  // Handle opacity changes
  useEffect(() => {
    if (opacityRef.current !== opacity) {
      if (boundaryRef.current) {
        boundaryRef.current.setStyle({
          opacity: opacity,
          fillOpacity: 0
        });
      }
      
      if (bufferCircleRef.current) {
        bufferCircleRef.current.setStyle({
          opacity: opacity,
          fillOpacity: 0
        });
      }
      
      opacityRef.current = opacity;
    }
  }, [opacity]);

  return null;
};

export default AOIBoundaryLayer;