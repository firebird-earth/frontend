import * as L from 'leaflet';
import { MapLayer } from '../types/map';
import { ArcTiffExportParams } from '../services/arcGISTiffService/types';
import * as GeoTIFF from 'geotiff';
import { RasterData } from '../types/map';
import { arcGISTiffService } from '../services/arcGISTiffService';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[fetchTiffLayer]', ...args); }
}

export async function fetchArcGISTiffLayer(layer: MapLayer, bounds: L.LatLngBounds): Promise<[RasterData, GeoTiffMetadata]> {

  log(`Starting Image Service fetch for: ${layer.name}`);

  const startTime = Date.now();

  try {
    const exportUrl = layer.source + '/exportImage';
    let parsedRule: any;
    try {
      parsedRule = typeof layer.renderingRule === 'string' ?
        JSON.parse(layer.renderingRule) : layer.renderingRule;
    } catch (e) {
      console.error('Failed to parse rendering rule:', e);
      parsedRule = layer.renderingRule;
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const projectedSW = L.Projection.SphericalMercator.project(sw);
    const projectedNE = L.Projection.SphericalMercator.project(ne);
    const widthMeters = projectedNE.x - projectedSW.x;
    const heightMeters = projectedNE.y - projectedSW.y;
    const tileWidth = Math.round(widthMeters / 30);
    const tileHeight = Math.round(heightMeters / 30);
    const bbox = `${projectedSW.x},${projectedSW.y},${projectedNE.x},${projectedNE.y}`;

    const params: Partial<ArcTiffExportParams> = {
      bbox,
      bboxSR: '3857',
      size: `${tileWidth},${tileHeight}`,
      imageSR: '3857',
      format: 'tiff',
      pixelType: 'F32',
      noData: '',
      compression: 'LZW',
      bandIds: '',
      mosaicRule: '',
      renderingRule: JSON.stringify(parsedRule),
      interpolation: 'RSP_NearestNeighbor',
      f: 'image'
    };

    const [arrayBuffer, metadata] = await Promise.all([
      arcGISTiffService.getTiffData(exportUrl, params),
      arcGISTiffService.getTiffMetadata(exportUrl, params)
    ]);

    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const rasters = await image.readRasters();
    const rasterArray = rasters[0];

    const rasterData: RasterData = {
      rasterArray,
      width: metadata.width,
      height: metadata.height,
      noDataValue: metadata.noDataValue
    };

    log(`Completed Image Service fetch for: ${layer.name} in ${Date.now() - startTime}ms`);
    return [rasterData, metadata];
  } catch (error) {
    console.error(`Error fetching Image Service for: ${layer.name}`, error);
    throw error;
  }
}
