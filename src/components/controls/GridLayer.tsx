import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { calculateGridZoomThreshold } from '../../utils/grid';

const CanvasGridLayer: React.FC = () => {
  const map = useMap();
  const gridLayerRef = useRef<L.GridLayer | null>(null);
  
  const { grid } = useAppSelector(state => state.settings.settings?.preferences.map || {
    grid: {
      show: false,
      size: 30,
      unit: 'meters'
    }
  });
  
  const zoomThreshold = calculateGridZoomThreshold(grid.size, grid.unit);

  useEffect(() => {
    if (!grid.show) {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
      return;
    }

    const CustomGridLayer = L.GridLayer.extend({
      createTile: function(coords: L.Coords) {
        const tile = document.createElement('canvas');
        const ctx = tile.getContext('2d');
        const zoom = coords.z;

        if (!ctx || zoom < zoomThreshold) {
          return tile;
        }

        // Set tile size
        const size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        // Get tile boundaries in lat/lng
        const nwPoint = coords.scaleBy(size);
        const nw = this._map.unproject(nwPoint, coords.z);
        const se = this._map.unproject(nwPoint.add(size), coords.z);
        const centerLat = (nw.lat + se.lat) / 2;

        // Calculate cell size in meters
        const cellSizeInMeters = grid.unit === 'acres'
          ? Math.sqrt(grid.size * 4046.86)
          : grid.size;

        // Meters per degree
        const metersPerDegLat = 111319.9;
        const metersPerDegLng = metersPerDegLat * Math.cos(centerLat * Math.PI / 180);

        // Convert cell size to degrees
        const cellSizeLat = cellSizeInMeters / metersPerDegLat;
        const cellSizeLng = cellSizeInMeters / metersPerDegLng;

        // Anchor both lat/lng calculations to the NW corner:
        const latCells = Math.floor(nw.lat / cellSizeLat);
        const lngCells = Math.floor(nw.lng / cellSizeLng);

        const startLat = latCells * cellSizeLat;
        const startLng = lngCells * cellSizeLng;

        // Style
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;

        // Draw vertical lines
        for (let lng = startLng; lng <= se.lng + cellSizeLng; lng += cellSizeLng) {
          const x = Math.round(
            this._map.project([nw.lat, lng], coords.z).x - nwPoint.x
          ) + 0.5;
          if (x >= 0 && x <= size.x) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size.y);
            ctx.stroke();
          }
        }

        // Draw horizontal lines (nw.lat > se.lat so go downward)
        for (let lat = startLat; lat >= se.lat - cellSizeLat; lat -= cellSizeLat) {
          const y = Math.round(
            this._map.project([lat, nw.lng], coords.z).y - nwPoint.y
          ) + 0.5;
          if (y >= 0 && y <= size.y) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size.x, y);
            ctx.stroke();
          }
        }

        return tile;
      }
    });

    const gridLayer = new CustomGridLayer({
      tileSize: 256,
      minZoom: zoomThreshold,
      maxNativeZoom: 22,
      noWrap: true,
      bounds: map.getBounds().pad(1),
      keepBuffer: 2,
      updateWhenZooming: false,
      updateWhenIdle: true,
      className: 'geotiff-high-quality'
    });

    map.addLayer(gridLayer);
    gridLayerRef.current = gridLayer;

    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
    };
  }, [map, grid.show, grid.size, grid.unit, zoomThreshold]);

  return null;
};

export default CanvasGridLayer;
