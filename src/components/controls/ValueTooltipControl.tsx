import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setShowMapValues } from '../../store/slices/layers';
import { setIsCancellingTooltip } from '../../store/slices/uiSlice';
import { layerDataCache } from '../../cache/cache';
import { getColorScheme, getColorFromScheme } from '../../utils/colors';
import { defaultColorScheme } from '../../constants/colors';
import { leafletLayerMap } from '../../store/slices/layers/state';

const ValueTooltipConfig = {
  debug: false,
};

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
      if (ValueTooltipConfig.debug) console.log('Missing tooltip inputs');
      return;
    }

    const { rasterArray, width, height, noDataValue } = layerData.data;
    const scheme = getColorScheme(layer.colorScheme || defaultColorScheme);
    const domain = layer.domain || [valueRange.defaultMin, valueRange.defaultMax];
    const [domainMin, domainMax] = domain;
    const fullRange = domainMax - domainMin;

    const tooltip = L.tooltip({
      permanent: true,
      direction: 'top',
      className: 'value-tooltip',
      offset: [0, -20],
    }).setContent('Move mouse over the map')
      .setLatLng(map.getCenter())
      .addTo(map);
    tooltipRef.current = tooltip;

    const updateTooltip = (e: L.LeafletMouseEvent) => {
      const leafletLayer = leafletLayerMap.get(layerId);
      const img = leafletLayer?.getElement?.() as HTMLImageElement | undefined;
      if (!img) return;

      const bounds = img.getBoundingClientRect();
      const mouse = map.mouseEventToContainerPoint(e.originalEvent);
      const mapContainer = map.getContainer().getBoundingClientRect();

      const offsetX = mouse.x - (bounds.left - mapContainer.left);
      const offsetY = mouse.y - (bounds.top - mapContainer.top);

      const relX = offsetX / bounds.width;
      const relY = offsetY / bounds.height;

      const pixelX = Math.floor(relX * width);
      const pixelY = Math.floor(relY * height);

      const index = pixelY * width + pixelX;
      const value = rasterArray[index];

      let label = '';
      let swatchColor = '';

      const isInvalid =
        index < 0 || index >= rasterArray.length ||
        value === undefined || isNaN(value) || !isFinite(value) ||
        (noDataValue !== null && Math.abs(value - noDataValue) < 1e-10) ||
        value < valueRange.min || value > valueRange.max;

      if (isInvalid) {
        label = 'No data';
        swatchColor = 'rgba(0,0,0,0)';
      } else {
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

      tooltipRef.current?.setContent(renderSwatchContent(`${layerName}: ${label}`, swatchColor));
      tooltipRef.current?.setLatLng(e.latlng);

      if (ValueTooltipConfig.debug) {
        console.log({
          latlng: e.latlng,
          pixelX, pixelY, index, value,
          swatchColor, width, height,
          bounds: { width: bounds.width, height: bounds.height }
        });
      }
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
      <div>${label}</div>
    </div>
  `;
}

export default ValueTooltipControl;
