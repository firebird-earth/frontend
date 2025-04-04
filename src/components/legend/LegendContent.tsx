import React from 'react';
import { MoreVertical } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { LayerType } from '../../types/map';
import LayerMenu from './LayerMenu';
import GeoTiffLegend from './GeoTiffLegend';
import ArcGISLegend from './ArcGISLegend';
import FeatureLegend from './FeatureLegend';
import { ELEVATION } from '../../constants/maps/layers/elevation';
import { FIRE_METRICS } from '../../constants/maps';

interface LegendContentProps {
  onShowAbout: (categoryId: string, layerId: number) => void;
  onShowFeatureAbout: (categoryId: string, layerId: number) => void;
  onMenuClick: (e: React.MouseEvent, categoryId: string, layerId: number) => void;
  menu: { isOpen: boolean; categoryId: string; layerId: number } | null;
}

const LegendContent: React.FC<LegendContentProps> = ({
  onShowAbout,
  onShowFeatureAbout,
  onMenuClick,
  menu
}) => {
  const { categories } = useAppSelector(state => state.layers);

  // Get all active layers
  const activeLayers = Object.entries(categories)
    .filter(([categoryId]) => categoryId !== 'basemaps') // Exclude basemaps
    .flatMap(([categoryId, category]) => 
      category.layers
        .filter(layer => layer.active)
        .map(layer => ({ categoryId, layer }))
    );

  if (activeLayers.length === 0) return null;

  return (
    <div className="p-4 space-y-6 bg-white">
      {activeLayers.map(({ categoryId, layer }) => {
        const isFeatureLayer = layer.type === LayerType.ArcGISFeatureService || 
                             (layer.type === LayerType.Vector && layer.source?.includes('/FeatureServer/'));
        const isArcGISImageService = layer.type === LayerType.ArcGISImageService;

        // Get units from layer configuration
        let units = layer.units || 'units';
        if (categoryId === 'elevation') {
          const elevationLayer = Object.values(ELEVATION).find(l => l.name === layer.name);
          if (elevationLayer) {
            units = elevationLayer.units;
          }
        } else if (categoryId === 'landscapeRisk') {
          const riskLayer = Object.values(FIRE_METRICS.LANDSCAPE_RISK).find(l => l.name === layer.name);
          if (riskLayer) {
            units = riskLayer.units;
          }
        } else if (categoryId === 'fuels') {
          const fuelsLayer = Object.values(FIRE_METRICS.FUELS).find(l => l.name === layer.name);
          if (fuelsLayer) {
            units = fuelsLayer.units;
          }
        }

        return (
          <div
            key={`${categoryId}-${layer.id}`}
            className="space-y-2"
          >
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
                    onAboutClick={layer.type === LayerType.GeoTiff || isArcGISImageService ? () => onShowAbout(categoryId, layer.id) : undefined}
                    onFeatureAboutClick={isFeatureLayer ? () => onShowFeatureAbout(categoryId, layer.id) : undefined}
                    isGeoTiff={layer.type === LayerType.GeoTiff}
                    isFeatureLayer={isFeatureLayer}
                    isArcGISImageService={isArcGISImageService}
                    categories={categories}
                  />
                )}
              </div>
            </div>
            
            {/* GeoTIFF Legend */}
            {layer.type === LayerType.GeoTiff && (
              <GeoTiffLegend 
                url={layer.source}
                categoryId={categoryId}
                layerId={layer.id}
              />
            )}

            {/* ArcGIS Image Service Legend */}
            {isArcGISImageService && layer.colorScheme && (
              <ArcGISLegend
                url={layer.source}
                categoryId={categoryId}
                layerId={layer.id}
                units={units}
              />
            )}

            {/* Feature Layer Legend */}
            {(isFeatureLayer || layer.type === LayerType.Vector) && (
              <FeatureLegend
                url={layer.source}
                categoryId={categoryId}
                layerId={layer.id}
                units={units}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LegendContent;