// persistent game settings management
export interface GameSettings {
  audio: {
    masterVolume: number;
    soundEffects: boolean;
    backgroundMusic: boolean;
    hapticFeedback: boolean;
  };
  controls: {
    joystickMode: boolean;
    joystickSensitivity: number;
    touchControlsOpacity: number;
    invertYAxis: boolean;
  };
  display: {
    showFPS: boolean;
    particleEffects: boolean;
    screenShake: boolean;
    colorBlindMode: boolean;
  };
  gameplay: {
    difficultyLevel: 'easy' | 'normal' | 'hard';
    autoSave: boolean;
    showHints: boolean;
    pauseOnFocusLoss: boolean;
  };
  notifications: {
    enabled: boolean;
    gameUpdates: boolean;
    challenges: boolean;
    reminders: boolean;
  };
}

export const DEFAULT_SETTINGS: GameSettings = {
  audio: {
    masterVolume: 0.8,
    soundEffects: true,
    backgroundMusic: true,
    hapticFeedback: true,
  },
  controls: {
    joystickMode: false,
    joystickSensitivity: 0.7,
    touchControlsOpacity: 0.8,
    invertYAxis: false,
  },
  display: {
    showFPS: false,
    particleEffects: true,
    screenShake: true,
    colorBlindMode: false,
  },
  gameplay: {
    difficultyLevel: 'normal',
    autoSave: true,
    showHints: true,
    pauseOnFocusLoss: true,
  },
  notifications: {
    enabled: false,
    gameUpdates: true,
    challenges: true,
    reminders: false,
  },
};

class GameSettingsManager {
  private static instance: GameSettingsManager;
  private settings: GameSettings;
  private listeners: Array<(settings: GameSettings) => void> = [];
  private readonly STORAGE_KEY = 'arcade_collector_settings';

  static getInstance(): GameSettingsManager {
    if (!GameSettingsManager.instance) {
      GameSettingsManager.instance = new GameSettingsManager();
    }
    return GameSettingsManager.instance;
  }

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private mergeWithDefaults(stored: any): GameSettings {
    const merged = { ...DEFAULT_SETTINGS };
    
    // Deep merge stored settings with defaults
    if (stored && typeof stored === 'object') {
      if (stored.audio) merged.audio = { ...DEFAULT_SETTINGS.audio, ...stored.audio };
      if (stored.controls) merged.controls = { ...DEFAULT_SETTINGS.controls, ...stored.controls };
      if (stored.display) merged.display = { ...DEFAULT_SETTINGS.display, ...stored.display };
      if (stored.gameplay) merged.gameplay = { ...DEFAULT_SETTINGS.gameplay, ...stored.gameplay };
      if (stored.notifications) merged.notifications = { ...DEFAULT_SETTINGS.notifications, ...stored.notifications };
    }
    
    return merged;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Get current settings
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  // Update specific setting
  updateSetting<T extends keyof GameSettings, K extends keyof GameSettings[T]>(
    category: T,
    key: K,
    value: GameSettings[T][K]
  ): void {
    this.settings[category] = {
      ...this.settings[category],
      [key]: value
    };
    this.saveSettings();
  }

  // Update entire category
  updateCategory<T extends keyof GameSettings>(
    category: T,
    newSettings: Partial<GameSettings[T]>
  ): void {
    this.settings[category] = {
      ...this.settings[category],
      ...newSettings
    };
    this.saveSettings();
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  // Reset specific category
  resetCategory<T extends keyof GameSettings>(category: T): void {
    this.settings[category] = { ...DEFAULT_SETTINGS[category] };
    this.saveSettings();
  }

  // Subscribe to settings changes
  subscribe(listener: (settings: GameSettings) => void): () => void {
    this.listeners.push(listener);
    // Call immediately with current settings
    listener(this.settings);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Export settings to JSON
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings from JSON
  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      this.settings = this.mergeWithDefaults(imported);
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Get setting value by path
  getSetting<T extends keyof GameSettings, K extends keyof GameSettings[T]>(
    category: T,
    key: K
  ): GameSettings[T][K] {
    return this.settings[category][key];
  }

  // Validate settings (for future use)
  private validateSettings(settings: any): boolean {
    // Add validation logic here if needed
    return true;
  }
}

// Export singleton instance
export const gameSettings = GameSettingsManager.getInstance();

// Expose to window for testing (development only)
if (typeof window !== 'undefined') {
  (window as any).gameSettings = gameSettings;
}

// React hook for using settings
import { useState, useEffect } from 'react';

export function useGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(gameSettings.getSettings());

  useEffect(() => {
    const unsubscribe = gameSettings.subscribe(setSettings);
    return unsubscribe;
  }, []);

  return {
    settings,
    updateSetting: gameSettings.updateSetting.bind(gameSettings),
    updateCategory: gameSettings.updateCategory.bind(gameSettings),
    resetToDefaults: gameSettings.resetToDefaults.bind(gameSettings),
    resetCategory: gameSettings.resetCategory.bind(gameSettings),
    exportSettings: gameSettings.exportSettings.bind(gameSettings),
    importSettings: gameSettings.importSettings.bind(gameSettings),
    getSetting: gameSettings.getSetting.bind(gameSettings),
  };
}