import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAOI } from '../../hooks/useAOI';
import { metersToMiles } from '../../utils/geometry';
import { BUFFER_RADIUS } from '../../globals';

const DEBUG = false;
function log(...args: any[]) {
  if (DEBUG) { console.log('[AOILayer]', ...args); }
}

interface AOILayerProps {
  locationId: number;
  active: boolean;
  geojson: GeoJSON.FeatureCollection | null;
  center: [number, number]; // [lat, lng]
  showCenter?: boolean;
  showBufferBounds?: boolean;
}

const AOILayer: React.FC<AOILayerProps> = ({
  active,
  geojson,
  center,
  showCenter = true,
  showBufferBounds = true
}) => {
  const map = useMap();
  const aois = useAOI();
  const aoi = useAppSelector(state => state.home.aoi.current);
  const boundaryRef = useRef<L.GeoJSON | null>(null);
  const bufferCircleRef = useRef<L.Circle | null>(null);
  const bufferBoundsRef = useRef<L.Rectangle | null>(null);
  const opacityRef = useRef<number>(1.0);
  const opacity = 1.0;

  //log('AOIs:', aois)
  log('currentAOI:', aoi)
  log('aoi width in miles:', metersToMiles(aoi.bufferedRadius*2));
  
  useEffect(() => {
    
    if (!active || !center || !aoi) return;
    [boundaryRef, bufferCircleRef, bufferBoundsRef].forEach((ref) => {
      if (ref.current) {
        map.removeLayer(ref.current);
        ref.current = null;
      }
    });

    // Draw aoi boundry from geojson
    if (geojson) {
      boundaryRef.current = L.geoJSON(geojson, {
        interactive: false,
        style: { color: '#2563eb', weight: 2, fillOpacity: 0, opacity }
      }).addTo(map);
    }

    if (showCenter) {
     // draw a 6px red circle at the center
      const dot = L.circleMarker([aoi.center[0], aoi.center[1]], {
        radius: 6,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1,
        weight: 1,
      });
      dot.addTo(map);
    }

     // Draw buffer circle
    bufferCircleRef.current = L.circle(aoi.center, {
      radius: aoi.bufferedRadius,
      interactive: false,
      color: '#2563eb',
      weight: 2,
      fillOpacity: 0,
      opacity
    }).addTo(map);
    
    // Draw buffer bounds (rect)
    if (showBufferBounds) {
      const b = aoi.bufferedBounds;
      bufferBoundsRef.current = L.rectangle(
        [[b.minLat, b.minLng], [b.maxLat, b.maxLng]],
        { interactive: false, color: '#2563eb', weight: 1, fillOpacity: 0.05, opacity: 0.5, dashArray: '5,5' }
      ).addTo(map);
    }

    opacityRef.current = opacity;
  }, [active, geojson, center, map, opacity, showBufferBounds]);

  return null;
};

export default AOILayer;
