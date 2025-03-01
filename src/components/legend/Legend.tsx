import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleLayer } from '../../store/slices/layersSlice';
import WUILegend from '../layers/layers/WUILegend';
import CrisisAreasLegend from '../layers/layers/CrisisAreasLegend';
import GeoTiffLegend from '../layers/firemetrics/GeoTiffLegend';

interface MenuState {
  isOpen: boolean;
  categoryId: string;
  layerId: number;
}

const Legend: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.layers);
  const [menu, setMenu] = useState<MenuState | null>(null);

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

  // Separate firemetrics and fuels layers from other layers
  const firemetricsLayers = allActiveLayers.filter(
    ({ categoryId }) => categoryId === 'firemetrics' || categoryId === 'fuels'
  );
  
  // All other layers (not firemetrics or fuels)
  const otherLayers = allActiveLayers.filter(
    ({ categoryId }) => categoryId !== 'firemetrics' && categoryId !== 'fuels'
  );

  // Combine the layers with firemetrics first, then other layers
  const activeLayers = [...firemetricsLayers, ...otherLayers];

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
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 border z-50">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100"
                    onClick={() => {
                      console.log('Adjust opacity');
                      setMenu(null);
                    }}
                  >
                    Adjust Opacity
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-gray-100"
                    onClick={() => {
                      console.log('Zoom to layer');
                      setMenu(null);
                    }}
                  >
                    Zoom to Layer
                  </button>
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
          {layer.type === 'geotiff' && <GeoTiffLegend url={layer.source} />}
          {layer.name === 'WUI' && <WUILegend />}
          {layer.name === 'Wildfire Crisis Areas' && <CrisisAreasLegend />}
          {layer.name === 'Mortality' && (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className={`h-4 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded`} />
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
    </div>
  );
};

export default Legend;