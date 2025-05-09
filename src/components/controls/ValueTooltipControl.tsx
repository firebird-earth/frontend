import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setShowMapValues } from '../../store/slices/layersSlice';
import { setIsCancellingTooltip } from '../../store/slices/uiSlice';
import { layerDataCache } from '../../cache/cache';
import { getColorFromScheme } from '../../utils/colors';
import { defaultColorScheme } from '../../constants/colors';
import { leafletLayerMap } from '../../store/slices/layersSlice/state';
import { clampValueToDomain, resolveDomain } from '../../utils/rasterDomain';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[ValueTooltipControl]', ...args);
  }
}

interface ValueTooltipProps {
  categoryId: string;
  layerId: number;
  layerName: string;
}

const ValueTooltipControl: React.FC<ValueTooltipProps> = React.memo(({ categoryId, layerId, layerName }) => {
  const map = useMap();
  const dispatch = useAppDispatch();

  const valueRange = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    return category?.layers.find(l => l.id === layerId)?.valueRange ?? null;
  });

  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    return category?.layers.find(l => l.id === layerId) ?? null;
  });

  const tooltipRef = useRef<L.Tooltip | null>(null);

  useEffect(() => {
    const layerData = layerDataCache.getSync(`${categoryId}-${layerId}`);
    if (!layerData?.data || !layerData.metadata || !valueRange || !layer) {
      log('Missing tooltip inputs');
      return;
    }

    // Prefer the processed array (clamped + filled) if available
    const { rasterArray, processedRaster, width, height, noDataValue } = layerData.data as {
      rasterArray: Float32Array;
      processedRaster?: Float32Array;
      width: number;
      height: number;
      noDataValue: number;
    };
    const dataArray = processedRaster ?? rasterArray;
    log(`Using ${processedRaster ? 'processedRaster' : 'rasterArray'} for layer ${categoryId}-${layerId}`);

    const scheme = layer.colorScheme || defaultColorScheme;

    // Resolve domain replacing nodata with actual stats
    const rawDomain = layer.domain || [valueRange.defaultMin, valueRange.defaultMax];
    const [domainMin, domainMax] = resolveDomain(
      rawDomain,
      layerData.metadata.stats.min,
      layerData.metadata.stats.max,
      noDataValue
    );
    const fullRange = domainMax - domainMin;

    const tooltip = L.tooltip({
      permanent: true,
      direction: 'top',
      className: 'value-tooltip',
      offset: [0, -20],
    })
      .setContent('Move mouse over the map')
      .setLatLng(map.getCenter())
      .addTo(map);
    tooltipRef.current = tooltip;

    const updateTooltip = (e: L.LeafletMouseEvent) => {
      const leafletLayer = leafletLayerMap.get(layerId);
      const img = leafletLayer?.getElement?.() as HTMLImageElement | undefined;
      if (!img) return;

      const bounds = img.getBoundingClientRect();

      // ← CHANGED: use clientX/Y directly against bounds
      const ev = e.originalEvent as MouseEvent;
      const offsetX = ev.clientX - bounds.left;
      const offsetY = ev.clientY - bounds.top;

      const relX = offsetX / bounds.width;
      const relY = offsetY / bounds.height;

      const pixelX = Math.floor(relX * width);
      const pixelY = Math.floor(relY * height);
      const index = pixelY * width + pixelX;

      const raw = dataArray[index];
      const value = clampValueToDomain(raw, domainMin, domainMax, noDataValue);
      const isNoData = Math.abs(raw - noDataValue) < 1e-10;

      let label: string;
      let swatchColor: string;

      if (index < 0 || index >= dataArray.length || isNaN(value) || isNoData) {
        label = 'No value';
        swatchColor = 'rgba(0,0,0,0)';
      } else {
        // Format display value
        const formattedValue =
          Math.abs(value) < 0.01
            ? value.toExponential(2)
            : Math.abs(value) > 1000
            ? value.toFixed(0)
            : value.toFixed(1);
        const unit = layerName.includes('Slope') || layerName.includes('Aspect') ? '°' : '';
        const normalizedValue = (value - domainMin) / fullRange;
        swatchColor = getColorFromScheme(scheme, normalizedValue);
        label = `${formattedValue}${unit}`;
      }

      tooltipRef.current
        ?.setContent(renderSwatchContent(`${layerName}: ${label}`, swatchColor))
        .setLatLng(e.latlng);

      //log({latlng: e.latlng, pixelX, pixelY, index, raw, value, swatchColor});
    };

    map.on('mousemove', updateTooltip);

    const cancel = () => {
      dispatch(setIsCancellingTooltip(true));
      dispatch(setShowMapValues({ categoryId, layerId, showValues: false }));
      setTimeout(() => dispatch(setIsCancellingTooltip(false)), 100);
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      e.originalEvent.stopPropagation();
      cancel();
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation();
      cancel();
    };

    map.on('click', handleMapClick);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      map.off('mousemove', updateTooltip);
      map.off('click', handleMapClick);
      document.removeEventListener('keydown', handleKeyPress);
      if (tooltipRef.current) {
        map.removeLayer(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, [map, categoryId, layerId, dispatch]);

  return null;
});

function renderSwatchContent(label: string, color: string) {
  return `
    <div style="display:flex;align-items:center;gap:6px">
      <div style="width:12px;height:12px;background:${color};border-radius:2px;border:1px solid #aaa;"></div>
      <div style="font-weight: bold; font-size: 12px;">${label}</div>
    </div>
  `;
}

export default ValueTooltipControl;
