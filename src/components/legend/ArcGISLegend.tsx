import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getColorScheme, getGradientForScheme } from '../../utils/colors';

interface ArcGISLegendProps {
  url: string;
  categoryId: string;
  layerId: number;
  units?: string;
}

const ArcGISLegend: React.FC<ArcGISLegendProps> = React.memo(({ 
  url, 
  categoryId, 
  layerId,
  units = 'units'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get layer from Redux store
  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    return category.layers.find(l => l.id === layerId);
  });

  // Effect to handle loading state
  useEffect(() => {
    if (!layer) {
      setLoading(true);
      return;
    }

    // If we have metadata and colorScheme, we're ready to render
    if (layer.metadata?.stats && layer.colorScheme) {
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
    }
  }, [layer]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!layer?.metadata?.stats || !layer?.colorScheme) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Failed to load layer metadata
            </h3>
            <p className="text-sm text-red-600">
              Layer metadata not available
            </p>
          </div>
        </div>
      </div>
    );
  }

  const valueRange = layer.valueRange;
  const colorScheme = getColorScheme(layer.colorScheme.name);
  const { min, max } = layer.metadata.stats;

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
          {units}
        </div>
      </div>
    </div>
  );
});

ArcGISLegend.displayName = 'ArcGISLegend';

export default ArcGISLegend;