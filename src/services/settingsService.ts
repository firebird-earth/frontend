import { 
  FirebaseUserSettings, 
  UpdateSettingsPayload 
} from '../types/settings';
import { store } from '../store';
import { 
  setSettings, 
  setLoading, 
  setError,
  updateSettings as updateSettingsAction
} from '../store/slices/settingsSlice';

class SettingsService {
  private static instance: SettingsService;
  private readonly STORAGE_KEY = 'firebird_user_settings';

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Load settings from local storage (temporary until Firebase integration)
   */
  public async loadSettings(userId: string): Promise<FirebaseUserSettings | null> {
    const dispatch = store.dispatch;
    
    try {
      dispatch(setLoading(true));
      const storedSettings = localStorage.getItem(this.STORAGE_KEY);
      const settings = storedSettings ? JSON.parse(storedSettings) : null;
      
      if (settings) {
        dispatch(setSettings(settings));
      }
      
      return settings;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings';
      dispatch(setError(message));
      return null;
    }
  }

  /**
   * Save settings to local storage (temporary until Firebase integration)
   */
  public async saveSettings(settings: FirebaseUserSettings): Promise<void> {
    const dispatch = store.dispatch;
    
    try {
      dispatch(setLoading(true));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      dispatch(setSettings(settings));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      dispatch(setError(message));
      throw error;
    }
  }

  /**
   * Update specific settings
   * This will be replaced with Firebase updates that use timestamps for conflict resolution
   */
  public async updateSettings(updates: UpdateSettingsPayload): Promise<void> {
    const dispatch = store.dispatch;
    
    try {
      dispatch(setLoading(true));
      
      // Update in Redux
      dispatch(updateSettingsAction(updates));
      
      // Get updated settings from store
      const state = store.getState();
      const settings = state.settings.settings;
      
      if (settings) {
        // Save to local storage (will be replaced with Firebase)
        await this.saveSettings(settings);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      dispatch(setError(message));
      throw error;
    }
  }

  /**
   * Clear all settings
   * This will be replaced with Firebase document deletion
   */
  public async clearSettings(): Promise<void> {
    const dispatch = store.dispatch;
    
    try {
      dispatch(setLoading(true));
      localStorage.removeItem(this.STORAGE_KEY);
      dispatch(setSettings(null));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear settings';
      dispatch(setError(message));
      throw error;
    }
  }
}

export const settingsService = SettingsService.getInstance();