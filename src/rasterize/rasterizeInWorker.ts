import RasterWorker from './rasterize.worker.ts?worker';
import type { GeoTiffMetadata } from '../types/geotiff';

let _rasterReqId = 0;
const rasterWorker = new RasterWorker();

/**
 * Rasterize via web worker, correlating by `id`.
 */
export function rasterizeInWorker(
  fnName: string,
  layerName: string,
  vectorData: any,
  referenceMetadata?: GeoTiffMetadata,
  attributeField?: string
): Promise<Raster> {
  const id = ++_rasterReqId;
  return new Promise((resolve, reject) => {
    function handler(e: MessageEvent<any>) {
      const d = e.data as { id: number; success: boolean; payload?: any; error?: string };
      if (d.id !== id) return;
      rasterWorker.removeEventListener('message', handler);
      if (!d.success) {
        return reject(new Error(d.error));
      }
      resolve(d.payload as Raster);
    }
    rasterWorker.addEventListener('message', handler);
    rasterWorker.postMessage({
      id,
      fnName,
      layerName,
      vectorData,
      referenceMetadata,
      attributeField
    });
  });
}
