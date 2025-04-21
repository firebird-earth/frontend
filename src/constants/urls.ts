// Openstreet
export const OPENSTREETMAP = 'https://{s}.tile.openstreetmap.org';

// Opentopo
export const OPENTOPOMAP = 'https://{s}.tile.opentopomap.org';

// CartoDB
export const CARTODB = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net';

// ArcGIS Online base URL
// Directory: https://server.arcgisonline.com/arcgis/rest/services
export const ARCGIS_ONLINE = 'https://server.arcgisonline.com/ArcGIS/rest/services';

// Basemap layers
export const BASEMAP_LAYERS = {
  STREET: `${OPENSTREETMAP}/{z}/{x}/{y}.png`,
  STREET_LIGHT: `${CARTODB}/light_all/{z}/{x}/{y}.png`,
  TERRAIN: `${OPENTOPOMAP}/{z}/{x}/{y}.png`,
  SATELLITE: `${ARCGIS_ONLINE}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
  TOPO: `${ARCGIS_ONLINE}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`
} as const;

// ArcGIS FeatureServer base URL
// Directory: https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services
export const ARCGIS_SERVICES = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services';

// ArcGIS FeatureServer layers
export const STATES_LAYER = `${ARCGIS_SERVICES}/USA_States_Generalized_Boundaries/FeatureServer/0`;
export const COUNTIES_LAYER = `${ARCGIS_SERVICES}/USA_Counties_Generalized_Boundaries/FeatureServer/0`;
export const FEDERAL_LANDS_LAYER = `${ARCGIS_SERVICES}/USA_Federal_Lands/FeatureServer/0`;
export const USFS_LANDS_LAYER = `${ARCGIS_SERVICES}/USA_Forest_Service_Lands/FeatureServer/0`;
export const USFWS_LANDS_LAYER = `${ARCGIS_SERVICES}/USA_Fish_and_Wildlife_Service_Lands/FeatureServer/0`;

// USFS MapServer base URL
// Directory: https://apps.fs.usda.gov/arcx/rest/services/EDW
export const USFS = 'https://apps.fs.usda.gov/arcx/rest/services';

// USFS layers
export const WUI_LAYER = `${USFS}/EDW/EDW_WUI_2020_01/MapServer/tile/{z}/{y}/{x}`;
export const CRISIS_AREAS_LAYER = `${USFS}/EDW/EDW_BILLandscapeInvestments_01/MapServer/0`;

// 3DEP ImageServer base URL
// Directory: https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer
export const ELEVATION_3DEP = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer';

// Firebird base URLs
export const STORAGE = 'https://storage.googleapis.com/firebird-geotiff-public';

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
