import { LayersState } from '../types';
import { findLayer, findCategory } from './utils';
import { MapLayer, LayerType } from '../../../../types/map';
import { store } from '../../../../store';

/**
 * Returns layers in a consistent order for both the map and legend
 * @param categories The layer categories from the Redux store
 * @returns An array of layers with their category IDs
 */
export function getOrderedLayers(categories: any): { layer: MapLayer; categoryId: string }[] {
  // Get all active layers EXCEPT basemaps
  const layers = Object.entries(categories)
    .flatMap(([categoryId, category]) => {
      // Skip basemaps category
      if (categoryId === 'basemaps') return [];
      
      const activeLayers = category.layers.filter(l => l.active);
      return activeLayers.map(layer => ({
        layer,
        categoryId
      }));
    });

  // Sort layers:
  // 1. GeoTiffs first (sorted by their order)
  // 2. ArcGIS Image Services second (sorted by their order)
  // 3. Other layers last
  return layers.sort((a, b) => {
    if (a.layer.type === LayerType.GeoTiff && b.layer.type !== LayerType.GeoTiff) {
      return -1; // GeoTiffs go first
    }
    if (a.layer.type !== LayerType.GeoTiff && b.layer.type === LayerType.GeoTiff) {
      return 1;
    }
    if (a.layer.type === LayerType.ArcGISImageService && b.layer.type !== LayerType.ArcGISImageService) {
      return -1; // ArcGIS Image Services go after GeoTiffs
    }
    if (a.layer.type !== LayerType.ArcGISImageService && b.layer.type === LayerType.ArcGISImageService) {
      return 1;
    }
    // Sort by order within same type
    return (b.layer.order || 0) - (a.layer.order || 0);
  });
}

/**
 * Returns GeoTIFF layers in order
 * @param categories The layer categories from the Redux store
 * @returns An array of GeoTIFF layers with their category IDs
 */
export function getOrderedGeoTiffLayers(categories: any): { layer: MapLayer; categoryId: string }[] {
  // Get all ACTIVE GeoTIFF layers from all categories
  const layersWithCategories = Object.entries(categories)
    .flatMap(([categoryId, category]) => {
      const activeLayers = category.layers.filter(
        (l: MapLayer) => l.active && l.type === LayerType.GeoTiff
      );
      return activeLayers.map(layer => ({
        layer,
        categoryId
      }));
    });

  // Sort by order property
  return layersWithCategories.sort((a, b) => (b.layer.order || 0) - (a.layer.order || 0));
}