import React, { useEffect } from 'react';
import DynamicLayer from '../../base/DynamicLayer';
import { ELEVATION_SERVICE } from '../../../../services/maps/services';
import { useAppSelector } from '../../../../hooks/useAppSelector';

interface AspectLayerProps {
  active: boolean;
  opacity?: number;
}

const AspectLayer: React.FC<AspectLayerProps> = (props) => {
  const { active } = props;
  
  useEffect(() => {
    console.log('Aspect layer state changed:', {
      active,
      opacity: props.opacity,
      timestamp: new Date().toISOString()
    });
  }, [active, props.opacity]);

  return (
    <DynamicLayer
      {...props}
      serviceConfig={ELEVATION_SERVICE}
      renderingRule="Aspect Degrees"
      className="elevation-layer"
    />
  );
};

export default AspectLayer;