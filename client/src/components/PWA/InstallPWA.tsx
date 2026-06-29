import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download, Smartphone, X, Wifi, WifiOff } from 'lucide-react';
import { PWAManager, PWAInstallPrompt, isMobileDevice, isOnline, onNetworkChange } from '../../lib/pwa-utils';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    const pwaManager = PWAManager.getInstance();
    
    // Check if app is already installed
    setIsInstalled(pwaManager.isInstalled());

    // Subscribe to install prompt changes
    const unsubscribe = pwaManager.onInstallPromptChange((prompt) => {
      setDeferredPrompt(prompt);
      setShowInstallPrompt(!!prompt && !showDismissed && isMobileDevice());
    });

    // Listen for network changes
    const unsubscribeNetwork = onNetworkChange(setNetworkStatus);

    return () => {
      unsubscribe();
      unsubscribeNetwork();
    };
  }, [showDismissed]);

  const handleInstallClick = async () => {
    const pwaManager = PWAManager.getInstance();
    const success = await pwaManager.installApp();
    
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowDismissed(true);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show offline indicator
  if (!networkStatus) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-orange-600 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Offline Mode</span>
      </div>
    );
  }

  // Show install prompt
  if (showInstallPrompt) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-sm">Install App</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs mb-3 opacity-90">
          Install NEON RUNNER for the best mobile gaming experience!
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100 flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            Later
          </Button>
        </div>
      </div>
    );
  }

  return null;
}