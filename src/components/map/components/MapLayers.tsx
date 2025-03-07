import React from 'react';
import { TileLayer } from 'react-leaflet';
import { useAppSelector } from '../../../hooks/useAppSelector';
import WUILayer from '../../layers/layers/WUILayer';
import CrisisAreasLayer from '../../layers/layers/CrisisAreasLayer';
import AOIBoundaryLayer from '../../layers/home/AOIBoundaryLayer';
import GeoTiffLayer from '../../layers/firemetrics/GeoTiffLayer';
import { getOrderedGeoTiffLayers } from '../../../utils/layers';

const MapLayers: React.FC = () => {
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const coordinates = useAppSelector(state => state.aoi.coordinates);
  const layers = useAppSelector(state => state.layers);
  
  const activeBasemap = layers.categories.basemaps?.layers.find(l => l.active);
  const wuiLayer = layers.categories.wildfire?.layers.find(l => l.name === 'WUI');
  const crisisAreasLayer = layers.categories.wildfire?.layers.find(l => l.name === 'Wildfire Crisis Areas');
  
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
      
      {displayCoords && (
        <AOIBoundaryLayer
          locationId={currentAOI ? (typeof currentAOI.id === 'string' ? parseInt(currentAOI.id) : currentAOI.id) : 0}
          active={true}
          geojson={boundary}
          center={displayCoords}
        />
      )}

      {/* Render GeoTIFF layers in the same order as they appear in the legend */}
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