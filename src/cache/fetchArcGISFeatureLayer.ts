import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { Feature } from '@turf/helpers';
import { MapLayer } from '../../../types/map';

export interface FeatureLayerResult {
  features: Feature[];
}

export async function fetchArcGISFeatureLayer(
  layer: MapLayer,
  bounds?: L.LatLngBounds
): Promise<FeatureLayerResult> {
  
  console.log(`[LayerDataCache] Starting FeatureLayer fetch for: ${layer.name}`);
  const start = Date.now();

  const featureLayer = EsriLeaflet.featureLayer({
    url: layer.source
  });

  const query = featureLayer.query()
    .where('1=1')             // matches default `where`
    .returnGeometry(true)
    .returnZ(false)
    .precision(5)             // matches component default
    .simplify(0.35)           // matches component default
    .fields(['OBJECTID'])     // matches component
    .limit(2000);             // matches maxFeatures

  if (bounds) {
    query.within(bounds);
  }

  const features = await new Promise<Feature[]>((resolve, reject) => {
    query.run((err, fc) => {
      if (err || !fc) return reject(err || new Error('Empty feature collection'));
      resolve(fc.features as Feature[]);
    });
  });

  console.log(`[LayerDataCache] Completed FeatureLayer fetch for: ${layer.name} in ${Date.now() - start}ms`);
  return { features };
}
