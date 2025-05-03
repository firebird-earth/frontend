import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { store } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  setLayerBounds,
  setLayerMetadata,
  initLayerValueRange,
  setLayerLegend,
  setLayerLegendInfo,
} from '../../store/slices/layersSlice';
import { MapPane, QueryExpression } from '../../types/map';
import { leafletLayerMap } from '../../store/slices/layersSlice/state';
import { colorizeRasterImage } from '../../utils/colorizeRaster';
import { getColorScheme } from '../../utils/colors';
import { defaultColorScheme } from '../../constants/colors';
import { execExpression } from '../../query/exec';
import { layerDataCache } from '../../cache/cache';
import { hashString } from '../../utils/utils';
import GeoTiffLegend from '../legend/GeoTiffLegend';
import { useLayerOpacity } from '../../hooks/useLayerOpacity';
import { useLayerValueRange } from '../../hooks/useLayerValueRange';
import { findLayerByName } from '../../store/slices/layersSlice/utils/utils';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[QueryLayer]', ...args);
}

// Factory to create a QueryLayer component
export function createQueryLayer(
  categoryId: string,
  config: QueryExpression
) {
  log('Creating query layer:', { categoryId, config });

  const QueryLayerInstance: React.FC<{ active: boolean }> = ({ active }) => (
    <QueryLayer
      active={active}
      expression={config.expression}
      categoryId={config.categoryId}
      layerId={
        config.name ? hashString(config.name + config.expression) : undefined
      }
    />
  );

  return QueryLayerInstance;
}

export interface QueryLayerProps {
  expression: string;
  active: boolean;
  categoryId?: string;
  layerId?: number;
  onError?: (error: Error) => void;
}

const QueryLayer: React.FC<QueryLayerProps> = ({
  expression,
  active,
  categoryId,
  layerId,
  onError,
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const currentAOI = useAppSelector((state) => state.home.aoi.current);
  const mountedRef = useRef(true);
  const layerRef = useRef<L.ImageOverlay | null>(null);
  const opacity = useLayerOpacity(categoryId, layerId);
  const valueRange = useLayerValueRange(categoryId, layerId);

  const lastRasterRef = useRef<any>(null);
  const lastMetaRef = useRef<any>(null);
  const lastSchemeRef = useRef<string>(defaultColorScheme);

  const layer = useAppSelector((state) => {
    if (!categoryId || layerId == null) return;
    const cat = state.layers.categories[categoryId];
    return cat?.layers.find((l) => l.id === layerId);
  });

  const layerOrder = layer?.order ?? 0;

  const cleanup = () => {
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
  };

  const renderOverlay = (
    rasterData: any,
    metadata: any,
    colorSchemeName: string
  ) => {
    const { rasterArray, width, height, noDataValue } = rasterData;
    const schemeObj = getColorScheme(colorSchemeName)!;
    // always use full data range
    const domain: [number, number] = [
      metadata.stats.min,
      metadata.stats.max,
    ];
    const imageData = colorizeRasterImage(
      rasterArray,
      width,
      height,
      noDataValue,
      schemeObj.colors,
      domain,
      valueRange
    );
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL();
    const bounds = L.latLngBounds(
      L.latLng(metadata.leafletBounds[0][0], metadata.leafletBounds[0][1]),
      L.latLng(metadata.leafletBounds[1][0], metadata.leafletBounds[1][1])
    );
    cleanup();
    const overlay = L.imageOverlay(dataUrl, bounds, {
      opacity,
      pane: MapPane.FiremetricsPane,
      className: `${categoryId}-layer`,
      zIndex: layerOrder,
    });
    overlay.addTo(map);
    leafletLayerMap.set(layerId!, overlay);
    layerRef.current = overlay;
  };

  // redraw on slider change, using same full-domain colors
  useEffect(() => {
    if (
      valueRange &&
      lastRasterRef.current &&
      lastMetaRef.current &&
      lastSchemeRef.current
    ) {
      renderOverlay(
        lastRasterRef.current,
        lastMetaRef.current,
        lastSchemeRef.current
      );
    }
  }, [valueRange]);

  useEffect(() => {
    if (!active) {
      mountedRef.current = false;
      cleanup();
      return;
    }
    mountedRef.current = true;

    const cacheKey = `${categoryId}-${layerId}`;
    const cached = layerDataCache.getSync(cacheKey);
    if (cached?.data && cached?.metadata) {
      lastRasterRef.current = cached.data;
      lastMetaRef.current = cached.metadata;
      lastSchemeRef.current = layer.colorScheme.name;
      renderOverlay(cached.data, cached.metadata, layer.colorScheme.name);
      return cleanup;
    }

    (async () => {
      try {
        const result = await execExpression(expression);
        if (!mountedRef.current) return;

        const rasterData = result?.data;
        const metadata = result?.metadata;
        if (!rasterData || !metadata)
          throw new Error('Invalid rasterData or metadata');

        let colorSchemeName = defaultColorScheme;
        if (metadata.isBinary) {
          metadata.stats = { ...metadata.stats, min: 0, max: 1 };
          colorSchemeName = layer.colorScheme.name!;
        } else if (metadata.maskLayerName) {
          const state = store.getState();
          const maskLayer = findLayerByName(
            state.layers,
            metadata.maskLayerName
          );
          colorSchemeName = maskLayer.colorScheme.name;
          dispatch(
            setLayerLegendInfo({
              categoryId: categoryId!,
              layerId: layerId!,
              colorScheme: maskLayer.colorScheme,
              units: maskLayer.units,
            })
          );
          dispatch(
            setLayerLegend({
              categoryId: categoryId!,
              layerId: layerId!,
              legend: maskLayer.legend,
            })
          );
        } else {
          metadata.units = '???';
        }

        dispatch(
          setLayerMetadata({
            categoryId: categoryId!,
            layerId: layerId!,
            metadata,
          })
        );
        dispatch(
          setLayerBounds({
            categoryId: categoryId!,
            layerId: layerId!,
            bounds: metadata.leafletBounds,
          })
        );
        dispatch(
          initLayerValueRange({
            categoryId: categoryId!,
            layerId: layerId!,
            min: metadata.stats.min,
            defaultMin: metadata.stats.min,
            max: metadata.stats.max,
            defaultMax: metadata.stats.max,
          })
        );

        layerDataCache.set(cacheKey, rasterData, metadata);

        lastRasterRef.current = rasterData;
        lastMetaRef.current = metadata;
        lastSchemeRef.current = colorSchemeName;

        renderOverlay(rasterData, metadata, colorSchemeName);
      } catch (err) {
        if (!mountedRef.current) return;
        cleanup();
        if (onError) onError(err as Error);
      }
    })();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [map, active, expression, currentAOI, dispatch, categoryId, layerId, onError, layerOrder]);

  useEffect(() => {
    if (layerRef.current) layerRef.current.setOpacity(opacity);
  }, [opacity]);

  useEffect(() => {
    if (layerRef.current) layerRef.current.setZIndex(layerOrder);
  }, [layerOrder]);

  return null;
};

export default QueryLayer;
