import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { Feature } from '@turf/helpers';
import { MapLayer } from '../types/map';
import { computeGridMetadata } from '../utils/grid';
import { RESOLUTION } from '../globals';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[FetchFeatureLayer]', ...args); }
}

export interface FeatureLayerMetadata {
  /** Geographic envelope for rasterization: [minX, minY, maxX, maxY] in EPSG:4326 */
  bounds: [number, number, number, number];
  /** Raw geographic bounds (same as `bounds`, provided for downstream consistency) */
  rawBounds: [number, number, number, number];
  /** Number of columns in the raster grid */
  width: number;
  /** Number of rows in the raster grid */
  height: number;
  /** X coordinate (meters) of the top-left pixel origin */
  originX: number;
  /** Y coordinate (meters) of the top-left pixel origin */
  originY: number;
  /** Pixel size in X direction (meters) */
  pixelWidth: number;
  /** Pixel size in Y direction (meters, negative for top-down) */
  pixelHeight: number;
  /** Feature-specific metadata */
  featureCount: number;
  /** Attribute fields returned */
  fields: string[];
  /** Geometry type (e.g. "Polygon") */
  geometryType?: string;
}

/**
 * Fetches an ArcGIS FeatureLayer, applies the spatial filter 'bounds',
 * and returns features plus raster grid metadata at a fixed resolution.
 */
export async function fetchArcGISFeatureLayer(
  layer: MapLayer,
  bounds: L.LatLngBounds
): Promise<[Feature[], FeatureLayerMetadata]> {
  log(`Starting FeatureLayer fetch for: ${layer.name}`);
  const start = Date.now();

  // Build and run the Esri-Leaflet query
  // Default CRS is EPSG:4326 (WGS84, [longitude, latitude])
  const featureLayer = EsriLeaflet.featureLayer({ url: layer.source });
  const query = featureLayer
    .query()
    .where('1=1')
    .returnGeometry(true)
    .fields(layer.fields && layer.fields.length > 0 ? layer.fields : ['OBJECTID'])
    .limit(2000)
    .intersects(bounds);

  const result = await new Promise<[Feature[], FeatureLayerMetadata]>((resolve, reject) => {
    query.run((err, fc) => {
      if (err || !fc) return reject(err || new Error('Empty feature collection'));
      const features = fc.features as Feature[];
      const featureCount = features.length;
      const fields = fc.fields
        ? fc.fields.map((f: any) => f.name)
        : featureCount > 0
        ? Object.keys(features[0].properties)
        : [];
      const geometryType = (fc as any).geometryType;

      // Compute grid metadata from bounds at fixed resolution
      const { width, height, originX, originY, pixelWidth, pixelHeight } = computeGridMetadata(bounds, RESOLUTION);

      // Extract geographic envelope for metadata
      const minX = bounds.getWest();
      const minY = bounds.getSouth();
      const maxX = bounds.getEast();
      const maxY = bounds.getNorth();

      const metadata: FeatureLayerMetadata = {
        bounds: [minX, minY, maxX, maxY],
        rawBounds: [minX, minY, maxX, maxY],
        width,
        height,
        originX,
        originY,
        pixelWidth,
        pixelHeight,
        featureCount,
        fields,
        geometryType
      };
      resolve([features, metadata]);
    });
  });

  log('Fetched metadata:', result[1])
  log(`Completed FeatureLayer fetch for: ${layer.name} in ${Date.now() - start}ms`);
  return result;
}
