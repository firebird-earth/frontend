import { RasterData } from '../types/geotiff';

const EPSILON = 1e-6;

/**
 * Crops a raster to match target width and height if off by at most 1 pixel.
 * Also updates the metadata width and height.
 */
export function cropAlignRaster(
  raster: RasterData,
  targetWidth: number,
  targetHeight: number
): RasterData {
  let { rasterArray, width, height, noDataValue, metadata } = raster as any;

  if (width === targetWidth && height === targetHeight) {
    return raster; // already fine
  }

  if (Math.abs(width - targetWidth) > 1 || Math.abs(height - targetHeight) > 1) {
    throw new Error(`Raster mismatch too large to auto-crop: (${width}×${height}) vs (${targetWidth}×${targetHeight})`);
  }

  console.warn(`[cropAlignRaster] Auto-cropping raster from ${width}×${height} to ${targetWidth}×${targetHeight}`);

  const cropped = new Float32Array(targetWidth * targetHeight);

  for (let r = 0; r < targetHeight; r++) {
    for (let c = 0; c < targetWidth; c++) {
      const srcIdx = r * width + c;
      const dstIdx = r * targetWidth + c;
      cropped[dstIdx] = rasterArray[srcIdx];
    }
  }

  const updatedMetadata = metadata ? {
    ...metadata,
    width: targetWidth,
    height: targetHeight
  } : undefined;

  return {
    rasterArray: cropped,
    width: targetWidth,
    height: targetHeight,
    noDataValue,
    metadata: updatedMetadata
  };
}

/**
 * Checks if two rasters are geospatially aligned.
 * Compares CRS, pixel size, and origin (tiepoint).
 */
export function isGeospatiallyAligned(
  rasterA: RasterData,
  rasterB: RasterData
): boolean {
  const metaA = rasterA.metadata;
  const metaB = rasterB.metadata;

  if (!metaA || !metaB) return false;
  if (metaA.projection?.sourceCRS !== metaB.projection?.sourceCRS) return false;

  const scaleA = metaA.resolution;
  const scaleB = metaB.resolution;
  if (!scaleA || !scaleB) return false;

  if (Math.abs(scaleA.x - scaleB.x) > EPSILON) return false;
  if (Math.abs(scaleA.y - scaleB.y) > EPSILON) return false;

  const tieA = metaA.projection?.origin;
  const tieB = metaB.projection?.origin;
  if (!tieA || !tieB) return false;

  if (Math.abs(tieA[0] - tieB[0]) > EPSILON) return false;
  if (Math.abs(tieA[1] - tieB[1]) > EPSILON) return false;

  return true;
}

/**
 * Clips a larger raster to match the bounds of a smaller raster.
 * Assumes rasters are geospatially aligned.
 */
export function clipRasterToBounds(
  source: RasterData,
  target: RasterData
): RasterData {
  const { width: srcWidth, height: srcHeight, rasterArray: srcArray, noDataValue } = source;
  const { width: tgtWidth, height: tgtHeight } = target;

  if (tgtWidth > srcWidth || tgtHeight > srcHeight) {
    throw new Error('Target raster is larger than source raster, cannot clip.');
  }

  console.warn(`[clipRasterToBounds] Clipping raster from ${srcWidth}×${srcHeight} to ${tgtWidth}×${tgtHeight}`);

  const clipped = new Float32Array(tgtWidth * tgtHeight);

  for (let r = 0; r < tgtHeight; r++) {
    for (let c = 0; c < tgtWidth; c++) {
      const srcIdx = r * srcWidth + c;
      const tgtIdx = r * tgtWidth + c;
      clipped[tgtIdx] = srcArray[srcIdx];
    }
  }

  const updatedMetadata = source.metadata ? {
    ...source.metadata,
    width: tgtWidth,
    height: tgtHeight
  } : undefined;

  return {
    rasterArray: clipped,
    width: tgtWidth,
    height: tgtHeight,
    noDataValue,
    metadata: updatedMetadata
  };
}
