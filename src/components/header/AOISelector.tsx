import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Navigation, MapPinOff } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setCurrentAOI } from '../../store/slices/homeSlice/actions';
import { startCreatingAOI } from '../../store/slices/uiSlice';
import { useAOI } from '../../hooks/useAOI';
import { navigateToLocation } from '../../utils/navigate';
import locations from '../../constants/places/locations';

interface AOISelectorProps {
  onClose: () => void;
}

const AOISelector: React.FC<AOISelectorProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { aois } = useAOI();
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const isNavOpen = useAppSelector(state => state.ui.isNavOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleSelectLocation = (location: any) => {
    // Make sure we have valid coordinates before navigating
    if (location && location.coordinates) {
      dispatch(setCurrentAOI(location));
      navigateToLocation(location);
      onClose();
    } else {
      console.error("Cannot navigate: location or coordinates missing", location);
    }
  };
  
  const handleCreateAOI = () => {
    dispatch(startCreatingAOI());
    onClose();
  };

  const handleAOIClick = (aoi: any) => {
    if (aoi && aoi.location?.coordinates) {
      dispatch(setCurrentAOI(aoi));
      navigateToLocation({
        id: parseInt(aoi.id),
        name: aoi.name,
        coordinates: aoi.location.coordinates
      });
      onClose();
    }
  };
  
  const isActive = (id: number | string) => {
    if (!currentAOI) return false;
    if (typeof id === 'string') {
      return currentAOI.id === id;
    }
    return 'id' in currentAOI && currentAOI.id === id;
  };
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="p-2">
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

      <div className="my-2 border-t dark:border-gray-700"></div>
      
      <button
        onClick={handleCreateAOI}
        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-left"
      >
        <Plus className="h-4 w-4" />
        <span>Add a new location</span>
      </button>
    </div>
  );
};

export default AOISelector;