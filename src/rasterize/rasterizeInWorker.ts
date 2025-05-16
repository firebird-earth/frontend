// src/utils/rasterizeInWorker.ts

import RasterWorker from './rasterize.worker.ts?worker';
import type { GeoTiffMetadata } from '../types/geotiff';

let _rasterReqId = 0;
const rasterWorker = new RasterWorker();

/**
 * Special “debug” message containing the raw edge‐mask bitmap
 * that you can render on the page for inspection.
 */
export interface DebugEdgeMask {
  id: number;
  type: 'DEBUG_EDGE_MASK';
  width: number;
  height: number;
  bitmap: ImageBitmap;
}

/**
 * The normal response shape from the worker.
 */
interface WorkerResponse {
  id: number;
  success: boolean;
  payload?: any;
  error?: string;
}

/**
 * Draws an ImageBitmap into a newly appended canvas so you can
 * see exactly what your OffscreenCanvas produced.
 */
function showDebugBitmap(msg: DebugEdgeMask) {
  const { width, height, bitmap } = msg;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(bitmap, 0, 0);
  }
}

/**
 * Rasterize via web worker, correlating by `id`.  
 * Automatically listens for any DEBUG_EDGE_MASK messages
 * to render their bitmap, and any `{__debug__: true, messages: [...]}` 
 * arrays to surface the worker‐side logs.
 *
 * @param fnName            name of the vector‐raster function (e.g. 'edge')
 * @param layerName         source layer name to rasterize
 * @param vectorData        GeoJSON features
 * @param referenceMetadata optional tile metadata
 * @param attributeField    optional field name for label/category
 */
export function rasterizeInWorker(
  fnName: string,
  layerName: string,
  vectorData: any,
  referenceMetadata?: GeoTiffMetadata,
  attributeField?: string
): Promise<any> {
  const id = ++_rasterReqId;

  return new Promise((resolve, reject) => {
    function handler(e: MessageEvent<any>) {
      const msg = e.data as (WorkerResponse & DebugEdgeMask & { __debug__?: boolean; messages?: string[] });

      // 1) special bitmap debug
      if (msg.type === 'DEBUG_EDGE_MASK' && msg.id === id) {
        showDebugBitmap(msg as DebugEdgeMask);
        return;
      }

      // 2) generic debug log messages from inside the worker
      if (msg.__debug__ && Array.isArray(msg.messages) && msg.messages.length) {
        console.group(`RasterWorker[${id}] debug logs`);
        msg.messages.forEach((line) => console.log(line));
        console.groupEnd();
        return;
      }

      // 3) normal response
      if (typeof msg.id !== 'number' || msg.id !== id) {
        // not our message, ignore
        return;
      }

      rasterWorker.removeEventListener('message', handler);

      if (msg.success) {
        resolve(msg.payload);
      } else {
        reject(new Error(msg.error));
      }
    }

    rasterWorker.addEventListener('message', handler);

    rasterWorker.postMessage({
      id,
      fnName,
      layerName,
      vectorData,
      referenceMetadata,
      attributeField,
    });
  });
}
