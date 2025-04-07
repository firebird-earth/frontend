import { LayerType } from '../../../../types/map';
import { MapLayer } from '../../../../types/map';

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

/**
 * Returns active layers sorted by pane and order
 * @param categories The layer categories from the Redux store
 * @returns An array of layers sorted by pane z-index (highest to lowest) and order within each pane
 */
export function getOrderedLayersByPane(categories: any): { layer: MapLayer; categoryId: string }[] {
  console.log('\n=== Starting Layer Ordering ===');

  // Get all active layers except basemaps
  const layers = Object.entries(categories)
    .flatMap(([categoryId, category]) => {
      if (categoryId === 'basemaps') return [];
      
      const activeLayers = category.layers.filter(l => l.active);
      return activeLayers.map(layer => ({
        layer,
        categoryId
      }));
    });

  console.log('\nActive Layers:', layers.map(({ layer, categoryId }) => ({
    name: layer.name,
    categoryId,
    type: layer.type,
    pane: layer.pane || 'overlayPane',
    order: layer.order
  })));

  // Define pane z-index values
  const paneZIndex = {
    'overlayPane': 400,    // Default Leaflet overlay pane
    'firemetricsPane': 375, // Custom pane for fire metrics
    'layersPane': 350,      // Custom pane for other layers
    'tilePane': 200
  };

  console.log('\nPane Z-Index Values:', paneZIndex);

  // Group layers by pane
  const paneGroups = new Map<string, { layer: MapLayer; categoryId: string }[]>();
  
  layers.forEach(item => {
    const pane = item.layer.pane || 'overlayPane';
    if (!paneGroups.has(pane)) {
      paneGroups.set(pane, []);
    }
    paneGroups.get(pane)!.push(item);
  });

  console.log('\nLayers Grouped by Pane:');
  paneGroups.forEach((paneLayers, pane) => {
    console.log(`\n${pane} (z-index: ${paneZIndex[pane]}):`);
    paneLayers.forEach(({ layer }) => {
      console.log(`  - ${layer.name} (order: ${layer.order})`);
    });
  });

  // Sort layers within each pane by order
  paneGroups.forEach(paneLayers => {
    paneLayers.sort((a, b) => (b.layer.order || 0) - (a.layer.order || 0));
  });

  // Sort panes by z-index (highest to lowest)
  const sortedPanes = Object.entries(paneZIndex)
    .sort(([, aZIndex], [, bZIndex]) => bZIndex - aZIndex)
    .map(([pane]) => pane);

  console.log('\nSorted Pane Order:', sortedPanes);

  // Combine all layers in correct z-index order
  const result = sortedPanes.flatMap(pane => paneGroups.get(pane) || []);

  console.log('\nFinal Layer Order:');
  result.forEach(({ layer, categoryId }) => {
    console.log(`  - ${layer.name} (${categoryId}, pane: ${layer.pane || 'overlayPane'}, order: ${layer.order})`);
  });

  console.log('\n=== Layer Ordering Complete ===\n');

  return result;
}
