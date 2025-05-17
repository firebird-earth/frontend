// fetchLayers.ts
import { LayerDataCache } from './binder';
import { RasterData } from '../../types/geotiff';
import { buildReferenceRasterFromMetadata } from '../../raster/referenceRaster';
import { rasterizeInWorker } from '../../rasterize/rasterizeInWorker';
import { NODATA_VALUE } from '../../globals';
import { validateMetadata } from '../../services/geotiffService/validateMetadata';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[Binder:fetchLayers]', ...args);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface RasterTask {
  id: string;
  task: Promise<RasterData>;
}

/**
 * Fetch a single layer and schedule any vector-to-raster tasks.
 */
async function processLayer(
  name: string,
  cache: LayerDataCache,
  neededFns: Set<string>,
  onProgress?: (layerName: string) => void
): Promise<{ resolved: RasterData & any; rasterTasks: RasterTask[] }> {
  let attempts = 0;
  let resolved: any;
  while (attempts < 2) {
    try {
      // Get raw entry from cache
      const layerEntry = await cache.get(name, 'aoiBufferBounds');
      log('fetched layer:', name, layerEntry);

      // Extract data & metadata
      const data = (layerEntry as any).data as any;
      const metadata = (layerEntry as any).metadata;
      validateMetadata(metadata);
      
      // Build unified rasterData object, preserving optional features
      resolved = {
        rasterArray: data.rasterArray,
        width: data.width,
        height: data.height,
        noDataValue: data.noDataValue ?? NODATA_VALUE,
        features: data.features,   // undefined for pure rasters
        metadata,
      };
      log('resolved layer:', name, resolved);

      onProgress?.(name);
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

  // Prepare rasterization tasks for vector layers
  const rasterTasks: RasterTask[] = [];
  if (Array.isArray((resolved as any).features)) {
    const featureMeta = resolved.metadata as any;
    const refMeta = buildReferenceRasterFromMetadata(featureMeta).metadata;
    validateMetadata(refMeta);
    for (const fn of neededFns) {
      const id = `__${fn}_${name}`;
      const task = rasterizeInWorker(fn, name, resolved, refMeta);
      rasterTasks.push({ id, task });
    }
  }

  return { resolved, rasterTasks };
}

/**
 * Fetches all layers and their vector-to-raster tasks.
 */
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

  await Promise.all(
    Array.from(layerNames).map(async (name) => {
      const neededFns = neededFnsByLayer.get(name) || new Set<string>();
      const { resolved, rasterTasks } = await processLayer(
        name,
        cache,
        neededFns,
        onProgress
      );
      layerResults.set(name, resolved);
      for (const { id, task } of rasterTasks) {
        if (!rasterizedResults.has(id)) {
          log('scheduling rasterize for layer:', id);
          rasterizedResults.set(id, task);
        }
      }
    })
  );

  return { layerResults, rasterizedResults };
}
