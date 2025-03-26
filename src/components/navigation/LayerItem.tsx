import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LayerItemProps {
  icon: React.ElementType;
  name: string;
  active: boolean;
  onClick: () => void;
  onEyeClick: (e: React.MouseEvent) => void;
  isBasemap?: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({ 
  icon: Icon, 
  name, 
  active, 
  onClick, 
  onEyeClick,
  isBasemap = false 
}) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center justify-between p-1 rounded-lg cursor-pointer
      ${active 
        ? 'bg-blue-50 dark:bg-blue-900/20' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }
    `}
  >
    <div className="flex items-center space-x-2">
      <Icon className={`h-4 w-4 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
      <span className={`text-sm ${active ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
        {name}
      </span>
    </div>
    <div className="flex items-center pr-1">
      <button 
        onClick={onEyeClick}
        className={`${active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} hover:text-gray-600 dark:hover:text-gray-300`}
      >
        {active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

export default LayerItem;