// Base URLs
export const ARCGIS_BASE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services';
export const USFS_BASE_URL = 'https://apps.fs.usda.gov/arcx/rest/services';
export const STORAGE_BASE_URL = 'https://storage.googleapis.com/firebird-geotiff-public/TMV';

// Tile Layer URLs
export const TILE_LAYERS = {
  STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  STREET_LIGHT: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  TERRAIN: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  SATELLITE: `${ARCGIS_BASE_URL}/World_Imagery/MapServer/tile/{z}/{y}/{x}`
} as const;

// Service Layer URLs
export const SERVICE_LAYERS = {
  WUI: `${USFS_BASE_URL}/EDW/EDW_WUI_2020_01/MapServer/tile/{z}/{y}/{x}`,
  CRISIS_AREAS: `${USFS_BASE_URL}/EDW/EDW_BILLandscapeInvestments_01/MapServer/0`
} as const;

// GeoTIFF URLs - Using Google Storage
export const GEOTIFF_LAYERS = {
  FLAME_LENGTH: `${STORAGE_BASE_URL}/flame_length.tif`,
  CANOPY_COVER: `${STORAGE_BASE_URL}/canopy_cover.tif`,
  CANOPY_HEIGHT: `${STORAGE_BASE_URL}/canopy_height.tif`,
  CANOPY_BULK_DENSITY: `${STORAGE_BASE_URL}/CBD.tif`
} as const;