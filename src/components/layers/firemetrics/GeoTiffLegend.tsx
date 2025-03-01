import React, { useEffect, useState } from 'react';
import { extractGeoTiffMetadata } from '../../../utils/geotiffUtils';
import { getGradientColors } from '../../../utils/colorUtils';
import { AlertTriangle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface GeoTiffLegendProps {
  url: string;
}

interface DataRange {
  min: number;
  max: number;
  mean: number;
}

const GeoTiffLegend: React.FC<GeoTiffLegendProps> = ({ url }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [dataRange, setDataRange] = useState<DataRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        const fetchOptions: RequestInit = {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'image/tiff,*/*'
          }
        };

        const headResponse = await fetch(url, { ...fetchOptions, method: 'HEAD' });
        if (!headResponse.ok) {
          throw new Error(`Failed to fetch file info: ${headResponse.status} ${headResponse.statusText}`);
        }
        
        const totalSize = parseInt(headResponse.headers.get('content-length') || '0', 10);
        if (totalSize === 0) {
          throw new Error('File size is 0 bytes');
        }

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          receivedLength += value.length;
          
          const percent = Math.round((receivedLength / totalSize) * 100);
          setProgress(percent);
        }

        const chunksAll = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          chunksAll.set(chunk, position);
          position += chunk.length;
        }

        const file = new File([chunksAll], 'temp.tif', { 
          type: 'image/tiff',
          lastModified: Date.now()
        });

        const { metadata: meta, range } = await extractGeoTiffMetadata(file);

        if (!meta?.standard || !range) {
          throw new Error('Invalid metadata or data range');
        }

        setMetadata(meta);
        setDataRange(range);
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
  }, [url]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
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
        <div className={`h-4 w-full bg-gradient-to-r ${getGradientColors(url)} rounded`} />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{dataRange.min.toFixed(3)}</span>
          <span>{dataRange.max.toFixed(3)}</span>
        </div>
        <div className="text-xs text-gray-600 text-center">
          {custom?.units || 'units'}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg">
        {/* Collapsible About section header */}
        <button 
          onClick={() => setShowAbout(!showAbout)}
          className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>About</span>
          {showAbout ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Collapsible content */}
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
                  <span className="text-sm text-gray-600">EPSG:</span>
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