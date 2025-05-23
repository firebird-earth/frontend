import React, { useState } from 'react';
import { Navigation as NavigationIcon, Activity, MapPin, MapPinOff, Zap, Eye, EyeOff } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleSection, startCreatingAOI } from '../../store/slices/uiSlice';
import { setCurrentAOI } from '../../store/slices/homeSlice/actions';
import { navigateToLocation } from '../../utils/navigate';
import { useAOI } from '../../hooks/useAOI';
import locations from '../../constants/places/locations';
import { scenarios } from '../../constants/maps/scenarios';
import { store } from '../../store';
import { execExpression } from '../../query/exec';
import { showDialog } from '../../store/slices/uiSlice';
import SelectAOIDialog from '../../components/aoi/SelectAOIDialog';
import { toggleLayer, toggleSingleLayer } from '../../store/slices/layersSlice';
import { hashString } from '../../utils/utils';
import { MapLayer } from '../../types/map'

const HomeTab: React.FC = () => {
  const dispatch = store.dispatch;
  const sections = useAppSelector(state => state.ui.sections);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const scenarioLayers = useAppSelector(state => state.layers.categories.scenarios?.layers || []);
  const { aois } = useAOI();
  const [showDialog, setShowDialog] = useState(false);

  const handleLocationClick = (location: Location) => {
    dispatch(setCurrentAOI(location));
    navigateToLocation(location);
  };

  const handleAOIClick = (aoi: any) => {
    dispatch(setCurrentAOI(aoi));
    navigateToLocation({
      id: parseInt(aoi.id),
      name: aoi.name,
      coordinates: aoi.location.coordinates,
      boundary: aoi.boundary
    });
  };

  const handleCreateAOI = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(startCreatingAOI());
  };

  // Handle click on the layer text/name - exclusive behavior
  const handleScenarioClick = (layer: MapLayer) => {
    if (!currentAOI) {
      setShowDialog(true);
      return;
    }
    dispatch(toggleSingleLayer({ categoryId: 'scenarios', layerId: layer.id }));
  };

  // Handle click on the eye icon - non-exclusive behavior
  const handleEyeClick = (e: React.MouseEvent, layer: MapLayer) => {
    e.stopPropagation();
    if (!currentAOI) {
      setShowDialog(true);
      return;
    }
    dispatch(toggleLayer({ categoryId: 'scenarios', layerId: layer.id }));
  };

  const isActive = (id: number | string) => {
    if (!currentAOI) return false;
    if (typeof id === 'string') {
      return currentAOI.id === id;
    }
    return 'id' in currentAOI && currentAOI.id === id;
  };

  return (
    <div className="space-y-3">
      <div>
        <SectionHeader 
          title="LOCATIONS" 
          isOpen={sections.aois} 
          onToggle={() => dispatch(toggleSection('aois'))}
          showAdd
          onAddClick={handleCreateAOI}
        />
        {sections.aois && (
          <div className="space-y-1">
            {aois.map(aoi => (
              <div
                key={aoi.id}
                onClick={() => handleAOIClick(aoi)}
                className={`
                  flex items-center justify-between p-1 rounded-lg cursor-pointer
                  ${isActive(aoi.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className={`h-4 w-4 ${isActive(aoi.id) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`text-sm ${isActive(aoi.id) ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {aoi.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader 
          title="Treatment Scenarios" 
          isOpen={sections.scenarios} 
          onToggle={() => dispatch(toggleSection('scenarios'))}
          showAdd
        />
        {sections.scenarios && (
          <div className="space-y-1">
            {scenarioLayers.map(layer => (
              <div
                key={layer.id}
                onClick={() => handleScenarioClick(layer)}
                title={layer.expression?.replace(/"/g, '')}
                className={`
                  flex items-center justify-between p-1 rounded-lg cursor-pointer
                  ${layer.active
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <Zap className={`h-4 w-4 ${layer.active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`text-sm ${layer.active ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {layer.name}
                  </span>
                </div>
                <button 
                  onClick={(e) => handleEyeClick(e, layer)}
                  className={`${
                    layer.active 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {layer.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SelectAOI Dialog */}
      {showDialog && (
        <SelectAOIDialog onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
};

export default HomeTab;