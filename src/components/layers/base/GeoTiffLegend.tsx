// src/components/layers/base/GeoTiffLegend.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { getColorScheme, getGradientForScheme } from '../../../utils/colors';
import { geotiffService } from '../../../services/geotiffService';
import { getGeoTiffUrl } from '../../../constants/urls';

interface GeoTiffLegendProps {
  url: string;
  categoryId: string;
  layerId: number;
}

const GeoTiffLegend: React.FC<GeoTiffLegendProps> = React.memo(({ 
  url, 
  categoryId, 
  layerId 
}) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [dataRange, setDataRange] = useState<{min: number; max: number; mean: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current AOI from Redux store using selector
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const isCreatingAOI = useAppSelector(state => state.ui.isCreatingAOI);
  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.id === layerId);
  });

  // Memoize the URL to prevent unnecessary fetches
  const effectiveUrl = useMemo(() => {
    if (!currentAOI || !layer) return url;
    const aoiId = 'id' in currentAOI ? currentAOI.id : 1;
    const layerName = layer.source.split('/').pop()?.replace('.tif', '') || '';
    return getGeoTiffUrl(aoiId, layerName);
  }, [url, currentAOI, layer]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAOI) {
          throw new Error("Please select an Area of Interest (AOI) first");
        }

        if (!layer) {
          throw new Error("Layer not found");
        }

        const metadataResult = await geotiffService.getGeoTiffMetadata(effectiveUrl);

        if (!metadataResult?.metadata?.standard || !metadataResult?.range) {
          throw new Error('Invalid metadata or data range');
        }

        setMetadata(metadataResult.metadata);
        setDataRange(metadataResult.range);
        setLoading(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('GeoTIFF Legend error:', message);
        setError(message);
        setLoading(false);
      }
    };

    loadMetadata();
  }, [effectiveUrl, currentAOI, layer]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !metadata?.standard || !dataRange || !layer?.colorScheme) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Failed to load GeoTIFF metadata
            </h3>
            <p className="text-sm text-red-600">
              {error || 'Invalid metadata format'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const valueRange = layer.valueRange;
  const colorScheme = getColorScheme(layer.colorScheme);

  if (!colorScheme) {
    console.warn('No color scheme found for layer:', layer.name);
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div 
          className="h-4 w-full rounded" 
          style={{ background: getGradientForScheme(colorScheme) }}
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{valueRange ? valueRange.min.toFixed(3) : dataRange.min.toFixed(3)}</span>
          <span>{valueRange ? valueRange.max.toFixed(3) : dataRange.max.toFixed(3)}</span>
        </div>
        <div className="text-xs text-gray-600 text-center">
          {layer.units || metadata.custom?.units || 'units'}
        </div>
      </div>
    </div>
  );
});

GeoTiffLegend.displayName = 'GeoTiffLegend';

export default GeoTiffLegend;
