import { RasterData } from '../../types/geotiff';

// Global cache for raster data
class RasterDataCache {
  private static instance: RasterDataCache;
  private cache: Map<string, RasterData> = new Map();

  private constructor() {}

  public static getInstance(): RasterDataCache {
    if (!RasterDataCache.instance) {
      RasterDataCache.instance = new RasterDataCache();
    }
    return RasterDataCache.instance;
  }

  public set(key: string, data: RasterData): void {
    this.cache.set(key, data);
  }

  public get(key: string): RasterData | undefined {
    return this.cache.get(key);
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const rasterDataCache = RasterDataCache.getInstance();