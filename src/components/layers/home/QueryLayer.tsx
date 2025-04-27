import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { addLayer } from '../../../store/slices/layers/actions';
import { LayerType, MapPane, QueryExpression } from '../../../types/map';
import { paneCounters, leafletLayerMap } from '../../../store/slices/layers/state';
import { colorizeRasterImage } from '../../../utils/colorizeRaster';
import { getColorScheme } from '../../../utils/colors';
import { defaultColorScheme } from '../../../constants/colors';
import { execExpression } from '../../../query/exec';
import { layerDataCache } from '../../../cache/cache';
import { hashString } from '../../../utils/utils';
import { store } from '../../../store';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[QueryLayer]', ...args);
  }
}

interface QueryLayerProps {
  active: boolean;
  scenario: QueryExpression;
}

export function createQueryLayer(categoryId: string, config: QueryExpression) {
  log('Creating query layer dynamically:', { categoryId, config });

  const QueryLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    return (
      <QueryLayer
        active={active}
        scenario={config}
      />
    );
  };

  QueryLayerInstance.displayName = `${config.name}Layer`;
  return QueryLayerInstance;
}

const QueryLayer: React.FC<QueryLayerProps> = ({ active, scenario }) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const mountedRef = useRef<boolean>(true);
  const layerKey = `scenario-${scenario.name}-${hashString(scenario.expression)}`;
  const layerRef = useRef<L.ImageOverlay | null>(null);

  log('QueryLayer render:', { active, scenario, layerKey });

  // Cleanup function
  const cleanup = () => {
    log('Running cleanup');
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      leafletLayerMap.delete(layerKey);
      layerRef.current = null;
    }
  };

  // Handle active state changes
  useEffect(() => {
    if (!active) {
      cleanup();
      return;
    }

    mountedRef.current = true;

    const createLeafletLayer = (rasterData: any, metadata: any) => {
      const { rasterArray, width, height, noDataValue } = rasterData;
      const scheme = getColorScheme(defaultColorScheme);
      if (!scheme) {
        throw new Error('Failed to get color scheme');
      }

      const imageData = colorizeRasterImage(
        rasterArray,
        width,
        height,
        noDataValue,
        scheme.colors,
        [metadata.stats.min, metadata.stats.max],
        {
          min: metadata.stats.min,
          max: metadata.stats.max,
          defaultMin: metadata.stats.min,
          defaultMax: metadata.stats.max
        }
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL();

      const bounds = L.latLngBounds(
        L.latLng(metadata.leafletBounds[0][0], metadata.leafletBounds[0][1]),
        L.latLng(metadata.leafletBounds[1][0], metadata.leafletBounds[1][1])
      );

      cleanup(); // Clean up any existing layer before creating new one

      const imageOverlay = L.imageOverlay(dataUrl, bounds, {
        opacity: 1,
        interactive: false,
        pane: MapPane.ScenariosPane,
        className: 'scenario-layer'
      });

      imageOverlay.addTo(map);
      layerRef.current = imageOverlay;
      leafletLayerMap.set(layerKey, imageOverlay);

      log('Canvas overlay added to map');
    };

    const loadLayer = async () => {
      try {
        if (layerDataCache.has(layerKey)) {
          log('Scenario already cached, loading from cache');
          const { data, metadata } = layerDataCache.getSync(layerKey);
          createLeafletLayer(data, metadata);
          return;
        }

        log('No cached scenario layer, executing expression');

        const result = await execExpression(scenario.expression);
        if (!mountedRef.current) {
          log('Component unmounted during load, aborting');
          return;
        }

        const rasterData = result.data;
        const metadata = result.metadata;
        if (!rasterData || !metadata) {
          log('Invalid raster data or metadata');
          return;
        }

        createLeafletLayer(rasterData, metadata);
        layerDataCache.set(layerKey, rasterData, metadata);

        // Add to Redux if not already present
        const state = store.getState();
        const alreadyExists = state.layers.categories.scenarios.layers.some(l => l.name === scenario.name);

        if (!alreadyExists) {
          const newLayer = {
            id: hashString(`${scenario.name}-${scenario.expression}`),
            name: scenario.name,
            type: LayerType.Raster,
            source: '',
            active: true,
            pane: MapPane.ScenariosPane,
            metadata,
            order: ++paneCounters[MapPane.ScenariosPane],
            colorScheme: defaultColorScheme,
            valueRange: {
              min: metadata.stats.min,
              max: metadata.stats.max,
              defaultMin: metadata.stats.min,
              defaultMax: metadata.stats.max
            }
          };

          dispatch(addLayer({
            categoryId: 'scenarios',
            layer: newLayer
          }));

          log(`Dispatched addLayer for scenario: ${scenario.name}`);
        }

      } catch (error) {
        log('Error loading scenario layer:', error);
      }
    };

    loadLayer();

    return () => {
      log('Cleanup effect running');
      mountedRef.current = false;
      cleanup();
    };
  }, [map, active, scenario, dispatch, layerKey]);

  return null;
};

export default QueryLayer;
