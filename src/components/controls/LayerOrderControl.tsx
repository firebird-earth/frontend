import React from 'react';
import { ChevronsUp, ChevronsDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { 
  bringLayerToFront,
  sendLayerToBack,
  bringLayerForward,
  sendLayerBackward
} from '../../store/slices/layersSlice';

interface LayerOrderControlProps {
  categoryId: string;
  layerId: number;
  className?: string;
  compact?: boolean;
  onOrderChange?: () => void;
}

const LayerOrderControl: React.FC<LayerOrderControlProps> = ({
  categoryId,
  layerId,
  className = '',
  compact = false,
  onOrderChange
}) => {
  const dispatch = useAppDispatch();

  const handleOrderChange = (action: () => void) => {
    action();
    onOrderChange?.();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`${className} ${compact ? 'space-y-1' : 'space-y-2'}`}
      onClick={handleContainerClick}
    >
      <div className="space-y-1">
        <button
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={() => handleOrderChange(() => 
            dispatch(bringLayerToFront({ categoryId, layerId }))
          )}
        >
          <ChevronsUp className="h-4 w-4 text-gray-500" />
          <span>Bring to Front</span>
        </button>
        
        <button
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={() => handleOrderChange(() => 
            dispatch(bringLayerForward({ categoryId, layerId }))
          )}
        >
          <ArrowUp className="h-4 w-4 text-gray-500" />
          <span>Bring Forward</span>
        </button>
        
        <button
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={() => handleOrderChange(() => 
            dispatch(sendLayerBackward({ categoryId, layerId }))
          )}
        >
          <ArrowDown className="h-4 w-4 text-gray-500" />
          <span>Send Backward</span>
        </button>
        
        <button
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={() => handleOrderChange(() => 
            dispatch(sendLayerToBack({ categoryId, layerId }))
          )}
        >
          <ChevronsDown className="h-4 w-4 text-gray-500" />
          <span>Send to Back</span>
        </button>
      </div>
    </div>
  );
};

export default LayerOrderControl;