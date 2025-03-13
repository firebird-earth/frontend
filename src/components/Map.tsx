import React from 'react';
import { MapContainer } from 'react-leaflet';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from './navigation/Navigation';
import MapController from './MapController';
import Legend from './legend/Legend';
import CreateAOIPanel from './aoi/CreateAOIPanel';
import ViewAOIPanel from './aoi/ViewAOIPanel';
import ErrorBoundary from './common/ErrorBoundary';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { toggleLegend } from '../store/slices/uiSlice';
import MapClickHandler from './map/MapClickHandler';
import LocationMarkers from './map/LocationMarkers';
import MapControls from './map/MapControls';
import MapLayers from './map/MapLayers';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { center, zoom } = useAppSelector(state => state.map);
  const { isNavOpen, isLegendOpen, isCreatingAOI, showAOIPanel } = useAppSelector(state => state.ui);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const layers = useAppSelector(state => state.layers);

  const hasActiveLayers = Object.entries(layers.categories).some(([categoryId, category]) => 
    categoryId !== 'basemaps' && category.layers.some(layer => layer.active)
  );

  const activeBasemap = layers.categories.basemaps?.layers.find(l => l.active);
  if (!activeBasemap) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No basemap available</h2>
          <p className="text-gray-600">Please select a basemap to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex ${isCreatingAOI ? 'creating-aoi' : ''}`}>
      <div className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 ${isNavOpen ? 'w-64' : 'w-0'}`}>
        <Navigation />
      </div>

      <div className="flex-1 h-full relative">
        <ErrorBoundary>
          <MapContainer
            center={[center[1], center[0]]}
            zoom={zoom}
            className="h-full w-full"
            maxZoom={22}
            minZoom={4}
            maxBounds={[
              [24.396308, -125.000000],
              [49.384358, -66.934570]
            ]}
            zoomControl={false}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            attributionControl={false}
            // Add finer zoom control
            zoomDelta={0.25} // Zoom steps of 0.25 instead of 1
            zoomSnap={0.25} // Snap to 0.25 zoom levels
            wheelDebounceTime={100} // Smooth out wheel zooming
          >
            <MapControls />
            <MapClickHandler />
            <MapLayers />
            <LocationMarkers />
            <MapController />
          </MapContainer>
        </ErrorBoundary>

        {/* Show CreateAOIPanel only when creating a new AOI */}
        {isCreatingAOI && <CreateAOIPanel />}
        
        {/* Show ViewAOIPanel only when we have a current AOI and showAOIPanel is true */}
        {!isCreatingAOI && currentAOI && showAOIPanel && <ViewAOIPanel />}
      </div>

      {hasActiveLayers && (
        <div className={`h-full bg-white border-l flex-shrink-0 transition-all duration-300 ease-in-out ${isLegendOpen ? 'w-64' : 'w-0'}`}>
          <div className="h-full relative">
            <button
              onClick={() => dispatch(toggleLegend())}
              className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-l-lg p-1 shadow-md hover:bg-gray-50"
            >
              {isLegendOpen ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>

            <div className={`h-full overflow-y-auto ${isLegendOpen ? 'visible' : 'invisible'}`}>
              <Legend />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;