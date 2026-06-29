import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download, X, Smartphone, Star } from 'lucide-react';
import { PWAManager } from '../../lib/pwa-utils';

export default function AddToHomeScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissedPermanently, setDismissedPermanently] = useState(false);

  useEffect(() => {
    const pwaManager = PWAManager.getInstance();
    
    // Check if already installed
    setIsInstalled(pwaManager.isInstalled());
    
    // Check if user previously dismissed permanently
    const dismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissedPermanently(dismissed);

    // Subscribe to installability changes
    const unsubscribe = pwaManager.onInstallPromptChange((prompt) => {
      setIsInstallable(!!prompt);
      
      // Show prompt after 10 seconds if not dismissed and installable
      if (prompt && !dismissed && !pwaManager.isInstalled()) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000);
      }
    });

    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    const pwaManager = PWAManager.getInstance();
    const success = await pwaManager.installApp();
    
    if (success) {
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDismissedPermanently(true);
    setShowPrompt(false);
  };

  // Don't show if installed, permanently dismissed, or not installable
  if (isInstalled || dismissedPermanently || !isInstallable || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-xl border border-white/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Install NEON RUNNER</h3>
            <p className="text-xs opacity-90">Get the full native app experience</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Features list */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center space-x-2 text-xs">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>Play offline anywhere</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>Faster loading times</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>No browser address bar</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>Save to home screen</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleInstall}
          size="sm"
          className="flex-1 bg-white text-indigo-600 hover:bg-gray-100 font-semibold flex items-center justify-center space-x-1"
        >
          <Download className="w-3 h-3" />
          <span>Install App</span>
        </Button>
        <Button
          onClick={handleDismissPermanently}
          size="sm"
          variant="ghost"
          className="text-white/80 hover:bg-white/20 px-3"
        >
          Not Now
        </Button>
      </div>
      
      {/* Installation instructions for different browsers */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <p className="text-xs text-white/70">
          Tap the install button or look for "Add to Home Screen" in your browser menu
        </p>
      </div>
    </div>
  );
}