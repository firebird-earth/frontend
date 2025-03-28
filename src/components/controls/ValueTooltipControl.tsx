import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setShowMapValues } from '../../store/slices/layers';
import { setIsCancellingTooltip } from '../../store/slices/uiSlice';
import { rasterDataCache } from '../../utils/geotif/cache';
import proj4 from 'proj4';

interface ValueTooltipProps {
  categoryId: string;
  layerId: number;
  layer: {
    name: string;
    type: string;
    metadata: {
      width: number;
      height: number;
      bounds: [[number, number], [number, number]];
      noDataValue: number | null;
      sourceCRS: string;
      tiepoint: number[];
      scale: number[];
      transform?: number[];
      rawBounds?: [number, number, number, number];
      rawBoundsCRS?: string;
      stats?: {
        min: number;
        max: number;
        mean: number;
        validCount: number;
        noDataCount: number;
        zeroCount: number;
      };
    };
  };
}

const ValueTooltipControl: React.FC<ValueTooltipProps> = React.memo(
  ({ categoryId, layerId, layer }) => {
    const map = useMap();
    const dispatch = useAppDispatch();
    const tooltipRef = useRef<L.Tooltip | null>(null);
    const mouseMoveHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);
    const cancelHandlerRef = useRef<() => void>(() => {});

    useEffect(() => {
      // Get raster data and validate metadata
      const rasterData = rasterDataCache.get(`${categoryId}-${layerId}`);
      if (!rasterData || !rasterData.data || !layer.metadata || !layer.metadata.bounds) {
        console.log('ValueTooltipControl - Missing data:', {
          hasRasterData: !!rasterData,
          hasRasterDataArray: rasterData?.data != null,
          hasMetadata: !!layer.metadata,
          hasBounds: !!layer.metadata?.bounds
        });
        return;
      }

      console.log('ValueTooltipControl - Layer metadata:', {
        name: layer.name,
        sourceCRS: layer.metadata.sourceCRS,
        rawBounds: layer.metadata.rawBounds,
        tiepoint: layer.metadata.tiepoint,
        scale: layer.metadata.scale,
        transform: layer.metadata.transform,
        bounds: layer.metadata.bounds,
        noDataValue: layer.metadata.noDataValue,
        dimensions: {
          width: layer.metadata.width,
          height: layer.metadata.height
        }
      });

      // Create and add tooltip
      const tooltip = L.tooltip({
        permanent: true,
        direction: 'top',
        className: 'value-tooltip',
        offset: [0, -20],
      });
      tooltip.setContent('Move mouse over the map');
      tooltip.setLatLng(map.getCenter());
      tooltip.addTo(map);
      tooltipRef.current = tooltip;

      // Update tooltip on mousemove
      const updateTooltip = (e: L.LeafletMouseEvent) => {
        if (!tooltipRef.current) return;

        console.log('ValueTooltipControl - Mouse event:', {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });

        const bounds = layer.metadata.bounds;
        if (!isPointInBounds(e.latlng, bounds)) {
          console.log('ValueTooltipControl - Point out of bounds:', {
            point: [e.latlng.lat, e.latlng.lng],
            bounds: bounds
          });
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
          console.log('ValueTooltipControl - Failed to calculate pixel coordinates');
          tooltipRef.current.setContent(`${layer.name}: No data`);
          tooltipRef.current.setLatLng(e.latlng);
          return;
        }

        console.log('ValueTooltipControl - Pixel coordinates:', pixelCoords);

        // Add validation for pixel coordinates
        if (!Number.isFinite(pixelCoords.pixelX) || !Number.isFinite(pixelCoords.pixelY) ||
            pixelCoords.pixelX < 0 || pixelCoords.pixelX >= rasterData.width ||
            pixelCoords.pixelY < 0 || pixelCoords.pixelY >= rasterData.height) {
          console.log('ValueTooltipControl - Invalid pixel coordinates:', {
            pixelX: pixelCoords.pixelX,
            pixelY: pixelCoords.pixelY,
            width: rasterData.width,
            height: rasterData.height
          });
          tooltipRef.current.setContent(`${layer.name}: No data`);
          tooltipRef.current.setLatLng(e.latlng);
          return;
        }

        const { pixelX, pixelY } = pixelCoords;
        const index = pixelY * rasterData.width + pixelX;
        const value = rasterData.data[index];

        console.log('ValueTooltipControl - Value lookup:', {
          index,
          value,
          noDataValue: rasterData.noDataValue,
          isNoData: isNoDataValue(value, rasterData.noDataValue),
          isEmpty: isEmptyValue(value)
        });

        if (isNoDataValue(value, rasterData.noDataValue) || isEmptyValue(value)) {
          tooltipRef.current.setContent(`${layer.name}: No data`);
        } else {
          const formattedValue =
            Math.abs(value) < 0.01
              ? value.toExponential(2)
              : Math.abs(value) > 1000
              ? value.toFixed(0)
              : value.toFixed(1);
          const unit =
            layer.name.includes('Slope') || layer.name.includes('Aspect')
              ? '°'
              : '';
          tooltipRef.current.setContent(`${layer.name}: ${formattedValue}${unit}`);
        }
        tooltipRef.current.setLatLng(e.latlng);
      };

      mouseMoveHandlerRef.current = updateTooltip;
      map.on('mousemove', updateTooltip);

      // Handle cancellation
      cancelHandlerRef.current = (e?: Event) => {
        if (e) {
          e.stopPropagation();
        }
        dispatch(setIsCancellingTooltip(true));
        dispatch(setShowMapValues({ categoryId, layerId, showValues: false }));
        setTimeout(() => {
          dispatch(setIsCancellingTooltip(false));
        }, 100);
      };

      const handleMapClick = (e: L.LeafletMouseEvent) => {
        e.originalEvent.stopPropagation();
        cancelHandlerRef.current();
      };

      const handleKeyPress = (e: KeyboardEvent) => {
        e.stopPropagation();
        cancelHandlerRef.current();
      };

      map.on('click', handleMapClick);
      document.addEventListener('keydown', handleKeyPress);

      return () => {
        if (mouseMoveHandlerRef.current) {
          map.off('mousemove', mouseMoveHandlerRef.current);
          mouseMoveHandlerRef.current = null;
        }
        map.off('click', handleMapClick);
        document.removeEventListener('keydown', handleKeyPress);
        if (tooltipRef.current) {
          map.removeLayer(tooltipRef.current);
          tooltipRef.current = null;
        }
      };
    }, [map, categoryId, layerId, layer, dispatch]);

    return null;
  }
);

function isPointInBounds(
  point: L.LatLng,
  bounds: [[number, number], [number, number]]
): boolean {
  const isInBounds = (
    point.lat >= bounds[0][0] &&
    point.lat <= bounds[1][0] &&
    point.lng >= bounds[0][1] &&
    point.lng <= bounds[1][1]
  );

  console.log('ValueTooltipControl - isPointInBounds:', {
    point: [point.lat, point.lng],
    bounds,
    isInBounds
  });

  return isInBounds;
}

function calculatePixelCoordinates(
  map: L.Map,
  latlng: L.LatLng,
  metadata: any,
  width: number,
  height: number
): { pixelX: number; pixelY: number } | null {
  const { rawBounds, sourceCRS } = metadata;
  if (!rawBounds || rawBounds.length !== 4) {
    console.log('ValueTooltipControl - Invalid rawBounds:', rawBounds);
    return null;
  }
  let [minX, minY, maxX, maxY] = rawBounds;

  // Determine the effective coordinate to use for lookup.
  // Start with the default being the WGS84 coordinate.
  let effectivePoint: [number, number] = [latlng.lng, latlng.lat];

  // If the source CRS is a UTM projection, transform the point.
  if (sourceCRS && sourceCRS.match(/^EPSG:(269|327)\d{2}$/)) {
    if (!proj4.defs(sourceCRS)) {
      const zone = parseInt(sourceCRS.slice(-2));
      const isNorth = sourceCRS.startsWith('EPSG:326');
      const hemisphere = isNorth ? '' : '+south';
      proj4.defs(sourceCRS, `+proj=utm +zone=${zone} ${hemisphere} +datum=WGS84 +units=m +no_defs`);
    }
    effectivePoint = proj4('EPSG:4326', sourceCRS, [latlng.lng, latlng.lat]);
    console.log('ValueTooltipControl - UTM transformation applied:', { utmPoint: effectivePoint });
  }

  // Common code: compute relative coordinates and then pixel indices.
  const relativeX = (effectivePoint[0] - minX) / (maxX - minX);
  
  //const relativeY = (effectivePoint[1] - minY) / (maxY - minY);
  const relativeY = 1 - ((effectivePoint[1] - minY) / (maxY - minY));
  
  const pixelX = Math.floor(relativeX * width);
  const pixelY = Math.floor(relativeY * height);

  console.log('ValueTooltipControl - Calculated pixel coordinates:', {
    effectivePoint,
    relativeX,
    relativeY,
    pixelX,
    pixelY
  });

  if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) {
    console.log('ValueTooltipControl - Pixel coordinates out of bounds');
    return null;
  }
  return { pixelX, pixelY };
}

function isEmptyValue(value: number): boolean {
  const isEmpty = value === undefined || isNaN(value) || !isFinite(value);
  console.log('ValueTooltipControl - isEmptyValue:', {
    value,
    isEmpty
  });
  return isEmpty;
}

function isNoDataValue(value: number, noDataValue: number | null): boolean {
  if (noDataValue === null) return false;
  const isNoData = Math.abs(value - noDataValue) < 1e-10;
  console.log('ValueTooltipControl - isNoDataValue:', {
    value,
    noDataValue,
    isNoData
  });
  return isNoData;
}

export default ValueTooltipControl;