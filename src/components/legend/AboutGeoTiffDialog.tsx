import React from 'react';
import { Info } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';
import { getCRSName } from '../../utils/crs';
import { useAppSelector } from '../../hooks/useAppSelector';

interface AboutGeoTiffDialogProps {
  layerName: string;
  layerId: number;
  categoryId: string;
  onClose: () => void;
}

const AboutGeoTiffDialog: React.FC<AboutGeoTiffDialogProps> = ({ 
  layerName,
  layerId,
  categoryId,
  onClose
}) => {
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

  // Get layer from Redux store
  const layer = useAppSelector(state => 
    state.layers.categories[categoryId]?.layers.find(l => l.id === layerId)
  );

  // Access metadata and range from the layer
  const metadata = layer?.metadata;

  // Early return if metadata is missing
  if (!metadata) {
    console.log("metadata not found");
    return null;
  }

  // Safely extract pixel statistics
  const min = metadata.stats?.min || 0;
  const max = metadata.stats?.max || 0;
  const mean = metadata.stats?.mean || 0;
  const validPixels = metadata.stats?.validCount || 0;
  const noDataPixels = metadata.stats?.noDataCount || 0;
  const zeroPixels = metadata.stats?.zeroCount || 0;
  const totalPixels = metadata.width * metadata.height;

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
                {min.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {max.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mean:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {mean.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Pixel Analysis */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pixel Analysis</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dimensions:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.width} × {metadata.height}
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
                {totalPixels.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resolution:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.resolution?.x 
                  ? `${metadata.resolution.x.toFixed(2)} meters`
                  : 'Unknown'}
              </span>
            </div>
          </div>

          {/* Image Properties */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Properties</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CRS:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {getCRSName(metadata.sourceCRS)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">NoData Value:</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {metadata.noDataValue ?? 'None'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutGeoTiffDialog;