import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleShowValues } from '../../store/slices/layers';

interface RasterData {
  data: Float32Array | Int16Array;
  width: number;
  height: number;
  noDataValue: number | null;
}

interface ValueTooltipProps {
  categoryId: string;
  layerId: number;
  layer: {
    name: string;
    type: string;
    metadata: {
      bounds: [[number, number], [number, number]];
      rawBounds?: [number, number, number, number];
    };
  };
  rasterData?: RasterData;
}

function calculatePixelCoordinates(
  map: L.Map,
  latlng: L.LatLng,
  metadata: any,
  width: number,
  height: number
): { pixelX: number; pixelY: number } | null {
  try {
    const sourceCRS = metadata.sourceCRS;
    const rawBounds = metadata.rawBounds;
    const bounds = metadata.bounds;
    
    if (!sourceCRS || !rawBounds || rawBounds.length !== 4 || !bounds) {
      return null;
    }

    const point = map.latLngToContainerPoint(latlng);
    const topLeft = map.latLngToContainerPoint(L.latLng(bounds[1][0], bounds[0][1]));
    const bottomRight = map.latLngToContainerPoint(L.latLng(bounds[0][0], bounds[1][1]));
    
    const relativeX = (point.x - topLeft.x) / (bottomRight.x - topLeft.x);
    const relativeY = (point.y - topLeft.y) / (bottomRight.y - topLeft.y);

    const pixelX = Math.floor(relativeX * width);
    const pixelY = Math.floor(relativeY * height);

    if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) {
      return null;
    }

    return { pixelX, pixelY };
  } catch (error) {
    return null;
  }
}

const ValueTooltipControl: React.FC<ValueTooltipProps> = ({
  categoryId,
  layerId,
  layer,
  rasterData
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(toggleShowValues({ categoryId, layerId }));
      }
    };

    const handleMapClick = () => {
      dispatch(toggleShowValues({ categoryId, layerId }));
    };

    document.addEventListener('keydown', handleEscape);
    map.on('click', handleMapClick);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      map.off('click', handleMapClick);
    };
  }, [dispatch, map, categoryId, layerId]);

  useEffect(() => {
    if (tooltipRef.current) {
      map.removeLayer(tooltipRef.current);
      tooltipRef.current = null;
    }

    hasMovedRef.current = false;

    if (!rasterData || !rasterData.data || !rasterData.width || !rasterData.height) {
      return;
    }

    if (!layer.metadata || !layer.metadata.rawBounds) {
      return;
    }

    const tooltip = L.tooltip({
      permanent: true,
      direction: 'top',
      className: 'value-tooltip',
      offset: [0, -20]
    }).setContent('Move the mouse over the map');

    const center = map.getCenter();
    tooltip.setLatLng(center);
    tooltip.addTo(map);
    tooltipRef.current = tooltip;

    const updateTooltip = (e: L.LeafletMouseEvent) => {
      if (!tooltipRef.current || !e.latlng) return;

      hasMovedRef.current = true;

      const { bounds } = layer.metadata;

      if (!isPointInBounds(e.latlng, bounds)) {
        tooltipRef.current.setContent(`${layer.name}: No data`);
        tooltipRef.current.setLatLng(e.latlng);
        return;
      }

      const pixelCoords = calculatePixelCoordinates(
        map,
        e.latlng,
        layer.metadata,
        rasterData.width,
        rasterData.height
      );

      if (!pixelCoords) {
        tooltipRef.current.setContent(`${layer.name}: No data`);
        tooltipRef.current.setLatLng(e.latlng);
        return;
      }

      const { pixelX, pixelY } = pixelCoords;
      const index = pixelY * rasterData.width + pixelX;
      const value = rasterData.data[index];

      if (isNoDataValue(value, rasterData.noDataValue) || isEmptyValue(value)) {
        tooltipRef.current.setContent(`${layer.name}: No data`);
      } else {
        let formattedValue: string;
        if (Math.abs(value) < 0.01) {
          formattedValue = value.toExponential(2);
        } else if (Math.abs(value) > 1000) {
          formattedValue = value.toFixed(0);
        } else {
          formattedValue = value.toFixed(3);
        }
        tooltipRef.current.setContent(`${layer.name}: ${formattedValue}`);
      }

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
  }, [map, layer, rasterData]);

  return null;
};

function isPointInBounds(point: L.LatLng, bounds: [[number, number], [number, number]]): boolean {
  return point.lat >= bounds[0][0] && point.lat <= bounds[1][0] &&
         point.lng >= bounds[0][1] && point.lng <= bounds[1][1];
}

function isEmptyValue(value: number): boolean {
  return value === undefined || 
         isNaN(value) || 
         !isFinite(value);
}

function isNoDataValue(value: number, noDataValue: number | null): boolean {
  if (noDataValue === null) return false;
  const epsilon = 1e-10;
  return Math.abs(value - noDataValue) < epsilon;
}

export default ValueTooltipControl;