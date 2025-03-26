import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleShowValues } from '../../store/slices/layers';

interface ImageMetadata {
  width: number;
  height: number;
  bounds: [[number, number], [number, number]];
  rawBounds: [number, number, number, number]; // [minX, minY, maxX, maxY]
  data: Float32Array | Int16Array;
  noDataValue?: number | null;
}

interface ValueTooltipTiffProps {
  categoryId: string;
  layerId: number;
  name: string;
  metadata: ImageMetadata;
  onClose?: () => void;
}

function calculatePixelCoordinates(
  map: L.Map,
  latlng: L.LatLng,
  metadata: ImageMetadata
): { pixelX: number; pixelY: number } | null {
  try {
    const { rawBounds, width, height } = metadata;
    if (!rawBounds || rawBounds.length !== 4) {
      console.warn('Missing or invalid rawBounds:', rawBounds);
      return null;
    }

    // Get raw bounds coordinates
    const [minX, minY, maxX, maxY] = rawBounds;

    // Calculate relative position within bounds
    const relativeX = (latlng.lng - minX) / (maxX - minX);
    const relativeY = (latlng.lat - minY) / (maxY - minY);

    // Convert to pixel coordinates
    const pixelX = Math.floor(relativeX * width);
    const pixelY = Math.floor(relativeY * height);

    // Check if the pixel coordinates are within bounds
    if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) {
      return null;
    }

    return { pixelX, pixelY };
  } catch (error) {
    console.error('Error calculating pixel coordinates:', error);
    return null;
  }
}

const ValueTooltipTiffControl: React.FC<ValueTooltipTiffProps> = ({
  categoryId,
  layerId,
  name,
  metadata,
  onClose
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const tooltipRef = useRef<L.Tooltip | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(toggleShowValues({ categoryId, layerId }));
        onClose?.();
      }
    };

    const handleMapClick = () => {
      dispatch(toggleShowValues({ categoryId, layerId }));
      onClose?.();
    };

    document.addEventListener('keydown', handleEscape);
    map.on('click', handleMapClick);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      map.off('click', handleMapClick);
    };
  }, [dispatch, map, categoryId, layerId, onClose]);

  useEffect(() => {
    if (tooltipRef.current) {
      map.removeLayer(tooltipRef.current);
      tooltipRef.current = null;
    }

    if (!metadata?.bounds || !metadata?.width || !metadata?.height || !metadata?.data || !metadata?.rawBounds) {
      return;
    }

    // Create tooltip
    const tooltip = L.tooltip({
      permanent: true,
      direction: 'top',
      className: 'value-tooltip',
      offset: [0, -20]
    });

    tooltip.setLatLng(map.getCenter());
    tooltip.setContent('Move the mouse over the map');
    tooltip.addTo(map);
    tooltipRef.current = tooltip;

    const updateTooltip = (e: L.LeafletMouseEvent) => {
      if (!tooltipRef.current || !e.latlng) return;

      // Check if point is within bounds
      if (!isPointInBounds(e.latlng, metadata.bounds)) {
        tooltipRef.current.setContent(`${name}: No data`);
        tooltipRef.current.setLatLng(e.latlng);
        return;
      }

      // Get pixel coordinates
      const pixelCoords = calculatePixelCoordinates(map, e.latlng, metadata);
      if (!pixelCoords) {
        tooltipRef.current.setContent(`${name}: No data`);
        tooltipRef.current.setLatLng(e.latlng);
        return;
      }

      // Get value from data array
      const index = pixelCoords.pixelY * metadata.width + pixelCoords.pixelX;
      const value = metadata.data[index];

      // Check for NoData value
      if (metadata.noDataValue !== undefined && value === metadata.noDataValue) {
        tooltipRef.current.setContent(`${name}: No data`);
        tooltipRef.current.setLatLng(e.latlng);
        return;
      }

      // Format the value
      let formattedValue: string;
      if (Math.abs(value) < 0.01) {
        formattedValue = value.toExponential(2);
      } else if (Math.abs(value) > 1000) {
        formattedValue = value.toFixed(0);
      } else {
        formattedValue = value.toFixed(1);
      }

      // Add degree symbol for slope and aspect
      const unit = name.includes('Slope') || name.includes('Aspect') ? '°' : '';
      tooltipRef.current.setContent(`${name}: ${formattedValue}${unit}`);
      tooltipRef.current.setLatLng(e.latlng);
    };

    map.on('mousemove', updateTooltip);

    return () => {
      map.off('mousemove', updateTooltip);
      if (tooltipRef.current) {
        map.removeLayer(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, [map, metadata, name]);

  return null;
};

function isPointInBounds(point: L.LatLng, bounds: [[number, number], [number, number]]): boolean {
  return (
    point.lat >= bounds[0][0] &&
    point.lat <= bounds[1][0] &&
    point.lng >= bounds[0][1] &&
    point.lng <= bounds[1][1]
  );
}

export default ValueTooltipTiffControl;