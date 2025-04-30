import React from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getColorScheme, getGradientForScheme } from '../../utils/colors';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[GeoTiffLegend]', ...args);
  }
}

interface GeoTiffLegendProps {
  categoryId: string;
  layerId: number;
}

const GeoTiffLegend: React.FC<GeoTiffLegendProps> = React.memo(({categoryId, layerId}) => {

  log('lookup layer', {categoryId: categoryId, layerId: layerId})
  
  // Get layer from Redux store
  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.id === layerId);
  });

  log('---------layer:', {layer: layer})
  
  // Loading state
  if (!layer?.metadata?.stats || !layer.colorScheme) {
    log('layer not found, display placeholder legend')
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <div 
            className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" 
          />
        </div>
      </div>
    );
  }

  const valueRange = layer.valueRange;
  const { min, max } = layer.metadata.stats;
  const colorScheme = getColorScheme(layer.colorScheme);
  
  if (!colorScheme) {
    console.warn('No color scheme found for layer:', layer.name);
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div 
          className="h-4 w-full rounded" 
          style={{ background: getGradientForScheme(colorScheme) }}
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{valueRange ? valueRange.min.toFixed(3) : min.toFixed(3)}</span>
          <span>{valueRange ? valueRange.max.toFixed(3) : max.toFixed(3)}</span>
        </div>
        <div className="text-xs text-gray-600 text-center">
          {layer.units || 'units'}
        </div>
      </div>
    </div>
  );
});

GeoTiffLegend.displayName = 'GeoTiffLegend';

export default GeoTiffLegend;