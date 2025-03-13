import React from 'react';

const SlopeLegend: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="h-4 w-full rounded bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
        <div className="flex justify-between text-xs text-gray-600">
          <span>0°</span>
          <span>45°+</span>
        </div>
        <div className="text-xs text-gray-600 text-center">
          Slope (degrees)
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
        Source: USGS 3DEP
      </div>
    </div>
  );
};

export default SlopeLegend;