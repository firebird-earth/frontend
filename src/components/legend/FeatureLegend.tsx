import React from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { defaultColorScheme } from '../../constants/colors';

interface FeatureLegendProps {
  categoryId: string;
  layerId: number;
  units?: string;
}

const FeatureLegend: React.FC<FeatureLegendProps> = React.memo(({ 
  categoryId, 
  layerId,
  units = 'units'
}) => {
  // Get layer from Redux store
  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) {
      console.log('Category not found:', categoryId);
      return null;
    }
    return category.layers.find(l => l.id === layerId) || null;
  });

  if (!layer) {
    console.log('Layer is null');
    return null;
  }

  if (!layer.legend || !Array.isArray(layer.legend.items)) {
    console.log('Layer has no legend items:', layer.legend);
    return null;
  }

  const items = layer.legend.items;
  if (items.length === 0) {
    console.log('Layer has an empty legend:', layer.legend);
    return null;
  }

  // Determine color scheme from layer.colorScheme.colors or fallback
  const scheme =
    layer.colorScheme &&
    Array.isArray((layer.colorScheme as any).colors) &&
    (layer.colorScheme as any).colors.length > 0
      ? (layer.colorScheme as any).colors
      : defaultColorScheme;
  const fallbackColor = scheme[0] || '#000';

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const color = item.color ?? fallbackColor;
        const weight = item.weight ?? 1;
        const fillColor = item.fillColor ?? fallbackColor;
        const fillOpacity = item.fillOpacity ?? 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              {fillColor === 'none' ? (
                // Line feature
                <div
                  className="w-5 h-0"
                  style={{
                    borderTopWidth: `${weight}px`,
                    borderTopStyle: 'solid',
                    borderTopColor: color
                  }}
                />
              ) : (
                // Area feature
                <div
                  className="w-full h-full rounded"
                  style={{
                    backgroundColor: fillColor,
                    opacity: fillOpacity,
                    border: `${weight}px solid ${color}`
                  }}
                />
              )}
            </div>
            <span className="text-sm text-gray-600">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});

FeatureLegend.displayName = 'FeatureLegend';

export default FeatureLegend;
