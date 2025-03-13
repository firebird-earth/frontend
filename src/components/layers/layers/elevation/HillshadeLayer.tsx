import React, { useEffect } from 'react';
import DynamicLayer from '../../base/DynamicLayer';
import { ELEVATION_SERVICE } from '../../../../services/maps/services';
import { useAppSelector } from '../../../../hooks/useAppSelector';

interface HillshadeLayerProps {
  active: boolean;
  opacity?: number;
}

const HillshadeLayer: React.FC<HillshadeLayerProps> = (props) => {
  const { active } = props;
  
  useEffect(() => {
    console.log('Hillshade layer state changed:', {
      active,
      opacity: props.opacity,
      timestamp: new Date().toISOString()
    });
  }, [active, props.opacity]);

  return (
    <DynamicLayer
      {...props}
      serviceConfig={ELEVATION_SERVICE}
      renderingRule="Hillshade Gray"
      className="elevation-layer"
    />
  );
};

export default HillshadeLayer;