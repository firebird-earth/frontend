import L from 'leaflet';
import proj4 from 'proj4';

/**
 * Reprojects a LatLngBounds object from EPSG:4326 to the target CRS.
 * Returns [minX, minY, maxX, maxY] in target projected coordinates.
 */
export function reprojectBounds(
  aoiBounds: L.LatLngBounds,
  targetCRS: string
): [number, number, number, number] {
  const proj = proj4('EPSG:4326', targetCRS);
  const [minX, minY] = proj.forward([
    aoiBounds.getWest(),
    aoiBounds.getSouth(),
  ]);
  const [maxX, maxY] = proj.forward([
    aoiBounds.getEast(),
    aoiBounds.getNorth(),
  ]);
  return [minX, minY, maxX, maxY];
}
