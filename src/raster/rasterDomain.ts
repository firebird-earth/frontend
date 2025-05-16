/**
 * Given a candidate domain and the layer’s metadata, replace any endpoint
 * equal to the NoData value with the real min/max from the stats.
 */
export function resolveDomain(
  domain: [number,number],
  statsMin: number,
  statsMax: number,
  noDataValue: number|null
): [number,number] {
  let [min, max] = domain;
  if (noDataValue != null) {
    if (min === noDataValue) min = statsMin;
    if (max === noDataValue) max = statsMax;
  }
  return [min, max];
}

// Helper to clamp a single value to domain, excluding NoData
export function clampValueToDomain(
  raw: number,
  domainMin: number,
  domainMax: number,
  noDataValue: number
): number {
  const eps = 1e-10;
  if (Math.abs(raw - noDataValue) < eps) return noDataValue;
  if (raw < domainMin) return domainMin;
  if (raw > domainMax) return domainMax;
  return raw;
}

/**
 * Clamp raster values to a specified domain, excluding NoData values.
 *
 * @param arr - Raster data array
 * @param domainMin - Minimum allowed value
 * @param domainMax - Maximum allowed value
 * @param noDataValue - Value representing NoData
 * @returns New Float32Array with values clamped within [domainMin, domainMax]
 */
export function clampRasterToDomain(
  arr: Float32Array,
  domainMin: number,
  domainMax: number,
  noDataValue: number
): Float32Array {
  const out = new Float32Array(arr);
  for (let i = 0; i < out.length; i++) {
    const v = out[i];
    if (v !== noDataValue) {
      if (v < domainMin) out[i] = domainMin;
      else if (v > domainMax) out[i] = domainMax;
    }
  }
  return out;
}
