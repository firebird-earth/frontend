import React from 'react';
import TileLayer from '../../base/TileLayer';
import { WUI_LAYER } from '../../../../constants/urls';
import { useAppSelector } from '../../../../hooks/useAppSelector';

interface WUILayerProps {
  active: boolean;
}

const WUILayer: React.FC<WUILayerProps> = ({ active }) => {
  const opacity = useAppSelector(state => {
    const category = state.layers.categories.wildfire;
    if (!category) return 0.7;
    const layer = category.layers.find(l => l.name === 'WUI');
    return layer?.opacity ?? 0.7;
  });

  return (
    <TileLayer
      active={active}
      opacity={opacity}
      url={WUI_LAYER}
      maxZoom={16}
      attribution="USFS WUI 2020"
      className="wui-layer"
    />
  );
};

export default WUILayer;