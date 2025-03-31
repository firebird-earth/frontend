import React from 'react';
import { Home, Layers, Flame } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setActiveTab } from '../../store/slices/uiSlice';
import { Tab } from '../../constants/maps';

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
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 pointer-events-none">
        <div className="hidden group-hover:block relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2 h-2 bg-gray-800 transform rotate-45 -translate-y-1"></div>
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {label}
          </div>
        </div>
      </div>
    </div>
  </button>
);

const TabContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.ui.activeTab);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex">
        <TabButton
          icon={Home}
          label="Home"
          isActive={activeTab === Tab.HOME}
          onClick={() => dispatch(setActiveTab(Tab.HOME))}
        />
        <TabButton
          icon={Flame}
          label="Wildfire Risk"
          isActive={activeTab === Tab.FIREMETRICS}
          onClick={() => dispatch(setActiveTab(Tab.FIREMETRICS))}
        />
        <TabButton
          icon={Layers}
          label="Layers"
          isActive={activeTab === Tab.LAYERS}
          onClick={() => dispatch(setActiveTab(Tab.LAYERS))}
        />
      </div>
    </div>
  );
};

export default TabContent;