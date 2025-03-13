import React, { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setLayerValueRange } from '../../store/slices/layersSlice';
import { useDraggable } from '../../hooks/useDraggable';

interface ValueRangeDialogProps {
  categoryId: string;
  layerId: number;
  initialRange: {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
  };
  onClose: () => void;
}

const ValueRangeDialog: React.FC<ValueRangeDialogProps> = ({
  categoryId,
  layerId,
  initialRange,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const [min, setMin] = useState(initialRange.min);
  const [max, setMax] = useState(initialRange.max);
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

  useEffect(() => {
    setMin(initialRange.min);
    setMax(initialRange.max);
  }, [initialRange]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value);
    setMin(newMin);
    dispatch(setLayerValueRange({
      categoryId,
      layerId,
      min: newMin,
      max
    }));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value);
    setMax(newMax);
    dispatch(setLayerValueRange({
      categoryId,
      layerId,
      min,
      max: newMax
    }));
  };

  const handleReset = () => {
    setMin(initialRange.defaultMin);
    setMax(initialRange.defaultMax);
    dispatch(setLayerValueRange({
      categoryId,
      layerId,
      min: initialRange.defaultMin,
      max: initialRange.defaultMax
    }));
  };

  return (
    <div className="fixed inset-0 z-[2000]" style={{ pointerEvents: 'none' }}>
      <div 
        ref={dialogRef}
        onClick={handleDialogClick}
        className="bg-white rounded-lg shadow-xl w-80 absolute"
        style={{ 
          left: position.x,
          top: position.y,
          transition: 'none',
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="p-4 border-b border-gray-200 drag-handle flex items-center space-x-2 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <Sliders className="h-5 w-5 text-gray-500 pointer-events-none" />
          <h3 className="text-lg font-medium text-gray-900 pointer-events-none">
            Adjust Value Range
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Min Value</span>
              <span className="text-sm text-gray-500">{min.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={initialRange.defaultMin}
              max={initialRange.defaultMax}
              step={(initialRange.defaultMax - initialRange.defaultMin) / 100}
              value={min}
              onChange={handleMinChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Max Value</span>
              <span className="text-sm text-gray-500">{max.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={initialRange.defaultMin}
              max={initialRange.defaultMax}
              step={(initialRange.defaultMax - initialRange.defaultMin) / 100}
              value={max}
              onChange={handleMaxChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleReset}
            className="w-full text-sm text-blue-600 hover:text-blue-700"
          >
            Reset to Default
          </button>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueRangeDialog;