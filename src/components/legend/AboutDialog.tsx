import React from 'react';
import { Info } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';
import { FIRE_METRICS } from '../../constants/maps';

interface AboutPanelProps {
  metadata: {
    standard: {
      imageWidth: number;
      imageHeight: number;
      bitsPerSample: number[];
      compression: number | null;
      resolution: {
        x: number;
        y: number;
      };
      noData: number | null;
      nonNullValues: number;
      totalPixels: number;
      zeroCount: number;
      crs: string;
      projectionName: string;
      datum: string;
      modelTransform: {
        origin: [number, number] | null;
      };
    };
    custom: {
      units?: string;
      description?: string;
      source?: string;
    };
  };
  range: {
    min: number;
    max: number;
    mean: number;
  };
  onClose: () => void;
  layerName?: string;
  categoryId?: string;
}

const AboutDialog: React.FC<AboutPanelProps> = ({ metadata, range, onClose, layerName, categoryId }) => {
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

  const formatNoData = (value: any): string => {
    if (value === undefined || value === null) return 'Not set';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value.trim();
    return 'Invalid';
  };

  const noDataPixels = metadata.standard.totalPixels - metadata.standard.nonNullValues;
  const zeroPixels = metadata.standard.zeroCount || 0;
  const validPixels = metadata.standard.nonNullValues;

  // Get layer metadata from constants
  const getLayerMetadata = () => {
    if (!layerName || !categoryId) return null;

    if (categoryId === 'firemetrics') {
      return Object.values(FIRE_METRICS.LANDSCAPE_RISK).find(l => l.name === layerName);
    }
    if (categoryId === 'fuels') {
      return Object.values(FIRE_METRICS.FUELS).find(l => l.name === layerName);
    }
    return null;
  };

  const layerMetadata = getLayerMetadata();

  return (
    <div className="fixed inset-0 z-[2000]" style={{ pointerEvents: 'none' }}>
      <div 
        ref={dialogRef}
        onClick={handleDialogClick}
        className="bg-white rounded-lg shadow-xl w-80 absolute"
        style={{ 
          left: position.x,
          top: position.y,
          transition: 'none',
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="p-4 border-b border-gray-200 drag-handle flex items-center space-x-2 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <Info className="h-5 w-5 text-gray-500 pointer-events-none" />
          <h3 className="text-lg font-medium text-gray-900 pointer-events-none">
            About
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Min:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {range.min.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {range.max.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mean:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {range.mean.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Size:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.standard.imageWidth} × {metadata.standard.imageHeight}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valid Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {validPixels.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">NoData Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {noDataPixels.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zero Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {zeroPixels.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.standard.totalPixels.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resolution:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {isNaN(metadata.standard.resolution.x) 
                  ? 'Unknown'
                  : `${metadata.standard.resolution.x.toFixed(2)} meters`}
              </span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Type:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.standard.bitsPerSample
                  ? `${metadata.standard.bitsPerSample[0]}-bit`
                  : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compression:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.standard.compression ? `Type ${metadata.standard.compression}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">No Data:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {formatNoData(metadata.standard.noData)}
               </span>
            </div>
            {metadata.custom?.description && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {metadata.custom.description}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CRS:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.standard.crs || 'Unknown'}
              </span>
            </div>
            {metadata.standard.projectionName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600"></span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {metadata.standard.projectionName}
                </span>
              </div>
            )}
            {metadata.standard.modelTransform?.origin && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top:</span>
                  <span className="text-sm font-bold text-gray-700 font-mono text-right">
                    {metadata.standard.modelTransform.origin[0].toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Left:</span>
                  <span className="text-sm font-bold text-gray-700 font-mono text-right">
                    {metadata.standard.modelTransform.origin[1].toFixed(6)}
                  </span>
                </div>
              </>
            )}
            {metadata.standard.datum && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Datum:</span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {metadata.standard.datum}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            {layerMetadata?.source && (
              <span className="text-xs text-gray-500 italic">
                Source: {layerMetadata.source}
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;