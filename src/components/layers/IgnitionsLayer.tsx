import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { calculateBufferCircle } from '../../utils/geometry';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[IgnitionsLayer]', ...args);
  }
}

interface IgnitionsLayerProps {
  locationId: number;
  active: boolean;
  geojson: GeoJSON.FeatureCollection | null;
  center: [number, number]; // [lat, lng]
  showBufferBounds?: boolean;
  showIgnitions?: boolean;
}

const IgnitionsLayer: React.FC<IgnitionsLayerProps> = ({
  locationId,
  active,
  geojson,
  center,
  showBufferBounds = false,
  showIgnitions = true
}) => {
  const map = useMap();
  const boundaryRef = useRef<L.GeoJSON | null>(null);
  const bufferCircleRef = useRef<L.Circle | null>(null);
  const bufferBoundsRef = useRef<L.Rectangle | null>(null);
  const ignitionLayerRef = useRef<L.GeoJSON | null>(null);
  const staticGridRef = useRef<[number, number][]>([]);
  const opacityRef = useRef<number>(1.0);

  const opacity = 1.0;

  log('starting render')
  // ignition constants
  const DOTS_PER_ACRE = 1;
  const FULL_DENSITY_ZOOM = 14;
  const MAX_FAKE_DOTS = 5000;
  const DOT_RADIUS_PX = 2;
  const EARTH_RADIUS = 6378137; // meters

  // convert meter offsets to lat/lng
  function offsetMetersToLatLng(
    [lat0, lng0]: [number, number],
    dx: number,
    dy: number
  ): [number, number] {
    const dLat = (dy / EARTH_RADIUS) * (180 / Math.PI);
    const dLng =
      (dx / EARTH_RADIUS) * (180 / Math.PI) / Math.cos((lat0 * Math.PI) / 180);
    return [lat0 + dLat, lng0 + dLng];
  }

  // generate a grid of points inside the circle
  function generateGrid(
    center: [number, number],
    radius: number,
    count: number
  ): [number, number][] {
    const pts: [number, number][] = [];
    const side = Math.ceil(Math.sqrt(count));
    const spacing = (2 * radius) / (side - 1);
    for (let i = 0; i < side && pts.length < count; i++) {
      for (let j = 0; j < side && pts.length < count; j++) {
        const x = -radius + i * spacing;
        const y = -radius + j * spacing;
        const [lat, lng] = offsetMetersToLatLng(center, x, y);
        if (L.latLng(lat, lng).distanceTo(L.latLng(center)) <= radius) {
          pts.push([lat, lng]);
        }
      }
    }
    return pts;
  }

  // cache full-resolution grid once
  useEffect(() => {
    if (!active || !showIgnitions || !geojson) return;
    const { center: bc, bufferedRadius } = calculateBufferCircle(center, geojson, 8);
    const areaAcres = (Math.PI * bufferedRadius * bufferedRadius) / 4046.86;
    const fullCount = Math.floor(DOTS_PER_ACRE * areaAcres);
    staticGridRef.current = generateGrid(bc, bufferedRadius, fullCount);
  }, [active, showIgnitions, geojson, center]);

  function regenerateIgnitions() {
    if (ignitionLayerRef.current) {
      map.removeLayer(ignitionLayerRef.current);
      ignitionLayerRef.current = null;
    }
    if (!geojson) return;

    const zoom = Math.floor(map.getZoom());
    const { center: bc, bufferedRadius, bufferedBounds } = calculateBufferCircle(center, geojson, 8);
    let points: [number, number][];

    if (zoom < FULL_DENSITY_ZOOM) {
      // choose region: circle bounding box if fully on screen, else viewport
      const viewBounds = map.getBounds();
      const circleBounds = L.latLngBounds(
        [bufferedBounds.minLat, bufferedBounds.minLng],
        [bufferedBounds.maxLat, bufferedBounds.maxLng]
      );
      const region =
        viewBounds.contains(circleBounds.getSouthWest()) &&
        viewBounds.contains(circleBounds.getNorthEast())
          ? circleBounds
          : viewBounds;

      // tile region with MAX_FAKE_DOTS and clip to circle
      const south = region.getSouth();
      const north = region.getNorth();
      const west = region.getWest();
      const east = region.getEast();
      const side = Math.ceil(Math.sqrt(MAX_FAKE_DOTS));
      const latSpacing = (north - south) / (side - 1);
      const lngSpacing = (east - west) / (side - 1);
      const pts: [number, number][] = [];
      for (let i = 0; i < side && pts.length < MAX_FAKE_DOTS; i++) {
        for (let j = 0; j < side && pts.length < MAX_FAKE_DOTS; j++) {
          const lat = south + i * latSpacing;
          const lng = west + j * lngSpacing;
          if (L.latLng(lat, lng).distanceTo(L.latLng(bc)) <= bufferedRadius) {
            pts.push([lat, lng]);
          }
        }
      }
      points = pts;
    } else {
      points = staticGridRef.current;
    }

    const bounds = map.getBounds();
    const visible = points.filter(([lat, lng]) => bounds.contains(L.latLng(lat, lng)));

    const fc: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: visible.map(([lat, lng]) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {}
      }))
    };

    ignitionLayerRef.current = L.geoJSON(fc, {
      renderer: L.canvas({ padding: 0.5 }),
      pointToLayer: (_f, latlng) =>
        L.circleMarker(latlng, {
          radius: DOT_RADIUS_PX,
          color: 'red',
          weight: 0,
          fill: true,
          fillOpacity: 1
        })
    }).addTo(map);
  }

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

  // manage ignition lifecycle
  useEffect(() => {
    if (!active || !showIgnitions) {
      map.off('zoomend', regenerateIgnitions);
      map.off('moveend', regenerateIgnitions);
      if (ignitionLayerRef.current) map.removeLayer(ignitionLayerRef.current);
      ignitionLayerRef.current = null;
      return;
    }
    regenerateIgnitions();
    map.on('zoomend', regenerateIgnitions);
    map.on('moveend', regenerateIgnitions);
    return () => {
      map.off('zoomend', regenerateIgnitions);
      map.off('moveend', regenerateIgnitions);
      if (ignitionLayerRef.current) map.removeLayer(ignitionLayerRef.current);
    };
  }, [active, showIgnitions, geojson, center, map]);

  return null;
};

export default IgnitionsLayer;
