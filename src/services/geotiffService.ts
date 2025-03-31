import * as GeoTIFF from 'geotiff';
import { loadGeoTiffFromUrl, validateGeoTiff, extractGeoTiffMetadata } from '../utils/geotif/utils';
import { GeoTiffMetadata } from '../utils/geotif/types';

interface GeoTiffCache {
  arrayBuffer?: ArrayBuffer;
  metadata?: GeoTiffMetadata;
  lastFetched: number;
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

  public async getGeoTiffData(url: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer> {
    // Check if we're already loading this URL
    if (this.loadingPromises.has(url)) {
      const cachedPromise = this.loadingPromises.get(url)!;
      const result = await cachedPromise;
      return result.arrayBuffer!;
    }

    // Check if we have a cached version
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      
      // If the cache is less than 5 minutes old, use it
      if (cached.arrayBuffer && Date.now() - cached.lastFetched < 5 * 60 * 1000) {
        console.log('Using cached GeoTIFF data for:', url);
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
      const cachedPromise = this.loadingPromises.get(url)!;
      const result = await cachedPromise;
      return result.metadata!;
    }

    // Check if we have a cached version with metadata
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      
      // If the cache is less than 5 minutes old and has metadata, use it
      if (cached.metadata && Date.now() - cached.lastFetched < 5 * 60 * 1000) {
        console.log('Using cached GeoTIFF metadata for:', url);
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
    console.log('Fetching GeoTIFF data for:', url);
    
    try {
      // Load the GeoTIFF data
      const arrayBuffer = await loadGeoTiffFromUrl(url, onProgress);
      validateGeoTiff(arrayBuffer);

      // Extract metadata
      console.log('Extracting metadata from GeoTIFF');
      const file = new File([arrayBuffer], 'temp.tif', { 
        type: 'image/tiff',
        lastModified: Date.now()
      });
      
      const metadata = await extractGeoTiffMetadata(file);

      // Cache the result
      const cacheEntry: GeoTiffCache = {
        arrayBuffer,
        metadata,
        lastFetched: Date.now()
      };
      
      this.cache.set(url, cacheEntry);
      console.log('GeoTIFF data and metadata cached for:', url);
      
      return cacheEntry;
    } catch (error) {
      console.error('Failed to fetch and cache GeoTIFF:', error);
      throw error;
    }
  }

  public clearCache(): void {
    this.cache.clear();
    console.log('GeoTIFF cache cleared');
  }
}

export const geotiffService = GeoTiffService.getInstance();