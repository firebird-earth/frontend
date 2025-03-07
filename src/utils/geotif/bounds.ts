import * as GeoTIFF from 'geotiff';
import proj4 from 'proj4';
import { GeoTiffBounds } from './types';

// Register common projections
proj4.defs('EPSG:26913', '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs');

export async function getGeoTiffBounds(image: GeoTIFF.GeoTIFFImage): Promise<GeoTiffBounds> {
  console.log('Calculating GeoTIFF bounds...');

  // Get coordinate transformation info
  const tiepoint = image.fileDirectory.ModelTiepointTag;
  const pixelScale = image.fileDirectory.ModelPixelScaleTag;
  const transform = image.fileDirectory.ModelTransformationTag;

  console.log('Coordinate transformation info:', {
    tiepoint: tiepoint ? Array.from(tiepoint) : null,
    pixelScale: pixelScale ? Array.from(pixelScale) : null,
    transform: transform ? Array.from(transform) : null
  });

  // Get GeoKeys for CRS information
  const geoKeys = image.geoKeys || {};
  console.log('GeoKeys:', geoKeys);

  // Determine source CRS
  let sourceCRS = 'EPSG:4326'; // Default to WGS84
  if (geoKeys.ProjectedCSTypeGeoKey) {
    sourceCRS = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`;
  } else if (geoKeys.GeographicTypeGeoKey) {
    sourceCRS = `EPSG:${geoKeys.GeographicTypeGeoKey}`;
  }
  console.log('Source CRS:', sourceCRS);

  const width = image.getWidth();
  const height = image.getHeight();
  console.log('Image dimensions:', { width, height });

  let west: number, south: number, east: number, north: number;

  if (transform) {
    // Use transformation matrix
    console.log('Using transformation matrix for bounds');
    const [a, b, c, x0, d, e, f, y0] = transform;
    
    west = x0;
    north = y0;
    east = x0 + (width * a);
    south = y0 + (height * e);
    
    console.log('Calculated bounds from transform:', { west, north, east, south });
  } else if (tiepoint && pixelScale) {
    // Use tiepoint and pixel scale
    console.log('Using tiepoint and pixel scale for bounds');
    const [i, j, k, x, y, z] = tiepoint;
    const [scaleX, scaleY] = pixelScale;
    
    west = x;
    north = y;
    east = x + (width * Math.abs(scaleX));
    south = y - (height * Math.abs(scaleY));
    
    console.log('Calculated bounds from tiepoint/scale:', { west, north, east, south });
  } else {
    // Fallback to bounding box
    console.log('Falling back to bounding box');
    const bbox = image.getBoundingBox();
    console.log('Raw bounding box:', bbox);
    
    if (!bbox || bbox.length !== 4) {
      throw new Error('Invalid bounding box');
    }
    
    [west, south, east, north] = bbox;
    console.log('Bounds from bounding box:', { west, south, east, north });
  }

  // Transform coordinates to WGS84 if needed
  if (sourceCRS !== 'EPSG:4326') {
    try {
      console.log('Transforming coordinates from', sourceCRS, 'to WGS84');
      
      // Register the source CRS if needed
      if (!proj4.defs(sourceCRS)) {
        console.log('Registering source CRS definition for', sourceCRS);
        
        // Add common CRS definitions here if needed
        if (sourceCRS === 'EPSG:26913') {
          proj4.defs('EPSG:26913', '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs');
        } else if (sourceCRS === 'EPSG:32613') {
          proj4.defs('EPSG:32613', '+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs');
        } else if (sourceCRS === 'EPSG:3857') {
          proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs');
        }
      }

      // Transform corners to maintain aspect ratio
      const corners = [
        [west, south],  // Southwest
        [east, south],  // Southeast
        [east, north],  // Northeast
        [west, north]   // Northwest
      ];

      // Transform each corner
      const transformedCorners = corners.map(corner => 
        proj4(sourceCRS, 'EPSG:4326', corner)
      );

      // Find the new bounds
      west = Math.min(...transformedCorners.map(c => c[0]));
      east = Math.max(...transformedCorners.map(c => c[0]));
      south = Math.min(...transformedCorners.map(c => c[1]));
      north = Math.max(...transformedCorners.map(c => c[1]));

      console.log('Transformed corners:', {
        original: corners,
        transformed: transformedCorners,
        bounds: { west, south, east, north }
      });
    } catch (e) {
      console.error('Coordinate transformation failed:', e);
      throw new Error('Failed to transform coordinates to WGS84');
    }
  }

  // Validate bounds
  if (isNaN(west) || isNaN(south) || isNaN(east) || isNaN(north)) {
    throw new Error('Invalid bounds: coordinates contain NaN values');
  }

  if (west === east || south === north) {
    throw new Error('Invalid bounds: zero width or height');
  }

  // Ensure coordinates are within valid ranges
  west = Math.max(-180, Math.min(180, west));
  east = Math.max(-180, Math.min(180, east));
  south = Math.max(-90, Math.min(90, south));
  north = Math.max(-90, Math.min(90, north));

  // Ensure correct ordering
  if (west > east) {
    [west, east] = [east, west];
  }
  if (south > north) {
    [south, north] = [north, south];
  }

  // Return Leaflet-friendly bounds: [[south, west], [north, east]]
  const bounds: [[number, number], [number, number]] = [[south, west], [north, east]];
  
  console.log('Final WGS84 bounds:', {
    bounds,
    sourceCRS,
    transform,
    tiepoint,
    pixelScale,
    aspectRatio: {
      width: Math.abs(east - west),
      height: Math.abs(north - south),
      ratio: Math.abs(east - west) / Math.abs(north - south)
    }
  });

  return {
    bounds,
    sourceCRS,
    transform,
    tiepoint,
    pixelScale
  };
}