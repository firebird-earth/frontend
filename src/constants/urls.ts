// Public base URLs
export const ARCGIS_BASE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services';
export const ARCGIS_SERVICES_BASE_URL = 'https://services.arcgis.com/{serviceId}/arcgis/rest/services';
export const USFS_BASE_URL = 'https://apps.fs.usda.gov/arcx/rest/services';
export const CARTODB_BASE_URL = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net';
export const OPENSTREETMAP_BASE_URL = 'https://{s}.tile.openstreetmap.org';
export const OPENTOPOMAP_BASE_URL = 'https://{s}.tile.opentopomap.org';

// ArcGIS Service IDs
export const ARCGIS_SERVICE_IDS = {
  COUNTIES: 'P3ePLMYs2RVChkJx',
  STATES: 'P3ePLMYs2RVChkJx',
  USFS: 'P3ePLMYs2RVChkJx',
  USFWS: 'P3ePLMYs2RVChkJx'
} as const;

// Firebird base URLs
export const STORAGE_BASE_URL = 'https://storage.googleapis.com/firebird-geotiff-public';

// Tile Layer URLs
export const TILE_LAYERS = {
  STREET: `${OPENSTREETMAP_BASE_URL}/{z}/{x}/{y}.png`,
  STREET_LIGHT: `${CARTODB_BASE_URL}/light_all/{z}/{x}/{y}.png`,
  TERRAIN: `${OPENTOPOMAP_BASE_URL}/{z}/{x}/{y}.png`,
  SATELLITE: `${ARCGIS_BASE_URL}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
  TOPO: `${ARCGIS_BASE_URL}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`
} as const;

// Service Layer URLs
export const WUI_LAYER = `${USFS_BASE_URL}/EDW/EDW_WUI_2020_01/MapServer/tile/{z}/{y}/{x}`;

export const CRISIS_AREAS_LAYER = `${USFS_BASE_URL}/EDW/EDW_BILLandscapeInvestments_01/MapServer/0`;

export const STATES_LAYER = `${ARCGIS_SERVICES_BASE_URL.replace('{serviceId}', ARCGIS_SERVICE_IDS.STATES)}/USA_States_Generalized_Boundaries/FeatureServer/0`;

export const COUNTIES_LAYER = `${ARCGIS_SERVICES_BASE_URL.replace('{serviceId}', ARCGIS_SERVICE_IDS.COUNTIES)}/USA_Counties_Generalized_Boundaries/FeatureServer/0`;

export const FEDERAL_LANDS_LAYER = `${ARCGIS_SERVICES_BASE_URL.replace('{serviceId}', ARCGIS_SERVICE_IDS.COUNTIES)}/USA_Federal_Lands/FeatureServer/0`;

export const USFS_LANDS_LAYER = `${ARCGIS_SERVICES_BASE_URL.replace('{serviceId}', ARCGIS_SERVICE_IDS.USFS)}/USA_Forest_Service_Lands/FeatureServer/0`;

export const USFWS_LANDS_LAYER = `${ARCGIS_SERVICES_BASE_URL.replace('{serviceId}', ARCGIS_SERVICE_IDS.USFWS)}/USA_Fish_and_Wildlife_Service_Lands/FeatureServer/0`;

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