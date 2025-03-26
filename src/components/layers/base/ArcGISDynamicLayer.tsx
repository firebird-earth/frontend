import React from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { LayerType } from '../../../types/map';
import { ELEVATION_SERVICE } from '../../../services/maps/services';
import { getGradientForScheme, getColorScheme } from '../../../utils/colors';
import ArcGISTiffLayer from './ArcGISTiffLayer';
import ValueTooltipControl from '../../controls/ValueTooltipControl';

interface LayerConfig {
  name: string;
  description: string;
  source: string;
  type: LayerType;
  renderingRule: string;
  units: string;
  colorScheme?: string;
}

interface ArcGISDynamicLayerProps {
  active: boolean;
  categoryId: string;
  layerName: string;
  renderingRule: string;
}

// Factory function to create layer instance with legend
export function createDynamicLayer(categoryId: string, config: LayerConfig) {
  const DynamicLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    return (
      <ArcGISDynamicLayer
        active={active}
        categoryId={categoryId}
        layerName={config.name}
        renderingRule={config.renderingRule}
      />
    );
  };

  // Create legend component if colorScheme is provided
  if (config.colorScheme) {
    const LegendComponent: React.FC = () => {
      const colorScheme = getColorScheme(config.colorScheme!);
      if (!colorScheme) return null;

      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <div 
              className="h-4 w-full rounded" 
              style={{ background: getGradientForScheme(colorScheme) }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{colorScheme.domain?.[0] || 0}</span>
              <span>{colorScheme.domain?.[1] || 100}</span>
            </div>
            <div className="text-xs text-gray-600 text-center">
              {config.units}
            </div>
          </div>
        </div>
      );
    };

    DynamicLayerInstance.Legend = LegendComponent;
  }

  DynamicLayerInstance.displayName = `${config.name}Layer`;
  return DynamicLayerInstance;
}

// Base component
const ArcGISDynamicLayer: React.FC<ArcGISDynamicLayerProps> = ({
  active,
  categoryId,
  layerName,
  renderingRule
}) => {
  const opacity = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return 1.0;
    const layer = category.layers.find(l => l.name === layerName);
    return layer?.opacity ?? 1.0;
  });

  const showValues = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return false;
    const layer = category.layers.find(l => l.name === layerName);
    return layer?.showValues ?? false;
  });

  const layerId = layerName === 'Slope Steepness' ? 1 : 
                 layerName === 'Aspect' ? 2 : 
                 layerName === 'Hillshade' ? 3 : 4;

  // Get color scheme based on layer type
  const colorScheme = layerName === 'Slope Steepness' ? 'slopeGradient' :
                     layerName === 'Aspect' ? 'redBlue' :
                     'greenYellowRed';

  // Get metadata for the layer
  const metadata = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    const layer = category.layers.find(l => l.name === layerName);
    return layer?.metadata;
  });

  return (
    <>
      <ArcGISTiffLayer
        active={active}
        opacity={opacity}
        serviceConfig={ELEVATION_SERVICE}
        renderingRule={renderingRule}
        colorScheme={colorScheme}
        categoryId={categoryId}
        layerId={layerId}
      />

      {showValues && active && (
        <ValueTooltipControl
          categoryId={categoryId}
          layerId={layerId}
          layer={{
            name: layerName,
            type: LayerType.ArcGISImageService,
            metadata: metadata || {}
          }}
        />
      )}
    </>
  );
};

export default ArcGISDynamicLayer;