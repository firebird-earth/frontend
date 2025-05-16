// fetchLayers.ts
import { LayerDataCache } from './binder';
import { RasterData } from '../../types/geotiff';
import { buildReferenceRasterFromMetadata } from '../../raster/referenceRaster';
import { rasterizeInWorker } from '../../rasterize/rasterizeInWorker';
import { NODATA_VALUE } from '../../globals';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[Binder:fetchLayers]', ...args);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAndRasterizeLayers(
  layerNames: Set<string>,
  cache: LayerDataCache,
  neededFnsByLayer: Map<string, Set<string>>,
  onProgress?: (layerName: string) => void
): Promise<{
  layerResults: Map<string, RasterData & any>;
  rasterizedResults: Map<string, Promise<RasterData>>;
}> {
  const layerResults = new Map<string, RasterData & any>();
  const rasterizedResults = new Map<string, Promise<RasterData>>();

  for (const name of layerNames) {
    let attempts = 0;
    let resolved: any;
    while (attempts < 2) {
      try {
        // Explicitly extract data & metadata from cache entry
        const layerEntry = await cache.get(name, 'aoiBufferBounds');
        log('fetched layer:', name, layerEntry);
        const data = (layerEntry as any).data as any;
        const metadata = (layerEntry as any).metadata;

        // Build resolved RasterData-like object, preserving optional features
        resolved = {
          rasterArray: data.rasterArray,
          width: data.width,
          height: data.height,
          noDataValue: data.noDataValue ?? NODATA_VALUE,
          features: data.features,  // may be undefined for rasters
          metadata,
        };

        log('resolved layer:', resolved);
        
        break;
      } catch (err) {
        attempts++;
        console.error(
          `[Binder:fetchLayers] Failed to fetch layer "${name}" (attempt ${attempts})`,
          err
        );
        if (attempts >= 2) throw err;
        await delay(500);
      }
    }

    layerResults.set(name, resolved);
    onProgress?.(name);

    // Schedule rasterization for vector layers
    if (Array.isArray(resolved.features)) {
      const featureMeta = resolved.metadata as any;
      const refMeta = buildReferenceRasterFromMetadata(featureMeta).metadata;
      const needed = neededFnsByLayer.get(name) || new Set<string>();
      for (const fn of needed) {
        const id = `__${fn}_${name}`;
        if (!rasterizedResults.has(id)) {
          log('scheduling rasterize fn', fn, 'for layer', name);
          rasterizedResults.set(
            id,
            rasterizeInWorker(fn, name, resolved, refMeta)
          );
        }
      }
    }
  }

  return { layerResults, rasterizedResults };
}
