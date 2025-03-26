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

  // Calculate the zoom level where the cell would be 25 pixels
  const targetPixels = 15;
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