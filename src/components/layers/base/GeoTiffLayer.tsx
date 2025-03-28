import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { loadGeoTiffFromUrl, validateGeoTiff, getGeoTiffBounds } from '../../../utils/geotif/utils';
import { getColorScheme, getColorFromScheme, hexToRgb, GeoTiffNoDataColor } from '../../../utils/colors';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setLayerBounds, initializeLayerValueRange, setLayerMetadata, setLayerLoading } from '../../../store/slices/layers';
import { LayerType, GeoTiffRasterData, SerializableBounds } from '../../../types/map';
import { rasterDataCache } from '../../../utils/geotif/cache';
import proj4 from 'proj4';

interface GeoTiffLayerProps {
  url: string;
  active: boolean;
  zIndex?: number;
  categoryId?: string;
  layerId?: number;
}

const GeoTiffLayer: React.FC<GeoTiffLayerProps> = ({ 
  url, 
  active, 
  zIndex = 0,
  categoryId,
  layerId 
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const layerRef = useRef<L.ImageOverlay | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const imageDataRef = useRef<string | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const isCreatingAOI = useAppSelector(state => state.ui.isCreatingAOI);
  
  const opacity = useAppSelector(state => {
    if (!categoryId || !layerId) return 1;
    const category = state.layers.categories[categoryId];
    if (!category) return 1;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.opacity ?? 1;
  });

  const valueRange = useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.valueRange;
  });

  // Debug logging for layer state changes
  useEffect(() => {
    console.log('[GeoTiffLayer] State change:', {
      active,
      url,
      opacity,
      valueRange,
      hasLayer: !!layerRef.current,
      mapHasLayer: layerRef.current ? map.hasLayer(layerRef.current) : false
    });
  }, [active, url, opacity, valueRange, map]);

  // Cleanup function
  const cleanupLayer = () => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current = null;
    }
    imageDataRef.current = null;
    
    // Clear raster data from cache when layer is removed
    if (categoryId && layerId) {
      rasterDataCache.delete(`${categoryId}-${layerId}`);
    }
  };

  // Function to update visualization based on current value range
  const updateVisualization = () => {
    if (!valueRange) return;

    const rasterData = rasterDataCache.get(`${categoryId}-${layerId}`);
    if (!rasterData) return;

    const { data, width, height, noDataValue } = rasterData;

    // Create new canvas for this update
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    const imageData = ctx.createImageData(width, height);
    
    let colorScheme;
    if (url.includes('burn_probability')) {
      colorScheme = getColorScheme('burnProbability');
    } else if (url.includes('canopy_cover')) {
      colorScheme = getColorScheme('canopyCover');
    } else if (url.includes('flame_length')) {
      colorScheme = getColorScheme('fireIntensity');
    } else {
      colorScheme = getColorScheme('greenYellowRed');
    }
    
    if (!colorScheme) {
      colorScheme = getColorScheme('greenYellowRed');
    }

    // Use full data range for normalization
    const fullRange = valueRange.defaultMax - valueRange.defaultMin;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const idx = i * 4;

      if (
        value === undefined ||
        isNaN(value) ||
        !isFinite(value) ||
        (noDataValue !== null && value === noDataValue) ||
        value < valueRange.min ||
        value > valueRange.max
      ) {
        imageData.data[idx] = GeoTiffNoDataColor.r;
        imageData.data[idx + 1] = GeoTiffNoDataColor.g;
        imageData.data[idx + 2] = GeoTiffNoDataColor.b;
        imageData.data[idx + 3] = GeoTiffNoDataColor.a;
        continue;
      }

      // Normalize based on full data range, not selected range
      const normalizedValue = (value - valueRange.defaultMin) / fullRange;
      const color = getColorFromScheme(colorScheme, normalizedValue);
      const { r, g, b } = hexToRgb(color);
      
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    
    // Store the image data URL
    const dataUrl = canvas.toDataURL();
    imageDataRef.current = dataUrl;

    // Update layer if it exists
    if (layerRef.current && boundsRef.current) {
      layerRef.current.setUrl(dataUrl);
    }
  };

  // Effect for value range changes
  useEffect(() => {
    if (valueRange) {
      updateVisualization();
    }
  }, [valueRange]);

  // Main effect for layer management
  useEffect(() => {
    if (!active) {
      console.log('Cleaning up inactive layer');
      cleanupLayer();
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }
    
    if (!currentAOI) {
      console.log('No AOI selected');
      setError("Please select an Area of Interest (AOI) first");
      setLoading(false);
      return;
    }

    const loadGeoTiff = async () => {
      try {
        console.log('Starting GeoTIFF load');
        setError(null);
        setLoading(true);
        setProgress(0);

        const arrayBuffer = await loadGeoTiffFromUrl(url, setProgress);
        validateGeoTiff(arrayBuffer);

        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        if (!image) throw new Error('No image found in GeoTIFF');

        const width = image.getWidth();
        const height = image.getHeight();

        const boundsInfo = await getGeoTiffBounds(image);
    
        let serializableBounds: SerializableBounds;
        serializableBounds = boundsInfo.bounds;

        const leafletBounds = L.latLngBounds(
          L.latLng(serializableBounds[0][0], serializableBounds[0][1]),
          L.latLng(serializableBounds[1][0], serializableBounds[1][1])
        );

        const rasters = await image.readRasters();
        const data = rasters[0] as Int16Array | Float32Array;

        const rawNoData = image.fileDirectory.GDAL_NODATA;
        const noDataValue = rawNoData !== undefined
          ? Number(rawNoData.replace('\x00', ''))
          : null;

        const rasterData: GeoTiffRasterData = {
          data,
          width,
          height,
          noDataValue
        };

        // Store in raster cache
        if (categoryId && layerId) {
          rasterDataCache.set(`${categoryId}-${layerId}`, rasterData);
        }

        // Store bounds
        boundsRef.current = leafletBounds;

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        let validCount = 0;
        let noDataCount = 0;
        let zeroCount = 0;

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          if (
            value !== undefined &&
            !isNaN(value) &&
            isFinite(value) &&
            (noDataValue === null || value !== noDataValue)
          ) {
            if (value === 0) {
              zeroCount++;
            }
            min = Math.min(min, value);
            max = Math.max(max, value);
            sum += value;
            validCount++;
          } else {
            noDataCount++;
          }
        }

        const mean = validCount > 0 ? sum / validCount : 0;

        if (categoryId && layerId) {
          // Update layer metadata (serializable only)
          dispatch(setLayerMetadata({
            categoryId,
            layerId,
            metadata: {
              width,
              height,
              bounds: serializableBounds,
              noDataValue,
              sourceCRS: boundsInfo.sourceCRS,
              tiepoint: boundsInfo.tiepoint || [],
              scale: boundsInfo.pixelScale || [],
              transform: boundsInfo.transform,
              rawBounds: boundsInfo.rawBounds,
              rawBoundsCRS: boundsInfo.sourceCRS,
              stats: {
                min,
                max,
                mean,
                validCount,
                noDataCount,
                zeroCount
              }
            },
            range: {
              min,
              max,
              mean
            }
          }));

          // Initialize value range if not set
          if (!valueRange) {
            dispatch(initializeLayerValueRange({
              categoryId,
              layerId,
              min,
              max
            }));
          }

          // Update layer bounds
          dispatch(setLayerBounds({
            categoryId,
            layerId,
            bounds: serializableBounds
          }));
        }

        // Initial visualization
        updateVisualization();

        // Only create/update layer if we have image data
        if (imageDataRef.current) {
          if (layerRef.current) {
            console.log('Updating existing layer');
            layerRef.current.setUrl(imageDataRef.current);
            layerRef.current.setBounds(leafletBounds);
            layerRef.current.setOpacity(opacity);
          } else {
            console.log('Creating new layer');
            const layer = L.imageOverlay(imageDataRef.current, leafletBounds, {
              opacity: opacity,
              interactive: false,
              zIndex: zIndex,
              className: 'geotiff-high-quality'
            });

            layer.addTo(map);
            layerRef.current = layer;
          }
        }

        setLoading(false);
        setProgress(100);
        
        console.log('Layer loaded successfully');
      } catch (error) {
        console.error('Failed to load layer:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setError(message);
        setLoading(false);
        cleanupLayer();
      }
    };

    loadGeoTiff();

    return () => {
      console.log('Cleanup effect running');
      cleanupLayer();
    };
  }, [map, url, active, dispatch, categoryId, layerId, currentAOI, isCreatingAOI, zIndex]);

  // Separate effect for opacity changes
  useEffect(() => {
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      console.log('Updating layer opacity:', opacity);
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity, map]);

  if (loading) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Loading GeoTIFF...
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