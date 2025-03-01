import React from 'react';
import { Navigation as NavigationIcon, Activity, MapPin, MapPinOff, Zap } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import { Location } from '../../../types/map';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { toggleSection, startCreatingAOI } from '../../../store/slices/uiSlice';
import { setCurrentAOI } from '../../../store/slices/aoiSlice';
import { navigateToLocation } from '../../../utils/mapUtils';
import { useAOI } from '../../../hooks/useAOI';
import locations from '../../../constants/locations';

const HomeTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.ui.sections);
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const { aois } = useAOI();

  const handleLocationClick = (location: Location) => {
    dispatch(setCurrentAOI(location));
    navigateToLocation(location);
  };

  const handleAOIClick = (aoi: any) => {
    dispatch(setCurrentAOI(aoi));
    navigateToLocation({
      id: parseInt(aoi.id),
      name: aoi.name,
      coordinates: aoi.location.center
    });
  };

  const handleCreateAOI = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(startCreatingAOI());
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
          title="AOIs" 
          isOpen={sections.aois} 
          onToggle={() => dispatch(toggleSection('aois'))}
          showAdd
          onAddClick={handleCreateAOI}
        />
        {sections.aois && (
          <div className="space-y-1">
            {locations.map(location => (
              <div
                key={location.id}
                onClick={() => handleLocationClick(location)}
                className={`
                  flex items-center justify-between p-1 rounded-lg cursor-pointer
                  ${isActive(location.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <NavigationIcon className={`h-4 w-4 ${isActive(location.id) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`text-sm ${isActive(location.id) ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {location.name}
                  </span>
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                  {isActive(location.id) ? (
                    <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  ) : (
                    <MapPinOff className="h-4 w-4" />
                  )}
                </div>
              </div>
            ))}

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
                  <NavigationIcon className={`h-4 w-4 ${isActive(aoi.id) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`text-sm ${isActive(aoi.id) ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {aoi.name}
                  </span>
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                  {isActive(aoi.id) ? (
                    <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  ) : (
                    <MapPinOff className="h-4 w-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader 
          title="Scenarios" 
          isOpen={sections.scenarios} 
          onToggle={() => dispatch(toggleSection('scenarios'))}
          showAdd
        />
        {sections.scenarios && (
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>View Scenarios</span>
            </button>
          </div>
        )}
      </div>

      <div>
        <SectionHeader 
          title="Treatments" 
          isOpen={sections.treatments} 
          onToggle={() => dispatch(toggleSection('treatments'))}
          showAdd
        />
        {sections.treatments && (
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>View Treatments</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTab;