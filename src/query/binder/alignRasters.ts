// alignRasterLayers.ts
import { RasterData } from '../../types/geotiff';
import { clipRasterToBounds, isGeospatiallyAligned } from '../../raster/alignRaster';

export function alignRasters(
  layerResults: Map<string, any>,
  referenceRaster: RasterData
): void {
  for (const [name, layer] of layerResults) {
    if ('source' in layer && layer.source && 'rasterArray' in layer.source) {
      const sr = layer.source as RasterData;
      if (isGeospatiallyAligned(sr, referenceRaster)) {
        if (sr.width !== referenceRaster.width || sr.height !== referenceRaster.height) {
          console.warn(`[binder] size mismatch for "${name}", clipping`);
          const clipped = clipRasterToBounds(sr as any, referenceRaster);
          clipped.metadata.rawBounds = referenceRaster.metadata.rawBounds;
          clipped.metadata.projection.origin = referenceRaster.metadata.projection.origin;
          layerResults.set(name, { ...layer, source: clipped });
        }
      } else {
        throw new Error(`Layer "${name}" is not aligned with reference grid.`);
      }
    }
  }
}
