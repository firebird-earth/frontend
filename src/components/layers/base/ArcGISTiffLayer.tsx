import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setLayerBounds, initializeLayerValueRange, setLayerMetadata, setLayerLoading } from '../../../store/slices/layers';
import { validateTiff } from '../../../utils/tiff';
import { getColorScheme, getColorFromScheme, hexToRgb, GeoTiffNoDataColor } from '../../../utils/colors';
import { MapServiceConfig } from '../../../services/maps/types';
import { rasterDataCache } from '../../../utils/cache';
import { isFiremetricsTab } from '../../../constants/maps';
import { leafletLayerMap } from '../../../store/slices/layers/state';

// Debug configuration
const ArcGISTiffLayerConfig = {
  debug: false
} as const;

export function setArcGISTiffLayerDebug(enabled: boolean) {
  (ArcGISTiffLayerConfig as any).debug = enabled;
}

interface ArcGISTiffLayerProps {
  active: boolean;
  opacity?: number;
  serviceConfig: MapServiceConfig;
  renderingRule: string;
  colorScheme: string;
  categoryId: string;
  layerId: number;
  onError?: (error: Error) => void;
}

const ArcGISTiffLayer: React.FC<ArcGISTiffLayerProps> = ({
  active,
  opacity = 1,
  serviceConfig,
  renderingRule,
  colorScheme,
  categoryId,
  layerId,
  onError
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageDataRef = useRef<string | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);

  const valueRange = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.valueRange;
  });

  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.id === layerId);
  });

  if (ArcGISTiffLayerConfig.debug) {
    console.log('ArcGISTiffLayer layer:', layer)
  }
  
  // Cleanup function
  const cleanup = () => {
    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current = null;
    }
    imageDataRef.current = null;
    boundsRef.current = null;

    // Clear raster data from cache
    rasterDataCache.delete(`${categoryId}-${layerId}`);

    // Clear any pending timeouts
    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  // Cleanup when component unmounts or layer becomes inactive
  useEffect(() => {
    if (!active) {
      cleanup();
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }
    return () => cleanup();
  }, [active, map, categoryId, layerId]);

  // Update the loading state in Redux when loading changes
  useEffect(() => {
    dispatch(setLayerLoading({ categoryId, layerId, loading }));
  }, [loading, categoryId, layerId, dispatch]);

  // Handle map movement events
  useEffect(() => {
    if (!active) return;

    const handleMapMove = () => {
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = window.setTimeout(() => {
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
    };
  }, [active, map]);

  const loadData = async (bounds: L.LatLngBounds) => {
    try {
      setError(null);
      setLoading(true);
      setProgress(0);

      const arrayBuffer = await fetchTiff(bounds);
      validateTiff(arrayBuffer);

      // Load and parse the TIFF data
      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();

      const width = image.getWidth();
      const height = image.getHeight();
      const rasters = await image.readRasters();
      const data = rasters[0] as Float32Array;

      const bbox = image.getBoundingBox();
      const rawBounds = bbox || [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

      const rawNoData = image.fileDirectory.GDAL_NODATA;
      const noDataValue = rawNoData !== undefined ? Number(rawNoData.replace('\x00', '')) : null;

      const rasterData = { data, width, height, noDataValue };
      rasterDataCache.set(`${categoryId}-${layerId}`, rasterData);
      boundsRef.current = bounds;

      let min = Infinity, max = -Infinity, sum = 0, validCount = 0, noDataCount = 0, zeroCount = 0;
      for (let i = 0; i < data.length; i++) {
        const value = data[i];
        if (noDataValue !== null && value === noDataValue) {
          noDataCount++;
          continue;
        }
        if (value === 0) zeroCount++;
        if (value !== undefined && !isNaN(value) && isFinite(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
          sum += value;
          validCount++;
        }
      }
      const mean = validCount > 0 ? sum / validCount : 0;

      const serializableBounds: [[number, number], [number, number]] = [
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()]
      ];

      dispatch(setLayerMetadata({
        categoryId,
        layerId,
        metadata: {
          width,
          height,
          noDataValue,
          bitsPerSample: image.fileDirectory.BitsPerSample || [],
          compression: image.fileDirectory.Compression || null,
          resolution: {
            x: Math.abs(rawBounds[2] - rawBounds[0]) / width,
            y: Math.abs(rawBounds[3] - rawBounds[1]) / height
          },
          projection: {
            sourceCRS: 'EPSG:4326',
            tiepoint: image.fileDirectory.ModelTiepointTag || [],
            scale: image.fileDirectory.ModelPixelScaleTag || [],
            transform: image.fileDirectory.ModelTransformationTag,
            matrix: image.fileDirectory.ModelTransformationTag,
            origin: image.fileDirectory.ModelTransformationTag ? 
              [image.fileDirectory.ModelTransformationTag[3], image.fileDirectory.ModelTransformationTag[7]] : null
          },
          rawBounds,
          serializableBounds,
          stats: {
            min,
            max,
            mean,
            totalPixels: width * height,
            validCount,
            noDataCount,
            zeroCount
          }
        }
      }));

      if (!valueRange) {
        dispatch(initializeLayerValueRange({ categoryId, layerId, min, max }));
      }

      dispatch(setLayerBounds({
        categoryId,
        layerId,
        bounds: serializableBounds
      }));

      updateVisualization();
      setLoading(false);
      setProgress(100);
    } catch (error) {
      console.error('Failed to load layer:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
      setLoading(false);
      if (onError) onError(error instanceof Error ? error : new Error(message));
    }
  };

  const updateVisualization = () => {
    if (!valueRange || !boundsRef.current || !layer) return;

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
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
    const scheme = getColorScheme(colorScheme);
    if (!scheme) {
      console.error('No color scheme found for:', colorScheme);
      return;
    }

    if (ArcGISTiffLayerConfig.debug) {
      console.log('Using color scheme:', {
        name: scheme.name,
        type: scheme.type,
        buckets: scheme.buckets,
        colors: scheme.colors,
        domain: layer.domain
      });
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

    // Create new image overlay and explicitly bring it to the front
    const imageOverlay = L.imageOverlay(dataUrl, boundsRef.current, {
      opacity: opacity,
      interactive: false,
      className: 'geotiff-high-quality',
      pane: layer.pane,
      zIndex: layer.order || 0
    });

    console.log("---> add layer to map", {layer:layer.name, id:layer.id, pane:layer.pane, order:layer.order, zindex:layer.order}) 
    
    imageOverlay.addTo(map);
    imageOverlay.bringToFront();
    imageOverlayRef.current = imageOverlay;

    // Store the Leaflet layer reference in the WeakMap
    leafletLayerMap.set(layerId, imageOverlay);
  };

  useEffect(() => {
    if (valueRange) updateVisualization();
  }, [valueRange]);

  useEffect(() => {
    if (imageOverlayRef.current && map.hasLayer(imageOverlayRef.current)) {
      imageOverlayRef.current.setOpacity(opacity);
    }
  }, [opacity, map]);

  const fetchTiff = async (bounds: L.LatLngBounds): Promise<ArrayBuffer> => {
    try {
      const exportImageUrl = serviceConfig.serviceUrl;
      const zoom = map.getZoom();
      const containerSize = map.getSize();
      const pixelsPerDegree = Math.pow(2, zoom + 8) / 360;
      const degreesLng = Math.abs(bounds.getEast() - bounds.getWest());
      const degreesLat = Math.abs(bounds.getNorth() - bounds.getSouth());
      const targetWidth = Math.round(degreesLng * pixelsPerDegree);
      const targetHeight = Math.round(degreesLat * pixelsPerDegree);
      const width = Math.min(2048, Math.max(256, targetWidth));
      const height = Math.min(2048, Math.max(256, targetHeight));
      const bbox = `${bounds.getWest().toFixed(6)},${bounds.getSouth().toFixed(6)},${bounds.getEast().toFixed(6)},${bounds.getNorth().toFixed(6)}`;
      let parsedRule: any;
      try {
        parsedRule = typeof renderingRule === 'string' ?
          JSON.parse(renderingRule) : renderingRule;
      } catch (e) {
        console.error('Failed to parse rendering rule:', e);
        parsedRule = renderingRule;
      }
      const params = new URLSearchParams({
        bbox,
        bboxSR: '4326',
        size: `${width},${height}`,
        imageSR: '4326',
        format: 'tiff',
        pixelType: 'F32',
        noData: '',
        compression: 'LZW',
        bandIds: '',
        mosaicRule: '',
        renderingRule: JSON.stringify(parsedRule),
        interpolation: 'RSP_NearestNeighbor',
        f: 'image'
      });
      const url = `${exportImageUrl}/exportImage?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch TIFF: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Error fetching TIFF:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Loading TIFF...</div>
            <div className="mt-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 text-xs text-gray-500">{progress}% complete</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-md">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ArcGISTiffLayer;