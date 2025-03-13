import React, { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setLayerOpacity } from '../../store/slices/layersSlice';
import { useDraggable } from '../../hooks/useDraggable';

interface OpacityDialogProps {
  categoryId: string;
  layerId: number;
  initialOpacity?: number;
  onClose: () => void;
}

const OpacityDialog: React.FC<OpacityDialogProps> = ({ 
  categoryId, 
  layerId, 
  initialOpacity = 1, 
  onClose 
}) => {
  const dispatch = useAppDispatch();
  const [opacity, setOpacity] = useState(initialOpacity);
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

  useEffect(() => {
    setOpacity(initialOpacity);
  }, [initialOpacity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    dispatch(setLayerOpacity({ categoryId, layerId, opacity: newOpacity }));
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
            Adjust Opacity
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Transparent</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={handleChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500">Opaque</span>
          </div>
          
          <div className="text-center text-sm text-gray-700">
            {Math.round(opacity * 100)}%
          </div>
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

export default OpacityDialog;