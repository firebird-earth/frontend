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
  const boundaryCircleRef = useRef<L.Circle | null>(null);
  const centroidMarkerRef = useRef<L.Marker | null>(null);
  const opacityRef = useRef<number>(1.0);
  
  const opacity = 1.0;

  // Create or remove layers based on active state and center
  useEffect(() => {
    if (!active || !center) {
      [boundaryRef, bufferCircleRef, boundaryCircleRef, centroidMarkerRef].forEach(ref => {
        if (ref.current) {
          map.removeLayer(ref.current);
          ref.current = null;
        }
      });
      return;
    }

    // Clean up existing layers
    [boundaryRef, bufferCircleRef, boundaryCircleRef, centroidMarkerRef].forEach(ref => {
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
            fillOpacity: 0.1 * opacity,
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
      weight: 1,
      fillColor: '#2563eb',
      fillOpacity: 0.05 * opacity,
      opacity: 0.5 * opacity
    });

    bufferCircle.addTo(map);
    bufferCircleRef.current = bufferCircle;

    if (circleResult.boundaryCircle) {
      const boundaryCircle = L.circle(
        circleResult.boundaryCircle.center,
        {
          interactive: false,
          radius: circleResult.boundaryCircle.radius,
          color: '#ef4444',
          weight: 1,
          fillColor: '#ef4444',
          fillOpacity: 0.05 * opacity,
          opacity: 0.5 * opacity,
          dashArray: '5, 5'
        }
      );

      boundaryCircle.addTo(map);
      boundaryCircleRef.current = boundaryCircle;
      
      const centroidMarker = L.marker(circleResult.boundaryCircle.center, {
        icon: L.divIcon({
          className: 'centroid-marker',
          html: '<div style="width: 8px; height: 8px; background-color: red; border-radius: 50%; border: 1px solid white;"></div>',
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        }),
        interactive: false,
        opacity: opacity
      });
      
      centroidMarker.addTo(map);
      centroidMarkerRef.current = centroidMarker;
    }

    opacityRef.current = opacity;

    return () => {
      [boundaryRef, bufferCircleRef, boundaryCircleRef, centroidMarkerRef].forEach(ref => {
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
          fillOpacity: 0.1 * opacity
        });
      }
      
      if (bufferCircleRef.current) {
        bufferCircleRef.current.setStyle({
          opacity: 0.5 * opacity,
          fillOpacity: 0.05 * opacity
        });
      }
      
      if (boundaryCircleRef.current) {
        boundaryCircleRef.current.setStyle({
          opacity: 0.5 * opacity,
          fillOpacity: 0.05 * opacity
        });
      }
      
      if (centroidMarkerRef.current) {
        centroidMarkerRef.current.setOpacity(opacity);
      }
      
      opacityRef.current = opacity;
    }
  }, [opacity]);

  return null;
};

export default AOIBoundaryLayer;