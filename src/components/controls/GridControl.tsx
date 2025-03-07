import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import { calculateGridZoomThreshold, zoomToGridThreshold } from '../../utils/grid';

const GridControl = () => {
  const map = useMap();
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const controlRef = useRef<L.Control | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousShowRef = useRef<boolean>(false);
  
  const { grid } = useAppSelector(state => state.settings.settings?.preferences.map || {
    grid: {
      show: false,
      size: 30,
      unit: 'meters'
    }
  });
  
  const zoomThreshold = calculateGridZoomThreshold(grid.size, grid.unit);

  // Function to calculate grid cell width in pixels
  const calculateCellWidth = () => {
    const zoom = map.getZoom();
    const center = map.getCenter();
    
    // Calculate cell size in meters
    const cellSizeInMeters = grid.unit === 'acres' 
      ? Math.sqrt(grid.size * 4046.86) 
      : grid.size;

    // Calculate cell size in degrees at this latitude
    const metersPerDegLat = 111319.9; // meters per degree latitude
    const metersPerDegLng = metersPerDegLat * Math.cos(center.lat * Math.PI/180);
    const cellSizeLng = cellSizeInMeters / metersPerDegLng;

    // Convert to pixels using the map's projection
    const point1 = map.latLngToContainerPoint([center.lat, center.lng]);
    const point2 = map.latLngToContainerPoint([center.lat, center.lng + cellSizeLng]);
    
    return Math.abs(point2.x - point1.x);
  };

  // Function to update control width
  const updateControlWidth = () => {
    if (!containerRef.current) return;
    
    if (!grid.show || map.getZoom() < zoomThreshold) {
      // Reset to default width when grid is hidden or below threshold
      containerRef.current.style.width = 'auto';
      return;
    }

    const cellWidth = calculateCellWidth();
    containerRef.current.style.width = `${Math.max(cellWidth, 20)}px`; // Changed to 20px minimum
  };

  useEffect(() => {
    // Check if grid was just turned on
    if (grid.show && !previousShowRef.current) {
      zoomToGridThreshold(map, grid.size, grid.unit);
    }
    previousShowRef.current = grid.show;

    // Update control width immediately when grid visibility changes
    updateControlWidth();

    if (!grid.show) {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
      return;
    }

    // Create layer group for grid lines if it doesn't exist
    if (!gridLayerRef.current) {
      gridLayerRef.current = L.layerGroup().addTo(map);
    }

    // Function to draw grid lines
    const drawGrid = () => {
      if (!gridLayerRef.current) return;

      // Clear existing lines
      gridLayerRef.current.clearLayers();

      // Get current zoom level
      const zoom = map.getZoom();
      if (zoom < zoomThreshold) {
        updateControlWidth(); // Update width when below threshold
        return;
      }

      // Get bounds with buffer
      const bounds = map.getBounds().pad(0.1);
      const centerLat = bounds.getCenter().lat;

      // Calculate cell size in meters
      const cellSizeInMeters = grid.unit === 'acres' 
        ? Math.sqrt(grid.size * 4046.86) 
        : grid.size;

      // Calculate cell size in degrees at this latitude
      const metersPerDegLat = 111319.9; // meters per degree latitude
      const metersPerDegLng = metersPerDegLat * Math.cos(centerLat * Math.PI/180);
      
      const cellSizeLat = cellSizeInMeters / metersPerDegLat;
      const cellSizeLng = cellSizeInMeters / metersPerDegLng;

      // Calculate global grid alignment
      const latCells = Math.floor(bounds.getSouth() / cellSizeLat);
      const lngCells = Math.floor(bounds.getWest() / cellSizeLng);

      // Calculate the actual starting positions
      const startLat = latCells * cellSizeLat;
      const startLng = lngCells * cellSizeLng;

      // Draw vertical lines
      for (let lng = startLng; lng <= bounds.getEast(); lng += cellSizeLng) {
        // Handle date line crossing
        const adjustedLng = ((lng + 180) % 360) - 180;
        
        L.polyline([
          [bounds.getSouth(), adjustedLng],
          [bounds.getNorth(), adjustedLng]
        ], {
          color: '#3b82f6',
          weight: 1,
          opacity: 0.5,
          interactive: false,
          smoothFactor: 1
        }).addTo(gridLayerRef.current);
      }

      // Draw horizontal lines
      for (let lat = startLat; lat <= bounds.getNorth(); lat += cellSizeLat) {
        // Clamp latitude to valid range
        const adjustedLat = Math.max(-85, Math.min(85, lat));
        
        L.polyline([
          [adjustedLat, bounds.getWest()],
          [adjustedLat, bounds.getEast()]
        ], {
          color: '#3b82f6',
          weight: 1,
          opacity: 0.5,
          interactive: false,
          smoothFactor: 1
        }).addTo(gridLayerRef.current);
      }

      // Update control width after drawing grid
      updateControlWidth();
    };

    // Create grid control
    const GridControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-grid');
        containerRef.current = container;
        
        container.style.background = 'rgba(255, 255, 255, 0.8)';
        container.style.padding = '4px 8px';
        container.style.borderRadius = '4px';
        container.style.border = '1px solid #374151';
        container.style.color = '#374151';
        container.style.fontSize = '11px';
        container.style.lineHeight = '1.2';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '4px';
        container.style.whiteSpace = 'nowrap';
        container.style.cursor = 'pointer';
        container.style.marginBottom = '0';
        container.style.transition = 'all 0.2s ease-in-out';
        container.style.minWidth = '20px'; // Changed to 20px minimum
        
        const icon = document.createElement('div');
        icon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
        `;
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.flexShrink = '0';
        
        const text = document.createElement('span');
        text.textContent = `${grid.size} ${grid.unit === 'meters' ? 'm' : 'ac'}`;
        text.style.flexGrow = '1';
        text.style.textAlign = 'center';
        
        container.appendChild(icon);
        container.appendChild(text);

        const updateBackground = () => {
          const currentZoom = map.getZoom();
          
          if (currentZoom >= zoomThreshold) {
            container.style.backgroundColor = 'rgba(219, 234, 254, 0.9)';
            container.style.borderColor = '#3b82f6';
          } else {
            container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            container.style.borderColor = '#374151';
          }
        };
        
        updateBackground();
        map.on('zoomend', updateBackground);
        
        container.addEventListener('mouseenter', () => {
          container.style.opacity = '1';
        });
        
        container.addEventListener('mouseleave', () => {
          container.style.opacity = '0.9';
        });
        
        // Prevent double-click from triggering map zoom
        container.addEventListener('dblclick', (e) => {
          e.stopPropagation();
        });
        
        // Handle single click for zoom to threshold
        container.addEventListener('click', (e) => {
          e.stopPropagation();
          zoomToGridThreshold(map, grid.size, grid.unit);
        });
        
        // Disable map dragging when interacting with the control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        return container;
      }
    });

    // Add control if it doesn't exist
    if (!controlRef.current) {
      const gridControl = new GridControl();
      map.addControl(gridControl);
      controlRef.current = gridControl;
    }

    // Draw initial grid
    drawGrid();

    // Add event listeners
    map.on('moveend', drawGrid);
    map.on('zoomend', drawGrid);

    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
      map.off('moveend', drawGrid);
      map.off('zoomend', drawGrid);
    };
  }, [map, grid.show, grid.size, grid.unit, zoomThreshold]);

  return null;
};

export default GridControl;