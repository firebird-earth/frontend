import React from 'react';
import TabContent from './TabContent';
import HomeTab from './HomeTab';
import LayersTab from './LayersTab';
import FireMetricsTab from './FireMetricsTab';
import { useAppSelector } from '../../hooks/useAppSelector';
import { Tab } from '../../constants/maps';

const Navigation: React.FC = () => {
  const { isNavOpen, activeTab } = useAppSelector(state => state.ui);

  return (
    <div className={`bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-full flex flex-col relative z-[900] ${isNavOpen ? 'w-64' : 'w-0'}`}>
      <div className={`h-full flex flex-col ${isNavOpen ? '' : 'hidden'}`}>
        {/* Fixed tab bar at top with overflow visible for tooltips */}
        <div className="overflow-visible">
          <TabContent />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4 pr-2">
                {activeTab === Tab.HOME && <HomeTab />}
                {activeTab === Tab.LAYERS && <LayersTab />}
                {activeTab === Tab.FIREMETRICS && <FireMetricsTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;