import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { TileLayer } from 'react-leaflet';
import WUILayer from './layers/layers/wildfire/WUILayer';
import { 
  StatesLayer,
  CountiesLayer,
  FederalLandsLayer,
  USFSLayer,
  USFWSLayer,
  CrisisAreasLayer
} from './layers/base/ArcGISFeatureLayer';
import {
  HillshadeLayer,
  AspectLayer,
  SlopeLayer,
  ContourLayer
} from './layers/base/ArcGISDynamicLayer';
import AOIBoundaryLayer from './layers/home/AOIBoundaryLayer';
import GeoTiffLayer from './layers/firemetrics/GeoTiffLayer';
import { getOrderedGeoTiffLayers } from '../store/slices/common/utils/ordering';

const MapLayers: React.FC = () => {
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const coordinates = useAppSelector(state => state.home.aoi.coordinates);
  
  const activeBasemap = categories.basemaps?.layers.find(l => l.active);
  const wuiLayer = categories.wildfire?.layers.find(l => l.name === 'WUI');
  const crisisAreasLayer = categories.wildfire?.layers.find(l => l.name === 'Wildfire Crisis Areas');
  const statesLayer = categories.jurisdictions?.layers.find(l => l.name === 'States');
  const countiesLayer = categories.jurisdictions?.layers.find(l => l.name === 'Counties');
  const federalLandsLayer = categories.jurisdictions?.layers.find(l => l.name === 'US Federal Lands');
  const usfsLayer = categories.jurisdictions?.layers.find(l => l.name === 'US Forest Service');
  const usfwsLayer = categories.jurisdictions?.layers.find(l => l.name === 'US Fish and Wildlife');
  
  // Get elevation layers
  const hillshadeLayer = categories.elevation?.layers.find(l => l.name === 'Hillshade');
  const aspectLayer = categories.elevation?.layers.find(l => l.name === 'Aspect');
  const slopeLayer = categories.elevation?.layers.find(l => l.name === 'Slope Steepness');
  const contourLayer = categories.elevation?.layers.find(l => l.name === 'Contour');
  
  const activeGeoTiffLayers = getOrderedGeoTiffLayers(categories);

  if (!activeBasemap) return null;

  let displayCoords: [number, number] | null = null;
  let boundary: GeoJSON.FeatureCollection | null = null;

  if (currentAOI) {
    if ('location' in currentAOI) {
      displayCoords = [currentAOI.location.center[1], currentAOI.location.center[0]];
      boundary = currentAOI.boundary || null;
    } else if ('coordinates' in currentAOI) {
      displayCoords = [currentAOI.coordinates[1], currentAOI.coordinates[0]];
      boundary = currentAOI.boundary || null;
    }
  } else if (coordinates) {
    displayCoords = [coordinates[1], coordinates[0]];
  }

  return (
    <>
      <TileLayer
        url={activeBasemap.source}
        maxZoom={22}
        minZoom={4}
      />
      
      <WUILayer active={wuiLayer?.active || false} />
      <CrisisAreasLayer active={crisisAreasLayer?.active || false} />
      <StatesLayer active={statesLayer?.active || false} />
      <CountiesLayer active={countiesLayer?.active || false} />
      <FederalLandsLayer active={federalLandsLayer?.active || false} />
      <USFSLayer active={usfsLayer?.active || false} />
      <USFWSLayer active={usfwsLayer?.active || false} />
      
      {/* Elevation Layers */}
      <HillshadeLayer active={hillshadeLayer?.active || false} />
      <AspectLayer active={aspectLayer?.active || false} />
      <SlopeLayer active={slopeLayer?.active || false} />
      <ContourLayer active={contourLayer?.active || false} />
      
      {displayCoords && (
        <AOIBoundaryLayer
          locationId={currentAOI ? (typeof currentAOI.id === 'string' ? parseInt(currentAOI.id) : currentAOI.id) : 0}
          active={true}
          geojson={boundary}
          center={displayCoords}
        />
      )}

      {activeGeoTiffLayers.map(layer => (
        <GeoTiffLayer
          key={`${layer.id}-${layer.name}-${layer.active}-${layer.order}`}
          url={layer.source}
          active={layer.active}
          zIndex={layer.order || 0}
          categoryId={layer.name.includes('Canopy') ? 'fuels' : 'firemetrics'}
          layerId={layer.id}
        />
      ))}
    </>
  );
};

export default MapLayers;