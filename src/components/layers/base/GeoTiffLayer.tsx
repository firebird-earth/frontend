import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { validateGeoTiff } from '../../../utils/geotif/utils';
import { getColorScheme, getColorFromScheme, hexToRgb, GeoTiffNoDataColor } from '../../../utils/colors';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setLayerBounds, initializeLayerValueRange, setLayerMetadata, setLayerLoading } from '../../../store/slices/layers';
import { LayerType, GeoTiffRasterData } from '../../../types/map';
import { rasterDataCache } from '../../../utils/geotif/cache';
import { defaultColorScheme } from '../../../constants/colors';
import { geotiffService } from '../../../services/maps/geotiffService';
import { getGeoTiffBounds } from '../../../utils/geotif/bounds';
import { leafletLayerMap } from '../../../store/slices/layers/state';

interface GeoTiffLayerProps {
  url: string;
  active: boolean;
  categoryId?: string;
  layerId?: number;
  onError?: (error: Error) => void;
}

const GeoTiffLayer: React.FC<GeoTiffLayerProps> = ({ 
  url, 
  active, 
  zIndex = 0,
  categoryId,
  layerId,
  onError
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
  const loadTimeoutRef = useRef<number | null>(null);
  
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

  const layer = useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.id === layerId);
  });
 
  // Cleanup function
  const cleanupLayer = () => {
    if (layerRef.current) {
      // Remove from WeakMap if layer exists
      if (layer) {
        const existingLeafletLayer = leafletLayerMap.get(layerId);
        if (existingLeafletLayer) {
          leafletLayerMap.delete(layerId);
        }
      }
      
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current = null;
    }
    imageDataRef.current = null;
    boundsRef.current = null;
    
    // Clear raster data from cache
    if (categoryId && layerId) {
      rasterDataCache.delete(`${categoryId}-${layerId}`);
    }
  };

  // Effect for cleanup
  useEffect(() => {
    if (!active) {
      cleanupLayer();
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }
    return () => cleanupLayer();
  }, [active, map, categoryId, layerId]);

  // Update the loading state in Redux when loading changes
  useEffect(() => {
    dispatch(setLayerLoading({ categoryId, layerId, loading }));
  }, [loading, categoryId, layerId, dispatch]);

  // Function to update visualization based on current value range
  const updateVisualization = () => {
    if (!valueRange || !boundsRef.current || !layer) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const rasterData = rasterDataCache.get(`${categoryId}-${layerId}`);
    if (!rasterData) return;

    const { data, width, height, noDataValue } = rasterData;

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    const scheme = getColorScheme(layer.colorScheme || defaultColorScheme);
    if (!scheme) {
      console.error('No color scheme found for:', layer.colorScheme);
      return;
    }

    const domain = layer.domain || [valueRange.defaultMin, valueRange.defaultMax];
    const fullRange = domain[1] - domain[0];

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
 
      const normalizedValue = (value - domain[0]) / fullRange;
      const color = getColorFromScheme(scheme, normalizedValue);
      const { r, g, b } = hexToRgb(color);
      
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL();
    imageDataRef.current = dataUrl;

    // Create new image overlay
    const imageOverlay = L.imageOverlay(dataUrl, boundsRef.current, {
      opacity: opacity,
      interactive: false,
      className: 'geotiff-high-quality',
      pane: layer.pane,
      zIndex: layer.order || 0
    });

    console.log("---> add layer to map", {layer:layer.name, id:layer.id, pane:layer.pane, order:layer.order, zindex:layer.order}) 
    
    imageOverlay.addTo(map);
    layerRef.current = imageOverlay;

    // Store the Leaflet layer reference in the WeakMap
    leafletLayerMap.set(layerId, imageOverlay);
  };

  // Effect for value range changes
  useEffect(() => {
    if (valueRange) {
      updateVisualization();
    }
  }, [valueRange]);

  // Effect for opacity changes
  useEffect(() => {
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity, map]);

  // Main effect for layer management
  useEffect(() => {
    if (!active) {
      cleanupLayer();
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }
    
    if (!currentAOI) {
      setError("Please select an Area of Interest (AOI) first");
      setLoading(false);
      return;
    }

    const loadData = async (bounds: L.LatLngBounds) => {
      try {
        setError(null);
        setLoading(true);
        setProgress(0);

        // Load and process GeoTIFF
        const arrayBuffer = await geotiffService.getGeoTiffData(url, setProgress);
        validateGeoTiff(arrayBuffer);

        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        
        const width = image.getWidth();
        const height = image.getHeight();
        const rasters = await image.readRasters();
        const data = rasters[0] as Float32Array;

        const boundsInfo = await getGeoTiffBounds(image);
        const leafletBounds = L.latLngBounds(
          L.latLng(boundsInfo.bounds[0][0], boundsInfo.bounds[0][1]),
          L.latLng(boundsInfo.bounds[1][0], boundsInfo.bounds[1][1])
        );

        boundsRef.current = leafletBounds;

        // Get the GDAL_NODATA value
        const rawNoData = image.fileDirectory.GDAL_NODATA;
        const noDataValue = rawNoData !== undefined ? Number(rawNoData.replace('\x00', '')) : null;

        const rasterData: GeoTiffRasterData = {
          data,
          width,
          height,
          noDataValue
        };

        // Store in raster cache
        rasterDataCache.set(`${categoryId}-${layerId}`, rasterData);

        const cachedMetadata = geotiffService.getCache().get(url)?.metadata;
        if (!cachedMetadata) {
          throw new Error('Metadata not found in cache');
        }

        let resolutionCached = cachedMetadata.metadata.standard.resolution;
  
        // Get statistics
        let min = Infinity;
        let max = -Infinity;
        let mean = Infinity;
        let validCount = 0;
        let noDataCount = 0;
        let zeroCount = 0;

        validCount = cachedMetadata.metadata.standard.nonNullValues;
        noDataCount = cachedMetadata.metadata.standard.noDataCount;
        zeroCount = cachedMetadata.metadata.standard.zeroCount;    
        min = cachedMetadata.range.min;
        max = cachedMetadata.range.max;
        mean = cachedMetadata.range.mean;
          
        if (categoryId && layerId) {
          // Update layer metadata
          dispatch(setLayerMetadata({
            categoryId,
            layerId,
            metadata: {
              width,
              height,
              bounds: boundsInfo.bounds,
              noDataValue,
              sourceCRS: boundsInfo.sourceCRS,
              tiepoint: boundsInfo.tiepoint || [],
              scale: boundsInfo.pixelScale || [],
              transform: boundsInfo.transform,
              rawBounds: boundsInfo.rawBounds,
              resolution: cachedMetadata.metadata.standard.resolution,
              stats: {
                min,
                max,
                mean,
                validCount,
                noDataCount,
                zeroCount
              }
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
            bounds: boundsInfo.bounds
          }));
        }

        // Initial visualization
        updateVisualization();

        setLoading(false);
        setProgress(100);
      } catch (error) {
        console.error('Failed to load layer:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setError(message);
        setLoading(false);
        cleanupLayer();
        if (onError) {
          onError(error instanceof Error ? error : new Error(message));
        }
      }
    };

    // Handle map movement events
    const handleMapMove = () => {
      // Clear any pending load timeout
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }

      loadTimeoutRef.current = window.setTimeout(() => {
        // If we have cached data and image, just update bounds
        if (rasterDataCache.get(`${categoryId}-${layerId}`) && imageDataRef.current && boundsRef.current) {
          if (layerRef.current) {
            layerRef.current.setBounds(boundsRef.current);
          }
          return;
        }

        // Only do full reload if we don't have data cached
        const bounds = map.getBounds();
        loadData(bounds);
      }, 250);
    };

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    // Initial load
    handleMapMove();

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }
      cleanupLayer();
    };
  }, [map, url, active, dispatch, categoryId, layerId, currentAOI, isCreatingAOI, zIndex]);

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
