import React from 'react';
import { MoreVertical } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getOrderedGeoTiffLayers } from '../../store/slices/common/utils/ordering';
import { LayerType } from '../../types/map';
import { MAP_LAYERS } from '../../constants/maps';
import LayerMenu from './LayerMenu';

// Import layer components
import {
  StatesLayer,
  CountiesLayer,
  FederalLandsLayer,
  USFSLayer,
  USFWSLayer,
  CrisisAreasLayer,
  ElevationLayer,
  HillshadeLayer,
  AspectLayer,
  SlopeLayer,
  ContourLayer,
  GeoTiffLegend
} from '../layers/maps';

interface LegendContentProps {
  onShowAbout: (categoryId: string, layerId: number) => void;
  onShowFeatureAbout: (categoryId: string, layerId: number) => void;
  onShowArcGISAbout: (categoryId: string, layerId: number) => void;
  onShowTiffAbout: (categoryId: string, layerId: number) => void;
  onMenuClick: (e: React.MouseEvent, categoryId: string, layerId: number) => void;
  menu: { isOpen: boolean; categoryId: string; layerId: number } | null;
}

const LegendContent: React.FC<LegendContentProps> = ({
  onShowAbout,
  onShowFeatureAbout,
  onShowArcGISAbout,
  onShowTiffAbout,
  onMenuClick,
  menu
}) => {
  const { categories } = useAppSelector(state => state.layers);

  // Get GeoTIFF layers first
  const geoTiffLayers = getOrderedGeoTiffLayers(categories);
  
  // Get other layers, excluding GeoTIFFs
  const otherLayers = Object.entries(categories).flatMap(([categoryId, category]) => {
    if (categoryId !== 'basemaps') {
      return category.layers
        .filter(layer => layer.active && layer.type !== LayerType.GeoTiff)
        .map(layer => ({
          categoryId,
          layer
        }));
    }
    return [];
  });

  const activeLayers = [...geoTiffLayers, ...otherLayers];

  if (activeLayers.length === 0) return null;

  return (
    <div className="p-4 space-y-6 bg-white">
      {activeLayers.map(({ categoryId, layer }) => {
        const isFeatureLayer = layer.type === LayerType.ArcGISFeatureService || 
                             (layer.type === LayerType.Vector && layer.source?.includes('/FeatureServer/'));
        const isArcGISImageService = layer.type === LayerType.ArcGISImageService;

        return (
          <div key={`${categoryId}-${layer.id}`} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">{layer.name}</h4>
              <div className="relative">
                <button
                  onClick={(e) => onMenuClick(e, categoryId, layer.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menu?.isOpen && menu.categoryId === categoryId && menu.layerId === layer.id && (
                  <LayerMenu
                    categoryId={categoryId}
                    layerId={layer.id}
                    onClose={() => onMenuClick({ stopPropagation: () => {} } as React.MouseEvent, categoryId, layer.id)}
                    onAboutClick={layer.type === LayerType.GeoTiff ? () => onShowAbout(categoryId, layer.id) : undefined}
                    onFeatureAboutClick={isFeatureLayer ? () => onShowFeatureAbout(categoryId, layer.id) : undefined}
                    onTiffAboutClick={isArcGISImageService ? () => onShowTiffAbout(categoryId, layer.id) : undefined}
                    isGeoTiff={layer.type === LayerType.GeoTiff}
                    isFeatureLayer={isFeatureLayer}
                    isArcGISImageService={isArcGISImageService}
                    categories={categories}
                  />
                )}
              </div>
            </div>
            
            {layer.type === LayerType.GeoTiff && (
              <GeoTiffLegend 
                url={layer.source} 
                categoryId={categoryId}
                layerId={layer.id}
              />
            )}

            {/* Other layer legends */}
            {layer.name === MAP_LAYERS.JURISDICTIONS.STATES.name && <StatesLayer.Legend />}
            {layer.name === MAP_LAYERS.JURISDICTIONS.COUNTIES.name && <CountiesLayer.Legend />}
            {layer.name === MAP_LAYERS.JURISDICTIONS.FEDERAL_LANDS.name && <FederalLandsLayer.Legend />}
            {layer.name === MAP_LAYERS.JURISDICTIONS.USFS.name && <USFSLayer.Legend />}
            {layer.name === MAP_LAYERS.JURISDICTIONS.USFWS.name && <USFWSLayer.Legend />}
            
            {layer.name === MAP_LAYERS.WILDFIRE.WUI.name && (
              <div className="space-y-2">
                {MAP_LAYERS.WILDFIRE.WUI.legend?.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {layer.name === MAP_LAYERS.WILDFIRE.CRISIS_AREAS.name && <CrisisAreasLayer.Legend />}
            {layer.name === 'Elevation' && <ElevationLayer.Legend />}
            {layer.name === 'Slope Steepness' && <SlopeLayer.Legend />}
            {layer.name === 'Aspect' && <AspectLayer.Legend />}
            {layer.name === 'Hillshade' && <HillshadeLayer.Legend />}
            {layer.name === 'Contour' && <ContourLayer.Legend />}
          </div>
        );
      })}
    </div>
  );
};

export default LegendContent;
