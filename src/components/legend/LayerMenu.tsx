import React from 'react';
import { Info, BarChart2 } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  toggleLayer,
  toggleSingleLayer,
  toggleShowValues
} from '../../store/slices/layers';
import { isEsriLayer } from '../../store/slices/common/utils/utils';
import OpacityControl from '../controls/OpacityControl';
import ValueRangeControl from '../controls/ValueRangeControl';
import LayerOrderControl from '../controls/LayerOrderControl';

interface LayerMenuProps {
  categoryId: string;
  layerId: number;
  onClose: () => void;
  onAboutClick?: () => void;
  onFeatureAboutClick?: () => void;
  onTiffAboutClick?: () => void;
  isGeoTiff: boolean;
  isFeatureLayer: boolean;
  isArcGISImageService: boolean;
  categories: any;
}

const LayerMenu: React.FC<LayerMenuProps> = ({ 
  categoryId, 
  layerId, 
  onClose, 
  onAboutClick,
  onFeatureAboutClick,
  onTiffAboutClick,
  isGeoTiff,
  isFeatureLayer,
  isArcGISImageService,
  categories
}) => {
  const dispatch = useAppDispatch();
  const layer = categories[categoryId]?.layers.find((l: any) => l.id === layerId);
  
  // Handle click on layer name/text - exclusive behavior
  const handleLayerClick = () => {
    // Use toggleLayer for GeoTiff layers to match eye icon behavior
    if (isGeoTiff) {
      dispatch(toggleLayer({ categoryId, layerId }));
    } else {
      dispatch(toggleSingleLayer({ categoryId, layerId }));
    }
    onClose();
  };

  // Handle click on eye icon - non-exclusive behavior
  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLayer({ categoryId, layerId }));
    onClose();
  };

  // Handle click on Show Values
  const handleShowValuesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleShowValues({ categoryId, layerId }));
    onClose();
  };

  return (
    <div className="absolute right-0 top-[calc(100%+4.375rem)] w-56 bg-white rounded-lg shadow-lg py-1 border z-50">
      {/* Opacity Control */}
      {!isEsriLayer(categoryId, layerId, categories) && (
        <div className="px-4 py-2">
          <OpacityControl
            categoryId={categoryId}
            layerId={layerId}
            opacity={layer?.opacity || 1}
            showLabel={true}
            showValue={true}
          />
        </div>
      )}

      {/* Value Range Control */}
      {isGeoTiff && layer?.valueRange && (
        <div className="px-4 py-2">
          <ValueRangeControl
            categoryId={categoryId}
            layerId={layerId}
            range={layer.valueRange}
            showLabel={true}
            showValue={true}
          />
        </div>
      )}

      {/* Show Map Values option - Moved here */}
      {(isGeoTiff || isFeatureLayer || isArcGISImageService) && (
        <button
          onClick={handleShowValuesClick}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
            layer?.showValues ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Show Map Values</span>
        </button>
      )}
      
      {/* Layer ordering actions - only for GeoTIFF layers */}
      {isGeoTiff && (
        <div className="px-4 py-2 border-t border-gray-200">
          <LayerOrderControl
            categoryId={categoryId}
            layerId={layerId}
            onOrderChange={onClose}
          />
        </div>
      )}

      {/* About Panel */}
      {(isGeoTiff || isFeatureLayer || isArcGISImageService) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isGeoTiff && onAboutClick) {
              onAboutClick();
            } else if (isFeatureLayer && onFeatureAboutClick) {
              onFeatureAboutClick();
            } else if (isArcGISImageService && onTiffAboutClick) {
              onTiffAboutClick();
            }
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center border-t border-gray-200"
        >
          <Info className="h-4 w-4 mr-2" />
          About
        </button>
      )}
      
      <button
         className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200"
         onClick={handleLayerClick}
      >
        Remove Layer
      </button>
    </div>
  );
};

export default LayerMenu;