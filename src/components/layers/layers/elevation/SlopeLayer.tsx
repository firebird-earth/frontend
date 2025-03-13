import React, { useEffect } from 'react';
import DynamicLayer from '../../base/DynamicLayer';
import { ELEVATION_SERVICE } from '../../../../services/maps/services';
import { useAppSelector } from '../../../../hooks/useAppSelector';

interface SlopeLayerProps {
  active: boolean;
  opacity?: number;
}

const SlopeLayer: React.FC<SlopeLayerProps> = (props) => {
  const { active } = props;
  
  useEffect(() => {
    console.log('Slope layer state changed:', {
      active,
      opacity: props.opacity,
      timestamp: new Date().toISOString()
    });
  }, [active, props.opacity]);

  return (
    <DynamicLayer
      {...props}
      serviceConfig={ELEVATION_SERVICE}
      renderingRule="Slope Map"
      className="elevation-layer"
    />
  );
};

export default SlopeLayer;