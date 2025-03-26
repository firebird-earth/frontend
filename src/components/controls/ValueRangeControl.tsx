import React from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setLayerValueRange } from '../../store/slices/layers';

interface ValueRangeControlProps {
  categoryId: string;
  layerId: number;
  range: {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
  };
  onChange?: (min: number, max: number) => void;
  className?: string;
  showLabel?: boolean;
  showValue?: boolean;
  compact?: boolean;
}

const ValueRangeControl: React.FC<ValueRangeControlProps> = ({
  categoryId,
  layerId,
  range,
  onChange,
  className = '',
  showLabel = true,
  showValue = true,
  compact = false
}) => {
  const dispatch = useAppDispatch();

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    const handle = e.target.name;
    
    if (handle === 'min') {
      // Ensure min doesn't exceed max
      const newMin = Math.min(value, range.max);
      dispatch(setLayerValueRange({
        categoryId,
        layerId,
        min: newMin,
        max: range.max
      }));
      onChange?.(newMin, range.max);
    } else {
      // Ensure max doesn't go below min
      const newMax = Math.max(value, range.min);
      dispatch(setLayerValueRange({
        categoryId,
        layerId,
        min: range.min,
        max: newMax
      }));
      onChange?.(range.min, newMax);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`${className} ${compact ? 'space-y-1' : 'space-y-2'}`}
      onClick={handleContainerClick}
    >
      {(showLabel || showValue) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <span className={`text-sm text-gray-700 ${compact ? 'text-xs' : ''}`}>
              Value Range
            </span>
          )}
          {showValue && (
            <span className={`text-sm text-gray-500 ${compact ? 'text-xs' : ''}`}>
              {range.min.toFixed(2)} - {range.max.toFixed(2)}
            </span>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        <div className="relative pt-1">
          <div className="relative h-2">
            {/* Base track */}
            <div className="absolute inset-0 bg-gray-200 rounded-lg"></div>
            
            {/* Range highlight */}
            <div 
              className="absolute h-full bg-blue-500 rounded-lg"
              style={{
                left: `${((range.min - range.defaultMin) / (range.defaultMax - range.defaultMin)) * 100}%`,
                right: `${100 - ((range.max - range.defaultMin) / (range.defaultMax - range.defaultMin)) * 100}%`
              }}
            />

            {/* Range inputs */}
            <input
              type="range"
              name="min"
              value={range.min}
              min={range.defaultMin}
              max={range.defaultMax}
              step={(range.defaultMax - range.defaultMin) / 100}
              onChange={handleRangeChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute w-full top-0 h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            />
            <input
              type="range"
              name="max"
              value={range.max}
              min={range.defaultMin}
              max={range.defaultMax}
              step={(range.defaultMax - range.defaultMin) / 100}
              onChange={handleRangeChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute w-full top-0 h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueRangeControl;