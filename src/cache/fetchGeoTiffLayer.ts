import * as GeoTIFF from 'geotiff';
import { geotiffService } from '../services/geotiffService/geotiffService';
import { MapLayer } from '../types/map';
import { RasterData } from '../../../types/map';

export async function fetchGeoTiffLayer(layer: MapLayer): Promise<[any, any]> {
  
  console.log(`[LayerDataCache] Starting GeoTIFF fetch for: ${layer.name}`);
  
  const startTime = Date.now();
  const [arrayBuffer, metadata] = await Promise.all([
    geotiffService.getGeoTiffData(layer.source),
    geotiffService.getGeoTiffMetadata(layer.source)
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

  console.log(`[LayerDataCache] Completed GeoTIFF fetch for: ${layer.name} in ${Date.now() - startTime}ms`);
  return [rasterData, metadata];
}