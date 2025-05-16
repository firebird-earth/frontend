// src/utils/crs.ts
import proj4 from 'proj4';

const crsNames: Record<string, string> = {
  'EPSG:4326': 'WGS 84',
  'EPSG:3857': 'Web Mercator',
  'EPSG:4269': 'NAD83',
};

// Add UTM zone definitions
for (let zone = 1; zone <= 60; zone++) {
  crsNames[`EPSG:326${zone}`] = `WGS 84 / UTM ${zone}N`;
  crsNames[`EPSG:327${zone}`] = `WGS 84 / UTM ${zone}S`;
  crsNames[`EPSG:269${zone}`] = `NAD83 / UTM ${zone}N`;
}

export function getCRSName(code: string): string {
  return crsNames[code] || code;
}

/**
 * Registers the Web Mercator (EPSG:3857) definition.
 */
export function registerCRSWebMercator(): void {
  proj4.defs(
    'EPSG:3857',
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 ' +
    '+x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs'
  );
}

/**
 * Registers the Geographic WGS84 (EPSG:4326) definition.
 */
export function registerCRSGeographic(): void {
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
}

/**
 * Registers the Geographic NAD83 (EPSG:4269) definition.
 */
export function registerCRSNAD83Geographic(): void {
  proj4.defs('EPSG:4269', '+proj=longlat +datum=NAD83 +no_defs');
}

/**
 * Registers all WGS84 UTM projections for zones 1–60 (northern hemisphere).
 * Should be called once at app startup before any proj4.transform calls.
 */
export function registerUTMWGS84NorthernZones(): void {
  for (let zone = 1; zone <= 60; zone++) {
    const zoneCode = zone.toString().padStart(2, '0');
    const epsg = `EPSG:326${zoneCode}`;
    const def = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
    proj4.defs(epsg, def);
  }
}

/**
 * Registers all NAD83 UTM projections for zones 1–60 (northern hemisphere).
 * Should be called once at app startup before any proj4.transform calls.
 */
export function registerUTMNAD83NorthernZones(): void {
  for (let zone = 1; zone <= 60; zone++) {
    const zoneCode = zone.toString().padStart(2, '0');
    const epsg = `EPSG:269${zoneCode}`;
    const def = `+proj=utm +zone=${zone} +datum=NAD83 +units=m +no_defs`;
    proj4.defs(epsg, def);
  }
}

/**
 * Registers all CRS definitions needed in the app:
 * - Geographic WGS84 (EPSG:4326)
 * - Web Mercator (EPSG:3857)
 * - Geographic NAD83 (EPSG:4269)
 * - Northern hemisphere UTM zones (WGS84 and NAD83)
 */
export function registerAllCRSDefs(): void {
  registerCRSWebMercator();
  registerCRSGeographic();
  registerCRSNAD83Geographic();
  registerUTMWGS84NorthernZones();
  registerUTMNAD83NorthernZones();
}

export function registerUTMProjection(epsgCode: string) {
  // Only handle UTM codes
  if (!epsgCode.match(/^EPSG:(269|327)\d{2}$/)) {
    return;
  }

  // Extract zone number from EPSG code
  const zone = parseInt(epsgCode.slice(-2));
  if (isNaN(zone) || zone < 1 || zone > 60) {
    return;
  }

  // Determine hemisphere and datum
  const isNAD83 = epsgCode.startsWith('EPSG:269');
  const isNorth = epsgCode.startsWith('EPSG:269') || epsgCode.startsWith('EPSG:326');
  const hemisphere = isNorth ? '' : '+south';
  const datum = isNAD83 ? '+datum=NAD83' : '+datum=WGS84';

  // Create proj4 definition
  const proj4def = `+proj=utm +zone=${zone} ${hemisphere} ${datum} +units=m +no_defs`;

  // Register the CRS if not already defined
  if (!proj4.defs(epsgCode)) {
    proj4.defs(epsgCode, proj4def);
  }
}
