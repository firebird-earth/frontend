import { LayersState } from '../types';
import { findLayer, findCategory } from './utils';
import { MapLayer, LayerType } from '../../../types/map';
import { leafletLayerMap } from '../../../slices/layers/state';

/**
 * Returns the DOM element of a Leaflet layer.
 * Checks for a public getElement() method and falls back to internal properties.
 * @param layer - A Leaflet layer.
 * @returns The layer's DOM element, or null if not found.
 */
function getLayerElement(layer: L.Layer): HTMLElement | null {
  return (
    (typeof layer.getElement === 'function' ? layer.getElement() : null) ||
    ((layer as any)._container || (layer as any)._image) ||
    null
  );
}

export function handleLayerOrdering(state: LayersState, categoryId: string, layerId: number, action: 'front' | 'back' | 'forward' | 'backward'): void {
  console.log('handleLayerOrdering called:', { categoryId, layerId, action });

  const category = findCategory(state, categoryId);
  if (!category) {
    console.warn('Category not found:', categoryId);
    return;
  }

  const layer = findLayer(state, categoryId, layerId);
  if (!layer) {
    console.warn('Layer invalid:', layerId);
    return;
  }

  const leafletLayer = leafletLayerMap.get(layerId);
  const pane = leafletLayer.options.pane 

  const map = window.leafletMap
  
  // Get the pane's DOM element using the pane name.
  const paneElem = map.getPane(pane);
  if (!paneElem) {
    console.warn(`Pane "${pane}" not found on the map.`);
    return;
  }

  // Get the layer's DOM element.
  const element = getLayerElement(leafletLayer);
  if (!element) {
    console.warn('Layer element not found.');
    return;
  }

  const zindex = window.getComputedStyle(element).zIndex
  const zindexElem = element.style.zIndex
  
  console.log('Ordering layer:', {
    categoryId,
    name: layer.name,
    type: layer.type,
    layerPane: layer.pane,
    leafletPane: pane,
    layerOrder: layer.order,
    zindex: zindex,
    zindexElem: zindexElem,
    leafletLayer: leafletLayer,
    leafletMap: map
  });

  return;
  
  switch (action) {
    case 'front':
      //if (typeof leafletLayer.bringToFront === 'function') {
      //  console.log('execute .bringToFront');
      //  leafletLayer.bringToFront();
      //} else {
        // Append element so it becomes the last child in the pane.
        console.log('execute front using appendChild');
        paneElem.appendChild(element);
      //}
      break;

    case 'back':
      //if (typeof leafletLayer.bringToBack === 'function') {
      // console.log('execute .bringToBack');
      //  leafletLayer.bringToBack();
     // } else {
        // Insert element as the first child in the pane.
        console.log('execute back using insertBefore');
        paneElem.insertBefore(element, paneElem.firstElementChild);
      //}
      break;

    case 'forward': {
      // Move one step forward: insert element after its next sibling.
      const nextSibling = element.nextElementSibling;
      if (nextSibling) {
        paneElem.insertBefore(element, nextSibling.nextElementSibling);
      } else {
        console.log('Layer is already at the front.');
      }
      break;
    }

    case 'backward': {
      // Move one step backward: insert element before its previous sibling.
      const previousSibling = element.previousElementSibling;
      if (previousSibling) {
        paneElem.insertBefore(element, previousSibling);
      } else {
        console.log('Layer is already at the back.');
      }
      break;
    }

    default:
      console.warn('Unknown action:', action);
  }
}
