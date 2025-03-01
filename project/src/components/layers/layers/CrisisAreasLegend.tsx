import React from 'react';

const CrisisAreasLegend: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-red-500 opacity-25 border border-red-500"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Wildfire Crisis Fireshed
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
        Source: USFS Wildfire Crisis Strategy
      </div>
    </div>
  );
};

export default CrisisAreasLegend;