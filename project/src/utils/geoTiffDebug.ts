import { GeoTiffBounds } from './geotiffUtils';

export function getMountainVillageBounds(): GeoTiffBounds {
  // Mountain Village, CO coordinates
  // Using a square-shaped bounding box to match the 983x983 GeoTIFF dimensions
  // Leaflet expects bounds in [[southLat, westLng], [northLat, eastLng]] format
  
  // Center point of Mountain Village
  const centerLat = 37.932210;
  const centerLng = -107.856614;
  
  // When working with latitude/longitude, we need to account for the fact that
  // degrees of longitude get shorter as we move away from the equator
  // At this latitude, 1 degree of longitude is about 87% the length of 1 degree of latitude
  // So we need to adjust our longitude offset to maintain a square appearance
  const latOffset = 0.02; // Offset in latitude (about 2.2 km)
  const lngOffset = latOffset / Math.cos(centerLat * Math.PI / 180); // Adjust for latitude
  
  const bounds: [[number, number], [number, number]] = [
    [centerLat - latOffset, centerLng - lngOffset], // [southLat, westLng]
    [centerLat + latOffset, centerLng + lngOffset]  // [northLat, eastLng]
  ];

  // Calculate the actual width and height in degrees
  const width = Math.abs(bounds[1][1] - bounds[0][1]);
  const height = Math.abs(bounds[1][0] - bounds[0][0]);
  
  console.log('Debug bounds being used:', {
    southwest: bounds[0],
    northeast: bounds[1],
    width,
    height,
    aspectRatio: width / height,
    // At this latitude, the actual ground distance ratio should be close to 1.0
    groundDistanceRatio: (width * Math.cos(centerLat * Math.PI / 180)) / height
  });

  return {
    bounds,
    sourceCRS: 'EPSG:4326',
    transform: undefined,
    tiepoint: undefined,
    pixelScale: undefined
  };
}

export function compareGeoTiffBounds(actual: GeoTiffBounds, expected: GeoTiffBounds = getMountainVillageBounds()): void {
  console.log('GeoTIFF Bounds Comparison:');
  console.log('Expected bounds:', expected.bounds);
  console.log('Actual bounds:', actual.bounds);
  
  const [expectedSouth, expectedWest] = expected.bounds[0];
  const [expectedNorth, expectedEast] = expected.bounds[1];
  const [actualSouth, actualWest] = actual.bounds[0];
  const [actualNorth, actualEast] = actual.bounds[1];

  console.log('Differences:');
  console.log('South:', {
    expected: expectedSouth,
    actual: actualSouth,
    diff: Math.abs(expectedSouth - actualSouth).toFixed(6)
  });
  console.log('North:', {
    expected: expectedNorth,
    actual: actualNorth,
    diff: Math.abs(expectedNorth - actualNorth).toFixed(6)
  });
  console.log('West:', {
    expected: expectedWest,
    actual: actualWest,
    diff: Math.abs(expectedWest - actualWest).toFixed(6)
  });
  console.log('East:', {
    expected: expectedEast,
    actual: actualEast,
    diff: Math.abs(expectedEast - actualEast).toFixed(6)
  });
  
  // Calculate aspect ratios
  const expectedWidth = Math.abs(expectedEast - expectedWest);
  const expectedHeight = Math.abs(expectedNorth - expectedSouth);
  const actualWidth = Math.abs(actualEast - actualWest);
  const actualHeight = Math.abs(actualNorth - actualSouth);
  
  // Calculate the center latitude for both bounds
  const expectedCenterLat = (expectedNorth + expectedSouth) / 2;
  const actualCenterLat = (actualNorth + actualSouth) / 2;
  
  console.log('Aspect Ratio:', {
    expected: expectedWidth / expectedHeight,
    actual: actualWidth / actualHeight,
    diff: Math.abs((expectedWidth / expectedHeight) - (actualWidth / actualHeight)).toFixed(6)
  });
  
  // Calculate ground distance ratio (accounting for latitude)
  console.log('Ground Distance Ratio:', {
    expected: (expectedWidth * Math.cos(expectedCenterLat * Math.PI / 180)) / expectedHeight,
    actual: (actualWidth * Math.cos(actualCenterLat * Math.PI / 180)) / actualHeight
  });
}

export function useDebugBounds(): boolean {
  return true;
}