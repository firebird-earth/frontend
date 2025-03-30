import React, { useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { ZoomControl, ScaleControl } from 'react-leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import NorthArrow from '../controls/NorthArrow';
import NavigateControl from '../controls/NavigateControl';
import GridControl from '../controls/GridControl';
import CoordinateControl from '../controls/CoordinateControl';
import ValueTooltipControl from '../controls/ValueTooltipControl';
import LoadingControl from '../controls/LoadingControl';

const MapControls: React.FC = () => {
  const map = useMap();
  const { categories } = useAppSelector(state => state.layers);
  const isCancellingTooltip = useAppSelector(state => state.ui.isCancellingTooltip);

  // Find any layer with showValues enabled
  const layerWithValues = useMemo(() => {
    for (const [categoryId, category] of Object.entries(categories)) {
      const layer = category.layers.find(layer => layer.showValues && layer.active);
      if (layer) {
        return { categoryId, layer };
      }
    }
    return null;
  }, [categories]);

  // Check if any elevation layer is loading
  const isElevationLoading = useMemo(() => {
    const elevationCategory = categories.elevation;
    if (!elevationCategory) return false;
    return elevationCategory.layers.some(layer => layer.active && layer.loading);
  }, [categories]);

  return (
    <>
      <NavigateControl />
      <ZoomControl position="topright" />
      <ScaleControl position="bottomright" imperial={true} metric={true} />
      <GridControl />
      <NorthArrow position="bottomleft" />
      <CoordinateControl position="bottomleft" />
      <LoadingControl 
        show={isElevationLoading} 
        position="topleft"
        message="Loading elevation..."
      />

      {layerWithValues && (
        <ValueTooltipControl
          key={`${layerWithValues.categoryId}-${layerWithValues.layer.id}`}
          categoryId={layerWithValues.categoryId}
          layerId={layerWithValues.layer.id}
          layer={layerWithValues.layer}
        />
      )}
    </>
  );
};

export default MapControls;
