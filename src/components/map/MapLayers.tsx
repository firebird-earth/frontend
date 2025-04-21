// src/components/map/MapLayers.tsx
import React from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { TileLayer } from 'react-leaflet';
import { 
  StatesLayer,
  CountiesLayer,
  FederalLandsLayer,
  USFSLayer,
  USFWSLayer,
  CrisisAreasLayer,
  HillshadeLayer,
  AspectLayer,
  SlopeLayer,
  ContourLayer,
  WUILayer,
  ElevationLayer,
  GeoTiffLayer
} from '../layers/maps';
import AOIBoundaryLayer from '../layers/home/AOIBoundaryLayer';
import { getOrderedGeoTiffLayers } from '../../store/slices/layers';

const MapLayers: React.FC = () => {
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const coordinates = useAppSelector(state => state.home.aoi.coordinates);
  
  const activeBasemap = categories.basemaps?.layers.find(l => l.active);
  const wuiLayer = categories.wildfire?.layers.find(l => l.name === 'WUI' && l.active);
  const crisisAreasLayer = categories.wildfire?.layers.find(l => l.name === 'Wildfire Crisis Areas' && l.active);
  const statesLayer = categories.jurisdictions?.layers.find(l => l.name === 'States' && l.active);
  const countiesLayer = categories.jurisdictions?.layers.find(l => l.name === 'Counties' && l.active);
  const federalLandsLayer = categories.jurisdictions?.layers.find(l => l.name === 'US Federal Lands' && l.active);
  const usfsLayer = categories.jurisdictions?.layers.find(l => l.name === 'US Forest Service' && l.active);
  const usfwsLayer = categories.jurisdictions?.layers.find(l => l.name === 'US Fish and Wildlife' && l.active);
  
  // Get elevation layers - only if active
  const elevationLayer = categories.elevation?.layers.find(l => l.name === 'Elevation' && l.active);
  const hillshadeLayer = categories.elevation?.layers.find(l => l.name === 'Hillshade' && l.active);
  const aspectLayer = categories.elevation?.layers.find(l => l.name === 'Aspect' && l.active);
  const slopeLayer = categories.elevation?.layers.find(l => l.name === 'Slope Steepness' && l.active);
  const contourLayer = categories.elevation?.layers.find(l => l.name === 'Contour' && l.active);
  
  // Get active GeoTIFF layers in order with their categories
  const activeGeoTiffLayers = getOrderedGeoTiffLayers(categories).filter(({ layer }) => layer.active);
  
  // Find any layer with showValues enabled
  const layerWithValues = React.useMemo(() => {
    return Object.entries(categories).flatMap(([categoryId, category]) => 
      category.layers
        .filter(layer => layer.showValues && layer.active)
        .map(layer => ({ categoryId, layer }))
    )[0];
  }, [categories]);

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
      
      {wuiLayer && <WUILayer active={true} />}
      {crisisAreasLayer && <CrisisAreasLayer active={true} />}
      {statesLayer && <StatesLayer active={true} />}
      {countiesLayer && <CountiesLayer active={true} />}
      {federalLandsLayer && <FederalLandsLayer active={true} />}
      {usfsLayer && <USFSLayer active={true} />}
      {usfwsLayer && <USFWSLayer active={true} />}
      
      {/* Elevation Layers */}
      {elevationLayer && <ElevationLayer active={true} />}
      {slopeLayer && <SlopeLayer active={true} />}
      {hillshadeLayer && <HillshadeLayer active={true} />}
      {aspectLayer && <AspectLayer active={true} />}
      {contourLayer && <ContourLayer active={true} />}
      
      {displayCoords && (
        <AOIBoundaryLayer
          locationId={currentAOI ? (typeof currentAOI.id === 'string' ? parseInt(currentAOI.id) : currentAOI.id) : 0}
          active={true}
          geojson={boundary}
          center={displayCoords}
        />
      )}

      {activeGeoTiffLayers.map(({ layer, categoryId }) => (
        <GeoTiffLayer
          key={`${categoryId}-${layer.id}-${layer.name}-${layer.active}-${layer.order}`}
          url={layer.source}
          active={true}
          zIndex={layer.order || 0}
          categoryId={categoryId}
          layerId={layer.id}
        />
      ))}
    </>
  );
};

export default MapLayers;
