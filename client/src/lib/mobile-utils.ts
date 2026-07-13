// mobile-specific utilities for pwa enhancement

// Wake Lock API to prevent screen sleep during gameplay
export class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private isSupported = 'wakeLock' in navigator;

  async requestWakeLock(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Wake Lock API not supported');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated');
      
      // Handle wake lock release
      this.wakeLock.addEventListener('release', () => {
        console.log('Wake lock released');
      });
      
      return true;
    } catch (error) {
      console.error('Failed to request wake lock:', error);
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  isActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }
}

// Virtual touch controls for mobile devices
export interface TouchControlsState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean; // space/enter equivalent
  cheat: boolean; // for opening cheat menu
}

export class VirtualControlsManager {
  private state: TouchControlsState = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    cheat: false
  };
  
  private listeners: Array<(state: TouchControlsState) => void> = [];
  private touchStartPositions: Map<number, { x: number; y: number }> = new Map();

  // Joystick configuration
  private joystickDeadzone = 0.2;
  private joystickRadius = 60;

  constructor() {
    this.setupTouchEvents();
  }

  private setupTouchEvents() {
    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  handleJoystickMove(centerX: number, centerY: number, touchX: number, touchY: number) {
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < this.joystickRadius * this.joystickDeadzone) {
      // Inside deadzone - no movement
      this.updateMovement(false, false, false, false);
      return;
    }

    // Normalize direction
    const normalizedX = deltaX / distance;
    const normalizedY = deltaY / distance;

    // Determine primary direction
    const threshold = 0.5; // 45-degree threshold
    
    const up = normalizedY < -threshold;
    const down = normalizedY > threshold;
    const left = normalizedX < -threshold;
    const right = normalizedX > threshold;

    this.updateMovement(up, down, left, right);
  }

  private updateMovement(up: boolean, down: boolean, left: boolean, right: boolean) {
    const changed = 
      this.state.up !== up ||
      this.state.down !== down ||
      this.state.left !== left ||
      this.state.right !== right;

    if (changed) {
      this.state.up = up;
      this.state.down = down;
      this.state.left = left;
      this.state.right = right;
      this.notifyListeners();
    }
  }

  setActionButton(pressed: boolean) {
    if (this.state.action !== pressed) {
      this.state.action = pressed;
      this.notifyListeners();
    }
  }

  setCheatButton(pressed: boolean) {
    if (this.state.cheat !== pressed) {
      this.state.cheat = pressed;
      this.notifyListeners();
    }
  }

  getState(): TouchControlsState {
    return { ...this.state };
  }

  onStateChange(listener: (state: TouchControlsState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

// Haptic feedback for mobile devices
export class HapticManager {
  private isSupported = 'vibrate' in navigator;

  vibrate(pattern: number | number[]): boolean {
    if (!this.isSupported) return false;
    
    // Check if haptic feedback is enabled in settings
    try {
      const { gameSettings } = require('./gameSettings');
      const settings = gameSettings.getSettings();
      if (!settings.audio.hapticFeedback) return false;
    } catch (error) {
      // Settings not available, proceed without check
    }
    
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.warn('Vibration failed:', error);
      return false;
    }
  }

  // Predefined haptic patterns
  light() { return this.vibrate(50); }
  medium() { return this.vibrate(100); }
  heavy() { return this.vibrate(200); }
  
  // Game-specific patterns
  collectItem() { return this.vibrate([50, 30, 50]); }
  hitObstacle() { return this.vibrate([100, 50, 100, 50, 100]); }
  levelUp() { return this.vibrate([100, 50, 100, 50, 200]); }
  gameOver() { return this.vibrate([300, 100, 300]); }
}

// Offline storage management
export class OfflineStorageManager {
  private static readonly STORAGE_KEYS = {
    HIGH_SCORE: 'arcade_collector_high_score',
    PLAYER_NAME: 'arcade_collector_player_name',
    CHEAT_UNLOCKS: 'arcade_collector_cheat_unlocks',
    GAME_PROGRESS: 'arcade_collector_progress',
    SETTINGS: 'arcade_collector_settings'
  };

  // High score management
  saveHighScore(score: number, playerName: string): void {
    const data = {
      score,
      playerName,
      timestamp: Date.now()
    };
    localStorage.setItem(OfflineStorageManager.STORAGE_KEYS.HIGH_SCORE, JSON.stringify(data));
  }

  getHighScore(): { score: number; playerName: string; timestamp: number } | null {
    const data = localStorage.getItem(OfflineStorageManager.STORAGE_KEYS.HIGH_SCORE);
    return data ? JSON.parse(data) : null;
  }

  // Cheat unlocks
  saveCheatUnlocks(unlockedCheats: string[]): void {
    localStorage.setItem(OfflineStorageManager.STORAGE_KEYS.CHEAT_UNLOCKS, JSON.stringify(unlockedCheats));
  }

  getCheatUnlocks(): string[] {
    const data = localStorage.getItem(OfflineStorageManager.STORAGE_KEYS.CHEAT_UNLOCKS);
    return data ? JSON.parse(data) : [];
  }

  // Game settings
  saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(OfflineStorageManager.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getSettings(): Record<string, any> {
    const data = localStorage.getItem(OfflineStorageManager.STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  }

  // Player progress
  saveProgress(level: number, achievements: string[]): void {
    const progress = {
      level,
      achievements,
      timestamp: Date.now()
    };
    localStorage.setItem(OfflineStorageManager.STORAGE_KEYS.GAME_PROGRESS, JSON.stringify(progress));
  }

  getProgress(): { level: number; achievements: string[]; timestamp: number } | null {
    const data = localStorage.getItem(OfflineStorageManager.STORAGE_KEYS.GAME_PROGRESS);
    return data ? JSON.parse(data) : null;
  }

  // Clear all data
  clearAllData(): void {
    Object.values(OfflineStorageManager.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instances
export const wakeLockManager = new WakeLockManager();
export const virtualControlsManager = new VirtualControlsManager();
export const hapticManager = new HapticManager();
export const offlineStorageManager = new OfflineStorageManager();