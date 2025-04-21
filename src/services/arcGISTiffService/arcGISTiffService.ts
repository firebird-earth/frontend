import * as GeoTIFF from 'geotiff';
import { ArcGISTiffCache, ArcGISTiffServiceConfig, ArcTiffExportParams } from './types';
import { validateTiff } from './validation';
import { GeoTiffMetadata } from '../../types/geotiff';
import { extractGeoTiffMetadata } from '../geotiffService/metadata';

// Debug configuration
const ArcGISTiffServiceConfig: ArcGISTiffServiceConfig = {
  debug: false
};

export function setArcGISTiffServiceDebug(enabled: boolean) {
  ArcGISTiffServiceConfig.debug = enabled;
}

class ArcGISTiffService {
  private static instance: ArcGISTiffService;
  private cache: Map<string, ArcGISTiffCache> = new Map();
  private loadingPromises: Map<string, Promise<ArcGISTiffCache>> = new Map();

  private constructor() {}

  public static getInstance(): ArcGISTiffService {
    if (!ArcGISTiffService.instance) {
      ArcGISTiffService.instance = new ArcGISTiffService();
    }
    return ArcGISTiffService.instance;
  }

  public getCache(): Map<string, ArcGISTiffCache> {
    return this.cache;
  }

  public validateTiff(arrayBuffer: ArrayBuffer): void {
    validateTiff(arrayBuffer);
  }

  public async getTiffData(
    exportUrl: string,
    params: Partial<ArcTiffExportParams>,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    const cacheKey = `${exportUrl}?${new URLSearchParams(params as any).toString()}`;

    // Check if we're already loading this URL
    if (this.loadingPromises.has(cacheKey)) {
      if (ArcGISTiffServiceConfig.debug) {
        console.log('Reusing existing loading promise for:', cacheKey);
      }
      const cachedPromise = this.loadingPromises.get(cacheKey)!;
      const result = await cachedPromise;
      return result.arrayBuffer!;
    }

    // Check if we have a cached version
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached.arrayBuffer) {
        if (ArcGISTiffServiceConfig.debug) {
          console.log('Using cached TIFF data for:', cacheKey);
        }
        return cached.arrayBuffer;
      }
    }

    // Create a new loading promise
    const loadingPromise = this.fetchAndCacheTiff(exportUrl, params, onProgress);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      return result.arrayBuffer!;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  public async getTiffMetadata(
    exportUrl: string,
    params: Partial<ArcTiffExportParams>,
    onProgress?: (progress: number) => void
  ): Promise<GeoTiffMetadata> {
    const cacheKey = `${exportUrl}?${new URLSearchParams(params as any).toString()}`;

    // Check if we're already loading this URL
    if (this.loadingPromises.has(cacheKey)) {
      if (ArcGISTiffServiceConfig.debug) {
        console.log('Reusing existing loading promise for metadata:', cacheKey);
      }
      const cachedPromise = this.loadingPromises.get(cacheKey)!;
      const result = await cachedPromise;
      return result.metadata!;
    }

    // Check if we have a cached version with metadata
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached.metadata) {
        if (ArcGISTiffServiceConfig.debug) {
          console.log('Using cached TIFF metadata for:', cacheKey);
        }
        return cached.metadata;
      }
    }

    // Create a new loading promise if needed
    if (!this.loadingPromises.has(cacheKey)) {
      const loadingPromise = this.fetchAndCacheTiff(exportUrl, params, onProgress);
      this.loadingPromises.set(cacheKey, loadingPromise);
    }

    try {
      const result = await this.loadingPromises.get(cacheKey)!;
      return result.metadata!;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  private async fetchAndCacheTiff(
    exportUrl: string,
    params: Partial<ArcTiffExportParams>,
    onProgress?: (progress: number) => void
  ): Promise<ArcGISTiffCache> {
    if (ArcGISTiffServiceConfig.debug) {
      console.log('Fetching TIFF data for:', exportUrl, params);
    }

    try {
      // Build URL with params
      const url = `${exportUrl}?${new URLSearchParams(params as any).toString()}`;

      // Fetch the TIFF data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch TIFF: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && contentLength) {
          onProgress(Math.round((receivedLength / contentLength) * 100));
        }
      }

      // Combine chunks into array buffer
      const arrayBuffer = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        arrayBuffer.set(chunk, position);
        position += chunk.length;
      }

      // Validate and process TIFF
      validateTiff(arrayBuffer.buffer);

      // Extract metadata
      const file = new File([arrayBuffer], 'temp.tif', {
        type: 'image/tiff',
        lastModified: Date.now()
      });

      const metadata = await extractGeoTiffMetadata(file);

      // Cache the result
      const cacheEntry: ArcGISTiffCache = {
        arrayBuffer: arrayBuffer.buffer,
        metadata
      };

      const cacheKey = `${exportUrl}?${new URLSearchParams(params as any).toString()}`;
      this.cache.set(cacheKey, cacheEntry);

      if (ArcGISTiffServiceConfig.debug) {
        console.log('TIFF data and metadata cached for:', cacheKey);
      }

      return cacheEntry;
    } catch (error) {
      if (ArcGISTiffServiceConfig.debug) {
        console.error('Failed to fetch and cache TIFF:', error);
      }
      throw error;
    }
  }

  public clearCache(): void {
    this.cache.clear();
    if (ArcGISTiffServiceConfig.debug) {
      console.log('TIFF cache cleared');
    }
  }
}

export const arcGISTiffService = ArcGISTiffService.getInstance();