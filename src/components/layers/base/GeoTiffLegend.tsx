import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { getColorScheme, getGradientForScheme } from '../../../utils/colors';
import { geotiffService } from '../../../services/geotiffService';
import { getGeoTiffUrl } from '../../../constants/urls';
import { FIRE_METRICS } from '../../../constants/maps';

interface GeoTiffLegendProps {
  url: string;
  categoryId: string;
  layerId: number;
}

const GeoTiffLegend: React.FC<GeoTiffLegendProps> = ({ 
  url, 
  categoryId, 
  layerId 
}) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [dataRange, setDataRange] = useState<{min: number; max: number; mean: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current AOI from Redux store
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const isCreatingAOI = useAppSelector(state => state.ui.isCreatingAOI);
  const layer = useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    return state.layers.categories[categoryId]?.layers.find(l => l.id === layerId);
  });

  // Debug logging
  console.log('GeoTiffLegend props:', {
    url,
    categoryId,
    layerId,
    layer: layer ? {
      name: layer.name,
      type: layer.type,
      source: layer.source,
      valueRange: layer.valueRange
    } : null,
    currentAOI: currentAOI ? {
      id: currentAOI.id,
      name: currentAOI.name
    } : null
  });

  // Get layer metadata from constants
  const getLayerMetadata = () => {
    if (!layer) return null;

    if (categoryId === 'firemetrics') {
      return Object.values(FIRE_METRICS.LANDSCAPE_RISK).find(l => l.name === layer.name);
    }
    if (categoryId === 'fuels') {
      return Object.values(FIRE_METRICS.FUELS).find(l => l.name === layer.name);
    }
    return null;
  };

  const layerMetadata = getLayerMetadata();

  // Debug logging for layer metadata
  console.log('Layer metadata:', {
    layerMetadata,
    colorScheme: layerMetadata?.colorScheme,
    units: layerMetadata?.units
  });

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        console.log('Loading GeoTIFF metadata...');
        setLoading(true);
        setError(null);

        if (!currentAOI) {
          throw new Error("Please select an Area of Interest (AOI) first");
        }

        if (!layer) {
          throw new Error("Layer not found");
        }

        // Get the correct URL for the GeoTIFF
        const aoiId = 'id' in currentAOI ? currentAOI.id : 1;
        const layerName = layer.source.split('/').pop()?.replace('.tif', '') || '';
        const effectiveUrl = getGeoTiffUrl(aoiId, layerName);

        console.log('Loading metadata for URL:', effectiveUrl);

        const metadataResult = await geotiffService.getGeoTiffMetadata(effectiveUrl);
        console.log('Metadata loaded:', metadataResult);

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
  }, [url, currentAOI, isCreatingAOI, layer]);

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

  if (error || !metadata?.standard || !dataRange) {
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

  const valueRange = layer?.valueRange;
  const colorScheme = layerMetadata?.colorScheme ? getColorScheme(layerMetadata.colorScheme) : null;

  // Debug logging for rendering
  console.log('Rendering legend with:', {
    valueRange,
    colorScheme,
    dataRange
  });

  if (!colorScheme) {
    console.warn('No color scheme found for layer:', layer?.name);
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
          {layerMetadata?.units || metadata.custom?.units || 'units'}
        </div>
      </div>
    </div>
  );
};

export default GeoTiffLegend;