// src/cache/cache.ts

import { store } from '../store';
import { MapLayer } from '../types/map';
import { findLayer, findLayerByName } from '../store/slices/layers/utils/utils';
import { fetchGeoTiffLayer } from './fetchGeoTiffLayer';
import { fetchArcGISTiffLayer } from './fetchArcGISTiffLayer';
import { LayerType } from '../types/map';
import { store } from '../store'; 

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
    useAOIBounds: boolean = false
  ): Promise<{ data: T; metadata: any }> {
    if (LayerDataCacheConfig.debug) {
      console.log(`[LayerDataCache] Request key: ${key}`);
    }

    // First check cache
    const cached = this.cache.get(key);
    if (cached) {
      if (LayerDataCacheConfig.debug) {
        console.log(`[LayerDataCache] Cache hit for key: ${key}`);
      }
      return cached;
    }

    // Then check for in-flight requests
    const existingPromise = this.fetchPromises.get(key);
    if (existingPromise) {
      if (LayerDataCacheConfig.debug) {
        console.log(`[LayerDataCache] Reusing in-flight request for key: ${key}`);
      }
      return existingPromise;
    }

    if (LayerDataCacheConfig.debug) {
      console.log(`[LayerDataCache] Cache miss for key: ${key}, starting fetch`);
    }

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
    if (LayerDataCacheConfig.debug) {
      console.log(`found layer key: ${key}`, layer);
    }

    const map = window.leafletMap;
    const mapBounds = map.getBounds();
    if (LayerDataCacheConfig.debug) {    
      console.log('[layerDataCache] map bounds:', mapBounds)
    }
    
    // Access the current AOI from the Redux store
    const currentAOI = store.getState().home.aoi.current;
    const aoiBounds = L.latLngBounds(
      L.latLng(currentAOI.bufferedBounds.minLat, currentAOI.bufferedBounds.minLng),
      L.latLng(currentAOI.bufferedBounds.maxLat, currentAOI.bufferedBounds.maxLng)
    );   
    if (LayerDataCacheConfig.debug) {   
      console.log('[layerDataCache] aoi bounds:', aoiBounds)
    }
    
    let bounds = useAOIBounds ? aoiBounds : mapBounds
    if (LayerDataCacheConfig.debug) {   
      console.log('[layerDataCache] bounds:', bounds)
    }
    
    // Create fetch promise based on layer type
    let fetchPromise;
    switch (layer.type) {
      case LayerType.GeoTiff:
        fetchPromise = (async () => {
          const [data, metadata] = await fetchGeoTiffLayer(layer!, bounds);
          return { data, metadata };
        })();
        break;

       case LayerType.ArcGISImageService:
        fetchPromise = (async () => {
          const [data, metadata] = await fetchArcGISTiffLayer(layer!, bounds);
          return { data, metadata };
        })();
        break;

      case LayerType.ArcGISFeatureService:
        fetchPromise = (async () => {
          const [data, metadata] = await fetchArcGISFeatureLayer(layer!, bounds);
          return { data, metadata };
        })();
        break;

      default:
        throw new Error(`Unsupported layer type: ${layer.type}`);
    }

    // Store the promise in the fetchPromises map
    this.fetchPromises.set(key, fetchPromise);

    try {
      // Await the result
      const result = await fetchPromise;

      // Store in cache
      this.cache.set(key, result);

      // Clean up the fetch promise
      this.fetchPromises.delete(key);

      if (LayerDataCacheConfig.debug) {
        console.log(`[LayerDataCache] Cached result for key: ${key}`, result);
      }
      
      return result;
    } catch (error) {
      // Clean up on error
      this.fetchPromises.delete(key);
      throw error;
    }
  }

  public getSync<T>(key: string): { data: T; metadata: any } {
    const cached = this.cache.get(key);
    if (!cached) {
      throw new Error(`No cached data found for key: ${key}`);
    }
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
