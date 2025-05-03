import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { calculateBufferCircle } from '../../utils/geometry';

interface AOIBoundaryLayerProps {
  locationId: number;
  active: boolean;
  geojson: GeoJSON.FeatureCollection | null;
  center: [number, number]; // [lat, lng]
  showBufferBounds?: boolean;
}

const AOIBoundaryLayer: React.FC<AOIBoundaryLayerProps> = ({
  active,
  geojson,
  center,
  showBufferBounds = false
}) => {
  const map = useMap();
  const boundaryRef = useRef<L.GeoJSON | null>(null);
  const bufferCircleRef = useRef<L.Circle | null>(null);
  const bufferBoundsRef = useRef<L.Rectangle | null>(null);
  const opacityRef = useRef<number>(1.0);

  const opacity = 1.0;

  // draw boundary & buffer
  useEffect(() => {
    if (!active || !center) return;
    [boundaryRef, bufferCircleRef, bufferBoundsRef].forEach((ref) => {
      if (ref.current) {
        map.removeLayer(ref.current);
        ref.current = null;
      }
    });

    if (geojson) {
      boundaryRef.current = L.geoJSON(geojson, {
        interactive: false,
        style: { color: '#2563eb', weight: 2, fillOpacity: 0, opacity }
      }).addTo(map);
    }

    const circle = calculateBufferCircle(center, geojson!, 8);
    bufferCircleRef.current = L.circle(circle.center, {
      interactive: false,
      radius: circle.bufferedRadius,
      color: '#2563eb',
      weight: 2,
      fillOpacity: 0,
      opacity
    }).addTo(map);

    if (showBufferBounds) {
      const b = circle.bufferedBounds;
      bufferBoundsRef.current = L.rectangle(
        [[b.minLat, b.minLng], [b.maxLat, b.maxLng]],
        { interactive: false, color: '#2563eb', weight: 1, fillOpacity: 0.05, opacity: 0.5, dashArray: '5,5' }
      ).addTo(map);
    }

    opacityRef.current = opacity;
  }, [active, geojson, center, map, opacity, showBufferBounds]);

  return null;
};

export default AOIBoundaryLayer;
