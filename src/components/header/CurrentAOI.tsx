import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import AOISelector from './AOISelector';

const CurrentAOI: React.FC = () => {
  const [showSelector, setShowSelector] = useState(false);
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const isNavOpen = useAppSelector(state => state.ui.isNavOpen);
  
  const toggleSelector = () => {
    setShowSelector(!showSelector);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleSelector}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        
        <div className="flex items-center">
          <span className="text-sm font-medium truncate max-w-[224px] text-gray-700 dark:text-gray-300">
            {currentAOI ? currentAOI.name : 'Select AOI'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 text-gray-500 dark:text-gray-400" />
        </div>
      </button>
      
      {showSelector && (
        <AOISelector onClose={() => setShowSelector(false)} />
      )}
    </div>
  );
};

export default CurrentAOI;