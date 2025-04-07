// Basemaps
export const OPENSTREETMAP = 'https://{s}.tile.openstreetmap.org';
export const OPENTOPOMAP = 'https://{s}.tile.opentopomap.org';
export const CARTODB = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net';

// ArcGIS
export const ARCGIS = 'https://server.arcgisonline.com/ArcGIS/rest/services';
export const ARCGIS_SERVICES = 'https://services.arcgis.com/{serviceId}/arcgis/rest/services';

// ArcGIS Service IDs
export const ARCGIS_SERVICE_IDS = {
  COUNTIES: 'P3ePLMYs2RVChkJx',
  STATES: 'P3ePLMYs2RVChkJx',
  USFS: 'P3ePLMYs2RVChkJx',
  USFWS: 'P3ePLMYs2RVChkJx'
} as const;

// USFS
export const USFS = 'https://apps.fs.usda.gov/arcx/rest/services';

// Firebird base URLs
export const STORAGE = 'https://storage.googleapis.com/firebird-geotiff-public';

// Tile Layer URLs
export const TILE_LAYERS = {
  STREET: `${OPENSTREETMAP}/{z}/{x}/{y}.png`,
  STREET_LIGHT: `${CARTODB}/light_all/{z}/{x}/{y}.png`,
  TERRAIN: `${OPENTOPOMAP}/{z}/{x}/{y}.png`,
  SATELLITE: `${ARCGIS}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
  TOPO: `${ARCGIS}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`
} as const;

// USFS URLs
export const WUI_LAYER = `${USFS}/EDW/EDW_WUI_2020_01/MapServer/tile/{z}/{y}/{x}`;
export const CRISIS_AREAS_LAYER = `${USFS}/EDW/EDW_BILLandscapeInvestments_01/MapServer/0`;

// ArcGIS Service Layers
export const STATES_LAYER = `${ARCGIS_SERVICES.replace('{serviceId}', ARCGIS_SERVICE_IDS.STATES)}/USA_States_Generalized_Boundaries/FeatureServer/0`;

export const COUNTIES_LAYER = `${ARCGIS_SERVICES.replace('{serviceId}', ARCGIS_SERVICE_IDS.COUNTIES)}/USA_Counties_Generalized_Boundaries/FeatureServer/0`;

export const FEDERAL_LANDS_LAYER = `${ARCGIS_SERVICES.replace('{serviceId}', ARCGIS_SERVICE_IDS.COUNTIES)}/USA_Federal_Lands/FeatureServer/0`;

export const USFS_LANDS_LAYER = `${ARCGIS_SERVICES.replace('{serviceId}', ARCGIS_SERVICE_IDS.USFS)}/USA_Forest_Service_Lands/FeatureServer/0`;

export const USFWS_LANDS_LAYER = `${ARCGIS_SERVICES.replace('{serviceId}', ARCGIS_SERVICE_IDS.USFWS)}/USA_Fish_and_Wildlife_Service_Lands/FeatureServer/0`;

// Function to get GeoTIFF URL based on AOI ID
export function getGeoTiffUrl(aoiId: string | number, layerName: string): string {
  // Convert AOI ID to string and handle special case for Mountain Village
  const id = typeof aoiId === 'number' && aoiId === 1 ? 'TMV' : String(aoiId);
  
  // Normalize layer name to create a consistent filename
  const normalizedName = layerName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  return `${STORAGE}/${id}/${normalizedName}.tif`;
}
