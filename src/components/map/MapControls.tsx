import React from 'react';
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

  // Find any layer with showValues enabled
  const layerWithValues = React.useMemo(() => {
    return Object.entries(categories).flatMap(([categoryId, category]) => 
      category.layers
        .filter(layer => layer.showValues)
        .map(layer => ({ categoryId, layer }))
    )[0];
  }, [categories]);

  // Check if any elevation layer is loading
  const isElevationLoading = React.useMemo(() => {
    const elevationCategory = categories.elevation;
    if (!elevationCategory) return false;
    
    return elevationCategory.layers.some(layer => 
      layer.active && layer.loading
    );
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
        message="Loading elevation data..."
      />

      {/* Value Tooltip Control */}
      {layerWithValues && (
        <ValueTooltipControl
          categoryId={layerWithValues.categoryId}
          layerId={layerWithValues.layer.id}
          layer={layerWithValues.layer}
        />
      )}
    </>
  );
};

export default MapControls;