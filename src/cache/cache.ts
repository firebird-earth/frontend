// src/cache/cache.ts

import { store } from '../store';
import { MapLayer } from '../types/map';
import { findLayer, findLayerByName } from '../store/slices/layersSlice/utils/utils';
import { fetchGeoTiffLayer } from './fetchGeoTiffLayer';
import { fetchArcGISTiffLayer } from './fetchArcGISTiffLayer';
import { LayerType } from '../types/map';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[LayerDataCache]', ...args);
  }
}

// Debug configuration
const LayerDataCacheConfig = {
  debug: true
} as const;

export function setLayerDataCacheDebug(enabled: boolean) {
  (LayerDataCacheConfig as any).debug = enabled;
}

interface CacheEntry<T> {
  data: T;
  metadata: any;
}

class LayerDataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private fetchPromises: Map<string, Promise<CacheEntry<any>>> = new Map();

  public async get<T>(
    key: string,
    boundsOption: 'mapBounds' | 'aoiBufferBounds' = 'mapBounds'
  ): Promise<{ data: T; metadata: any }> {
    log('Request key:', key);

    // First check cache
    const cached = this.cache.get(key);
    if (cached) {
      log('Cache hit for key:', key);
      return cached;
    }

    // Then check for in-flight requests
    const existingPromise = this.fetchPromises.get(key);
    if (existingPromise) {
      log('Reusing in-flight request for key:', key);
      return existingPromise;
    }

    log('Cache miss for key:', key, 'starting fetch');

    // Find layer in store
    const state = store.getState();
    let layer: MapLayer | undefined;
    if (key.includes('-')) {
      const [categoryId, layerId] = key.split('-');
      layer = findLayer(state.layers, categoryId, parseInt(layerId));
    } else {
      layer = findLayerByName(state.layers, key);
    }
    if (!layer) {
      throw new Error(`Layer not found for key: ${key}`);
    }
    log('Found layer key:', key, layer);

    const map = window.leafletMap;
    const mapBounds = map.getBounds();
    log('map bounds:', mapBounds);

    // Access the current aoi from the Redux store
    const currentaoi = store.getState().home.aoi.current;
    const aoiBounds = L.latLngBounds(
      L.latLng(currentaoi.bufferedBounds.minLat, currentaoi.bufferedBounds.minLng),
      L.latLng(currentaoi.bufferedBounds.maxLat, currentaoi.bufferedBounds.maxLng)
    );
    log('aoi bounds:', aoiBounds);

    // choose bounds for fetch
    let fetchBounds;
    if (boundsOption === 'aoiBufferBounds') {
      fetchBounds = aoiBounds;
    } else {
      fetchBounds = mapBounds;
    }
    log('fetch bounds:', fetchBounds);

    // Create fetch promise based on layer type
    let fetchPromise: Promise<CacheEntry<any>>;
    switch (layer.type) {
      case LayerType.GeoTiff:
        fetchPromise = (async () => {
          const [data, metadata] = await fetchGeoTiffLayer(layer!, fetchBounds);
          return { data, metadata };
        })();
        break;

      case LayerType.ArcGISImageService:
        fetchPromise = (async () => {
          const [data, metadata] = await fetchArcGISTiffLayer(layer!, fetchBounds);
          return { data, metadata };
        })();
        break;

      default:
        throw new Error(`Unsupported layer type: ${layer.type}`);
    }

    this.fetchPromises.set(key, fetchPromise);

    try {
      let result = await fetchPromise;

      // Store in cache
      this.cache.set(key, result);
      this.fetchPromises.delete(key);

      log('Cached result for key:', key, result);

      return result;
    } catch (error) {
      this.fetchPromises.delete(key);
      throw error;
    }
  }

  public getSync<T>(key: string): { data: T; metadata: any } {
    const cached = this.cache.get(key);
    return cached;
  }

  public set<T>(key: string, data: T, metadata: any): void {
    this.cache.set(key, { data, metadata });
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public delete(key: string): void {
    this.cache.delete(key);
    this.fetchPromises.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.fetchPromises.clear();
  }
}

export const layerDataCache = new LayerDataCache();
