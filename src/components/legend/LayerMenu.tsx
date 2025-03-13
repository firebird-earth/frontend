import React from 'react';
import { ChevronsUp, ChevronsDown, ArrowUp, ArrowDown, Sliders, Info, Image } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  bringLayerToFront,
  sendLayerToBack,
  bringLayerForward,
  sendLayerBackward,
  toggleLayer,
  setSlopeRenderingRule
} from '../../store/slices/layersSlice';
import { isEsriLayer } from '../../utils/layers';
import { SLOPE_RENDERING_RULES } from '../../services/maps/services';

interface LayerMenuProps {
  categoryId: string;
  layerId: number;
  onClose: () => void;
  onOpacityClick: () => void;
  onValueRangeClick?: () => void;
  onAboutClick?: () => void;
  isGeoTiff: boolean;
  categories: any;
}

const LayerMenu: React.FC<LayerMenuProps> = ({
  categoryId,
  layerId,
  onClose,
  onOpacityClick,
  onValueRangeClick,
  onAboutClick,
  isGeoTiff,
  categories
}) => {
  const dispatch = useAppDispatch();
  const layer = categories[categoryId]?.layers.find((l: any) => l.id === layerId);
  const isSlopeLayer = layer?.name === 'Slope Steepness';
  const currentRenderingRule = useAppSelector(state => state.layers.slopeRenderingRule);

  return (
    <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-1 border z-50">
      {/* Opacity Control */}
      {!isEsriLayer(categoryId, layerId, categories) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpacityClick();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
        >
          <Sliders className="h-4 w-4 mr-2" />
          Adjust Opacity
        </button>
      )}

      {/* Value Range Control */}
      {isGeoTiff && onValueRangeClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onValueRangeClick();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
        >
          <Sliders className="h-4 w-4 mr-2" />
          Adjust Value Range
        </button>
      )}
      
      {/* Rendering Rules for Slope Layer */}
      {isSlopeLayer && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-500">Rendering Style</div>
          {SLOPE_RENDERING_RULES.map(rule => (
            <button
              key={rule.rasterFunction}
              onClick={() => {
                dispatch(setSlopeRenderingRule(rule.rasterFunction));
                onClose();
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                currentRenderingRule === rule.rasterFunction ? 'text-blue-600' : 'text-[#333333]'
              }`}
            >
              <div className="flex items-center">
                <Image className="h-4 w-4 mr-2" />
                {rule.name}
              </div>
              {currentRenderingRule === rule.rasterFunction && (
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              )}
            </button>
          ))}
        </>
      )}
      
      {/* Layer ordering controls - only for GeoTIFF layers */}
      {isGeoTiff && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            onClick={() => {
              dispatch(bringLayerToFront({ categoryId, layerId }));
              onClose();
            }}
          >
            <ChevronsUp className="h-4 w-4 mr-2" />
            Bring to Front
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            onClick={() => {
              dispatch(bringLayerForward({ categoryId, layerId }));
              onClose();
            }}
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Bring Forward
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            onClick={() => {
              dispatch(sendLayerBackward({ categoryId, layerId }));
              onClose();
            }}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Send Backward
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            onClick={() => {
              dispatch(sendLayerToBack({ categoryId, layerId }));
              onClose();
            }}
          >
            <ChevronsDown className="h-4 w-4 mr-2" />
            Send to Back
          </button>
        </>
      )}

      {/* About Panel - only for GeoTIFF layers */}
      {isGeoTiff && onAboutClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAboutClick();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
        >
          <Info className="h-4 w-4 mr-2" />
          About
        </button>
      )}
      
      <div className="border-t border-gray-200 my-1"></div>
      
      <button
         className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
         onClick={() => {
           dispatch(toggleLayer({ categoryId, layerId }));
           onClose();
         }}
      >
        Remove Layer
      </button>
    </div>
  );
};

export default LayerMenu;