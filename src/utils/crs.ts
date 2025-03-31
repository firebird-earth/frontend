// src/utils/crs.ts
const crsNames: Record<string, string> = {
  'EPSG:4326': 'WGS 84',
  'EPSG:3857': 'Web Mercator',
  'EPSG:4269': 'NAD83',
};

// Add UTM zone definitions
for (let zone = 1; zone <= 60; zone++) {
  crsNames[`EPSG:326${zone}`] = `WGS 84 / UTM zone ${zone}N`;
  crsNames[`EPSG:327${zone}`] = `WGS 84 / UTM zone ${zone}S`;
  crsNames[`EPSG:269${zone}`] = `NAD83 / UTM zone ${zone}N`;
}

export function getCRSName(code: string): string {
  return crsNames[code] || code;
}