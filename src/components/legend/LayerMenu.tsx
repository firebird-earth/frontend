import React from 'react';
import { Info, BarChart2, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  toggleLayer,
  toggleSingleLayer,
  setShowMapValues
} from '../../store/slices/layersSlice';
import OpacityControl from '../controls/OpacityControl';
import TransparencyControl from '../controls/TransparencyControl';
import ValueRangeControl from '../controls/ValueRangeControl';
import LayerOrderControl from '../controls/LayerOrderControl';
import { LayerType } from '../../types/map';

interface LayerMenuProps {
  categoryId: string;
  layerId: number;
  onClose: () => void;
  onAboutClick?: () => void;
  onFeatureAboutClick?: () => void;
  categories: any;
}

const LayerMenu: React.FC<LayerMenuProps> = ({ 
  categoryId, 
  layerId, 
  onClose, 
  onAboutClick,
  onFeatureAboutClick,
  categories
}) => {
  const dispatch = useAppDispatch();
  const layer = categories[categoryId]?.layers.find((l: any) => l.id === layerId);
  const isGeoTiffLayer = layer.type === LayerType.GeoTiff;
  const isRasterLayer = layer.type === LayerType.Raster && !layer.metadata?.isBinary;
  const isRasterLayerBinary = layer.type === LayerType.Raster && layer.metadata?.isBinary;
  const isArcGISImageServiceLayer = layer.type === LayerType.ArcGISImageService;
  const isFeatureLayer = layer.type === LayerType.ArcGISFeatureService || layer.type === LayerType.Vector;
  const isTileLayer = layer.type === LayerType.TileLayer;

  const isImageLayer = isGeoTiffLayer || isRasterLayer || isRasterLayerBinary || isArcGISImageServiceLayer;
  
  // Handle click on layer name/text - exclusive behavior
  const handleLayerClick = () => {
    // Use toggleLayer for GeoTiff layers to match eye icon behavior
    if (isGeoTiffLayer || isRasterLayer || isRasterLayerBinary) {
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
    dispatch(setShowMapValues({ categoryId, layerId, showValues: true }));
    onClose();
  };

  return (
    <div className="absolute right-0 top-[calc(100%)] w-56 bg-white rounded-lg shadow-lg py-1 border z-50">
      {/* Transparency Control */}
      {(isImageLayer) && (
        <div className="px-2 py-2">
          <TransparencyControl
            categoryId={categoryId}
            layerId={layerId}
            opacity={layer?.opacity || 1}
            showLabel={true}
            showValue={true}
            label="Transparency"
          />
        </div>
      )}

      {/* Value Range Control */}
      {(isGeoTiffLayer || isRasterLayer || isArcGISImageServiceLayer) && layer?.valueRange && (
        <div className="px-2 py-2">
          <ValueRangeControl
            categoryId={categoryId}
            layerId={layerId}
            range={layer.valueRange}
            showLabel={true}
            showValue={true}
          />
        </div>
      )}

      {/* Show Values button */}
      {(isImageLayer) && layer?.valueRange && (
        <>
          <div className="my-1 border-t border-gray-200"></div>
          <button
            onClick={handleShowValuesClick}
            className={`w-full px-2 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
              layer?.showValues ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Show Map Values</span>
          </button>
        </>
      )}

      {/* Layer ordering controls */}
      {(isImageLayer) && (
        <>
          <div className="my-1 border-t border-gray-200"></div>
          <div className="px-0 py-2">
            <LayerOrderControl
              categoryId={categoryId}
              layerId={layerId}
              onOrderChange={onClose}
            />
          </div>
        </>
      )}

      {/* About Panel */}
      {(isImageLayer || isFeatureLayer) && (
        <>
          <div className="my-1 border-t border-gray-200"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isImageLayer) {
                onAboutClick?.();
              } else if (isFeatureLayer && onFeatureAboutClick) {
                onFeatureAboutClick();
              }
              onClose();
            }}
            className="w-full px-2 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </button>
        </>
      )}
      
      <button
         className="w-full px-2 py-2 text-left text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200 flex items-center"
         onClick={handleLayerClick}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Remove Layer
      </button>
    </div>
  );
};

export default LayerMenu;
