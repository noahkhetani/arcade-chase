import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Bell, BellOff, X, Check, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '../../lib/pushNotifications';
import { useGameSettings } from '../../lib/gameSettings';

interface NotificationOptInProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoShow?: boolean;
}

export default function NotificationOptIn({ 
  isOpen = false, 
  onClose, 
  autoShow = true 
}: NotificationOptInProps) {
  const { isSupported, permission, isSubscribed, requestPermission, unsubscribe } = usePushNotifications();
  const { settings, updateSetting } = useGameSettings();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Auto-show notification opt-in after user has played for a while
    if (autoShow && isSupported && permission === 'default' && !settings.notifications.enabled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds of gameplay

      return () => clearTimeout(timer);
    }
  }, [autoShow, isSupported, permission, settings.notifications.enabled]);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const granted = await requestPermission();
      
      if (granted) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowPrompt(false);
          onClose?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      await unsubscribe();
      updateSetting('notifications', 'enabled', false);
      setShowPrompt(false);
      onClose?.();
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onClose?.();
  };

  if (!isSupported) {
    return null;
  }

  // Show success state
  if (showSuccess) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm mx-4">
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Notifications Enabled!</h3>
            <p className="text-xs opacity-90">You'll receive game updates and challenges</p>
          </div>
        </div>
      </div>
    );
  }

  // Control visibility
  const shouldShow = isOpen || showPrompt;
  if (!shouldShow) return null;

  // Already granted - show management options
  if (permission === 'granted' && isSubscribed) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm mx-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Notifications Active</h3>
              <p className="text-xs opacity-90">You're subscribed to game updates</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Game Updates</span>
            <span className={settings.notifications.gameUpdates ? 'text-green-300' : 'text-gray-300'}>
              {settings.notifications.gameUpdates ? 'On' : 'Off'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Daily Challenges</span>
            <span className={settings.notifications.challenges ? 'text-green-300' : 'text-gray-300'}>
              {settings.notifications.challenges ? 'On' : 'Off'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Play Reminders</span>
            <span className={settings.notifications.reminders ? 'text-green-300' : 'text-gray-300'}>
              {settings.notifications.reminders ? 'On' : 'Off'}
            </span>
          </div>
        </div>

        <div className="flex space-x-2 mt-3">
          <Button
            onClick={handleDisableNotifications}
            size="sm"
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            <BellOff className="w-3 h-3 mr-1" />
            {isLoading ? 'Disabling...' : 'Disable'}
          </Button>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-600 text-white p-4 rounded-lg shadow-lg max-w-sm mx-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Notifications Blocked</h3>
              <p className="text-xs opacity-90">Enable in browser settings to receive updates</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <p className="text-xs mb-3">
          To enable notifications, click the lock icon in your browser's address bar and allow notifications.
        </p>
        
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
        >
          Got it
        </Button>
      </div>
    );
  }

  // Default state - ask for permission
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm mx-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Stay in the Loop!</h3>
            <p className="text-xs opacity-90">Get notified about updates and challenges</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Benefits list */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <span>New game features and updates</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <span>Daily challenges and events</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <span>Reminders to beat your high score</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleEnableNotifications}
          size="sm"
          disabled={isLoading}
          className="flex-1 bg-white text-purple-600 hover:bg-gray-100 font-semibold"
        >
          <Bell className="w-3 h-3 mr-1" />
          {isLoading ? 'Enabling...' : 'Enable Notifications'}
        </Button>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="text-white/80 hover:bg-white/20 px-3"
        >
          Maybe Later
        </Button>
      </div>
      
      <p className="text-xs text-white/70 mt-3">
        You can change this anytime in settings
      </p>
    </div>
  );
}