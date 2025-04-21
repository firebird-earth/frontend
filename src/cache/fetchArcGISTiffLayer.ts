import { MapLayer } from '../types/map';
import { ArcTiffExportParams } from '../services/arcGISTiffService/types';
import * as GeoTIFF from 'geotiff';
import { RasterData } from '../types/map';
import { arcGISTiffService } from '../services/arcGISTiffService';

export async function fetchArcGISTiffLayer(layer: MapLayer): Promise<[RasterData, any]> {
  
  console.log(`[LayerDataCache] Starting Image Service fetch for: ${layer.name}`);
  
  const startTime = Date.now();

  try {
    // Extract the base URL and rendering rule
    const exportUrl = layer.source + '/exportImage';
    let parsedRule: any;
    try {
      parsedRule = typeof layer.renderingRule === 'string' ?
        JSON.parse(layer.renderingRule) : layer.renderingRule;
    } catch (e) {
      console.error('Failed to parse rendering rule:', e);
      parsedRule = layer.renderingRule;
    }

    // Get the map instance
    const map = window.leafletMap;
    if (!map) {
      throw new Error('Map instance not found');
    }

    // Get current map bounds and size
    const bounds = map.getBounds();
    const size = map.getSize();
    const zoom = map.getZoom();
    const pixelsPerDegree = Math.pow(2, zoom + 8) / 360;
    const degreesLng = Math.abs(bounds.getEast() - bounds.getWest());
    const degreesLat = Math.abs(bounds.getNorth() - bounds.getSouth());
    const targetWidth = Math.round(degreesLng * pixelsPerDegree);
    const targetHeight = Math.round(degreesLat * pixelsPerDegree);
    const tileWidth = Math.min(2048, Math.max(256, targetWidth));
    const tileHeight = Math.min(2048, Math.max(256, targetHeight));
    const bbox = `${bounds.getWest().toFixed(6)},${bounds.getSouth().toFixed(6)},${bounds.getEast().toFixed(6)},${bounds.getNorth().toFixed(6)}`;

    // Create fetch params
    const params: Partial<ArcTiffExportParams> = {
      bbox,
      bboxSR: '4326',
      size: `${tileWidth},${tileHeight}`,
      imageSR: '4326',
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

    // Fetch both data and metadata in parallel
    const [arrayBuffer, metadata] = await Promise.all([
      arcGISTiffService.getTiffData(exportUrl, params),
      arcGISTiffService.getTiffMetadata(exportUrl, params)
    ]);

    // Extract the image raster from the file array buffer
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

    console.log(`[LayerDataCache] Completed Image Service fetch for: ${layer.name} in ${Date.now() - startTime}ms`);
    return [rasterData, metadata];
  } catch (error) {
    console.error(`[LayerDataCache] Error fetching Image Service for: ${layer.name}`, error);
    throw error;
  }
}