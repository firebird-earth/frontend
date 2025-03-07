import React, { useState } from 'react';
import { MoreVertical, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Sliders, Info } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  toggleLayer, 
  toggleSingleLayer, 
  setLayerOpacity,
  bringLayerToFront,
  sendLayerToBack,
  bringLayerForward,
  sendLayerBackward,
  setLayerValueRange,
  clearActiveLayers
} from '../../store/slices/layersSlice';
import WUILegend from '../layers/layers/WUILegend';
import CrisisAreasLegend from '../layers/layers/CrisisAreasLegend';
import GeoTiffLegend from '../layers/firemetrics/GeoTiffLegend';
import { getColorScheme, getGradientForScheme } from '../../utils/colors';
import { getOrderedGeoTiffLayers, isEsriLayer } from '../../utils/layers';
import OpacitySlider from './OpacitySlider';
import ValueRangeControl from './ValueRangeControl';
import AboutPanel from './AboutPanel';
import { geotiffService } from '../../services/geotiffService';
import { getGeoTiffUrl } from '../../constants/urls';

interface MenuState {
  isOpen: boolean;
  categoryId: string;
  layerId: number;
}

const Legend: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [showOpacityControl, setShowOpacityControl] = useState<{
    categoryId: string;
    layerId: number;
    initialOpacity: number;
  } | null>(null);
  const [showValueRangeControl, setShowValueRangeControl] = useState<{
    categoryId: string;
    layerId: number;
    initialRange: {
      min: number;
      max: number;
      defaultMin: number;
      defaultMax: number;
    };
  } | null>(null);
  const [showAboutPanel, setShowAboutPanel] = useState<{
    metadata: any;
    range: any;
  } | null>(null);

  // Get all active layers except basemaps
  const allActiveLayers = Object.entries(categories).flatMap(([categoryId, category]) => {
    if (categoryId !== 'basemaps') {
      return category.layers
        .filter(layer => layer.active)
        .map(layer => ({
          categoryId,
          layer
        }));
    }
    return [];
  });

  // Get GeoTIFF layers in the same order as they're rendered on the map
  const geoTiffLayers = getOrderedGeoTiffLayers(categories).map(layer => ({
    categoryId: layer.name.includes('Canopy') ? 'fuels' : 'firemetrics',
    layer
  }));
  
  // Get all other active layers (not GeoTIFF)
  const otherLayers = allActiveLayers.filter(
    ({ layer }) => layer.type !== 'geotiff'
  );

  // Combine the layers with GeoTIFF layers first, then other layers
  const activeLayers = [...geoTiffLayers, ...otherLayers];

  const handleMenuClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation();
    if (menu?.categoryId === categoryId && menu?.layerId === layerId) {
      setMenu(null);
    } else {
      setMenu({ isOpen: true, categoryId, layerId });
    }
  };

  const handleClickOutside = () => {
    setMenu(null);
  };

  React.useEffect(() => {
    if (menu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menu]);

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string, layerId: number) => {
    e.stopPropagation();
    const opacity = parseFloat(e.target.value);
    dispatch(setLayerOpacity({ categoryId, layerId, opacity }));
  };

  const handleShowAbout = async (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer || !currentAOI) return;

    try {
      const aoiId = 'id' in currentAOI ? currentAOI.id : 1;
      const layerName = layer.source.split('/').pop()?.replace('.tif', '') || '';
      const url = getGeoTiffUrl(aoiId, layerName);

      const metadata = await geotiffService.getGeoTiffMetadata(url);
      
      setShowAboutPanel({
        metadata: metadata.metadata,
        range: metadata.range
      });
      setMenu(null);
    } catch (error) {
      console.error('Failed to load GeoTIFF metadata:', error);
    }
  };

  if (activeLayers.length === 0) return null;

  return (
    <div className="p-4 space-y-6 bg-white">
      {activeLayers.map(({ categoryId, layer }) => (
        <div key={`${categoryId}-${layer.id}`} className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#333333]">{layer.name}</h4>
            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(e, categoryId, layer.id)}
                className="p-1 hover:bg-gray-100 rounded-lg text-[#333333]"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menu?.isOpen && menu.categoryId === categoryId && menu.layerId === layer.id && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-1 border z-50">
                  {/* Opacity Control */}
                  {!isEsriLayer(categoryId, layer.id, categories) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOpacityControl({
                          categoryId,
                          layerId: layer.id,
                          initialOpacity: layer.opacity || 1
                        });
                        setMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      Adjust Opacity
                    </button>
                  )}

                  {/* Value Range Control */}
                  {layer.type === 'geotiff' && layer.valueRange && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowValueRangeControl({
                          categoryId,
                          layerId: layer.id,
                          initialRange: layer.valueRange!
                        });
                        setMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      Adjust Value Range
                    </button>
                  )}
                  
                  {/* Layer ordering controls - only for GeoTIFF layers */}
                  {layer.type === 'geotiff' && (
                    <>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          dispatch(bringLayerToFront({ categoryId, layerId: layer.id }));
                          setMenu(null);
                        }}
                      >
                        <ChevronsUp className="h-4 w-4 mr-2" />
                        Bring to Front
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          dispatch(bringLayerForward({ categoryId, layerId: layer.id }));
                          setMenu(null);
                        }}
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Bring Forward
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          dispatch(sendLayerBackward({ categoryId, layerId: layer.id }));
                          setMenu(null);
                        }}
                      >
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Send Backward
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          dispatch(sendLayerToBack({ categoryId, layerId: layer.id }));
                          setMenu(null);
                        }}
                      >
                        <ChevronsDown className="h-4 w-4 mr-2" />
                        Send to Back
                      </button>
                    </>
                  )}

                  {/* About Panel - only for GeoTIFF layers */}
                  {layer.type === 'geotiff' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowAbout(categoryId, layer.id);
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
                       dispatch(toggleLayer({ categoryId, layerId: layer.id }));
                       setMenu(null);
                     }}
                  >
                    Remove Layer
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Layer-specific legends */}
          {layer.type === 'geotiff' && (
            <GeoTiffLegend 
              url={layer.source} 
              categoryId={categoryId}
              layerId={layer.id}
            />
          )}
          {layer.name === 'WUI' && <WUILegend />}
          {layer.name === 'Wildfire Crisis Areas' && <CrisisAreasLegend />}
          {layer.name === 'Mortality' && (
            <div className="space-y-2">
              <div className="space-y-1">
                {(() => {
                  const mortalityScheme = getColorScheme('greenYellowRed');
                  if (mortalityScheme) {
                    return (
                      <div 
                        className="h-4 w-full rounded" 
                        style={{ background: getGradientForScheme(mortalityScheme) }}
                      />
                    );
                  } else {
                    return (
                      <div className="h-4 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded" />
                    );
                  }
                })()}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <div className="text-xs text-gray-600 text-center">
                  Tree mortality
                </div>
              </div>
            </div>
          )}

          {/* Buildings */}
          {layer.name === 'Buildings' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 opacity-70"></div>
                <span className="text-xs text-[#333333]">Building</span>
              </div>
            </div>
          )}

          {/* Restoration Classes */}
          {layer.name.includes('Departure') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-600 opacity-70"></div>
                <span className="text-xs text-[#333333]">Significant Departure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-400 opacity-70"></div>
                <span className="text-xs text-[#333333]">Moderate Departure</span>
              </div>
            </div>
          )}

          {/* Other layer legends */}
          {layer.name === 'Priority Treatment Areas' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-600 opacity-70"></div>
                <span className="text-xs text-[#333333]">High Priority Treatment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-400 opacity-70"></div>
                <span className="text-xs text-[#333333]">Medium Priority Treatment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-300 opacity-70"></div>
                <span className="text-xs text-[#333333]">Low Priority Treatment</span>
              </div>
            </div>
          )}

          {/* Jurisdictions */}
          {layer.name === 'US Forest Service' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-700 opacity-70"></div>
                <span className="text-xs text-[#333333]">National Forest</span>
              </div>
            </div>
          )}

          {layer.name === 'Bureau of Land Management' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-700 opacity-70"></div>
                <span className="text-xs text-[#333333]">BLM Land</span>
              </div>
            </div>
          )}

          {/* Water Features */}
          {layer.name.includes('Watersheds') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 opacity-30 border border-blue-600"></div>
                <span className="text-xs text-[#333333]">Watershed Boundary</span>
              </div>
            </div>
          )}

          {layer.name === 'Lakes, Wetlands and Ponds' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 opacity-50"></div>
                <span className="text-xs text-[#333333]">Water Body</span>
              </div>
            </div>
          )}

          {/* Infrastructure */}
          {layer.name.includes('Power Transmission') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-800 opacity-70 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-yellow-400"></div>
                </div>
                <span className="text-xs text-[#333333]">Transmission Line</span>
              </div>
            </div>
          )}

          {/* Habitat */}
          {layer.name.includes('Migration') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 opacity-70"></div>
                <span className="text-xs text-[#333333]">Migration Corridor</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-300 opacity-70"></div>
                <span className="text-xs text-[#333333]">Migration Area</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Opacity Control Dialog */}
      {showOpacityControl && (
        <OpacitySlider
          categoryId={showOpacityControl.categoryId}
          layerId={showOpacityControl.layerId}
          initialOpacity={showOpacityControl.initialOpacity}
          onClose={() => setShowOpacityControl(null)}
        />
      )}

      {/* Value Range Control Dialog */}
      {showValueRangeControl && (
        <ValueRangeControl
          categoryId={showValueRangeControl.categoryId}
          layerId={showValueRangeControl.layerId}
          initialRange={showValueRangeControl.initialRange}
          onClose={() => setShowValueRangeControl(null)}
        />
      )}

      {/* About Panel */}
      {showAboutPanel && (
        <AboutPanel
          metadata={showAboutPanel.metadata}
          range={showAboutPanel.range}
          onClose={() => setShowAboutPanel(null)}
        />
      )}
    </div>
  );
};

export default Legend;