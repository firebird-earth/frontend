/**
 * Rasterizes a vector layer based on the function context.
 * Supports: mask, within, label, category, distance_to, edge, buffer, intersect
 */

import * as turf from '@turf/turf';
import { Vector } from '../query/binder';
import { GeoTiffMetadata, RasterData } from '../types/geotiff';
import { computeEdgeRaster } from './edgeRaster';
import { computeDistanceRaster } from './distanceRaster';
import { computeWithinRaster } from './withinRaster';
import { computeLabelRaster } from './labelRaster';
import { computeCategoryRaster } from './categoryRaster';
import { computeBufferRaster } from './bufferRaster';
import { computeIntersectRaster } from './intersectRaster';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[Rasterize]', ...args);
}

export interface Raster extends RasterData {
  metadata?: GeoTiffMetadata;
}

export async function rasterizeVectorFunction(
  fnName: string,
  layerName: string,
  vectorData: Vector,
  referenceMetadata?: GeoTiffMetadata,
  attributeField?: string
): Promise<Raster> {
  console.debug(`[Rasterizer] ${fnName}(${layerName})`);
  const start = performance.now();

  const width  = referenceMetadata?.width  ?? 256;
  const height = referenceMetadata?.height ?? 256;
  const total  = width * height;

  let originX    = 0;
  let originY    = 0;
  let pixelWidth = 1;
  let pixelHeight= -1;

  if (referenceMetadata) {
    const [minX_, , , maxY_] = referenceMetadata.rawBounds;
    originX    = minX_;
    originY    = maxY_;
    pixelWidth  = referenceMetadata.resolution.x;
    pixelHeight = -referenceMetadata.resolution.y;
    log('Tile extent:', referenceMetadata.rawBounds, 'resolution:', referenceMetadata.resolution);
  }

  const minX = originX;
  const maxY = originY;

  const rawFeatures = (vectorData as any).features as any[];
  log('Raw features count:', rawFeatures.length);

  let filteredFeatures = rawFeatures;
  if (referenceMetadata?.leafletBounds) {
    const [[latMin, lonMin], [latMax, lonMax]] = referenceMetadata.leafletBounds;
    const tileBBox = turf.bboxPolygon([lonMin, latMin, lonMax, latMax]);
    filteredFeatures = rawFeatures.filter(f => turf.booleanIntersects(f, tileBBox));
    log('Filtered features count:', filteredFeatures.length);
  }

  const features = filteredFeatures.map(f => turf.toMercator(f));
  log('Reprojected features count:', features.length);

  let data: Float32Array;
  switch (fnName) {
    case 'edge':
      log('Delegating edge rasterization');
      data = computeEdgeRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight);
      break;

    case 'distance_to':
      log('Delegating distance rasterization');
      data = computeDistanceRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight);
      break;

    case 'mask':
    case 'within':
      log('Delegating within rasterization');
      data = computeWithinRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight);
      break;

    case 'label':
      log('Delegating label rasterization');
      data = computeLabelRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight, attributeField);
      break;

    case 'category':
      log('Delegating category rasterization');
      data = computeCategoryRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight, attributeField);
      break;

    case 'buffer':
      log('Delegating buffer rasterization');
      const bufferDist = referenceMetadata?.resolution?.x ?? Math.abs(pixelWidth);
      data = computeBufferRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight, bufferDist);
      break;

    case 'intersect':
      log('Delegating intersect rasterization');
      data = computeIntersectRaster(features, width, height, minX, maxY, pixelWidth, pixelHeight);
      break;

    default:
      throw new Error(`Unsupported rasterization function: ${fnName}`);
  }

  // Compute stats
  let min = Infinity, max = -Infinity, sum = 0, zeroCount = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
    if (v === 0) zeroCount++;
    sum += v;
  }
  const mean = sum / total;

  const metadata: GeoTiffMetadata = {
    width,
    height,
    noDataValue: -9999,
    compression: null,
    bitsPerSample: [],
    resolution: referenceMetadata?.resolution ?? { x: pixelWidth, y: Math.abs(pixelHeight) },
    projection: referenceMetadata?.projection ?? { origin: null },
    rawBounds: referenceMetadata?.rawBounds   ?? [minX, maxY + pixelHeight * height, minX + pixelWidth * width, maxY],
    leafletBounds: referenceMetadata?.leafletBounds ?? [[maxY + pixelHeight * height, minX], [maxY, minX + pixelWidth * width]],
    stats: { min, max, mean, totalPixels: total, validCount: total, zeroCount, noDataCount: 0 }
  };

  const duration = performance.now() - start;
  log(`RasterizeVectorFunction ${fnName} took ${duration.toFixed(2)}ms`);

  return { rasterArray: data, width, height, noDataValue: -9999, metadata };
}
