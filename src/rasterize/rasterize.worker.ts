// rasterize.worker.ts
import { rasterizeVectorFunction } from './rasterize';
import type { GeoTiffMetadata, RasterData } from '../types/geotiff';

export type Request = {
  id: number;            // new
  fnName: string;
  layerName: string;
  vectorData: any;
  referenceMetadata?: GeoTiffMetadata;
  attributeField?: string;
};

export type Response =
  | { id: number; success: true;  payload: RasterData & { metadata: GeoTiffMetadata } }
  | { id: number; success: false; error: string };

self.onmessage = async (evt: MessageEvent<Request>) => {
  const { id, fnName, layerName, vectorData, referenceMetadata, attributeField } = evt.data;
  try {
    const result = await rasterizeVectorFunction(
      fnName,
      layerName,
      vectorData,
      referenceMetadata,
      attributeField
    );
    const msg: Response = { id, success: true, payload: result };
    self.postMessage(msg);
  } catch (e: any) {
    self.postMessage({ id, success: false, error: e.message });
  }
};
