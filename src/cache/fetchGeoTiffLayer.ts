import * as L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { geotiffService } from '../services/geotiffService/geotiffService';
import { MapLayer } from '../types/map';
import { RasterData } from '../../../types/map';
import { store } from '../store'; 

export async function fetchGeoTiffLayer(layer: MapLayer, bounds: L.LatLngBounds): Promise<[RasterData, GeoTiffMetadata]> {
  
  console.log(`[LayerDataCache] Starting GeoTIFF fetch for: ${layer.name}`);
  
  const startTime = Date.now();

  // Access the current AOI from the Redux store
  const currentAOI = store.getState().home.aoi.current;
  if (!currentAOI) {
    throw new Error('No AOI selected');
  }

  console.log('[fetchGeoTiffLayer] currentAOI:', currentAOI)

  const aoiId = currentAOI.id === 1 ? 'TMV' : currentAOI.id.toString();
  const source = layer.source.replace('{aoi}', aoiId);

  console.log('[fetchGeoTiffLayer] source:', source)
  
  const [arrayBuffer, metadata] = await Promise.all([
    geotiffService.getGeoTiffData(source),
    geotiffService.getGeoTiffMetadata(source)
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