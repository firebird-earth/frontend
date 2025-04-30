import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setLayerBounds, setLayerMetadata, initializeLayerValueRange, setLayerLegendInfo } from '../../store/slices/layers';
import { MapPane, QueryExpression } from '../../types/map';
import { leafletLayerMap } from '../../store/slices/layers/state';
import { colorizeRasterImage } from '../../utils/colorizeRaster';
import { getColorScheme } from '../../utils/colors';
import { defaultColorScheme, defaultColorSchemeBinary } from '../../constants/colors';
import { execExpression } from '../../query/exec';
import { layerDataCache } from '../../cache/cache';
import { hashString } from '../../utils/utils';
import GeoTiffLegend from '../legend/GeoTiffLegend';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[QueryLayer]', ...args);
}

// Factory to create a QueryLayer component
export function createQueryLayer(categoryId: string, config: QueryExpression) {
  log('Creating query layer:', { categoryId, config });

  const QueryLayerInstance: React.FC<{ active: boolean }> = ({ active }) => (
    <QueryLayer
      active={active}
      expression={config.expression}
      categoryId={config.categoryId}
      layerId={config.name ? hashString(config.name + config.expression) : undefined}
    />
  );

  QueryLayerInstance.Legend = () => (
    <GeoTiffLegend
      categoryId={categoryId}
      layerId={config.name ? hashString(config.name + config.expression) : undefined}
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
  const key = `${categoryId}-${layerId}`;
  const zIndex = 0;

  log('QueryLayer render:', { active, expression, categoryId, layerId });

  const cleanup = () => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      leafletLayerMap.delete(key);
      layerRef.current = null;
    }
  };

  useEffect(() => {
    if (!active) {
      mountedRef.current = false;
      cleanup();
      return;
    }

    mountedRef.current = true;

    // helper to draw & overlay
    const renderOverlay = (rasterData: any, metadata: any) => {
      const { rasterArray, width, height, noDataValue } = rasterData;
      const schemeObj = getColorScheme(metadata.colorScheme)!;
      const domain: [number, number] = [metadata.stats.min, metadata.stats.max];
      const imageData = colorizeRasterImage(
        rasterArray,
        width,
        height,
        noDataValue,
        schemeObj.colors,
        domain,
        metadata.stats
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
        opacity: 1,
        zIndex,
        interactive: false,
        pane: MapPane.FiremetricsPane,
        className: `${categoryId}-layer`,
      });
      overlay.addTo(map);
      layerRef.current = overlay;
    };

    // Cache branch
    const cached = layerDataCache.getSync(key);
    if (cached?.data && cached?.metadata) {
      if (!mountedRef.current) return;
      renderOverlay(cached.data, cached.metadata);
      return cleanup;
    }

    // Async branch
    (async () => {
      try {
        const result = await execExpression(expression, currentAOI);
        if (!mountedRef.current) return;

        const rasterData = result?.data;
        const metadata = result?.metadata;
        if (!rasterData || !metadata) throw new Error('Invalid rasterdata or metadata');
        
        if (metadata.isBinary) {
          metadata.colorScheme = defaultColorSchemeBinary;
          metadata.units = 'feasible';
          metadata.stats = {
              ...metadata.stats,
              min: 1,
              max: 1
            };
        } else {
          metadata.colorScheme = defaultColorScheme;
          metadata.units = '???';
        }

        renderOverlay(rasterData, metadata);
        
        layerDataCache.set(key, rasterData, metadata);
        
        dispatch(setLayerLegendInfo({ categoryId, layerId, colorScheme: metadata.colorScheme, units: metadata.units }));
        dispatch(setLayerBounds({ categoryId, layerId, bounds: metadata.leafletBounds }));
        dispatch(setLayerMetadata({ categoryId, layerId, metadata }));
        dispatch(
          initializeLayerValueRange({
            categoryId,
            layerId,
            min: metadata.stats.min,
            defaultMin: metadata.stats.min,
            max: metadata.stats.max,
            defaultMax: metadata.stats.max,
          })
        );
      } catch (err) {
        if (!mountedRef.current) return;
        log('Error in QueryLayer:', err);
        cleanup();
        if (onError) onError(err as Error);
      }
    })();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [map, active, expression, currentAOI, dispatch, categoryId, layerId, onError]);

  return null;
};

export default QueryLayer;
