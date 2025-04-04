import { LayerType } from '../../../../types/map';
import { LayerCategory, LayersState } from '../types';
import { MapLayer } from '../../../../types/map';

export function createInitialCategory(
  id: string,
  name: string,
  layers: Partial<MapLayer>[]
): LayerCategory {
  return {
    id,
    name,
    layers: layers.map((layer, index) => {
      // Determine which pane this layer belongs to
      const pane = id === 'landscapeRisk' || id === 'fuels' ? 'firemetricsPane' : 'layersPane';
      
      return {
        id: index + 1,
        active: false,
        pane: pane,
        ...layer
      };
    })
  };
}

export function findLayer(state: LayersState, categoryId: string, layerId: number): MapLayer | undefined {
  return state.categories[categoryId]?.layers.find(l => l.id === layerId);
}

/**
 * Checks if a layer is an Esri layer
 * 
 * @param categoryId The category ID
 * @param layerId The layer ID
 * @param categories The layer categories from the Redux store
 * @returns True if the layer is an Esri layer, false otherwise
 */
export function isEsriLayer(categoryId: string, layerId: number, categories: any): boolean {
  const category = categories[categoryId];
  if (!category) return false;
  
  const layer = category.layers.find((l: MapLayer) => l.id === layerId);
  if (!layer) return false;
  
  // Check if it's a vector layer in the wildfire category
  // This includes Crisis Areas layer and potentially other Esri layers
  return categoryId === 'wildfire' && layer.type === 'vector';
}

export function findCategory(state: LayersState, categoryId: string): LayerCategory | undefined {
  return state.categories[categoryId];
}