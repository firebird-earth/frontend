import React from 'react';
import { MoreVertical } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { LayerType } from '../../types/map';
import LayerMenu from './LayerMenu';
import GeoTiffLegend from './GeoTiffLegend';
import ArcGISLegend from './ArcGISLegend';
import FeatureLegend from './FeatureLegend';
import { ELEVATION } from '../../constants/maps/elevation';
import { FIRE_METRICS } from '../../constants/maps';
import { selectOrderedLayers } from '../../store/slices/layers/selectors';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[LegendContent]', ...args);
  }
}

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
  // Get categories once at the top
  const { categories } = useAppSelector(state => state.layers);
  const activeLayers = useAppSelector(selectOrderedLayers);

  if (activeLayers.length === 0) return null;

  log('activeLayers:', activeLayers.map(({ layer, categoryId }) => ({
    name: layer.name,
    type: layer.type,
    categoryId,
    active: layer.active,
    metadata: layer.metadata
  })));

  return (
    <div className="p-4 space-y-6 bg-white">
      {activeLayers.map(({ categoryId, layer }) => {
        const isFeatureLayer =
          layer.type === LayerType.ArcGISFeatureService ||
          (layer.type === LayerType.Vector && layer.source?.includes('/FeatureServer/'));
        const isArcGISImageService = layer.type === LayerType.ArcGISImageService;
        const isTileLayer = layer.type === LayerType.TileLayer;
        const isRasterLayer = layer.type === LayerType.Raster;

        // Determine units
        let units = layer.units || 'units';
        if (categoryId === 'elevation') {
          const elevationLayer = Object.values(ELEVATION).find(l => l.name === layer.name);
          if (elevationLayer) units = elevationLayer.units;
        } else if (categoryId === 'landscapeRisk') {
          const riskLayer = Object.values(FIRE_METRICS.LANDSCAPE_RISK).find(l => l.name === layer.name);
          if (riskLayer) units = riskLayer.units;
        } else if (categoryId === 'fuels') {
          const fuelsLayer = Object.values(FIRE_METRICS.FUELS).find(l => l.name === layer.name);
          if (fuelsLayer) units = fuelsLayer.units;
        }

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
                {menu?.isOpen &&
                  menu.categoryId === categoryId &&
                  menu.layerId === layer.id && (
                    <LayerMenu
                      categoryId={categoryId}
                      layerId={layer.id}
                      onClose={() =>
                        onMenuClick(
                          { stopPropagation: () => {} } as React.MouseEvent,
                          categoryId,
                          layer.id
                        )
                      }
                      onAboutClick={
                        (layer.type === LayerType.GeoTiff || isArcGISImageService || isRasterLayer)
                          ? () => onShowAbout(categoryId, layer.id)
                          : undefined
                      }
                      onFeatureAboutClick={
                        isFeatureLayer
                          ? () => onShowFeatureAbout(categoryId, layer.id)
                          : undefined
                      }
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
              <GeoTiffLegend categoryId={categoryId} layerId={layer.id} />
            )}

            {/* Raster Legend */}
            {layer.type === LayerType.Raster && (
              layer.metadata?.isBinary ? (
                <FeatureLegend
                  categoryId={categoryId}
                  layerId={layer.id}
                  units={units}
                />
              ) : (
                <GeoTiffLegend
                  categoryId={categoryId}
                  layerId={layer.id}
                />
              )
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

            {/* Feature Layer or TileLayer Legend */}
            {(isFeatureLayer || layer.type === LayerType.Vector || isTileLayer) && layer.legend && (
              <FeatureLegend
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