import React, { useState, useEffect } from 'react';
import { extractGeoTiffMetadata } from '../../../utils/geotif/utils';
import { getColorScheme, getGradientForScheme } from '../../../utils/colors';
import { AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { geotiffService } from '../../../services/geotiffService';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { getGeoTiffUrl } from '../../../constants/urls';

interface GeoTiffLegendProps {
  url: string;
  categoryId?: string;
  layerId?: number;
}

const GeoTiffLegend: React.FC<GeoTiffLegendProps> = ({ url, categoryId, layerId }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [dataRange, setDataRange] = useState<{min: number; max: number; mean: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  
  // Get the current AOI from Redux store
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const isCreatingAOI = useAppSelector(state => state.ui.isCreatingAOI);
  const layer = useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    return state.layers.categories[categoryId]?.layers.find(l => l.id === layerId);
  });
  
  // Determine the actual URL to use based on the current AOI
  const effectiveUrl = React.useMemo(() => {
    if (!currentAOI) {
      return url;
    }
    
    const aoiId = 'id' in currentAOI ? currentAOI.id : 1;
    const layerName = url.split('/').pop()?.replace('.tif', '') || '';
    return getGeoTiffUrl(aoiId, layerName);
  }, [url, currentAOI]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        if (!currentAOI) {
          throw new Error("Please select an Area of Interest (AOI) first");
        }

        const metadataResult = await geotiffService.getGeoTiffMetadata(effectiveUrl, setProgress);

        if (!metadataResult?.metadata?.standard || !metadataResult?.range) {
          throw new Error('Invalid metadata or data range');
        }

        setMetadata(metadataResult.metadata);
        setDataRange(metadataResult.range);
        setProgress(100);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('GeoTIFF Legend error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [effectiveUrl, currentAOI, isCreatingAOI]);

  const getColorSchemeForUrl = () => {
    if (effectiveUrl.includes('burn_probability')) {
      return getColorScheme('burnProbability');
    } else if (effectiveUrl.includes('canopy_cover')) {
      return getColorScheme('canopyCover');
    } else if (effectiveUrl.includes('flame_length')) {
      return getColorScheme('fireIntensity');
    } else {
      return getColorScheme('greenYellowRed');
    }
  };

  const colorScheme = getColorSchemeForUrl();

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
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

  if (error || !metadata?.standard || !dataRange) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Failed to load GeoTIFF
            </h3>
            <p className="text-sm text-red-600">
              {error || 'Invalid metadata format'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { standard, custom } = metadata;
  const valueRange = layer?.valueRange;

  const formatNoData = (value: any): string => {
    if (value === undefined || value === null) return 'Not set';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value.trim();
    return 'Invalid';
  };

  const noDataPixels = standard.totalPixels - standard.nonNullValues;
  const zeroPixels = standard.zeroCount || 0;
  const validPixels = standard.nonNullValues;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {colorScheme && (
          <div 
            className="h-4 w-full rounded" 
            style={{ background: getGradientForScheme(colorScheme) }}
          />
        )}
        <div className="flex justify-between text-xs text-gray-600">
          <span>{valueRange ? valueRange.min.toFixed(3) : dataRange.min.toFixed(3)}</span>
          <span>{valueRange ? valueRange.max.toFixed(3) : dataRange.max.toFixed(3)}</span>
        </div>
        <div className="text-xs text-gray-600 text-center">
          {custom?.units || 'units'}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg">
        <button 
          onClick={() => setShowAbout(!showAbout)}
          className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>About</span>
          {showAbout ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {showAbout && (
          <div className="p-3 pt-0 space-y-1.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Min:</span>
                <span className="text-sm font-medium text-gray-700">
                  {dataRange.min.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max:</span>
                <span className="text-sm font-medium text-gray-700">
                  {dataRange.max.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mean:</span>
                <span className="text-sm font-medium text-gray-700">
                  {dataRange.mean.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Size:</span>
                <span className="text-sm font-medium text-gray-700">
                  {standard.imageWidth} × {standard.imageHeight}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valid Pixels:</span>
                <span className="text-sm font-medium text-gray-700">
                  {validPixels.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">NoData Pixels:</span>
                <span className="text-sm font-medium text-gray-700">
                  {noDataPixels.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Zero Pixels:</span>
                <span className="text-sm font-medium text-gray-700">
                  {zeroPixels.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Pixels:</span>
                <span className="text-sm font-medium text-gray-700">
                  {standard.totalPixels.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resolution:</span>
                <span className="text-sm font-medium text-gray-700">
                  {isNaN(standard.resolution.x) 
                    ? 'Unknown'
                    : `${standard.resolution.x.toFixed(2)} meters`}
                </span>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Type:</span>
                <span className="text-sm font-medium text-gray-700">
                  {standard.bitsPerSample
                    ? `${standard.bitsPerSample[0]}-bit`
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Compression:</span>
                <span className="text-sm font-medium text-gray-700">
                  {standard.compression ? `Type ${standard.compression}` : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">No Data:</span>
                <span className="text-sm font-medium text-gray-700">
                  {formatNoData(standard.noData)}
                 </span>
              </div>
              {custom?.description && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {custom.description}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CRS:</span>
                <span className="text-sm font-medium text-gray-700">
                  {standard.crs || 'Unknown'}
                </span>
              </div>
              {standard.projectionName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600"></span>
                  <span className="text-sm font-medium text-gray-700">
                    {standard.projectionName}
                  </span>
                </div>
              )}
              {standard.modelTransform.origin && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Top:</span>
                    <span className="text-sm font-bold text-gray-700 font-mono">
                      {standard.modelTransform.origin[0].toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Left:</span>
                    <span className="text-sm font-bold text-gray-700 font-mono">
                      {standard.modelTransform.origin[1].toFixed(6)}
                    </span>
                  </div>
                </>
              )}
              {standard.datum && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Datum:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {standard.datum}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeoTiffLegend;