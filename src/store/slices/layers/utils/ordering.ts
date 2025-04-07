import { current } from 'immer';
import { LayersState } from '../types';
import { findLayer, findCategory } from './utils';
import { MapLayer, LayerType } from '../../../../types/map';
import { leafletLayerMap } from '../../../slices/layers/state';
import { current } from 'immer'

/**
 * Returns the DOM element of a Leaflet layer.
 * Checks for a public getElement() method and falls back to internal properties.
 */
function getLayerElement(layer: L.Layer): HTMLElement | null {
  try {
    return (
      (typeof layer.getElement === 'function' ? layer.getElement() : null) ||
      ((layer as any)._container || (layer as any)._image) ||
      null
    );
  } catch (error) {
    console.error('Error in getLayerElement:', error);
    return null;
  }
}

/**
 * Updates the inline z-index for a single layer.
 *
 * @param layerId - The layer's ID.
 * @param newOrder - The new order value.
 * @param map - The Leaflet map instance.
 */
function updateSingleLayerZIndex(layerId: number, newOrder: number, map: L.Map): void {
  const leafletLayer = leafletLayerMap.get(layerId);
  if (leafletLayer) {
    const el = getLayerElement(leafletLayer);
    if (el) {
      el.style.zIndex = String(newOrder);
    }
  }
}

/**
 * Updates only the affected layer(s) based on the reordering action.
 * For 'front' and 'back', only the target layer is updated.
 * For 'forward' and 'backward', the target layer and its immediate neighbor are updated.
 *
 * @param action - The reordering action.
 * @param targetLayer - The target layer from state.
 * @param updatedCandidates - The candidate layers array after reordering.
 * @param map - The Leaflet map instance.
 */
function updateAffectedPaneZIndices(
  updatedCandidates: MapLayer[],
  targetLayer: MapLayer,
  action: 'front' | 'back' | 'forward' | 'backward' 
): void {
  const map = window.leafletMap;
  const targetIndex = updatedCandidates.findIndex(l => l.id === targetLayer.id);
  switch (action) {
    case 'front':
    case 'back':
      updateSingleLayerZIndex(targetLayer.id, targetLayer.order!, map);
      break;
    case 'forward': {
      const neighbor =
        targetIndex < updatedCandidates.length - 1
          ? updatedCandidates[targetIndex + 1]
          : undefined;
      updateSingleLayerZIndex(targetLayer.id, targetLayer.order!, map);
      if (neighbor) {
        updateSingleLayerZIndex(neighbor.id, neighbor.order!, map);
      }
      break;
    }
    case 'backward': {
      const neighbor = targetIndex > 0 ? updatedCandidates[targetIndex - 1] : undefined;
      updateSingleLayerZIndex(targetLayer.id, targetLayer.order!, map);
      if (neighbor) {
        updateSingleLayerZIndex(neighbor.id, neighbor.order!, map);
      }
      break;
    }
  }
}

/**
 * Updates the inline z-index of all layers in the given pane based on the provided candidate layers.
 * This "slam" approach updates every candidate layer in a single animation frame.
 *
 * @param candidates - The sorted candidate layers array (with updated order values).
 * @param pane - The pane name (e.g. "overlayPane", "markerPane", etc.).
 * @param map - The Leaflet map instance.
 */
function updateAllPaneZIndices(candidates: MapLayer[], pane: string): void {
  const map = window.leafletMap;
  const paneElem = map.getPane(pane);
  if (!paneElem) return;

  candidates.forEach((layer, index) => {
    const leafletLayer = leafletLayerMap.get(layer.id);
    if (leafletLayer) {
      const el = getLayerElement(leafletLayer);
      if (el) {
        el.style.zIndex = String(index + 1);
      }
    }
  });
}

function updateAllPaneZIndicesBatch(candidates: MapLayer[], pane: string): void {
  const map = window.leafletMap;
  const paneElem = map.getPane(pane);
  if (!paneElem) return;

  // Temporarily disable transitions to avoid flicker.
  const prevTransition = paneElem.style.transition;
  paneElem.style.transition = 'none';

  // Batch update inline z-index values in one animation frame.
  requestAnimationFrame(() => {
    candidates.forEach((layer, index) => {
      const leafletLayer = leafletLayerMap.get(layer.id);
      if (leafletLayer) {
        const el = getLayerElement(leafletLayer);
        if (el) {
          // Set z-index based on new sequential order (starting at 1).
          el.style.zIndex = String(index + 1);
        }
      }
    });
    // Force a reflow if needed.
    void paneElem.offsetHeight;
    // Restore the original transition.
    paneElem.style.transition = prevTransition;
  });
}

/**
 * Reorders the candidate layers array based on the target layer's ID and the action.
 *
 * @param candidates - Array of candidate MapLayer objects (sorted by order).
 * @param targetId - The target layer's ID.
 * @param action - The reordering action ('front' | 'back' | 'forward' | 'backward').
 * @returns The updated candidate array.
 */
function reorderCandidateLayers(
  candidates: MapLayer[],
  targetId: number,
  action: 'front' | 'back' | 'forward' | 'backward'
): MapLayer[] {
  const index = candidates.findIndex(l => l.id === targetId);
  if (index === -1) return candidates;

  switch (action) {
    case 'front':
      if (index < candidates.length - 1) {
        const [target] = candidates.splice(index, 1);
        candidates.push(target);
      }
      break;
    case 'back':
      if (index > 0) {
        const [target] = candidates.splice(index, 1);
        candidates.unshift(target);
      }
      break;
    case 'forward':
      if (index < candidates.length - 1) {
        // Swap with next element.
        [candidates[index], candidates[index + 1]] = [candidates[index + 1], candidates[index]];
      }
      break;
    case 'backward':
      if (index > 0) {
        // Swap with previous element.
        [candidates[index], candidates[index - 1]] = [candidates[index - 1], candidates[index]];
      }
      break;
    default:
      console.warn('Unknown action in reorderCandidateArray:', action);
  }
  return candidates;
}

/**
 * Returns the sorted candidate layers for a given pane.
 *
 * @param state - The LayersState from your application.
 * @param pane - The pane name (e.g. "overlayPane", "markerPane", etc.).
 * @param targetId - The target layer's ID.
 * @param action - The reordering action ('front' | 'back' | 'forward' | 'backward').
 * @returns The sorted candidate layers array
 */
function getSortedCandidateLayers(
  state: LayersState,
  pane: string
): MapLayer[] {
  
  // Gather candidate layers from state for this pane.
  const candidateLayers: MapLayer[] = [];
  
  Object.values(state.categories).forEach(category => {
    category.layers.forEach(layer => {
      if (layer.pane === pane && layer.order !== undefined) {
        candidateLayers.push(layer);
      }
    });
  });

  // Sort candidate layers by their stored order.
  candidateLayers.sort((a, b) => a.order! - b.order!);

  return candidateLayers;
}

export function handleLayerOrdering(
  state: LayersState,
  categoryId: string,
  layerId: number,
  action: 'front' | 'back' | 'forward' | 'backward'
): void {

  const category = findCategory(state, categoryId);
  if (!category) {
    console.warn('Category not found:', categoryId);
    return;
  }

  const targetLayer = findLayer(state, categoryId, layerId);
  if (!targetLayer) {
    console.warn('Layer invalid:', layerId);
    return;
  }

  const leafletLayer = leafletLayerMap.get(layerId);
  if (!leafletLayer) {
    console.warn('Leaflet layer not found for layerId:', layerId);
    return;
  }

  // Use the pane from the Leaflet layer options.
  const pane = leafletLayer.options.pane;
  const map = window.leafletMap;
  if (!map) {
    console.warn('Map instance not found.');
    return;
  }

  console.log('handleLayerOrdering called:', { categoryId, layerId, layer:targetLayer.name, type:targetLayer.type, action });
  
  // Get sorted candidate layers based on state reordering.
  const candidates = getSortedCandidateLayers(state, pane);

  console.log(
    'before reordering layers:',
    candidates.map(l => ({ id: l.id, order: l.order, name: l.name }))
  );

  // Reorder the candidates based on the action.
  const updatedCandidates = reorderCandidateLayers(candidates, layerId, action);

  // Update the DOM.
  const updateMethod = 'all';
  switch (updateMethod) {
    case 'all':
      console.log('call updateAllPaneZIndices');
      updateAllPaneZIndices(updatedCandidates, pane);
      break;
    case 'batch':
      console.log('call updateAllPaneZIndicesBatch');
      updateAllPaneZIndicesBatch(updatedCandidates, pane);
      break;
    case 'min':
      console.log('call updateAffectedPaneZIndices');
      updateAffectedPaneZIndices(updatedCandidates, targetLayer, action);
      break;
    default:
      break;
  }
 
  //if (targetLayer.type != LayerType.GeoTiff) {
    // Update layer.order on each layer
    updatedCandidates.forEach((layer, index) => {
      layer.order = index + 1;
    });

    console.log(
      'After reordering layers:',
      updatedCandidates.map(l => ({ id: l.id, order: l.order, name: l.name }))
    );
  //}
  
  // log  z-index of the target element.
  const element = getLayerElement(leafletLayer);
  if (element) {
    console.log(
      'After reordering, zIndex of target element:',
      window.getComputedStyle(element).zIndex
    );
  }
}
