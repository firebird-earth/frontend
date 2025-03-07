import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { calculateGridZoomThreshold } from '../../utils/grid';

function CanvasGridLayer() {
  const map = useMap();

  const { grid } = useAppSelector(
    (state) =>
      state.settings.settings?.preferences.map || {
        grid: { show: false, size: 30, unit: 'meters' },
      }
  );

  const zoomThreshold = calculateGridZoomThreshold(grid.size, grid.unit);

  useEffect(() => {
    if (!grid.show) return;

    // 1) Create a custom Layer that places a single <canvas> into the *tile pane*.
    const SingleCanvasLayer = L.Layer.extend({
      onAdd(map: L.Map) {
        // Put our canvas in the tile pane (same as the map tiles),
        // so it shares Leaflet's built-in transform.
        const tilePane = map.getPane('tilePane');
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
        if (tilePane) tilePane.appendChild(this._canvas);

        // Make sure it gets the same transform transitions (zoom/pan) as tiles:
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-animated');

        // Force the canvas to sit behind markers:
        this._canvas.style.zIndex = '0';
        this._canvas.style.position = 'absolute';

        // Redraw whenever map moves/zooms
        map.on('viewreset moveend zoomend resize', this._draw, this);
        // On initial add
        this._draw();
      },

      onRemove(map: L.Map) {
        map.off('viewreset moveend zoomend resize', this._draw, this);
        if (this._canvas) {
          L.DomUtil.remove(this._canvas);
          this._canvas = null;
        }
      },

      _draw() {
        if (!this._canvas) return;
        const map = this._map;
        const size = map.getSize();
        const zoom = map.getZoom();

        // Resize canvas to the current map viewport
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        const ctx = this._canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, size.x, size.y);

        // Skip if zoom is below threshold
        if (zoom < zoomThreshold) return;

        // Convert user's grid size to "meters" for a Web Mercator approximation
        const cellSizeMeters =
          grid.unit === 'acres'
            ? Math.sqrt(grid.size * 4046.86) // 1 acre ≈ 4046.86 m^2
            : grid.size;

        // We’ll figure out how many meters each pixel represents
        // at the current zoom, in Leaflet’s CRS.EPSG3857.
        const earthCircum = 40075016.68557849; // circumference used by EPSG:3857
        const metersPerPixel = earthCircum / (256 * Math.pow(2, zoom));

        // So the grid cell in *pixels* at current zoom is:
        const gridPx = cellSizeMeters / metersPerPixel;

        // Now we need the offset in “world pixels” for the top-left of the map.
        //   - `map.project(latLng, zoom)` gives global pixel coords at this zoom
        //   - We’ll find the top-left corner’s global pixel coords, then mod by gridPx
        const bounds = map.getBounds();
        const nwLatLng = bounds.getNorthWest();
        const globalNW = map.project(nwLatLng, zoom); // e.g. (global x,y)

        // The local canvas is drawn from (0,0) to (size.x,size.y).
        // If globalNW.x = 12345.67 px, we want to see where that sits relative
        // to the nearest multiple of gridPx. That gives us the alignment offset.
        const offsetX = globalNW.x % gridPx;
        const offsetY = globalNW.y % gridPx;

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;

        // We'll draw vertical lines from left to right
        // i.e. x = (0 - offsetX) to x <= size.x, stepping by gridPx
        for (
          let x = -offsetX;
          x <= size.x;
          x += gridPx
        ) {
          // No rounding to integer
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, size.y);
          ctx.stroke();
        }

        // Then horizontal lines, top to bottom
        for (
          let y = -offsetY;
          y <= size.y;
          y += gridPx
        ) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size.x, y);
          ctx.stroke();
        }
      },
    });

    const layer = new SingleCanvasLayer();
    layer.addTo(map);

    return () => {
      layer.remove();
    };
  }, [map, grid.show, grid.size, grid.unit, zoomThreshold]);

  return null;
}

export default CanvasGridLayer;
