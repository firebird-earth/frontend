import { LayerType, MapLayer } from '../../../../types/map';
import { PaneZIndex } from '../../../../types/map'

// Debug configuration
const OrderingGetConfig = {
  debug: false
} as const;

export function setOrderingGetDebug(enabled: boolean) {
  (OrderingGetConfig as any).debug = enabled;
}

/**
 * Returns GeoTIFF layers in order
 * @param categories The layer categories from the Redux store
 * @returns An array of GeoTIFF layers with their category IDs
 */
export function getOrderedGeoTiffLayers(categories: any): { layer: MapLayer; categoryId: string }[] {
  if (OrderingGetConfig.debug) {
    console.log('Getting ordered GeoTIFF layers...');
  }

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

  if (OrderingGetConfig.debug) {
    console.log('Found GeoTIFF layers:', layersWithCategories.map(({ layer, categoryId }) => ({
      name: layer.name,
      categoryId,
      order: layer.order
    })));
  }

  // Sort by order property
  const sortedLayers = layersWithCategories.sort((a, b) => (b.layer.order || 0) - (a.layer.order || 0));

  if (OrderingGetConfig.debug) {
    console.log('Sorted GeoTIFF layers:', sortedLayers.map(({ layer }) => ({
      name: layer.name,
      order: layer.order
    })));
  }

  return sortedLayers;
}

/**
 * Returns active layers sorted by pane and order
 * @param categories The layer categories from the Redux store
 * @returns An array of layers sorted by pane z-index (highest to lowest) and order within each pane
 */
export function getOrderedLayersByPane(categories: any): { layer: MapLayer; categoryId: string }[] {
  if (OrderingGetConfig.debug) {
    console.log('\n=== Starting Layer Ordering ===');
  }

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

  if (OrderingGetConfig.debug) {
    console.log('\nActive Layers:', layers.map(({ layer, categoryId }) => ({
      name: layer.name,
      categoryId,
      type: layer.type,
      pane: layer.pane || 'overlayPane',
      order: layer.order
    })));
  }

  if (OrderingGetConfig.debug) {
    console.log('\nPane Z-Index Values:', PaneZIndex);
  }

  // Group layers by pane
  const paneGroups = new Map<string, { layer: MapLayer; categoryId: string }[]>();
  
  layers.forEach(item => {
    const pane = item.layer.pane || 'overlayPane';
    if (!paneGroups.has(pane)) {
      paneGroups.set(pane, []);
    }
    paneGroups.get(pane)!.push(item);
  });

  if (OrderingGetConfig.debug) {
    console.log('\nLayers Grouped by Pane:');
    paneGroups.forEach((paneLayers, pane) => {
      console.log(`\n${pane} (z-index: ${PaneZIndex[pane]}):`);
      paneLayers.forEach(({ layer }) => {
        console.log(`  - ${layer.name} (order: ${layer.order})`);
      });
    });
  }

  // Sort layers within each pane by order
  paneGroups.forEach(paneLayers => {
    paneLayers.sort((a, b) => (b.layer.order || 0) - (a.layer.order || 0));
  });

  // Sort panes by z-index (highest to lowest)
  const sortedPanes = Object.entries(PaneZIndex)
    .sort(([, aZIndex], [, bZIndex]) => bZIndex - aZIndex)
    .map(([pane]) => pane);

  if (OrderingGetConfig.debug) {
    console.log('\nSorted Pane Order:', sortedPanes);
  }

  // Combine all layers in correct z-index order
  const result = sortedPanes.flatMap(pane => paneGroups.get(pane) || []);

  if (OrderingGetConfig.debug) {
    console.log('\nFinal Layer Order:');
    result.forEach(({ layer, categoryId }) => {
      console.log(`  - ${layer.name} (${categoryId}, pane: ${layer.pane || 'overlayPane'}, order: ${layer.order})`);
    });
    console.log('\n=== Layer Ordering Complete ===\n');
  }

  return result;
}