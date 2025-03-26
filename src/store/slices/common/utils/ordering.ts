import { LayersState } from '../types';
import { findLayer, findCategory } from './utils';
import { MapLayer, LayerType } from '../../../../types/map';

export function handleLayerOrdering(state: LayersState, categoryId: string, layerId: number, action: 'front' | 'back' | 'forward' | 'backward'): void {
  const category = findCategory(state, categoryId);
  if (!category) return;

  const layer = findLayer(state, categoryId, layerId);
  if (!layer || layer.type !== LayerType.GeoTiff || layer.order === undefined) return;

  const allGeoTiffLayers = Object.values(state.categories)
    .flatMap(cat => cat.layers)
    .filter(l => l.type === LayerType.GeoTiff && l.order !== undefined)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  switch (action) {
    case 'front':
      const highestOrder = Math.max(...allGeoTiffLayers.map(l => l.order!));
      layer.order = highestOrder + 10;
      break;

    case 'back':
      const lowestOrder = Math.min(...allGeoTiffLayers.map(l => l.order!));
      layer.order = lowestOrder - 10;
      break;

    case 'forward': {
      const currentIndex = allGeoTiffLayers.findIndex(l => l.id === layer.id);
      if (currentIndex < allGeoTiffLayers.length - 1) {
        const nextLayer = allGeoTiffLayers[currentIndex + 1];
        const tempOrder = layer.order;
        layer.order = nextLayer.order;
        nextLayer.order = tempOrder;
      }
      break;
    }

    case 'backward': {
      const currentIndex = allGeoTiffLayers.findIndex(l => l.id === layer.id);
      if (currentIndex > 0) {
        const prevLayer = allGeoTiffLayers[currentIndex - 1];
        const tempOrder = layer.order;
        layer.order = prevLayer.order;
        prevLayer.order = tempOrder;
      }
      break;
    }
  }
}

/**
 * Returns GeoTIFF layers in a consistent order for both the map and legend
 * This ensures that the layers are displayed in the same order in both places
 * 
 * @param categories The layer categories from the Redux store
 * @returns An array of GeoTIFF layers in the correct order
 */
export function getOrderedGeoTiffLayers(categories: any): MapLayer[] {
  // Get all ACTIVE GeoTIFF layers from firemetrics and fuels categories
  const firemetricsLayers = categories.firemetrics?.layers.filter(
    (l: MapLayer) => l.active && l.type === LayerType.GeoTiff
  ) || [];
  
  const fuelsLayers = categories.fuels?.layers.filter(
    (l: MapLayer) => l.active && l.type === LayerType.GeoTiff
  ) || [];

  // Combine the layers in a specific order
  const allLayers = [...firemetricsLayers, ...fuelsLayers];
  
  // Sort by order property if available
  return sortLayersByOrder(allLayers);
}

/**
 * Sorts layers by their order property if available
 * 
 * @param layers Array of layers to sort
 * @returns Sorted array of layers
 */
export function sortLayersByOrder(layers: MapLayer[]): MapLayer[] {
  return [...layers].sort((a, b) => {
    // If both layers have an order property, sort by that
    if (a.order !== undefined && b.order !== undefined) {
      return b.order - a.order; // Higher order values appear on top (first in the array)
    }
    
    // If only one layer has an order property, prioritize it
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    // Otherwise, maintain the original order
    return 0;
  });
}