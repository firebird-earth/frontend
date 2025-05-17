import React from 'react';
import { MoreVertical, Info } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { LayerType } from '../../types/map';
import LayerMenu from './LayerMenu';
import GeoTiffLegend from './GeoTiffLegend';
import ArcGISLegend from './ArcGISLegend';
import FeatureLegend from './FeatureLegend';
import { ELEVATION } from '../../constants/maps/elevation';
import { FIRE_METRICS } from '../../constants/maps';
import { selectOrderedLayers } from '../../store/slices/layersSlice/selectors';

const DEBUG = false;
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
        const isGeoTiffLayer = layer.type === LayerType.GeoTiff;
        const isRasterLayer = layer.type === LayerType.Raster;
        const isArcGISImageServiceLayer = layer.type === LayerType.ArcGISImageService;
        const isFeatureLayer = layer.type === LayerType.ArcGISFeatureService || layer.type === LayerType.Vector;
        const isTileLayer = layer.type === LayerType.TileLayer;
        const isIgnitionsLayer = layer.type === LayerType.Ingnitions;
        const units = layer.units || 'units';

        return (
          <div key={`${categoryId}-${layer.id}`} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h4 className="text-sm font-semibold text-gray-800">{layer.name}</h4>
              </div>
              <div className="flex items-center relative">
                <Info 
                  className="h-4 w-4 text-gray-400 mr-2 cursor-pointer hover:text-gray-600" 
                  onClick={() => {
                    if (isFeatureLayer) {
                      onShowFeatureAbout(categoryId, layer.id);
                    } else if (isGeoTiffLayer || isArcGISImageServiceLayer || isRasterLayer) {
                      onShowAbout(categoryId, layer.id);
                    }
                  }}
                />
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
                        (layer.type === LayerType.GeoTiff || isArcGISImageServiceLayer || isRasterLayer)
                          ? () => onShowAbout(categoryId, layer.id)
                          : undefined
                      }
                      onFeatureAboutClick={
                        isFeatureLayer
                          ? () => onShowFeatureAbout(categoryId, layer.id)
                          : undefined
                      }
                      categories={categories}
                    />
                  )}
              </div>
            </div>

            {/* Ignitions Legend */}
            {layer.type === LayerType.Ignitions && (
              <FeatureLegend categoryId={categoryId} layerId={layer.id} units={units} />
            )}

            {/* GeoTIFF Legend */}
            {layer.type === LayerType.GeoTiff && (
              <GeoTiffLegend categoryId={categoryId} layerId={layer.id} />
            )}

            {/* Raster Legend */}
            {layer.type === LayerType.Raster && (
              layer.metadata?.isBinary ? (
                <FeatureLegend categoryId={categoryId} layerId={layer.id} units={units} />
              ) : (
                <GeoTiffLegend categoryId={categoryId}  layerId={layer.id} />
              )
            )}

            {/* ArcGIS Image Service Legend */}
            {isArcGISImageServiceLayer && layer.colorScheme && (
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