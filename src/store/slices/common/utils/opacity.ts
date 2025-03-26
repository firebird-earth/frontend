import { LayersState } from '../types';
import { findLayer, findCategory } from './utils';

export function handleOpacity(state: LayersState, categoryId: string, layerId: number, opacity: number): void {
  const category = findCategory(state, categoryId);
  if (!category) return;

  const layer = findLayer(state, categoryId, layerId);
  if (layer) {
    layer.opacity = Math.max(0, Math.min(1, opacity));
  }
}