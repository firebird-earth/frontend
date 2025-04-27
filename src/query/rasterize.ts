/**
 * Rasterizes a vector layer based on the function context.
 * Supports: mask, label, category, distance_to, edge, within
 */

import * as turf from '@turf/turf';
import { Vector } from './binder';
import { GeoTiffMetadata, RasterData } from '../types/geotiff';

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

  const width = referenceMetadata?.width ?? 256;
  const height = referenceMetadata?.height ?? 256;
  const total = width * height;

  const [minX, minY, maxX, maxY] = referenceMetadata?.rawBounds ?? [0, 0, width, height];
  const pixelWidth = (maxX - minX) / width;
  const pixelHeight = (maxY - minY) / height;

  const data = new Float32Array(total);
  const features = vectorData.features;

  switch (fnName) {
    case 'mask':
    case 'within': {
      for (let row = 0; row < height; row++) {
        const y = maxY - row * pixelHeight;
        for (let col = 0; col < width; col++) {
          const x = minX + col * pixelWidth;
          const pt = turf.point([x, y]);
          const index = row * width + col;
          data[index] = features.some(f => turf.booleanPointInPolygon(pt, f as turf.helpers.Polygon | turf.helpers.MultiPolygon)) ? 1 : 0;
        }
      }
      break;
    }

    case 'label': {
      for (let row = 0; row < height; row++) {
        const y = maxY - row * pixelHeight;
        for (let col = 0; col < width; col++) {
          const x = minX + col * pixelWidth;
          const pt = turf.point([x, y]);
          const index = row * width + col;
          for (const feature of features) {
            if (turf.booleanPointInPolygon(pt, feature as turf.helpers.Polygon | turf.helpers.MultiPolygon)) {
              const val = feature.properties?.[attributeField || 'id'];
              if (val != null && typeof val === 'number') {
                data[index] = val;
              }
              break;
            }
          }
        }
      }
      break;
    }

    case 'category': {
      const categoryMap = new Map<string, number>();
      let nextCode = 1;
      for (let row = 0; row < height; row++) {
        const y = maxY - row * pixelHeight;
        for (let col = 0; col < width; col++) {
          const x = minX + col * pixelWidth;
          const pt = turf.point([x, y]);
          const index = row * width + col;
          for (const feature of features) {
            if (turf.booleanPointInPolygon(pt, feature as turf.helpers.Polygon | turf.helpers.MultiPolygon)) {
              const val = feature.properties?.[attributeField || 'type'];
              if (typeof val === 'string') {
                if (!categoryMap.has(val)) {
                  categoryMap.set(val, nextCode++);
                }
                data[index] = categoryMap.get(val)!;
              }
              break;
            }
          }
        }
      }
      break;
    }

    case 'distance_to': {
      const centroids = features.map(f => turf.centroid(f));
      for (let row = 0; row < height; row++) {
        const y = maxY - row * pixelHeight;
        for (let col = 0; col < width; col++) {
          const x = minX + col * pixelWidth;
          const pt = turf.point([x, y]);
          const index = row * width + col;
          const distances = centroids.map(c => turf.distance(pt, c, { units: 'meters' }));
          data[index] = Math.min(...distances);
        }
      }
      break;
    }

    case 'edge': {
      const bufferPolys = features.map(f => turf.buffer(f, 1, { units: 'meters' }));
      for (let row = 0; row < height; row++) {
        const y = maxY - row * pixelHeight;
        for (let col = 0; col < width; col++) {
          const x = minX + col * pixelWidth;
          const pt = turf.point([x, y]);
          const index = row * width + col;
          for (let i = 0; i < features.length; i++) {
            const inside = turf.booleanPointInPolygon(pt, features[i] as any);
            const buffered = turf.booleanPointInPolygon(pt, bufferPolys[i] as any);
            if (!inside && buffered) {
              data[index] = 1;
              break;
            }
          }
        }
      }
      break;
    }

    default:
      throw new Error(`Unsupported rasterization function: ${fnName}`);
  }

  const metadata: GeoTiffMetadata = {
    width,
    height,
    noDataValue: -9999,
    compression: null,
    bitsPerSample: [],
    resolution: referenceMetadata?.resolution ?? { x: 1, y: 1 },
    projection: referenceMetadata?.projection ?? { origin: null },
    rawBounds: referenceMetadata?.rawBounds ?? [0, 0, width, height],
    leafletBounds: referenceMetadata?.leafletBounds ?? [[0, 0], [0, 0]],
    stats: {
      min: Math.min(...data),
      max: Math.max(...data),
      mean: data.reduce((s, v) => s + v, 0) / total,
      totalPixels: total,
      validCount: total,
      zeroCount: data.filter(v => v === 0).length,
      noDataCount: 0
    }
  };

  return {
    rasterArray: data,
    width,
    height,
    noDataValue: -9999,
    metadata
  };
}
