import L from 'leaflet';
import { store } from '../../store';
import { RasterData, GeoTiffMetadata } from '../../types/geotiff';
import { ASTNode, ASTNodeMap, LayerNode } from '../parser';
import { clipRasterToBounds, isGeospatiallyAligned } from '../../raster/alignRaster';
import { buildReferenceRaster } from '../../raster/referenceRaster';
import { reprojectRaster } from './reprojectRaster';
import { collectRasterFns, collectLayerNames } from './collectASTLayers';
import { alignRasters } from './alignRasters';
import { walkAST } from './walkAST';
import { fetchAndRasterizeLayers } from './fetchLayers';
import { RESOLUTION, NODATA_VALUE } from '../../globals';
import { validateMetadata } from '../../services/geotiffService/validateMetadata';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[Binder]', ...args);
}

export interface Vector {}
export interface BoundLayerNode extends LayerNode {
  source?: RasterData | (Vector & { metadata?: GeoTiffMetadata });
  sourceType?: 'raster' | 'vector';
  error?: Error;
}
export interface LayerDataCache {
  get(name: string, boundsOption?: string): Promise<any>;
}

export async function bindLayers(
  ast: ASTNode | ASTNodeMap,
  cache: LayerDataCache,
  onProgress?: (layerName: string) => void
): Promise<ASTNode | ASTNodeMap> {

  log('start bindLayers');
  
  // 1. Collect functions and layer names
  const neededFnsByLayer = collectRasterFns(ast);
  const layerNames = collectLayerNames(ast);

  // 2. Fetch and rasterize initial layers
  const { layerResults, rasterizedResults } =
    await fetchAndRasterizeLayers(layerNames, cache, neededFnsByLayer, onProgress);

  // 2a. Await rasterized results and merge into layerResults
  const rasterizedData = new Map<string, RasterData>();
  for (const [key, promise] of rasterizedResults.entries()) {
    const rasterData = await promise;
    rasterizedData.set(key, rasterData);
    layerResults.set(key, rasterData);
  }
  log('Merged layerResults:', layerResults);

  // 3. Pick the smallest raster as reference
  let referenceRaster: RasterData | undefined;
  for (const entry of layerResults.values()) {
    const rasterData = entry as RasterData;
    if (!rasterData?.rasterArray || !rasterData.metadata?.rawBounds) continue;
    const size = rasterData.width * rasterData.height;
    if (!referenceRaster || size < referenceRaster.width * referenceRaster.height) {
      referenceRaster = rasterData;
    }
  }
  if (!referenceRaster) {
    throw new Error('No raster layers found to bind.');
  }
  log('Reference raster size', referenceRaster.width, 'x', referenceRaster.height);
  validateMetadata(referenceRaster.metadata);
  
  // 4. Build reference raster
  const { rawBounds, resolution, projection } = referenceRaster.metadata;
  const refNoData = referenceRaster.noDataValue ?? NODATA_VALUE;
  const referenceGrid = buildReferenceRaster(rawBounds, resolution.x, projection.sourceCRS, refNoData);

  // 5. Reproject and align all layers to reference grid
  for (const [name, entry] of layerResults.entries()) {
    const rasterData = entry as RasterData;
    const m = rasterData.metadata;
    validateMetadata(m);
    if (
      m.projection.sourceCRS !== referenceGrid.metadata.projection.sourceCRS ||
      rasterData.width !== referenceGrid.width ||
      rasterData.height !== referenceGrid.height ||
      m.resolution.x !== referenceGrid.metadata.resolution.x ||
      m.resolution.y !== referenceGrid.metadata.resolution.y
    ) {
      log(`Reprojecting layer ${name} to reference grid`);
      const reprojected = await reprojectRaster(rasterData, referenceGrid);
      layerResults.set(name, reprojected);
    }
  }

  // 6. Align all the rasters.
  alignRasters(layerResults as Map<string, RasterData>, referenceGrid);

  // 7. Log final results
  log('Final layerResults:', layerResults);
  log('Final rasterizedResults:', rasterizedData);

  // 8. Walk AST
  return await walkAST(ast as ASTNode, layerResults, rasterizedData);
}
