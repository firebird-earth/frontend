import React from 'react';
import TabContent from './TabContent';
import HomeTab from './tabs/HomeTab';
import LayersTab from './tabs/LayersTab';
import FireMetricsTab from './tabs/FireMetricsTab';
import { useAppSelector } from '../../hooks/useAppSelector';

const Navigation: React.FC = () => {
  const { isNavOpen, activeTab } = useAppSelector(state => state.ui);

  return (
    <div className={`bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-full flex flex-col relative z-[900] ${isNavOpen ? 'w-64' : 'w-0'}`}>
      <div className={`h-full flex flex-col ${isNavOpen ? '' : 'hidden'}`}>
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'home' && <HomeTab />}
              {activeTab === 'layers' && <LayersTab />}
              {activeTab === 'firemetrics' && <FireMetricsTab />}
            </div>

            {/* Fixed tab bar at bottom */}
            <TabContent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navigation;