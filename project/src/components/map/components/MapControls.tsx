import React from 'react';
import { ZoomControl, ScaleControl } from 'react-leaflet';
import NorthArrow from '../../controls/NorthArrow';
import NavigateControl from '../../controls/NavigateControl';

const MapControls: React.FC = () => {
  return (
    <>
      <NorthArrow position="bottomleft" />
      <NavigateControl />
      <ZoomControl position="topright" />
      <ScaleControl position="bottomright" imperial={true} metric={true} />
    </>
  );
};

export default MapControls;