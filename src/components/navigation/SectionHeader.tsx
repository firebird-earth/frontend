import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  showAdd?: boolean;
  onAddClick?: (e: React.MouseEvent) => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  isOpen, 
  onToggle, 
  showAdd = false,
  onAddClick
}) => (
  <div className="flex items-center justify-between mb-2">
    <button 
      onClick={onToggle}
      className="flex items-center space-x-2 text-sm font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
    >
      <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? '' : '-rotate-90'}`} />
      <span>{title}</span>
    </button>
    {showAdd && onAddClick && (
      <button 
        onClick={onAddClick}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
      >
        <Plus className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default SectionHeader;