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
        
        // Get tile bounds
        const nwPoint = coords.scaleBy(size);
        const nw = this._map.unproject(nwPoint, coords.z);
        const se = this._map.unproject(nwPoint.add(size), coords.z);
        const centerLat = (nw.lat + se.lat) / 2;
        
        // Calculate cell size in meters
        const cellSizeInMeters = grid.unit === 'acres' 
          ? Math.sqrt(grid.size * 4046.86) 
          : grid.size;
        
        // Calculate meters per degree at this latitude
        const metersPerDegLat = 111319.9; // meters per degree latitude
        const metersPerDegLng = metersPerDegLat * Math.cos(centerLat * Math.PI/180);
        
        // Calculate cell size in degrees
        const cellSizeLat = cellSizeInMeters / metersPerDegLat;
        const cellSizeLng = cellSizeInMeters / metersPerDegLng;
        
        // Calculate global grid alignment
        // Use prime meridian (0° longitude) and equator (0° latitude) as reference
        const latCells = Math.floor(se.lat / cellSizeLat);
        const lngCells = Math.floor(nw.lng / cellSizeLng);
        
        // Calculate the actual starting positions
        const startLat = latCells * cellSizeLat;
        const startLng = lngCells * cellSizeLng;
        
        // Set line style
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        
        // Draw vertical lines
        for (let lng = startLng; lng <= se.lng + cellSizeLng; lng += cellSizeLng) {
          const point = this._map.project([nw.lat, lng], coords.z);
          const x = Math.round(point.x - nwPoint.x) + 0.5;
          
          if (x >= 0 && x <= size.x) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size.y);
            ctx.stroke();
          }
        }
        
        // Draw horizontal lines
        for (let lat = startLat; lat <= nw.lat + cellSizeLat; lat += cellSizeLat) {
          const point = this._map.project([lat, nw.lng], coords.z);
          const y = Math.round(point.y - nwPoint.y) + 0.5;
          
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