import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { calculateGridZoomThreshold, zoomToGridThreshold } from '../../utils/grid';

interface GridControlProps {
  position?: L.ControlPosition;
}

const GridControl: React.FC<GridControlProps> = ({ position = 'bottomright' }) => {
  const map = useMap();
  const gridLayerRef = useRef<L.GridLayer | null>(null);
  const controlRef = useRef<L.Control | null>(null);

  const { grid } = useAppSelector(state =>
    state.settings.settings?.preferences.map || { grid: { show: false, size: 30, unit: 'meters' } }
  );
  const zoomThreshold = calculateGridZoomThreshold(grid.size, grid.unit);

  useEffect(() => {
    if (grid.show && !gridLayerRef.current) {
      zoomToGridThreshold(map, grid.size, grid.unit);

      const PixelLayer = L.GridLayer.extend({
        createTile: function(coords: L.Coords) {
          const tile = document.createElement('canvas');
          const ctx = tile.getContext('2d');
          const size = this.getTileSize();
          tile.width = size.x;
          tile.height = size.y;

          const zoom = coords.z;
          if (!ctx || zoom < zoomThreshold) return tile;

          const cellMeters = grid.unit === 'acres'
            ? Math.sqrt(grid.size * 4046.86)
            : grid.size;
          const earthCirc = 40075016.686;
          const scale = 256 * Math.pow(2, zoom);
          const cellPx = (cellMeters * scale) / earthCirc;

          const originX = coords.x * size.x;
          const originY = coords.y * size.y;

          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5;

          const startX = Math.floor(originX / cellPx);
          for (let i = startX; ; i++) {
            const x = i * cellPx - originX + 0.5;
            if (x < 0) continue;
            if (x > size.x) break;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size.y);
            ctx.stroke();
          }

          const startY = Math.floor(originY / cellPx);
          for (let j = startY; ; j++) {
            const y = j * cellPx - originY + 0.5;
            if (y < 0) continue;
            if (y > size.y) break;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size.x, y);
            ctx.stroke();
          }

          return tile;
        }
      });

      const pixelLayer = new PixelLayer({
        tileSize: 256,
        minZoom: zoomThreshold,
        maxNativeZoom: 22,
        noWrap: true,
        keepBuffer: 2
      });

      map.addLayer(pixelLayer);
      gridLayerRef.current = pixelLayer;
    }

    if (!grid.show && gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
      gridLayerRef.current = null;
    }

    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
    };
  }, [map, grid.show, grid.size, grid.unit, zoomThreshold]);

  useEffect(() => {
    let updateWidth: () => void;

    if (grid.show) {
      if (!controlRef.current) {
        const Ctrl = L.Control.extend({
          options: { position },
          onAdd: () => {
            const c = L.DomUtil.create('div', 'leaflet-control-grid');
            Object.assign(c.style, {
              boxSizing: 'border-box',          // include padding/border in width
              background: 'rgba(255,255,255,0.8)',
              padding: '4px 8px',
              border: '1px solid #374151',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '11px'
            });
            c.textContent = `${grid.size}${grid.unit === 'meters' ? 'm' : 'ac'}`;
            L.DomEvent.disableClickPropagation(c);
            c.addEventListener('click', () => zoomToGridThreshold(map, grid.size, grid.unit));
            return c;
          }
        });
        controlRef.current = new (Ctrl as any)();
        map.addControl(controlRef.current);

        const container = (controlRef.current as any)._container as HTMLDivElement;
        updateWidth = () => {
          const zoom = map.getZoom();
          const cellMeters = grid.unit === 'acres'
            ? Math.sqrt(grid.size * 4046.86)
            : grid.size;
          const earthCirc = 40075016.686;
          const scale = 256 * Math.pow(2, zoom);
          const cellPx = (cellMeters * scale) / earthCirc;
          const width = Math.max(cellPx, 25);    // allow down to 25px
          container.style.width = `${width}px`;
        };
        updateWidth();
        map.on('zoomend', updateWidth);
      }
    } else if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }

    return () => {
      if (updateWidth) map.off('zoomend', updateWidth);
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, grid.show, grid.size, grid.unit, position]);

  return null;
};

export default GridControl;
