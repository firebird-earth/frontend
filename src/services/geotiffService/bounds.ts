import * as GeoTIFF from 'geotiff';
import proj4 from 'proj4';
import { GeoTiffBounds } from './types';
import { registerUTMProjection } from '../../utils/crs';

// Debug configuration
const BoundsConfig = {
  debug: false
} as const;

export function setBoundsDebug(enabled: boolean) {
  (BoundsConfig as any).debug = enabled;
}

export async function getGeoTiffBounds(image: GeoTIFF.GeoTIFFImage): Promise<GeoTiffBounds> {
  if (BoundsConfig.debug) {
    console.log('Calculating GeoTIFF bounds...');
  }

  // Get coordinate transformation info
  const tiepoint = image.fileDirectory.ModelTiepointTag;
  const pixelScale = image.fileDirectory.ModelPixelScaleTag;
  const transform = image.fileDirectory.ModelTransformationTag;

  if (BoundsConfig.debug) {
    console.log('Coordinate transformation info:', {
      tiepoint: tiepoint ? Array.from(tiepoint) : null,
      pixelScale: pixelScale ? Array.from(pixelScale) : null,
      transform: transform ? Array.from(transform) : null
    });
  }

  // Get GeoKeys for CRS information
  const geoKeys = image.geoKeys || {};
  if (BoundsConfig.debug) {
    console.log('GeoKeys:', geoKeys);
  }

  // Determine source CRS
  let sourceCRS = 'EPSG:4326'; // Default to WGS84
  if (geoKeys.ProjectedCSTypeGeoKey) {
    sourceCRS = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`;
  } else if (geoKeys.GeographicTypeGeoKey) {
    sourceCRS = `EPSG:${geoKeys.GeographicTypeGeoKey}`;
  }

  // Register UTM projection if needed
  registerUTMProjection(sourceCRS);

  if (BoundsConfig.debug) {
    console.log('Source CRS:', sourceCRS);
  }

  const width = image.getWidth();
  const height = image.getHeight();
  if (BoundsConfig.debug) {
    console.log('Image dimensions:', { width, height });
  }

  let west: number, south: number, east: number, north: number;
  let rawBounds: [number, number, number, number] | undefined;

  if (transform) {
    // Use transformation matrix
    if (BoundsConfig.debug) {
      console.log('Using transformation matrix for bounds');
    }
    const [a, b, c, x0, d, e, f, y0] = transform;
    
    west = x0;
    north = y0;
    east = x0 + (width * a);
    south = y0 + (height * e);
    
    rawBounds = [west, south, east, north];
    if (BoundsConfig.debug) {
      console.log('Calculated bounds from transform:', { west, north, east, south });
    }
  } else if (tiepoint && pixelScale) {
    // Use tiepoint and pixel scale
    if (BoundsConfig.debug) {
      console.log('Using tiepoint and pixel scale for bounds');
    }
    const [i, j, k, x, y, z] = tiepoint;
    const [scaleX, scaleY] = pixelScale;
    
    west = x;
    north = y;
    east = x + (width * Math.abs(scaleX));
    south = y - (height * Math.abs(scaleY));
    
    rawBounds = [west, south, east, north];
    if (BoundsConfig.debug) {
      console.log('Calculated bounds from tiepoint/scale:', { west, north, east, south });
    }
  } else {
    // Fallback to bounding box
    if (BoundsConfig.debug) {
      console.log('Falling back to bounding box');
    }
    const bbox = image.getBoundingBox();
    if (BoundsConfig.debug) {
      console.log('Raw bounding box:', bbox);
    }
    
    if (!bbox || bbox.length !== 4) {
      throw new Error('Invalid bounding box');
    }
    
    [west, south, east, north] = bbox;
    rawBounds = [west, south, east, north];
    if (BoundsConfig.debug) {
      console.log('Bounds from bounding box:', { west, south, east, north });
    }
  }

  // Transform corners to WGS84 if needed
  if (sourceCRS !== 'EPSG:4326') {
    try {
      if (BoundsConfig.debug) {
        console.log('Transforming coordinates from', sourceCRS, 'to WGS84');
      }

      // Transform corners to maintain aspect ratio
      const corners = [
        [west, south],  // Southwest
        [east, south],  // Southeast
        [east, north],  // Northeast
        [west, north]   // Northwest
      ];

      // Transform each corner
      const transformedCorners = corners.map(corner => {
        try {
          return proj4(sourceCRS, 'EPSG:4326', corner);
        } catch (error) {
          console.error('Failed to transform corner:', corner, error);
          throw error;
        }
      });

      // Find the new bounds
      west = Math.min(...transformedCorners.map(c => c[0]));
      east = Math.max(...transformedCorners.map(c => c[0]));
      south = Math.min(...transformedCorners.map(c => c[1]));
      north = Math.max(...transformedCorners.map(c => c[1]));

      if (BoundsConfig.debug) {
        console.log('Transformed corners:', {
          original: corners,
          transformed: transformedCorners,
          bounds: { west, south, east, north }
        });
      }
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
  const leafletBounds: [[number, number], [number, number]] = [[south, west], [north, east]];

  const leafletBoundsLatLng = L.latLngBounds(
    L.latLng(leafletBounds[0][0], leafletBounds[0][1]),
    L.latLng(leafletBounds[1][0], leafletBounds[1][1])
  );

  if (BoundsConfig.debug) {
    console.log('Final bounds:', {
      rawBounds,
      leafletBounds,
      leafletBoundsLatLng,
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
  }

  return {
    rawBounds,
    leafletBounds,
    leafletBoundsLatLng,    
    sourceCRS,
    transform,
    tiepoint,
    pixelScale
  };
}