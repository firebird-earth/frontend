import React from 'react';
import { Home, Layers, Flame } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setActiveTab } from '../../store/slices/uiSlice';

interface TabButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex-1 px-4 py-3 text-sm font-medium ${
      isActive
        ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    <div className="flex items-center justify-center">
      <Icon className="h-4 w-4" />
      <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {label}
      </span>
    </div>
  </button>
);

const TabContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.ui.activeTab);

  return (
    <div className="flex border-t dark:border-gray-700 mt-auto">
      <TabButton
        icon={Home}
        label="Home"
        isActive={activeTab === 'home'}
        onClick={() => dispatch(setActiveTab('home'))}
      />
      <TabButton
        icon={Flame}
        label="Fire Metrics"
        isActive={activeTab === 'firemetrics'}
        onClick={() => dispatch(setActiveTab('firemetrics'))}
      />
      <TabButton
        icon={Layers}
        label="Layers"
        isActive={activeTab === 'layers'}
        onClick={() => dispatch(setActiveTab('layers'))}
      />
    </div>
  );
};

export default TabContent;