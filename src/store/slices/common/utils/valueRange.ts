import { LayersState } from '../types';
import { findLayer, findCategory } from './utils';

export function handleValueRange(
  state: LayersState,
  categoryId: string,
  layerId: number,
  min: number,
  max: number,
  isInitialization: boolean = false
): void {
  const category = findCategory(state, categoryId);
  if (!category) return;

  const layer = findLayer(state, categoryId, layerId);
  if (!layer) return;

  if (isInitialization) {
    layer.valueRange = {
      min,
      max,
      defaultMin: min,
      defaultMax: max
    };
  } else if (layer.valueRange) {
    layer.valueRange.min = min;
    layer.valueRange.max = max;
  }
}