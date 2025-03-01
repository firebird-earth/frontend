import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { loadGeoTiffFromUrl, validateGeoTiff, getGeoTiffBounds } from '../../../utils/geotiffUtils';
import { getColorChannels, getNoDataColor, getZeroValueColor } from '../../../utils/colorUtils';

interface GeoTiffLayerProps {
  url: string;
  active: boolean;
}

const GeoTiffLayer: React.FC<GeoTiffLayerProps> = ({ url, active }) => {
  console.log('GeoTiffLayer render:', { url, active }); // Debug render

  const map = useMap();
  const layerRef = useRef<L.ImageOverlay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('GeoTiffLayer effect running:', { active }); // Debug effect

    if (!active) {
      if (layerRef.current) {
        console.log('Removing GeoTIFF layer');
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      setError(null);
      return;
    }

    const loadGeoTiff = async () => {
      try {
        setError(null);
        setLoading(true);
        setProgress(0);

        console.log('Starting GeoTIFF layer load for URL:', url);

        // Load and validate the GeoTIFF file
        console.log('Loading GeoTIFF data...');
        const arrayBuffer = await loadGeoTiffFromUrl(url, setProgress);
        validateGeoTiff(arrayBuffer);

        // Create GeoTIFF object
        console.log('Creating GeoTIFF object...');
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        if (!image) throw new Error('No image found in GeoTIFF');

        const width = image.getWidth();
        const height = image.getHeight();
        console.log('GeoTIFF dimensions:', { width, height });

        // Get bounds directly from GeoTIFF metadata
        console.log('Calculating GeoTIFF bounds...');
        const boundsInfo = await getGeoTiffBounds(image);
        
        // Log the bounds information for debugging
        console.log('GeoTIFF bounds info:', boundsInfo);

        const leafletBounds = L.latLngBounds(boundsInfo.bounds);
        
        // Calculate the center and dimensions
        const center = leafletBounds.getCenter();
        const width_deg = Math.abs(boundsInfo.bounds[1][1] - boundsInfo.bounds[0][1]);
        const height_deg = Math.abs(boundsInfo.bounds[1][0] - boundsInfo.bounds[0][0]);
        
        // Calculate the ground distance ratio at this latitude
        const centerLat = center.lat;
        const groundDistanceRatio = (width_deg * Math.cos(centerLat * Math.PI / 180)) / height_deg;
        
        console.log('Creating Leaflet bounds:', {
          bounds: boundsInfo.bounds,
          leafletBounds: leafletBounds.toBBoxString(),
          southWest: leafletBounds.getSouthWest(),
          northEast: leafletBounds.getNorthEast(),
          center: center,
          width: width_deg,
          height: height_deg,
          aspectRatio: width_deg / height_deg,
          groundDistanceRatio: groundDistanceRatio
        });

        // Read raster data
        console.log('Reading raster data...');
        const rasters = await image.readRasters();
        if (!rasters || !rasters[0]) throw new Error('No raster data found');

        const data = rasters[0] as Int16Array;
        console.log('Raster data info:', {
          length: data.length,
          type: data.constructor.name,
          sampleValues: Array.from(data.slice(0, 5))
        });

        // Get NODATA value
        const rawNoData = image.fileDirectory.GDAL_NODATA;
        console.log('Raw NODATA value:', rawNoData);
        const noDataValue = rawNoData !== undefined
          ? Number(rawNoData.replace('\x00', ''))
          : null;
        console.log('Parsed NODATA value:', noDataValue);

        // Find min/max values
        console.log('Calculating data range...');
        let min = Infinity;
        let max = -Infinity;
        let validCount = 0;
        let noDataCount = 0;
        let nanCount = 0;
        let infCount = 0;
        let zeroCount = 0;

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          if (
            value !== undefined &&
            !isNaN(value) &&
            (noDataValue === null || value !== noDataValue)
          ) {
            if (!isFinite(value)) {
              infCount++;
              continue;
            }
            if (value === 0) {
              zeroCount++;
            }
            min = Math.min(min, value);
            max = Math.max(max, value);
            validCount++;
          } else if (isNaN(value)) {
            nanCount++;
          } else if (noDataValue !== null && value === noDataValue) {
            noDataCount++;
          }
        }

        console.log('Data statistics:', {
          min,
          max,
          validCount,
          noDataCount,
          nanCount,
          infCount,
          zeroCount,
          totalPixels: width * height
        });

        if (min === Infinity || max === -Infinity) {
          throw new Error('No valid data values found');
        }

        // Create a canvas to draw the raster
        console.log('Creating visualization...');
        const range = max - min;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        const imageData = ctx.createImageData(width, height);
        
        // Get color functions
        const noDataColor = getNoDataColor();
        const zeroValueColor = getZeroValueColor();
        
        // Generate visualization with appropriate color scheme
        let validPixelsInVisualization = 0;
        let noDataPixelsInVisualization = 0;
        let zeroPixelsInVisualization = 0;

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          const idx = i * 4;

          if (
            value === undefined ||
            isNaN(value) ||
            !isFinite(value) ||
            (noDataValue !== null && value === noDataValue)
          ) {
            // Use transparent for nodata values
            imageData.data[idx] = noDataColor.r;
            imageData.data[idx + 1] = noDataColor.g;
            imageData.data[idx + 2] = noDataColor.b;
            imageData.data[idx + 3] = noDataColor.a;
            noDataPixelsInVisualization++;
            continue;
          }
          
          // Special handling for zero values
          if (value === 0) {
            imageData.data[idx] = zeroValueColor.r;
            imageData.data[idx + 1] = zeroValueColor.g;
            imageData.data[idx + 2] = zeroValueColor.b;
            imageData.data[idx + 3] = zeroValueColor.a;
            zeroPixelsInVisualization++;
            continue;
          }

          // Normalize value between 0 and 1
          const normalizedValue = (value - min) / range;

          // Get color channels based on layer type
          const { r, g, b } = getColorChannels(url, normalizedValue);
          
          imageData.data[idx] = r;     // Red channel
          imageData.data[idx + 1] = g; // Green channel
          imageData.data[idx + 2] = b; // Blue channel
          imageData.data[idx + 3] = 255; // Fully opaque

          validPixelsInVisualization++;
        }

        console.log('Visualization statistics:', {
          validPixels: validPixelsInVisualization,
          noDataPixels: noDataPixelsInVisualization,
          zeroPixels: zeroPixelsInVisualization,
          totalPixels: width * height
        });

        ctx.putImageData(imageData, 0, 0);

        // Remove previous layer if any
        if (layerRef.current) {
          console.log('Removing previous GeoTIFF layer');
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        }

        // Convert canvas to data URL for Leaflet overlay
        console.log('Creating image overlay...');
        const imageUrl = canvas.toDataURL();
        const layer = L.imageOverlay(imageUrl, leafletBounds, {
          opacity: 1.0,
          interactive: false
        });

        console.log('Adding layer to map...');
        layer.addTo(map);
        layerRef.current = layer;

        // Fit map view to the new layer's bounds
        console.log('Fitting map to bounds:', leafletBounds.toBBoxString());
        map.fitBounds(leafletBounds, {
          padding: [50, 50],
          maxZoom: 16
        });

        console.log('GeoTIFF layer added successfully');
        setLoading(false);
        setProgress(100);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('GeoTIFF layer error:', err);
        setError(message);
        setLoading(false);
      }
    };

    loadGeoTiff();

    // Cleanup
    return () => {
      if (layerRef.current) {
        console.log('Cleaning up GeoTIFF layer');
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, url, active]);

  if (loading) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Loading GeoTIFF data...
            </div>
            <div className="mt-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {progress}% complete
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-md">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Failed to load GeoTIFF
            </h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GeoTiffLayer;