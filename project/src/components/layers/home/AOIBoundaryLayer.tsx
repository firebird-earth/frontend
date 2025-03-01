import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { calculateBufferCircle } from '../../../utils/geometryUtils';

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

  useEffect(() => {
    if (!active || !center) {
      // Clean up existing layers
      if (boundaryRef.current) {
        map.removeLayer(boundaryRef.current);
        boundaryRef.current = null;
      }
      if (bufferCircleRef.current) {
        map.removeLayer(bufferCircleRef.current);
        bufferCircleRef.current = null;
      }
      if (boundaryCircleRef.current) {
        map.removeLayer(boundaryCircleRef.current);
        boundaryCircleRef.current = null;
      }
      if (centroidMarkerRef.current) {
        map.removeLayer(centroidMarkerRef.current);
        centroidMarkerRef.current = null;
      }
      return;
    }

    // Clean up existing layers before creating new ones
    if (boundaryRef.current) {
      map.removeLayer(boundaryRef.current);
      boundaryRef.current = null;
    }
    if (bufferCircleRef.current) {
      map.removeLayer(bufferCircleRef.current);
      bufferCircleRef.current = null;
    }
    if (boundaryCircleRef.current) {
      map.removeLayer(boundaryCircleRef.current);
      boundaryCircleRef.current = null;
    }
    if (centroidMarkerRef.current) {
      map.removeLayer(centroidMarkerRef.current);
      centroidMarkerRef.current = null;
    }

    // Create boundary layer if geojson exists
    if (geojson) {
      try {
        const boundaryLayer = L.geoJSON(geojson, {
          interactive: false, // Make non-interactive
          style: {
            color: '#2563eb', // blue-600
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.1,
            opacity: 1
          }
        });
        boundaryLayer.addTo(map);
        boundaryRef.current = boundaryLayer;
      } catch (error) {
        console.warn('Failed to create boundary layer:', error);
      }
    }

    // Calculate and create buffer circle
    const circleResult = calculateBufferCircle(center, geojson, 8); // 8 mile buffer
    
    console.log('Buffer circle result:', circleResult);
    
    // Create the buffer circle (larger circle)
    const bufferCircle = L.circle(
      circleResult.center, // Already in [lat, lng] format
      {
        interactive: false, // Make non-interactive
        radius: circleResult.radius,
        color: '#2563eb',
        weight: 1,
        fillColor: '#2563eb',
        fillOpacity: 0.05,
        opacity: 0.5
      }
    );

    bufferCircle.addTo(map);
    bufferCircleRef.current = bufferCircle;

    // Create the boundary circle (smaller circle) if it exists
    if (circleResult.boundaryCircle) {
      const boundaryCircle = L.circle(
        circleResult.boundaryCircle.center,
        {
          interactive: false,
          radius: circleResult.boundaryCircle.radius,
          color: '#ef4444', // red-500
          weight: 1,
          fillColor: '#ef4444',
          fillOpacity: 0.05,
          opacity: 0.5,
          dashArray: '5, 5' // Dashed line
        }
      );

      boundaryCircle.addTo(map);
      boundaryCircleRef.current = boundaryCircle;
      
      // Add a marker at the center of the boundary circle for debugging
      const centroidMarker = L.marker(circleResult.boundaryCircle.center, {
        icon: L.divIcon({
          className: 'centroid-marker',
          html: '<div style="width: 8px; height: 8px; background-color: red; border-radius: 50%; border: 1px solid white;"></div>',
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        }),
        interactive: false
      });
      
      centroidMarker.addTo(map);
      centroidMarkerRef.current = centroidMarker;
    }

    return () => {
      if (boundaryRef.current) {
        map.removeLayer(boundaryRef.current);
        boundaryRef.current = null;
      }
      if (bufferCircleRef.current) {
        map.removeLayer(bufferCircleRef.current);
        bufferCircleRef.current = null;
      }
      if (boundaryCircleRef.current) {
        map.removeLayer(boundaryCircleRef.current);
        boundaryCircleRef.current = null;
      }
      if (centroidMarkerRef.current) {
        map.removeLayer(centroidMarkerRef.current);
        centroidMarkerRef.current = null;
      }
    };
  }, [active, geojson, center, map]);

  return null;
};

export default AOIBoundaryLayer;