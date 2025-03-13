import React from 'react';
import { TileLayer } from 'react-leaflet';
import { useAppSelector } from '../../hooks/useAppSelector';
import WUILayer from '../layers/layers/wildfire/WUILayer';
import CrisisAreasLayer from '../layers/layers/wildfire/CrisisAreasLayer';
import AOIBoundaryLayer from '../layers/home/AOIBoundaryLayer';
import GeoTiffLayer from '../layers/firemetrics/GeoTiffLayer';
import HillshadeLayer from '../layers/layers/elevation/HillshadeLayer';
import AspectLayer from '../layers/layers/elevation/AspectLayer';
import SlopeLayer from '../layers/layers/elevation/SlopeLayer';
import ContourLayer from '../layers/layers/elevation/ContourLayer';
import { getOrderedGeoTiffLayers } from '../../utils/layers';

const MapLayers: React.FC = () => {
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const coordinates = useAppSelector(state => state.home.aoi.coordinates);
  const layers = useAppSelector(state => state.layers);
  
  const activeBasemap = layers.categories.basemaps?.layers.find(l => l.active);
  const wuiLayer = layers.categories.wildfire?.layers.find(l => l.name === 'WUI');
  const crisisAreasLayer = layers.categories.wildfire?.layers.find(l => l.name === 'Wildfire Crisis Areas');
  
  // Get elevation layers
  const hillshadeLayer = layers.categories.elevation?.layers.find(l => l.name === 'Hillshade');
  const aspectLayer = layers.categories.elevation?.layers.find(l => l.name === 'Aspect');
  const slopeLayer = layers.categories.elevation?.layers.find(l => l.name === 'Slope Steepness');
  const contourLayer = layers.categories.elevation?.layers.find(l => l.name === 'Contour');
  
  const activeGeoTiffLayers = getOrderedGeoTiffLayers(layers.categories);

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
      
      {/* Elevation Layers */}
      <HillshadeLayer 
        active={hillshadeLayer?.active || false}
        opacity={hillshadeLayer?.opacity}
      />
      <AspectLayer 
        active={aspectLayer?.active || false}
        opacity={aspectLayer?.opacity}
      />
      <SlopeLayer 
        active={slopeLayer?.active || false}
        opacity={slopeLayer?.opacity}
      />
      <ContourLayer 
        active={contourLayer?.active || false}
        opacity={contourLayer?.opacity}
      />
      
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