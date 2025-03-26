import React from 'react';
import { Info } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';

interface AboutTiffDialogProps {
  metadata: {
    width: number;
    height: number;
    bounds: [[number, number], [number, number]];
    noDataValue: number | null;
    sourceCRS: string;
    tiepoint: number[];
    scale: number[];
    transform?: number[];
    rawBounds?: [number, number, number, number];
    stats?: {
      min: number;
      max: number;
      mean: number;
      validCount: number;
      noDataCount: number;
      zeroCount: number;
    };
  };
  range: {
    min: number;
    max: number;
    mean: number;
  };
  layerName: string;
  renderingRule?: string;
  onClose: () => void;
}

const AboutTiffDialog: React.FC<AboutTiffDialogProps> = ({
  metadata,
  range,
  layerName,
  renderingRule,
  onClose
}) => {
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

  // Calculate percentage of valid pixels
  const totalPixels = metadata.stats?.validCount + (metadata.stats?.noDataCount || 0);
  const validPercentage = totalPixels ? 
    ((metadata.stats?.validCount || 0) / totalPixels * 100).toFixed(1) : '0';
  const noDataPercentage = totalPixels ? 
    ((metadata.stats?.noDataCount || 0) / totalPixels * 100).toFixed(1) : '0';
  const zeroPercentage = totalPixels ? 
    ((metadata.stats?.zeroCount || 0) / totalPixels * 100).toFixed(1) : '0';

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
            {layerName}
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Data Statistics */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
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

          {/* Pixel Analysis */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pixel Analysis</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valid Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.stats?.validCount.toLocaleString()} ({validPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">NoData Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.stats?.noDataCount.toLocaleString()} ({noDataPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zero Pixels:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.stats?.zeroCount.toLocaleString()} ({zeroPercentage}%)
              </span>
            </div>
          </div>

          {/* Image Properties */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Properties</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dimensions:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.width} × {metadata.height}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">NoData Value:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.noDataValue ?? 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CRS:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.sourceCRS}
              </span>
            </div>
          </div>

          {/* Bounds */}
          {metadata.bounds && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Bounds</h4>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">North:</span>
                  <span className="text-gray-700">{metadata.bounds[1][0].toFixed(6)}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">South:</span>
                  <span className="text-gray-700">{metadata.bounds[0][0].toFixed(6)}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">East:</span>
                  <span className="text-gray-700">{metadata.bounds[1][1].toFixed(6)}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">West:</span>
                  <span className="text-gray-700">{metadata.bounds[0][1].toFixed(6)}°</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end">
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

export default AboutTiffDialog;