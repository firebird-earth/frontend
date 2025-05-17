import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { Feature } from '@turf/helpers';
import { MapLayer } from '../types/map';
import { computeGridMetadata } from '../utils/grid';
import { RESOLUTION, NODATA_VALUE } from '../globals';
import { RasterData } from '../types/geotiff';
import { validateMetadata } from '../services/geotiffService/validateMetadata';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[FetchFeatureLayer]', ...args);
}

export interface FeatureMetadata {
  width: number;
  height: number;
  noDataValue: number | null;
  compression: number | null;
  bitsPerSample: number[];
  resolution: {
    x: number;
    y: number;
  };
  projection: {
    sourceCRS: string;
    origin: [number, number] | null;
  };
  /** Geographic envelope for rasterization: [minX, minY, maxX, maxY] in lat/lng */
  bounds: [number, number, number, number];
  rawBounds: [number, number, number, number];
  leafletBounds: [[number, number], [number, number]];
  featureCount: number;
  fields: string[];
  geometryType?: string;
}

/**
 * Fetches an ArcGIS FeatureLayer, applies the spatial filter 'bounds',
 * and returns rasterData (with features added) and its metadata.
 */
export async function fetchArcGISFeatureLayer(
  layer: MapLayer,
  bounds: L.LatLngBounds
): Promise<[RasterData & { features: Feature[] }, FeatureMetadata]> {
  log(`Starting FeatureLayer fetch for: ${layer.name}`);
  const start = Date.now();

  const featureLayer = EsriLeaflet.featureLayer({ url: layer.source });
  const query = featureLayer
    .query()
    .where('1=1')
    .returnGeometry(true)
    .fields(layer.fields && layer.fields.length > 0 ? layer.fields : ['OBJECTID'])
    .limit(2000)
    .intersects(bounds);

  const [features, metadata] = await new Promise<[Feature[], FeatureMetadata]>((resolve, reject) => {
    query.run((err, fc) => {
      if (err || !fc) return reject(err || new Error('Empty feature collection'));
      const feats = fc.features as Feature[];
      const featureCount = feats.length;
      const fields = fc.fields ? fc.fields.map((f: any) => f.name) : [];
      const geometryType = (fc as any).geometryType;

      // Raster grid metadata
      const { width, height, originX, originY, pixelWidth, pixelHeight } =
        computeGridMetadata(bounds, RESOLUTION);

      // Geographic bounds
      const minX = bounds.getWest();
      const minY = bounds.getSouth();
      const maxX = bounds.getEast();
      const maxY = bounds.getNorth();

      const rawBounds: [number, number, number, number] = [minX, minY, maxX, maxY];
      const leafletBounds: [[number, number], [number, number]] = [[minY, minX], [maxY, maxX]];

      const meta: FeatureMetadata = {
        width,
        height,
        noDataValue: NODATA_VALUE,
        compression: null,
        bitsPerSample: [],
        resolution: { x: pixelWidth, y: pixelHeight },
        projection: { sourceCRS: 'EPSG:4326', origin: [originX, originY] },
        bounds: rawBounds,
        rawBounds,
        leafletBounds,
        featureCount,
        fields,
        geometryType,
      };
      resolve([feats, meta]);
    });
  });

  // Build placeholder RasterData object; rasterArray will be populated later during rasterization
  const rasterData: RasterData & { features: Feature[] } = {
    rasterArray: new Float32Array(metadata.width * metadata.height).fill(NODATA_VALUE),
    width: metadata.width,
    height: metadata.height,
    noDataValue: NODATA_VALUE,
    features,
  };

  log('Fetched rasterData:', rasterData);
  log('Fetched metadata:', metadata);
  log(`Completed fetch for: ${layer.name} in ${Date.now() - start}ms`);

  validateMetadata(metadata);
  
  return [rasterData, metadata];
}
