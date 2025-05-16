import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useLayer } from '../../hooks/useLayer';
import { useLayerOpacity } from '../../hooks/useLayerOpacity';
import { useLayerValueRange } from '../../hooks/useLayerValueRange';
import { setLayerBounds, initLayerValueRange, setLayerMetadata, setLayerLoading } from '../../store/slices/layersSlice';
import { leafletLayerMap } from '../../store/slices/layersSlice/state';
import { LayerType } from '../../types/map';
import { layerDataCache } from '../../cache/cache';
import { resolveDomain } from '../../raster/rasterDomain';
import { runRasterPipeline } from '../../raster/rasterPipeline';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[GeoTiffLayer]', ...args);
}

interface LayerConfig {
  source: string;
}

export function createGeoTiffLayer(categoryId: string, config: LayerConfig) {
  const GeoTiffLayerInstance: React.FC<{ active: boolean }> = ({ active }) => (
    <GeoTiffLayer active={active} url={config.source} categoryId={categoryId} />
  );
  GeoTiffLayerInstance.displayName = `${config.name}Layer`;
  return GeoTiffLayerInstance;
}

interface GeoTiffLayerProps {
  url: string;
  active: boolean;
  zIndex?: number;
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
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const isCreatingAOI = useAppSelector(state => state.ui.isCreatingAOI);
  const layer = useLayer(categoryId, layerId);
  const opacity = useLayerOpacity(categoryId, layerId);
  const valueRange = useLayerValueRange(categoryId, layerId);

  const cleanupLayer = () => {
    if (layerRef.current) {
      if (layer) leafletLayerMap.delete(layerId!);
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    canvasRef.current = null;
    boundsRef.current = null;
    if (categoryId && layerId) layerDataCache.delete(`${categoryId}-${layerId}`);
  };

  useEffect(() => {
    if (!active) { cleanupLayer(); setError(null); setLoading(false); setProgress(0); return; }
    return () => cleanupLayer();
  }, [active, map, categoryId, layerId]);

  useEffect(() => {
    dispatch(setLayerLoading({ categoryId, layerId, loading }));
  }, [loading, categoryId, layerId, dispatch]);

  const updateVisualization = () => {
    if (!valueRange || !boundsRef.current || !layer) return;
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }

    const layerData = layerDataCache.getSync(`${categoryId}-${layerId}`);
    const { rasterArray, width, height, noDataValue } = layerData.data;
    const metadata = layerData.metadata;

    const rawDomain: [number, number] = layer.domain || [valueRange.defaultMin, valueRange.defaultMax];
    const fillNoData = true;
    const superSample = true;
    const canvas = runRasterPipeline(
      categoryId!,
      layerId!,
      rasterArray,
      width,
      height,
      noDataValue,
      rawDomain,
      metadata.stats,
      valueRange,
      layer.colorScheme,
      fillNoData,
      superSample
    );

    canvasRef.current = canvas;
    const dataUrl = canvas.toDataURL();
    const overlay = L.imageOverlay(dataUrl, boundsRef.current!, 
      { opacity, interactive: false, className: 'geotiff-high-quality', pane: layer.pane, zIndex: layer.order });
    overlay.addTo(map);
    layerRef.current = overlay;
    leafletLayerMap.set(layerId!, overlay);
  };

  useEffect(() => { if (valueRange) updateVisualization(); }, [valueRange]);
  useEffect(() => { if (layerRef.current) layerRef.current.setOpacity(opacity); }, [opacity, map]);

  useEffect(() => {
    if (!active) return; if (!currentAOI) { setError('Please select an AOI'); setLoading(false); return; }
    const loadData = async () => {
      try {
        setError(null); setLoading(true); setProgress(0);
        const layerData = await layerDataCache.get(`${categoryId}-${layerId}`);
        const bounds = layerData.metadata.leafletBounds;
        const rawInit: [number, number] = layer.domain || [layerData.metadata.stats.min, layerData.metadata.stats.max];
        const [minInit, maxInit] = resolveDomain(rawInit, layerData.metadata.stats.min, layerData.metadata.stats.max, layerData.data.noDataValue);
        boundsRef.current = L.latLngBounds([bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[1][1]]);
        if (categoryId && layerId) {
          dispatch(setLayerMetadata({ categoryId, layerId, metadata: layerData.metadata }));
          if (!valueRange) dispatch(initLayerValueRange({ categoryId, layerId, min: minInit, max: maxInit }));
          dispatch(setLayerBounds({ categoryId, layerId, bounds }));
        }
        updateVisualization(); setLoading(false); setProgress(100);
      } catch (e) { console.error(e); setError((e as Error).message); setLoading(false); cleanupLayer(); if (onError) onError(e as Error); }
    };
    loadData();
    return () => { cleanupLayer(); };
  }, [map, url, active, dispatch, categoryId, layerId, currentAOI, isCreatingAOI, zIndex]);

  if (loading) return (
    <div className="absolute bottom-4 left-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">Loading GeoTIFF...</div>
          <div className="mt-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-gray-500">{progress}% complete</div>
        </div>
      </div>
    </div>
  );

  if (error) return (
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

  return null;
};

export default GeoTiffLayer;
