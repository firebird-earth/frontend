import * as GeoTIFF from 'geotiff';
import { loadGeoTiffFromUrl, validateGeoTiff, extractGeoTiffMetadata } from './utils';
import { GeoTiffMetadata } from '../../types/geotiff';
import { MapLayer } from '../../types/map';

// Debug configuration
const GeoTiffServiceConfig = {
  debug: false
} as const;

export function setGeoTiffServiceDebug(enabled: boolean) {
  (GeoTiffServiceConfig as any).debug = enabled;
}

interface GeoTiffCache {
  arrayBuffer?: ArrayBuffer;
  metadata?: GeoTiffMetadata;
}

class GeoTiffService {
  private static instance: GeoTiffService;
  private cache: Map<string, GeoTiffCache> = new Map();
  private loadingPromises: Map<string, Promise<GeoTiffCache>> = new Map();

  private constructor() {}

  public static getInstance(): GeoTiffService {
    if (!GeoTiffService.instance) {
      GeoTiffService.instance = new GeoTiffService();
    }
    return GeoTiffService.instance;
  }

  public getCache(): Map<string, GeoTiffCache> {
    return this.cache;
  }

  public validateGeoTiff(arrayBuffer: ArrayBuffer): void {
    validateGeoTiff(arrayBuffer);
  }

  public async getGeoTiffData(url: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer> {
    // Check if we're already loading this URL
    if (this.loadingPromises.has(url)) {
      if (GeoTiffServiceConfig.debug) {
        console.log('Reusing existing loading promise for:', url);
      }
      const cachedPromise = this.loadingPromises.get(url)!;
      const result = await cachedPromise;
      return result.arrayBuffer!;
    }

    // Check if we have a cached version
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      if (cached.arrayBuffer) {
        if (GeoTiffServiceConfig.debug) {
          console.log('Using cached GeoTIFF data for:', url);
        }
        return cached.arrayBuffer;
      }
    }

    // Create a new loading promise
    const loadingPromise = this.fetchAndCacheGeoTiff(url, onProgress);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const result = await loadingPromise;
      return result.arrayBuffer!;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(url);
    }
  }

  public async getGeoTiffMetadata(url: string, onProgress?: (progress: number) => void): Promise<GeoTiffMetadata> {
    // Check if we're already loading this URL
    if (this.loadingPromises.has(url)) {
      if (GeoTiffServiceConfig.debug) {
        console.log('Reusing existing loading promise for metadata:', url);
      }
      const cachedPromise = this.loadingPromises.get(url)!;
      const result = await cachedPromise;
      return result.metadata!;
    }

    // Check if we have a cached version with metadata
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      if (cached.metadata) {
        if (GeoTiffServiceConfig.debug) {
          console.log('Using cached GeoTIFF metadata for:', url);
        }
        return cached.metadata;
      }
    }

    // Create a new loading promise if needed
    if (!this.loadingPromises.has(url)) {
      const loadingPromise = this.fetchAndCacheGeoTiff(url, onProgress);
      this.loadingPromises.set(url, loadingPromise);
    }

    try {
      const result = await this.loadingPromises.get(url)!;
      return result.metadata!;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(url);
    }
  }

  private async fetchAndCacheGeoTiff(url: string, onProgress?: (progress: number) => void): Promise<GeoTiffCache> {
    if (GeoTiffServiceConfig.debug) {
      console.log('Fetching GeoTIFF data for:', url);
    }
    
    try {
      // Load and process GeoTIFF
      const arrayBuffer = await loadGeoTiffFromUrl(url, onProgress);
      validateGeoTiff(arrayBuffer);

      // Extract metadata
      if (GeoTiffServiceConfig.debug) {
        console.log('Extracting metadata from GeoTIFF');
      }
      const file = new File([arrayBuffer], 'temp.tif', { 
        type: 'image/tiff',
        lastModified: Date.now()
      });
      
      const metadata = await extractGeoTiffMetadata(file);

      // Cache the result
      const cacheEntry: GeoTiffCache = {
        arrayBuffer,
        metadata
      };
      
      this.cache.set(url, cacheEntry);
      if (GeoTiffServiceConfig.debug) {
        console.log('GeoTIFF data and metadata cached for:', url);
      }
      
      return cacheEntry;
    } catch (error) {
      if (GeoTiffServiceConfig.debug) {
        console.error('Failed to fetch and cache GeoTIFF:', error);
      }
      throw error;
    }
  }

  public clearCache(): void {
    this.cache.clear();
    if (GeoTiffServiceConfig.debug) {
      console.log('GeoTIFF cache cleared');
    }
  }
}

export const geotiffService = GeoTiffService.getInstance();
