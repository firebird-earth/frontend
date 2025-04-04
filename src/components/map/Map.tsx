import React, { useEffect, useRef } from 'react';
import { MapContainer } from 'react-leaflet';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../navigation/Navigation';
import MapController from './MapController';
import Legend from '../legend/Legend';
import CreateAOIPanel from '../aoi/CreateAOIPanel';
import ViewAOIPanel from '../aoi/ViewAOIPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleLegend } from '../../store/slices/uiSlice';
import MapClickHandler from './MapClickHandler';
import LocationMarkers from './LocationMarkers';
import MapControls from './MapControls';
import MapLayers from './MapLayers';
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
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Store map reference globally when initialized
  const handleMapInit = (map: L.Map) => {
    mapRef.current = map;
  };

  // Create custom panes when map initializes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Create panes with specific z-index values that sit below the default feature pane
    map.createPane('firemetricsPane');
    map.createPane('layersPane');
    
    // Set z-index for each pane (default feature pane is 400)
    map.getPane('firemetricsPane')!.style.zIndex = '375';
    map.getPane('layersPane')!.style.zIndex = '350';

    // Ensure pointer events are enabled
    map.getPane('firemetricsPane')!.style.pointerEvents = 'auto';
    map.getPane('layersPane')!.style.pointerEvents = 'auto';

  }, [mapRef.current]);

  // Add resize observer to handle container size changes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === mapContainerRef.current) {
          const map = mapRef.current;
          if (map) {
            map.invalidateSize({
              animate: false,
              pan: false
            });
          }
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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
    <div className="h-full w-full flex">
      {/* Navigation Panel */}
      <div className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 ${isNavOpen ? 'w-64' : 'w-0'}`}>
        <Navigation />
      </div>

      {/* Main Content Area */}
      <div className="h-full flex-1 flex">
        {/* Map Container */}
        <div ref={mapContainerRef} className="h-full w-full relative">
          <ErrorBoundary>
            <MapContainer
              ref={handleMapInit}
              center={[center[1], center[0]]}
              zoom={zoom}
              className="h-full w-full absolute inset-0"
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
              zoomDelta={0.25}
              zoomSnap={0.25}
              wheelDebounceTime={100}
            >
              <MapControls />
              <MapClickHandler />
              <MapLayers />
              <LocationMarkers />
              <MapController />
            </MapContainer>
          </ErrorBoundary>

          {isCreatingAOI && <CreateAOIPanel />}
          {!isCreatingAOI && currentAOI && showAOIPanel && <ViewAOIPanel />}
        </div>

        {/* Legend Panel */}
        {hasActiveLayers && (
          <div className={`h-full bg-white transition-all duration-300 ease-in-out flex-shrink-0 ${isLegendOpen ? 'w-64' : 'w-0'}`}>
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
    </div>
  );
};

export default MapComponent;