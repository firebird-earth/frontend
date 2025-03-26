import React from 'react';
import { Info } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';

interface AboutArcGISDialogProps {
  metadata: {
    name: string;
    description: string;
    pixelType: string;
    bandCount: number;
    minValues?: number[];
    maxValues?: number[];
    meanValues?: number[];
    stdvValues?: number[];
    extent?: {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
      spatialReference?: {
        wkid: number;
      };
    };
    spatialReference?: {
      wkid: number;
    };
    copyrightText?: string;
    rasterFunctionInfos?: Array<{
      name: string;
      description: string;
      help: string;
    }>;
  };
  onClose: () => void;
  layerName?: string;
  renderingRule?: string;
}

const AboutArcGISDialog: React.FC<AboutArcGISDialogProps> = ({ 
  metadata, 
  onClose, 
  layerName,
  renderingRule
}) => {
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

  // Find the current rendering rule info
  const currentRenderingRule = metadata.rasterFunctionInfos?.find(
    rule => rule.name === renderingRule
  );

  // Get WKID from either extent or top-level spatial reference
  const wkid = metadata.extent?.spatialReference?.wkid || 
               metadata.spatialReference?.wkid || 
               4326; // Default to WGS84

  // Get statistics from first band
  const hasStats = metadata.minValues?.[0] !== undefined && 
                  metadata.maxValues?.[0] !== undefined && 
                  metadata.meanValues?.[0] !== undefined;

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
            {layerName || metadata.name}
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Rendering Rule */}
          {currentRenderingRule && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Function:</span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {currentRenderingRule.name}
                </span>
              </div>
              {currentRenderingRule.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentRenderingRule.description}
                </p>
              )}
            </div>
          )}

          {/* Data Statistics */}
          {hasStats && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Min:</span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {metadata.minValues![0].toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max:</span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {metadata.maxValues![0].toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mean:</span>
                <span className="text-sm font-medium text-gray-700 text-right">
                  {metadata.meanValues![0].toFixed(3)}
                </span>
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="border-t border-gray-200 pt-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pixel Type:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.pixelType || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bands:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.bandCount || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CRS:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {`EPSG:${wkid}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            {metadata.copyrightText && (
              <span className="text-xs text-gray-500 italic flex-1 mr-4">
                {metadata.copyrightText}
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

export default AboutArcGISDialog;