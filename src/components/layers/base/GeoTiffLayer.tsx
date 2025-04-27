import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setLayerBounds, initializeLayerValueRange, setLayerMetadata, setLayerLoading } from '../../../store/slices/layers';
import { defaultColorScheme } from '../../../constants/colors';
import { leafletLayerMap } from '../../../store/slices/layers/state';
import { layerDataCache } from '../../../cache/cache';
import { getColorScheme } from '../../../utils/colors';
import { colorizeRasterImage } from '../../../utils/colorizeRaster';

import { LayerType } from '../../../types/map';

interface LayerConfig {
  name: string;
  description: string;
  source: string;
  type: LayerType;
  colorScheme: string;
  units: string;
}

export function createGeoTiffLayer(categoryId: string, config: LayerConfig) {
  const GeoTiffLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    return (
      <GeoTiffLayer
        active={active}
        url={config.source}
        categoryId={categoryId}
      />
    );
  };

  GeoTiffLayerInstance.Legend = () => (
    <GeoTiffLegend
      url={config.source}
      categoryId={categoryId}
      colorScheme={config.colorScheme}
      units={config.units}
    />
  );

  GeoTiffLayerInstance.displayName = `${config.name}Layer`;
  return GeoTiffLayerInstance;
}

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
  const SUPERSAMPLE = true; // Toggle supersampling
  const scale = SUPERSAMPLE ? 2 : 1;

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

  const cleanupLayer = () => {
    if (layerRef.current) {
      if (layer) {
        const existingLeafletLayer = leafletLayerMap.get(layerId);
        if (existingLeafletLayer) {
          leafletLayerMap.delete(layerId);
        }
      }
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (canvasRef.current) canvasRef.current = null;
    imageDataRef.current = null;
    boundsRef.current = null;
    if (categoryId && layerId) {
      layerDataCache.delete(`${categoryId}-${layerId}`);
    }
  };

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

  useEffect(() => {
    dispatch(setLayerLoading({ categoryId, layerId, loading }));
  }, [loading, categoryId, layerId, dispatch]);

  const updateVisualization = () => {
    if (!valueRange || !boundsRef.current || !layer) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const layerData = layerDataCache.getSync(`${categoryId}-${layerId}`);
    const rasterData = layerData.data;
    const metadata = layerData.metadata;
    if (!rasterData || !metadata) {
      console.log('updateVisualization(): invalid layerData');
      return;
    }
    const { rasterArray, width, height, noDataValue } = rasterData;

    const domain = layer.domain || [valueRange.defaultMin, valueRange.defaultMax];
    const schemeObj = getColorScheme(layer.colorScheme || defaultColorScheme);

    const imageData = colorizeRasterImage(
      rasterArray,
      width,
      height,
      noDataValue,
      schemeObj.colors,
      domain,
      valueRange
    );

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = width;
    baseCanvas.height = height;
    const baseCtx = baseCanvas.getContext('2d');
    if (!baseCtx) return;
    baseCtx.putImageData(imageData, 0, 0);

    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = width * scale;
    scaledCanvas.height = height * scale;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (!scaledCtx) return;
    scaledCtx.imageSmoothingEnabled = SUPERSAMPLE;
    scaledCtx.drawImage(baseCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    canvasRef.current = scaledCanvas;
    const dataUrl = scaledCanvas.toDataURL();
    imageDataRef.current = dataUrl;

    const imageOverlay = L.imageOverlay(dataUrl, boundsRef.current, {
      opacity: opacity,
      interactive: false,
      className: 'geotiff-high-quality',
      pane: layer.pane,
      zIndex: layer.order || 0
    });

    imageOverlay.addTo(map);
    layerRef.current = imageOverlay;
    leafletLayerMap.set(layerId, imageOverlay);
  };

  useEffect(() => {
    if (valueRange) {
      updateVisualization();
    }
  }, [valueRange]);

  useEffect(() => {
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity, map]);

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

    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        setProgress(0);

        const layerData = await layerDataCache.get(`${categoryId}-${layerId}`);
        const rasterData = layerData.data;
        const metadata = layerData.metadata;
        if (!rasterData || !metadata) {
          console.log('invalid layerData');
          return;
        }

        const min = metadata.stats.min;
        const max = metadata.stats.max;
        const bounds = metadata.leafletBounds;

        const leafletBoundsLatLng = L.latLngBounds(
          L.latLng(bounds[0][0], bounds[0][1]),
          L.latLng(bounds[1][0], bounds[1][1])
        );
        boundsRef.current = leafletBoundsLatLng;

        if (categoryId && layerId) {
          dispatch(setLayerMetadata({ categoryId, layerId, metadata }));
          if (!valueRange) {
            dispatch(initializeLayerValueRange({ categoryId, layerId, min, max }));
          }
          dispatch(setLayerBounds({ categoryId, layerId, bounds }));
        }

        updateVisualization();
        setLoading(false);
        setProgress(100);
      } catch (error) {
        console.error('Failed to load layer:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setError(message);
        setLoading(false);
        cleanupLayer();
        if (onError) onError(error instanceof Error ? error : new Error(message));
      }
    };

    loadData();

    return () => {
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
            <div className="text-sm font-medium text-gray-900">Loading GeoTIFF...</div>
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
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">Failed to load GeoTIFF</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GeoTiffLayer;