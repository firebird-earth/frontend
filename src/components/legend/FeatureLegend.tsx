import React from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';

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
    const foundLayer = category.layers.find(l => l.id === layerId);
    console.log('Found layer:', {
      categoryId,
      layerId,
      layer: foundLayer,
      legend: foundLayer?.legend,
      items: foundLayer?.legend?.items
    });
    return foundLayer;
  });

  if (!layer) {
    console.log('Layer is null');
    return null;
  }

  if (!layer.legend) {
    console.log('Layer has no legend property:', layer);
    return null;
  }

  if (!layer.legend.items || layer.legend.items.length === 0) {
    console.log('Layer has no legend items:', layer.legend);
    return null;
  }

  //console.log('Rendering legend items:', layer.legend.items);

  return (
    <div className="space-y-2">
      {layer.legend.items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            {item.fillColor === 'none' ? (
              // Line feature
              <div 
                className="w-5 h-0"
                style={{ 
                  borderTopWidth: `${item.weight}px`,
                  borderTopStyle: 'solid',
                  borderTopColor: item.color
                }}
              />
            ) : (
              // Area feature
              <div 
                className="w-full h-full rounded"
                style={{ 
                  backgroundColor: item.fillColor,
                  opacity: item.fillOpacity || 0.2,
                  border: `${item.weight}px solid ${item.color}`
                }}
              />
            )}
          </div>
          <span className="text-sm text-gray-600">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
});

FeatureLegend.displayName = 'FeatureLegend';

export default FeatureLegend;