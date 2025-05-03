import React, { useMemo } from 'react';
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
  GeoTiffLayer,
} from '../layers';
import QueryLayer from '../layers/QueryLayer';
import AOIBoundaryLayer from '../layers/AOIBoundaryLayer';
import IgnitionsLayer from '../layers/IgnitionsLayer';
import { getOrderedLayers } from '../../store/slices/layersSlice';
import { useAppSelector } from '../../hooks/useAppSelector';
import { leafletLayerMap } from '../../store/slices/layersSlice/state';
import { LayerType } from '../../types/map';
import { hashString } from '../../utils/utils';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[MapLayers]', ...args);
  }
}

const MapLayers: React.FC = () => {
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const coordinates = useAppSelector(state => state.home.aoi.coordinates);

  const {
    basemaps,
    wildfire,
    jurisdictions,
    elevation,
    scenarios: scenarioCategory,
    landscapeRisk
  } = categories;

  const {
    activeBasemap,
    activeLayers,
    activeScenarioLayers,
    activeGeoTiffLayers,
  } = useMemo(() => {
    
    const activeBasemap = basemaps?.layers.find(l => l.active);

    const activeLayers = {
      wui: wildfire?.layers.find(l => l.name === 'WUI' && l.active),
      crisis: wildfire?.layers.find(l => l.name === 'Wildfire Crisis Areas' && l.active),
      states: jurisdictions?.layers.find(l => l.name === 'States' && l.active),
      counties: jurisdictions?.layers.find(l => l.name === 'Counties' && l.active),
      federal: jurisdictions?.layers.find(l => l.name === 'US Federal Lands' && l.active),
      usfs: jurisdictions?.layers.find(l => l.name === 'US Forest Service' && l.active),
      usfws: jurisdictions?.layers.find(l => l.name === 'US Fish and Wildlife' && l.active),
      elevation: elevation?.layers.find(l => l.name === 'Elevation' && l.active),
      hillshade: elevation?.layers.find(l => l.name === 'Hillshade' && l.active),
      aspect: elevation?.layers.find(l => l.name === 'Aspect' && l.active),
      slope: elevation?.layers.find(l => l.name === 'Slope Steepness' && l.active),
      contour: elevation?.layers.find(l => l.name === 'Contour' && l.active),
      ignitions: landscapeRisk?.layers.find(l => l.name === 'Ignitions' && l.active),
    };

    const activeGeoTiffLayers = getOrderedLayers(categories, LayerType.GeoTiff)
      .filter(({ layer }) => layer.active);

    const activeScenarioLayers = getOrderedLayers({ scenarios: categories.scenarios }, LayerType.Raster)
      .filter(({ layer }) => layer.active);

    return {
      activeBasemap,
      activeLayers,
      activeScenarioLayers,
      activeGeoTiffLayers,
    };
  }, [basemaps, wildfire, jurisdictions, elevation, scenarioCategory, categories]);

  const { displayCoords, boundary } = useMemo(() => {
    if (currentAOI) {
      if ('location' in currentAOI) {
        return {
          displayCoords: [currentAOI.location.center[1], currentAOI.location.center[0]] as [number, number],
          boundary: currentAOI.boundary || null
        };
      }
      if ('coordinates' in currentAOI) {
        return {
          displayCoords: [currentAOI.coordinates[1], currentAOI.coordinates[0]] as [number, number],
          boundary: currentAOI.boundary || null
        };
      }
    } else if (coordinates) {
      return {
        displayCoords: [coordinates[1], coordinates[0]] as [number, number],
        boundary: null
      };
    }
    return { displayCoords: null, boundary: null };
  }, [currentAOI, coordinates]);

  if (!activeBasemap) return null;

  return (
    <>
      <TileLayer
        url={activeBasemap.source}
        maxZoom={22}
        minZoom={4}
      />

      {/* Jurisdiction Layers */}
      {activeLayers.states && <StatesLayer active={true} />}
      {activeLayers.counties && <CountiesLayer active={true} />}
      {activeLayers.federal && <FederalLandsLayer active={true} />}
      {activeLayers.usfs && <USFSLayer active={true} />}
      {activeLayers.usfws && <USFWSLayer active={true} />}

      {/* Elevation Layers */}
      {activeLayers.elevation && <ElevationLayer active={true} />}
      {activeLayers.hillshade && <HillshadeLayer active={true} />}
      {activeLayers.aspect && <AspectLayer active={true} />}
      {activeLayers.slope && <SlopeLayer active={true} />}
      {activeLayers.contour && <ContourLayer active={true} />}

      {/* Wildfire Layers */}
      {activeLayers.wui && <WUILayer active={true} />}
      {activeLayers.crisis && <CrisisAreasLayer active={true} />}

      {/* Ignitions Layer */}
      {activeLayers.ignitions && 
        <IgnitionsLayer 
          locationId={currentAOI ? (typeof currentAOI.id === 'string' ? parseInt(currentAOI.id) : currentAOI.id) : 0}
          active={true}
          geojson={boundary}
          center={displayCoords}
        />}

      {/* AOI Boundary */}
      {displayCoords && (
        <AOIBoundaryLayer
          locationId={currentAOI ? (typeof currentAOI.id === 'string' ? parseInt(currentAOI.id) : currentAOI.id) : 0}
          active={true}
          geojson={boundary}
          center={displayCoords}
        />
      )}

      {/* GeoTIFF Layers */}
      {activeGeoTiffLayers.map(({ layer, categoryId }) => (
        <GeoTiffLayer
          key={`${categoryId}-${layer.id}-${layer.name}-${layer.active}-${layer.order}`}
          categoryId={categoryId}
          layerId={layer.id}
          url={layer.source}
          active={true}
          zIndex={layer.order || 0}
        />
      ))}

      {/* Scenario Layers */}
      {activeScenarioLayers.map(({ layer, categoryId }) => (
        <QueryLayer
          key={`${categoryId}-${layer.id}-${layer.name}-${layer.active}-${layer.order}`}
          categoryId={categoryId}
          layerId={layer.id}
          expression={layer.expression}
          active={true}
          zIndex={layer.order || 0}
        />
      ))}
    </>
  );
};

export default MapLayers;