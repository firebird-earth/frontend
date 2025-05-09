import L from 'leaflet';

/**
 * Converts acres to square meters
 * @param acres Area in acres
 * @returns Area in square meters
 */
export function acresToSquareMeters(acres: number): number {
  return acres * 4046.86; // 1 acre = 4046.86 square meters
}

/**
 * Calculates the appropriate zoom level threshold for grid rendering
 * based on grid cell size and minimum pixel size (25px)
 * @param size Grid cell size in acres or meters
 * @param unit Unit of measurement ('acres' or 'meters')
 * @returns Minimum zoom level for grid rendering
 */
export function calculateGridZoomThreshold(size: number, unit: 'acres' | 'meters'): number {
  // Convert acres to meters if needed
  const sizeInMeters = unit === 'acres' 
    ? Math.sqrt(acresToSquareMeters(size)) // Convert acres to square meters and get side length
    : size;

  // Calculate meters per pixel at the equator for zoom level 0
  const metersPerPixelAtZoom0 = 40075016.686 / 256; // Earth circumference / tile size

  // Calculate the zoom level where the cell would be n pixels
  const targetPixels = 5;
  const targetMetersPerPixel = sizeInMeters / targetPixels;
  const targetZoom = Math.log2(metersPerPixelAtZoom0 / targetMetersPerPixel);

  // Round up to ensure we meet minimum pixel size
  const zoomLevel = Math.ceil(targetZoom);
  
  // Clamp between reasonable values (10 = city level, 22 = building level)
  return Math.min(Math.max(zoomLevel, 10), 22);
}

/**
 * Zooms the map to the appropriate level for the grid size
 * @param map The Leaflet map instance
 * @param size Grid cell size
 * @param unit Unit of measurement ('acres' or 'meters')
 */
export function zoomToGridThreshold(map: L.Map, size: number, unit: 'acres' | 'meters'): void {
  const threshold = calculateGridZoomThreshold(size, unit);
  const currentZoom = map.getZoom();
  
  // Only zoom in if we're below the threshold
  if (currentZoom < threshold) {
    map.setZoom(threshold, {
      animate: true,
      duration: 1
    });
  }
}

/**
 * Computes raster grid parameters from geographic bounds at a given resolution.
 * @param bounds      Leaflet LatLngBounds in EPSG:4326
 * @param resolution  Desired pixel size in meters
 * @returns Grid parameters: width, height, originX, originY, pixelWidth, pixelHeight
 */
export function computeGridMetadata(
  bounds: L.LatLngBounds,
  resolution: number
): { width: number; height: number; originX: number; originY: number; pixelWidth: number; pixelHeight: number } {
  // Project bounds to Web Mercator (meters)
  const sw = L.CRS.EPSG3857.project(bounds.getSouthWest());
  const ne = L.CRS.EPSG3857.project(bounds.getNorthEast());
  const dx = ne.x - sw.x;
  const dy = ne.y - sw.y;

  // Compute width/height at given resolution
  const width = Math.ceil(dx / resolution);
  const height = Math.ceil(dy / resolution);
  const originX = sw.x;
  const originY = ne.y;
  const pixelWidth = resolution;
  const pixelHeight = -resolution;

  return { width, height, originX, originY, pixelWidth, pixelHeight };
}
