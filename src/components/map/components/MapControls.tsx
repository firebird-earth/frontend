import React from 'react';
import { ZoomControl, ScaleControl } from 'react-leaflet';
import NorthArrow from '../../controls/NorthArrow';
import NavigateControl from '../../controls/NavigateControl';
import GridControl from '../../controls/GridControl';
import CoordinateControl from '../../controls/CoordinateControl';

const MapControls: React.FC = () => {
  return (
    <>
      <NavigateControl />
      <ZoomControl position="topright" />
      <ScaleControl position="bottomright" imperial={true} metric={true} />
      <GridControl />
      <NorthArrow position="bottomleft" />
      <CoordinateControl position="bottomleft" />
    </>
  );
};

export default MapControls;