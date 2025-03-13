// Base URLs
export const ARCGIS_BASE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services';
export const USFS_BASE_URL = 'https://apps.fs.usda.gov/arcx/rest/services';
export const STORAGE_BASE_URL = 'https://storage.googleapis.com/firebird-geotiff-public';

// Tile Layer URLs
export const TILE_LAYERS = {
  STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  STREET_LIGHT: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  TERRAIN: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  SATELLITE: `${ARCGIS_BASE_URL}/World_Imagery/MapServer/tile/{z}/{y}/{x}`
} as const;

// Service Layer URLs
export const WUI_LAYER = `${USFS_BASE_URL}/EDW/EDW_WUI_2020_01/MapServer/tile/{z}/{y}/{x}`;
export const CRISIS_AREAS_LAYER = `${USFS_BASE_URL}/EDW/EDW_BILLandscapeInvestments_01/MapServer/0`;

// Function to get GeoTIFF URL based on AOI ID
export function getGeoTiffUrl(aoiId: string | number, layerName: string): string {
  // Convert AOI ID to string and handle special case for Mountain Village
  const id = typeof aoiId === 'number' && aoiId === 1 ? 'TMV' : String(aoiId);
  
  // Normalize layer name to create a consistent filename
  const normalizedName = layerName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  return `${STORAGE_BASE_URL}/${id}/${normalizedName}.tif`;
}

// Legacy GeoTIFF URLs - Using Google Storage
export const GEOTIFF_LAYERS = {
  FLAME_LENGTH: `${STORAGE_BASE_URL}/TMV/flame_length.tif`,
  BURN_PROBABILITY: `${STORAGE_BASE_URL}/TMV/burn_probability.tif`,
  CANOPY_COVER: `${STORAGE_BASE_URL}/TMV/canopy_cover.tif`,
  CANOPY_HEIGHT: `${STORAGE_BASE_URL}/TMV/canopy_height.tif`,
  CANOPY_BULK_DENSITY: `${STORAGE_BASE_URL}/TMV/cbd.tif`
} as const;