import React from 'react';
import { X, Moon, Sun, Map, Navigation, Eye, Scale, Compass } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleSettings } from '../../store/slices/uiSlice';
import { settingsService } from '../../services/settingsService';

const SettingsDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state.settings);
  const showSettings = useAppSelector(state => state.ui.showSettings);

  if (!showSettings || !settings) return null;

  const handleThemeChange = async (mode: 'light' | 'dark') => {
    try {
      await settingsService.updateSettings({
        theme: { mode }
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleMapControlToggle = async (control: keyof typeof settings.preferences.map.controls) => {
    try {
      await settingsService.updateSettings({
        map: {
          controls: {
            ...settings.preferences.map.controls,
            [control]: !settings.preferences.map.controls[control]
          }
        }
      });
    } catch (error) {
      console.error('Failed to update map controls:', error);
    }
  };

  const handleDisplayToggle = async (setting: keyof typeof settings.preferences.display) => {
    try {
      await settingsService.updateSettings({
        display: {
          ...settings.preferences.display,
          [setting]: !settings.preferences.display[setting]
        }
      });
    } catch (error) {
      console.error('Failed to update display settings:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={() => dispatch(toggleSettings())}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.preferences.theme.mode === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Light Mode</span>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.preferences.theme.mode === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                </div>
              </label>
            </div>
          </div>

          {/* Map Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Map</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Scale</span>
                </div>
                <button
                  onClick={() => handleMapControlToggle('showScale')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span className="sr-only">Toggle scale</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.map.controls.showScale ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show North Arrow</span>
                </div>
                <button
                  onClick={() => handleMapControlToggle('showNorthArrow')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span className="sr-only">Toggle north arrow</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.map.controls.showNorthArrow ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Map className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Zoom Controls</span>
                </div>
                <button
                  onClick={() => handleMapControlToggle('showZoomControls')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span className="sr-only">Toggle zoom controls</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.map.controls.showZoomControls ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Display</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Navigation</span>
                </div>
                <button
                  onClick={() => handleDisplayToggle('showNavigation')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span className="sr-only">Toggle navigation</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.display.showNavigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Legend</span>
                </div>
                <button
                  onClick={() => handleDisplayToggle('showLegend')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span className="sr-only">Toggle legend</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.display.showLegend ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t dark:border-gray-700">
          <button
            onClick={() => dispatch(toggleSettings())}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;