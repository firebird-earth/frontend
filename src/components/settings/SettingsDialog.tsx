import React from 'react';
import { X, Moon, Sun, Map, Scale, Compass, Grid, MousePointer } from 'lucide-react';
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

  const handleCoordinatesToggle = async () => {
    try {
      await settingsService.updateSettings({
        map: {
          coordinates: {
            ...settings.preferences.map.coordinates,
            show: !settings.preferences.map.coordinates.show
          }
        }
      });
    } catch (error) {
      console.error('Failed to update coordinates display:', error);
    }
  };

  const handleCoordinateFormatChange = async (format: 'latlon-dd' | 'latlon-dms' | 'utm') => {
    try {
      await settingsService.updateSettings({
        map: {
          coordinates: {
            ...settings.preferences.map.coordinates,
            format
          }
        }
      });
    } catch (error) {
      console.error('Failed to update coordinate format:', error);
    }
  };

  const handleGridToggle = async () => {
    try {
      const newShow = !settings.preferences.map.grid.show;
      await settingsService.updateSettings({
        map: {
          grid: {
            ...settings.preferences.map.grid,
            show: newShow
          }
        }
      });
    } catch (error) {
      console.error('Failed to update grid settings:', error);
    }
  };

  const handleGridSizeChange = async (size: number) => {
    try {
      await settingsService.updateSettings({
        map: {
          grid: {
            ...settings.preferences.map.grid,
            size
          }
        }
      });
    } catch (error) {
      console.error('Failed to update grid size:', error);
    }
  };

  const handleGridUnitChange = async (unit: 'acres' | 'meters') => {
    try {
      await settingsService.updateSettings({
        map: {
          grid: {
            ...settings.preferences.map.grid,
            unit
          }
        }
      });
    } catch (error) {
      console.error('Failed to update grid unit:', error);
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.preferences.map.controls.showScale ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.preferences.map.controls.showNorthArrow ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.preferences.map.controls.showZoomControls ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Toggle zoom controls</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.map.controls.showZoomControls ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Coordinates Settings */}
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MousePointer className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Coordinates</span>
                  </div>
                  <button
                    onClick={handleCoordinatesToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.preferences.map.coordinates.show ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Toggle coordinates</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.preferences.map.coordinates.show ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coordinate Format
                  </label>
                  <select
                    value={settings.preferences.map.coordinates.format}
                    onChange={(e) => handleCoordinateFormatChange(e.target.value as 'latlon-dd' | 'latlon-dms' | 'utm')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
                  >
                    <option value="latlon-dd">Latitude/Longitude (Decimal Degrees)</option>
                    <option value="latlon-dms">Latitude/Longitude (Degrees Minutes Seconds)</option>
                    <option value="utm">UTM</option>
                  </select>
                </div>
              </div>

              {/* Grid Settings */}
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Grid className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Grid</span>
                  </div>
                  <button
                    onClick={handleGridToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.preferences.map.grid.show ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Toggle grid</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.preferences.map.grid.show ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grid Size
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={settings.preferences.map.grid.size}
                      onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                      className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
                    />
                    <select
                      value={settings.preferences.map.grid.unit}
                      onChange={(e) => handleGridUnitChange(e.target.value as 'acres' | 'meters')}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
                    >
                      <option value="meters">meters</option>
                      <option value="acres">acres</option>
                    </select>
                  </div>
                </div>
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