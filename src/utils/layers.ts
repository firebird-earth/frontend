import { MapLayer } from '../types/map';

/**
 * Returns GeoTIFF layers in a consistent order for both the map and legend
 * This ensures that the layers are displayed in the same order in both places
 * 
 * @param categories The layer categories from the Redux store
 * @returns An array of GeoTIFF layers in the correct order
 */
export function getOrderedGeoTiffLayers(categories: any): MapLayer[] {
  // Get all active GeoTIFF layers from firemetrics and fuels categories
  const firemetricsLayers = categories.firemetrics?.layers.filter(
    (l: MapLayer) => l.active && l.type === 'geotiff'
  ) || [];
  
  const fuelsLayers = categories.fuels?.layers.filter(
    (l: MapLayer) => l.active && l.type === 'geotiff'
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