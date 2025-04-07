import { LayerType, MapPane } from '../../../../types/map';
import { LayerCategory, LayersState } from '../types';
import { MapLayer } from '../../../../types/map';

// Global counter for unique layer IDs
let globalLayerId = 0;

export function createInitialCategory(
  id: string,
  name: string,
  layers: Partial<MapLayer>[]
): LayerCategory {
  return {
    id,
    name,
    layers: layers.map((layer) => {
      // Increment global counter for each new layer
      globalLayerId++;
      
      // Determine pane based on layer type
      let pane = MapPane.LayersPane; // Default pane
      
      if (layer.type === LayerType.ArcGISFeatureService) {
        pane = MapPane.OverlayPane;      
      } else if (layer.type === LayerType.GeoTiff) {
        pane = MapPane.FiremetricsPane;
      } else if (layer.type === LayerType.ArcGISImageService) {
        pane = MapPane.LayersPane;
      } else if (layer.type === LayerType.TileLayer) {
        pane = MapPane.TilePane;
      }
      
      return {
        id: globalLayerId,
        active: false,
        pane,
        ...layer
      };
    })
  };
}

export function findLayer(state: LayersState, categoryId: string, layerId: number): MapLayer | undefined {
  return state.categories[categoryId]?.layers.find(l => l.id === layerId);
}

export function findCategory(state: LayersState, categoryId: string): LayerCategory | undefined {
  return state.categories[categoryId];
}
