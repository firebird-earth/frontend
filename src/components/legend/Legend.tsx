import React, { useState } from 'react';
import { MoreVertical, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleLayer } from '../../store/slices/layersSlice';
import WUILegend from '../layers/layers/wildfire/WUILegend';
import CrisisAreasLegend from '../layers/layers/wildfire/CrisisAreasLegend';
import GeoTiffLegend from '../layers/firemetrics/GeoTiffLegend';
import SlopeLegend from '../layers/layers/elevation/SlopeLegend';
import { getColorScheme, getGradientForScheme } from '../../utils/colors';
import { getOrderedGeoTiffLayers } from '../../utils/layers';
import OpacityDialog from './OpacityDialog';
import ValueRangeDialog from './ValueRangeDialog';
import AboutDialog from './AboutDialog';
import LayerMenu from './LayerMenu';
import { geotiffService } from '../../services/geotiffService';
import { getGeoTiffUrl } from '../../constants/urls';
import { FIRE_METRICS, MAP_LAYERS } from '../../constants/maps';

interface MenuState {
  isOpen: boolean;
  categoryId: string;
  layerId: number;
}

const Legend: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
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
    layerName: string;
    categoryId: string;
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

  const handleEyeClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation();
    dispatch(toggleLayer({ categoryId, layerId }));
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
        range: metadata.range,
        layerName: layer.name,
        categoryId
      });
      setMenu(null);
    } catch (error) {
      console.error('Failed to load GeoTIFF metadata:', error);
    }
  };

  if (activeLayers.length === 0) return null;

  // Helper function to get layer metadata from constants
  const getLayerMetadata = (categoryId: string, layerName: string) => {
    // Check FIRE_METRICS first
    if (categoryId === 'firemetrics') {
      const landscapeRiskLayer = Object.values(FIRE_METRICS.LANDSCAPE_RISK).find(l => l.name === layerName);
      if (landscapeRiskLayer) return landscapeRiskLayer;
    }
    
    if (categoryId === 'fuels') {
      const fuelsLayer = Object.values(FIRE_METRICS.FUELS).find(l => l.name === layerName);
      if (fuelsLayer) return fuelsLayer;
    }

    // Check MAP_LAYERS
    const category = Object.values(MAP_LAYERS).find(cat => 
      Object.values(cat).some(l => l.name === layerName)
    );
    
    if (category) {
      return Object.values(category).find(l => l.name === layerName);
    }

    return null;
  };

  return (
    <div className="p-4 space-y-6 bg-white">
      {activeLayers.map(({ categoryId, layer }) => {
        const metadata = getLayerMetadata(categoryId, layer.name);
        
        return (
          <div key={`${categoryId}-${layer.id}`} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">{layer.name}</h4>
              <div className="relative">
                <button
                  onClick={(e) => handleMenuClick(e, categoryId, layer.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menu?.isOpen && menu.categoryId === categoryId && menu.layerId === layer.id && (
                  <LayerMenu
                    categoryId={categoryId}
                    layerId={layer.id}
                    onClose={() => setMenu(null)}
                    onOpacityClick={() => setShowOpacityControl({
                      categoryId,
                      layerId: layer.id,
                      initialOpacity: layer.opacity || 1
                    })}
                    onValueRangeClick={layer.type === 'geotiff' && layer.valueRange ? () => setShowValueRangeControl({
                      categoryId,
                      layerId: layer.id,
                      initialRange: layer.valueRange!
                    }) : undefined}
                    onAboutClick={layer.type === 'geotiff' ? () => handleShowAbout(categoryId, layer.id) : undefined}
                    isGeoTiff={layer.type === 'geotiff'}
                    categories={categories}
                  />
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
            {layer.name === MAP_LAYERS.WILDFIRE.WUI.name && <WUILegend />}
            {layer.name === MAP_LAYERS.WILDFIRE.CRISIS_AREAS.name && <CrisisAreasLegend />}
            {layer.name === MAP_LAYERS.LANDSCAPE.SLOPE.name && <SlopeLegend />}
            {layer.name === FIRE_METRICS.FUELS.MORTALITY.name && (
              <div className="space-y-2">
                <div className="space-y-1">
                  {(() => {
                    const mortalityScheme = getColorScheme(FIRE_METRICS.FUELS.MORTALITY.colorScheme);
                    if (mortalityScheme) {
                      return (
                        <div 
                          className="h-4 w-full rounded" 
                          style={{ background: getGradientForScheme(mortalityScheme) }}
                        />
                      );
                    }
                    return null;
                  })()}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    {FIRE_METRICS.FUELS.MORTALITY.units}
                  </div>
                </div>
              </div>
            )}

            {/* Buildings */}
            {layer.name === MAP_LAYERS.INFRASTRUCTURE.BUILDINGS.name && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-700 opacity-70"></div>
                  <span className="text-xs text-gray-600">{MAP_LAYERS.INFRASTRUCTURE.BUILDINGS.description}</span>
                </div>
              </div>
            )}

            {/* Restoration Classes */}
            {Object.values(MAP_LAYERS.RESTORATION_CLASS).some(rc => rc.name === layer.name) && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-600 opacity-70"></div>
                  <span className="text-xs text-gray-600">Significant Departure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-400 opacity-70"></div>
                  <span className="text-xs text-gray-600">Moderate Departure</span>
                </div>
              </div>
            )}

            {/* Other layer legends */}
            {layer.name === 'Priority Treatment Areas' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-600 opacity-70"></div>
                  <span className="text-xs text-gray-600">High Priority Treatment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-400 opacity-70"></div>
                  <span className="text-xs text-gray-600">Medium Priority Treatment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-300 opacity-70"></div>
                  <span className="text-xs text-gray-600">Low Priority Treatment</span>
                </div>
              </div>
            )}

            {/* Jurisdictions */}
            {layer.name === MAP_LAYERS.JURISDICTIONS.USFS.name && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-700 opacity-70"></div>
                  <span className="text-xs text-gray-600">{MAP_LAYERS.JURISDICTIONS.USFS.description}</span>
                </div>
              </div>
            )}

            {layer.name === MAP_LAYERS.JURISDICTIONS.BLM.name && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-700 opacity-70"></div>
                  <span className="text-xs text-gray-600">{MAP_LAYERS.JURISDICTIONS.BLM.description}</span>
                </div>
              </div>
            )}

            {/* Water Features */}
            {Object.values(MAP_LAYERS.WATER).some(w => w.name.includes('Watersheds') && w.name === layer.name) && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 opacity-30 border border-blue-600"></div>
                  <span className="text-xs text-gray-600">Watershed Boundary</span>
                </div>
              </div>
            )}

            {layer.name === MAP_LAYERS.WATER.WATER_BODIES.name && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 opacity-50"></div>
                  <span className="text-xs text-gray-600">{MAP_LAYERS.WATER.WATER_BODIES.description}</span>
                </div>
              </div>
            )}

            {/* Infrastructure */}
            {Object.values(MAP_LAYERS.INFRASTRUCTURE).some(i => i.name.includes('Power Transmission') && i.name === layer.name) && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-800 opacity-70 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-yellow-400"></div>
                  </div>
                  <span className="text-xs text-gray-600">Transmission Line</span>
                </div>
              </div>
            )}

            {/* Habitat */}
            {Object.values(MAP_LAYERS.HABITAT).some(h => h.name.includes('Migration') && h.name === layer.name) && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 opacity-70"></div>
                  <span className="text-xs text-gray-600">Migration Corridor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-300 opacity-70"></div>
                  <span className="text-xs text-gray-600">Migration Area</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Opacity Control Dialog */}
      {showOpacityControl && (
        <OpacityDialog
          categoryId={showOpacityControl.categoryId}
          layerId={showOpacityControl.layerId}
          initialOpacity={showOpacityControl.initialOpacity}
          onClose={() => setShowOpacityControl(null)}
        />
      )}

      {/* Value Range Control Dialog */}
      {showValueRangeControl && (
        <ValueRangeDialog
          categoryId={showValueRangeControl.categoryId}
          layerId={showValueRangeControl.layerId}
          initialRange={showValueRangeControl.initialRange}
          onClose={() => setShowValueRangeControl(null)}
        />
      )}

      {/* About Dialog */}
      {showAboutPanel && (
        <AboutDialog
          metadata={showAboutPanel.metadata}
          range={showAboutPanel.range}
          layerName={showAboutPanel.layerName}
          categoryId={showAboutPanel.categoryId}
          onClose={() => setShowAboutPanel(null)}
        />
      )}
    </div>
  );
};

export default Legend;