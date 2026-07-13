// pwa utility functions
export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: PWAInstallPrompt | null = null;
  private installPromptHandlers: Array<(prompt: PWAInstallPrompt | null) => void> = [];

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPrompt;
      this.notifyHandlers();
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyHandlers();
    });
  }

  onInstallPromptChange(handler: (prompt: PWAInstallPrompt | null) => void) {
    this.installPromptHandlers.push(handler);
    // Call immediately with current state
    handler(this.deferredPrompt);
    
    // Return cleanup function
    return () => {
      const index = this.installPromptHandlers.indexOf(handler);
      if (index > -1) {
        this.installPromptHandlers.splice(index, 1);
      }
    };
  }

  private notifyHandlers() {
    this.installPromptHandlers.forEach(handler => handler(this.deferredPrompt));
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notifyHandlers();
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches 
      || window.matchMedia('(display-mode: fullscreen)').matches
      || (window.navigator as any).standalone === true;
  }

  isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }
}

// Check if running in PWA mode
export function isPWAMode(): boolean {
  return PWAManager.getInstance().isInstalled();
}

// Check if PWA is installable
export function isPWAInstallable(): boolean {
  return PWAManager.getInstance().isInstallable();
}

// Install PWA
export async function installPWA(): Promise<boolean> {
  return PWAManager.getInstance().installApp();
}

// Detect mobile device
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024);
}

// Check network status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for network changes
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}