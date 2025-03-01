import React from 'react';
import { TileLayer } from 'react-leaflet';
import { useAppSelector } from '../../../hooks/useAppSelector';
import WUILayer from '../../layers/layers/WUILayer';
import CrisisAreasLayer from '../../layers/layers/CrisisAreasLayer';
import AOIBoundaryLayer from '../../layers/home/AOIBoundaryLayer';
import GeoTiffLayer from '../../layers/firemetrics/GeoTiffLayer';

const MapLayers: React.FC = () => {
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const coordinates = useAppSelector(state => state.aoi.coordinates);
  const layers = useAppSelector(state => state.layers);

  // Debug logs for layer state
  console.log('MapLayers render:', {
    basemaps: layers.categories.basemaps?.layers,
    fuels: layers.categories.fuels?.layers,
    activeGeoTiffLayers: layers.categories.fuels?.layers.filter(l => l.active)
  });

  const activeBasemap = layers.categories.basemaps?.layers.find(l => l.active);
  const wuiLayer = layers.categories.wildfire?.layers.find(l => l.name === 'WUI');
  const crisisAreasLayer = layers.categories.wildfire?.layers.find(l => l.name === 'Wildfire Crisis Areas');
  
  // Only include GeoTIFF layers (not placeholder types)
  const activeGeoTiffLayers = [
    ...(layers.categories.firemetrics?.layers.filter(l => l.active && l.type === 'geotiff') || []),
    ...(layers.categories.fuels?.layers.filter(l => l.active && l.type === 'geotiff') || [])
  ];

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

      {activeGeoTiffLayers.map(layer => (
        <GeoTiffLayer
          key={layer.id}
          url={layer.source}
          active={layer.active}
        />
      ))}
    </>
  );
};

export default MapLayers;