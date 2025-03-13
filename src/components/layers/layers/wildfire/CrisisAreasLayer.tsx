import React from 'react';
import FeatureLayer from '../../base/FeatureLayer';
import { CRISIS_AREAS_LAYER } from '../../../../constants/urls';
import { useAppSelector } from '../../../../hooks/useAppSelector';

interface CrisisAreasLayerProps {
  active: boolean;
}

const CrisisAreasLayer: React.FC<CrisisAreasLayerProps> = ({ active }) => {
  const opacity = useAppSelector(state => {
    const category = state.layers.categories.wildfire;
    if (!category) return 1.0;
    const layer = category.layers.find(l => l.name === 'Wildfire Crisis Areas');
    return layer?.opacity ?? 1.0;
  });

  return (
    <FeatureLayer
      active={active}
      opacity={opacity}
      url={CRISIS_AREAS_LAYER}
      simplifyFactor={0.35}
      precision={5}
      style={() => ({
        color: '#ef4444',
        weight: 1,
        fillColor: '#ef4444',
        fillOpacity: 0.25 * opacity,
        opacity: opacity
      })}
    />
  );
};

export default CrisisAreasLayer;