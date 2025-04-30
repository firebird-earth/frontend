// src/components/controls/TransparencyControl.tsx
import React, { useRef, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setLayerOpacity } from '../../store/slices/layersSlice';

interface TransparencyControlProps {
  categoryId: string;
  layerId: number;
  opacity: number;
  onChange?: (opacity: number) => void;
  className?: string;
  showLabel?: boolean;
  showValue?: boolean;
  compact?: boolean;
}

const TransparencyControl: React.FC<TransparencyControlProps> = ({
  categoryId,
  layerId,
  opacity,
  onChange,
  className = '',
  showLabel = true,
  showValue = true,
  compact = false
}) => {
  const dispatch = useAppDispatch();
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = 1 - Number(e.target.value); // Invert the value
    
    // Ensure value is between 0 and 1
    const normalizedValue = Math.min(Math.max(value, 0), 1);
    
    dispatch(setLayerOpacity({ categoryId, layerId, opacity: normalizedValue }));
    onChange?.(normalizedValue);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Get the current slider value on mouse up
      if (sliderRef.current) {
        const value = 1 - Number(sliderRef.current.value); // Invert the value
        const normalizedValue = Math.min(Math.max(value, 0), 1);
        dispatch(setLayerOpacity({ categoryId, layerId, opacity: normalizedValue }));
        onChange?.(normalizedValue);
      }
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
              Transparency
            </span>
          )}
          {showValue && (
            <span className={`text-sm text-gray-500 ${compact ? 'text-xs' : ''}`}>
              {Math.round((1 - opacity) * 100)}%
            </span>
          )}
        </div>
      )}
      <input
        ref={sliderRef}
        type="range"
        min="0"
        max="1"
        step="0.001" // Smaller step size for smoother control
        value={1 - opacity} // Invert the value for display
        onChange={handleTransparencyChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
          hover:bg-gray-300 focus:outline-none focus:bg-gray-300
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blue-500
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:hover:bg-blue-600
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-blue-500
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:hover:bg-blue-600
          [&::-moz-range-thumb]:border-0
        `}
      />
    </div>
  );
};

export default TransparencyControl;
