import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setLayerBounds, initLayerValueRange, setLayerMetadata, setLayerLoading } from '../../store/slices/layersSlice';
import { arcGISTiffService } from '../../services/arcGISTiffService';
import { colorizeRasterImage } from '../../utils/colorizeRaster';
import { MapServiceConfig } from '../../services/maps/types';
import { layerDataCache } from '../../cache/cache';
import { leafletLayerMap } from '../../store/slices/layersSlice/state';
import { useLayerFromCategory } from '../../hooks/useLayer';
import { getColorScheme, getGradientForScheme } from '../../utils/colors';
import { defaultColorScheme } from '../../constants/colors';
import { ELEVATION_SERVICE } from '../../constants/maps/elevation';

interface LayerConfig {
  name: string;
  description: string;
  source: string;
  type: string;
  renderingRule: string;
  units: string;
  colorScheme?: string;
  order?: number;
}

export function createTiffLayer(categoryId: string, config: LayerConfig) {
  const TiffLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    const layer = useLayerFromCategory(categoryId, config.name);
    const opacity = useAppSelector(state => {
      const cat = state.layers.categories[categoryId];
      return cat?.layers.find(l => l.name === config.name)?.opacity ?? 1.0;
    });

    if (!layer) return null;

    return (
      <ArcGISTiffLayer
        active={active}
        opacity={opacity}
        serviceConfig={ELEVATION_SERVICE}
        renderingRule={config.renderingRule}
        colorScheme={layer.colorScheme || config.colorScheme || defaultColorScheme}
        categoryId={categoryId}
        layerId={layer.id}
      />
    );
  };

  TiffLayerInstance.displayName = `${config.name}Layer`;
  return TiffLayerInstance;
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
    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

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

  useEffect(() => {
    dispatch(setLayerLoading({ categoryId, layerId, loading }));
  }, [loading, categoryId, layerId, dispatch]);

  const updateVisualization = () => {
    if (!valueRange || !boundsRef.current || !layer) return;

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }

    const layerData = layerDataCache.getSync(`${categoryId}-${layerId}`);
    const rasterData = layerData.data;
    const metadata = layerData.metadata;
    if (!rasterData || !metadata) {
      console.log('updateVisualization(): invalid layerData');
      return;
    }

    const { rasterArray, width, height, noDataValue } = rasterData;

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const domain = layer.domain || [valueRange.defaultMin, valueRange.defaultMax];
    const schemeObj = getColorScheme(layer.colorScheme.name);
    if (!schemeObj || !Array.isArray(schemeObj.colors)) {
      console.error('Invalid color scheme:', layer.colorScheme.name, schemeObj);
      return;
    }

    const imageData = colorizeRasterImage(
      rasterArray,
      width,
      height,
      noDataValue,
      schemeObj.colors,
      domain,
      valueRange
    );

    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL();
    imageDataRef.current = dataUrl;

    const imageOverlay = L.imageOverlay(dataUrl, boundsRef.current, {
      opacity,
      interactive: false,
      className: 'geotiff-high-quality',
      pane: layer.pane,
      zIndex: layer.order || 0
    });

    console.log('---> add layer to map', { layer: layer.name, id: layer.id, pane: layer.pane, order: layer.order });

    imageOverlay.addTo(map);
    imageOverlay.bringToFront();
    imageOverlayRef.current = imageOverlay;
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

  useEffect(() => {
    if (!active) {
      cleanup();
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }

    const loadData = async (bounds: L.LatLngBounds) => {
      try {
        setError(null);
        setLoading(true);
        setProgress(0);

        layerDataCache.delete(`${categoryId}-${layerId}`);

        console.log('---> call layerDataCache.get');
        const layerData = await layerDataCache.get(`${categoryId}-${layerId}`);
        console.log('---> layerData', layerData);
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
            dispatch(initLayerValueRange({ categoryId, layerId, min, max }));
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
        cleanup();
        if (onError) {
          onError(error instanceof Error ? error : new Error(message));
        }
      }
    };

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

    handleMapMove();

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }
      cleanup();
    };
  }, [map, active, dispatch, categoryId, layerId, serviceConfig.serviceUrl, renderingRule, onError]);

  if (loading) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Loading TIFF...</div>
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
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
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

export default ArcGISTiffLayer;