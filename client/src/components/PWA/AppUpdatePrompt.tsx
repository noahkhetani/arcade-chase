import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download, RefreshCw, X } from 'lucide-react';

export default function AppUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [newServiceWorker, setNewServiceWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker has taken over
        window.location.reload();
      });

      // Listen for updates
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  setNewServiceWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        }
      });
    }
  }, []);

  const handleUpdate = async () => {
    if (!newServiceWorker) return;

    setIsUpdating(true);
    
    try {
      // Send message to skip waiting
      newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error updating app:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg shadow-lg max-w-sm mx-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5" />
          <h3 className="font-bold text-sm">App Update Available</h3>
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
        A new version of NEON RUNNER is ready! Update now for the latest features and improvements.
      </p>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleUpdate}
          size="sm"
          disabled={isUpdating}
          className="bg-white text-green-600 hover:bg-gray-100 flex items-center space-x-1"
        >
          {isUpdating ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Download className="w-3 h-3" />
          )}
          <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
        </Button>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
          disabled={isUpdating}
        >
          Later
        </Button>
      </div>
    </div>
  );
}