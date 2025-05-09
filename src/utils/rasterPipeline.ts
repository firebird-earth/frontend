import { Float32Array } from 'std';
import { layerDataCache } from '../cache/cache';
import { resolveDomain, clampRasterToDomain } from '../utils/rasterDomain';
import { fillNoDataFocalMean } from '../utils/fillNoData';
import { colorizeRasterImage } from '../utils/colorizeRaster';
import { superscaleCanvas } from '../utils/superScaleRaster';
import { ColorScheme } from '../constants/colors';

/**
 * Process raw raster data into a Canvas for display and caching.
 * Steps:
 *  1. Resolve domain
 *  2. Clamp values to domain
 *  3. Fill NoData holes
 *  4. Cache processed raster for tooltips
 *  5. Colorize into ImageData
 *  6. Supersample into Canvas
 */
export function runRasterPipeline(
  categoryId: string,
  layerId: number,
  rasterArray: Float32Array,
  width: number,
  height: number,
  noDataValue: number,
  rawDomain: [number, number],
  stats: { min: number; max: number },
  valueRange: { defaultMin: number; defaultMax: number },
  colorScheme: ColorScheme
): HTMLCanvasElement {
  // 1. Resolve domain
  const [domainMin, domainMax] = resolveDomain(
    rawDomain,
    stats.min,
    stats.max,
    noDataValue
  );

  // 2. Clamp to domain
  const clamped = clampRasterToDomain(rasterArray, domainMin, domainMax, noDataValue);

  // 3. Fill NoData
  const fillSize = 2;
  const filled = fillNoDataFocalMean(clamped, width, height, noDataValue, fillSize);

  // 4. Expose processed raster for tooltip
  if (categoryId && layerId) {
    const cached = layerDataCache.getSync(`${categoryId}-${layerId}`);
    (cached.data as any).processedRaster = filled;
  }

  // 5. Colorize into ImageData
  const imageData = colorizeRasterImage(
    filled,
    width,
    height,
    noDataValue,
    colorScheme.colors,
    [domainMin, domainMax],
    valueRange
  );

  // 6. Supersample into Canvas
  const SUPERSAMPLE = true;
  const scale = SUPERSAMPLE ? 2 : 1;
  return superscaleCanvas(imageData, width, height, scale, SUPERSAMPLE);
}
