import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { calculateGridCells } from '../../../utils/grid';

interface GridLayerProps {
  center: [number, number]; // [lat, lng]
  radius: number; // meters
}

const GridLayer: React.FC<GridLayerProps> = ({ center, radius }) => {
  const map = useMap();
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Get grid settings from Redux store
  const gridSettings = useAppSelector(state => state.aoi.grid);
  const { show, size, unit } = gridSettings;

  useEffect(() => {
    // Remove existing grid layer if it exists
    if (gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
      gridLayerRef.current = null;
    }

    // Only create grid if it should be shown
    if (!show || !center || !radius) {
      return;
    }

    try {
      // Create a new layer group for the grid
      const gridGroup = L.layerGroup();
      
      // Calculate grid cells based on settings
      const gridCells = calculateGridCells(center, radius, size, unit);
      
      // Create polygons for each grid cell
      gridCells.forEach(cell => {
        const polygon = L.polygon(cell, {
          color: '#3b82f6', // blue-500
          weight: 1,
          opacity: 0.7,
          fillColor: '#3b82f6',
          fillOpacity: 0.05,
          interactive: false
        });
        
        gridGroup.addLayer(polygon);
      });

      // Add the grid layer to the map
      gridGroup.addTo(map);
      gridLayerRef.current = gridGroup;
    } catch (error) {
      console.error('Error creating grid layer:', error);
    }

    // Cleanup function
    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
    };
  }, [map, center, radius, show, size, unit]);

  return null;
};

export default GridLayer;