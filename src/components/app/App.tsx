import React, { useEffect } from 'react';
import { Menu, Search, Download, Settings } from 'lucide-react';
import Map from '../map/Map';
import SettingsDialog from '../settings/SettingsDialog';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleSettings, toggleNav, setActiveTab, setTheme } from '../../store/slices/uiSlice';
import { initializeSettings } from '../../store/slices/settingsSlice';
import firebirdLogo from '../../assets/firebird-logo.png';
import CurrentAOI from '../header/CurrentAOI';
import { store } from '../../store';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, showSettings, isNavOpen } = useAppSelector(state => state.ui);
  const { settings } = useAppSelector(state => state.settings);
  const settingsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(initializeSettings('temp_user_id'));
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      dispatch(setTheme(settings.preferences.theme.mode));
      console.log('App fully initialized, current state:', store.getState());
    }
  }, [settings, dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        dispatch(toggleSettings());
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSettings, dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogoClick = () => {
    dispatch(setActiveTab('home'));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md py-2 relative z-[1000]">
        <div className="w-full px-4">
          <div className="grid grid-cols-[calc(16rem-32px)_1fr_auto] items-center">
            {/* Left column: Menu button and logo - width matches navigation panel minus padding */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => dispatch(toggleNav())}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button 
                onClick={handleLogoClick}
                className="focus:outline-none mt-1"
              >
                <img 
                  src={firebirdLogo}
                  alt="Firebird"
                  width="102"
                  height="20"
                  className="h-5 w-[102px] object-contain"
                />
              </button>
            </div>
            
            {/* Center column: AOI selector (left-justified) */}
            <div className="flex justify-start">
              <CurrentAOI />
            </div>
            
            {/* Right column: Search, Export, Settings */}
            <div className="flex items-center justify-end space-x-3">
              <button className="flex items-center space-x-2 px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search</span>
              </button>
              <button className="flex items-center space-x-2 px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                <Download className="h-4 w-4" />
                <span className="text-sm">Export</span>
              </button>
              <button 
                onClick={() => dispatch(toggleSettings())}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 overflow-hidden">
        <Map />
      </div>

      {/* Settings Dialog */}
      <SettingsDialog />
    </div>
  );
};

export default App;