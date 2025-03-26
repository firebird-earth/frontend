import { RootState } from '../../..';
import { LayerCategory, MapLayer } from '../../../types/map';

// Basic selectors
export const selectLayersState = (state: RootState) => state.layers;
export const selectCategories = (state: RootState) => state.layers.categories;
export const selectSlopeRenderingRule = (state: RootState) => state.layers.slopeRenderingRule;

// Category selectors
export const selectCategory = (state: RootState, categoryId: string): LayerCategory | undefined => 
  state.layers.categories[categoryId];

export const selectCategoryLayers = (state: RootState, categoryId: string): MapLayer[] => 
  state.layers.categories[categoryId]?.layers || [];

// Layer selectors
export const selectLayer = (state: RootState, categoryId: string, layerId: number): MapLayer | undefined => 
  state.layers.categories[categoryId]?.layers.find(l => l.id === layerId);

export const selectLayerOpacity = (state: RootState, categoryId: string, layerId: number): number => 
  selectLayer(state, categoryId, layerId)?.opacity ?? 1;

export const selectLayerActive = (state: RootState, categoryId: string, layerId: number): boolean => 
  selectLayer(state, categoryId, layerId)?.active ?? false;

// Active layers selectors
export const selectActiveLayers = (state: RootState): { categoryId: string; layer: MapLayer }[] => 
  Object.entries(state.layers.categories)
    .flatMap(([categoryId, category]) => 
      category.layers
        .filter(layer => layer.active)
        .map(layer => ({ categoryId, layer }))
    );

export const selectActiveLayersInCategory = (state: RootState, categoryId: string): MapLayer[] => 
  state.layers.categories[categoryId]?.layers.filter(l => l.active) || [];