import React, { useEffect } from 'react';
import DynamicLayer from '../../base/DynamicLayer';
import { ELEVATION_SERVICE } from '../../../../services/maps/services';
import { useAppSelector } from '../../../../hooks/useAppSelector';

interface ContourLayerProps {
  active: boolean;
  opacity?: number;
}

const ContourLayer: React.FC<ContourLayerProps> = (props) => {
  const { active } = props;
  
  useEffect(() => {
    console.log('Contour layer state changed:', {
      active,
      opacity: props.opacity,
      timestamp: new Date().toISOString()
    });
  }, [active, props.opacity]);

  return (
    <DynamicLayer
      {...props}
      serviceConfig={ELEVATION_SERVICE}
      renderingRule="Contour"
      className="elevation-layer"
    />
  );
};

export default ContourLayer;