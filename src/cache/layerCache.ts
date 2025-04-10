// src/cache/layerCache.ts

import { store } from '../store';
import { MapLayer } from '../types/map';

interface CacheEntry<T> {
  data: T;
  metadata: any;
}

class LayerCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private fetchPromises: Map<string, Promise<CacheEntry<any>>> = new Map();

  public async get<T>(
    key: string
  ): Promise<{ data: T; metadata: any }> {
    console.log(`[LayerCache] Request for layer: ${key}`);

    // First check cache
    const cached = this.cache.get(key);
    if (cached) {
      console.log(`[LayerCache] Cache hit for: ${key}`);
      return cached;
    }

    // Then check for in-flight requests
    const existingPromise = this.fetchPromises.get(key);
    if (existingPromise) {
      console.log(`[LayerCache] Reusing in-flight request for: ${key}`);
      return existingPromise;
    }

    console.log(`[LayerCache] Cache miss for: ${key}, starting fetch`);

    // Find layer in store
    const state = store.getState();
    let layer: MapLayer | undefined;

    for (const categoryId in state.layers.categories) {
      const foundLayer = state.layers.categories[categoryId].layers.find(l => l.name === key);
      if (foundLayer) {
        layer = foundLayer;
        break;
      }
    }

    if (!layer) {
      throw new Error(`Layer not found for key: ${key}`);
    }

    // Create fetch promise based on layer type
    let fetchPromise;
    switch (layer.type) {
      case 'geoTiff':
        fetchPromise = (async () => {
          console.log(`[LayerCache] Starting GeoTIFF fetch for: ${key}`);
          const startTime = Date.now();
          const { geotiffService } = await import('../services/geotiffService/geotiffService');
          const [data, metadata] = await Promise.all([
            geotiffService.getLayerData(layer),
            geotiffService.getLayerMetadata(layer)
          ]);
          console.log(`[LayerCache] Completed GeoTIFF fetch for: ${key} in ${Date.now() - startTime}ms`);
          return { data, metadata };
        })();
        break;

      case 'arcgisFeatureService':
        fetchPromise = (async () => {
          console.log(`[LayerCache] Starting Feature Service fetch for: ${key}`);
          const startTime = Date.now();
          const { arcgisFeatureService } = await import('../services/maps/services');
          const [data, metadata] = await Promise.all([
            arcgisFeatureService.getLayerData(layer),
            arcgisFeatureService.getLayerMetadata(layer)
          ]);
          console.log(`[LayerCache] Completed Feature Service fetch for: ${key} in ${Date.now() - startTime}ms`);
          return { data, metadata };
        })();
        break;

      case 'tileLayer':
        fetchPromise = (async () => {
          console.log(`[LayerCache] Starting Tile Layer fetch for: ${key}`);
          const startTime = Date.now();
          const { tileService } = await import('../services/maps/services');
          const [data, metadata] = await Promise.all([
            tileService.getLayerData(layer),
            tileService.getLayerMetadata(layer)
          ]);
          console.log(`[LayerCache] Completed Tile Layer fetch for: ${key} in ${Date.now() - startTime}ms`);
          return { data, metadata };
        })();
        break;

      case 'arcgisImageService':
        fetchPromise = (async () => {
          console.log(`[LayerCache] Starting Image Service fetch for: ${key}`);
          const startTime = Date.now();
          const { arcgisImageService } = await import('../services/maps/services');
          const [data, metadata] = await Promise.all([
            arcgisImageService.getLayerData(layer),
            arcgisImageService.getLayerMetadata(layer)
          ]);
          console.log(`[LayerCache] Completed Image Service fetch for: ${key} in ${Date.now() - startTime}ms`);
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

      console.log(`[LayerCache] Cached result for: ${key}`);
      return result;
    } catch (error) {
      // Clean up on error
      this.fetchPromises.delete(key);
      throw error;
    }
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

export const layerCache = new LayerCache();