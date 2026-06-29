// Push Notifications Management for PWA
import { gameSettings } from './gameSettings';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      this.subscription = await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Update settings
        gameSettings.updateSetting('notifications', 'enabled', true);
        
        // Try to subscribe to push notifications
        await this.subscribeToPushNotifications();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<boolean> {
    if (!this.registration || !this.isSupported) {
      return false;
    }

    try {
      // Generate VAPID keys for your server (you'll need to implement this)
      const applicationServerKey = this.getVAPIDPublicKey();
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer();
        this.subscription = null;
        
        // Update settings
        gameSettings.updateSetting('notifications', 'enabled', false);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Show local notification
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.registration || this.getPermissionStatus() !== 'granted') {
      console.warn('Cannot show notification: permission not granted or service worker not ready');
      return;
    }

    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      tag: data.tag || 'neon-runner',
      data: data.data,
      requireInteraction: false,
      silent: false
    };

    try {
      await this.registration.showNotification(data.title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Schedule notification for later
  scheduleNotification(data: NotificationData, delayMs: number): number {
    const timeoutId = window.setTimeout(async () => {
      const settings = gameSettings.getSettings();
      
      // Only show if notifications are still enabled
      if (settings.notifications.enabled) {
        await this.showNotification(data);
      }
    }, delayMs);

    return timeoutId;
  }

  // Cancel scheduled notification
  cancelScheduledNotification(timeoutId: number): void {
    clearTimeout(timeoutId);
  }

  // Get VAPID public key (you'll need to generate these)
  private getVAPIDPublicKey(): Uint8Array {
    // This is a placeholder - you'll need to generate actual VAPID keys
    // For development, you can use web-push library to generate keys
    const base64String = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80Y4-sSkAgACcQKy2MuNsZBm_5GvudJCeGY0h9U9gGpk0V4zUppf5o0';
    return this.urlBase64ToUint8Array(base64String);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  // Predefined notification types
  async showGameUpdateNotification(version: string): Promise<void> {
    const settings = gameSettings.getSettings();
    if (!settings.notifications.enabled || !settings.notifications.gameUpdates) {
      return;
    }

    await this.showNotification({
      title: 'NEON RUNNER Updated!',
      body: `Version ${version} is now available with new features and improvements.`,
      tag: 'game-update',
      data: { type: 'update', version },
      actions: [
        {
          action: 'play',
          title: 'Play Now'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    });
  }

  async showDailyChallengeNotification(): Promise<void> {
    const settings = gameSettings.getSettings();
    if (!settings.notifications.enabled || !settings.notifications.challenges) {
      return;
    }

    await this.showNotification({
      title: 'Daily Challenge Available!',
      body: 'A new challenge is waiting for you. Complete it for bonus rewards!',
      tag: 'daily-challenge',
      data: { type: 'challenge' },
      actions: [
        {
          action: 'challenge',
          title: 'Start Challenge'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    });
  }

  async showPlayReminderNotification(): Promise<void> {
    const settings = gameSettings.getSettings();
    if (!settings.notifications.enabled || !settings.notifications.reminders) {
      return;
    }

    await this.showNotification({
      title: 'Time to Play!',
      body: 'Come back and beat your high score in NEON RUNNER!',
      tag: 'play-reminder',
      data: { type: 'reminder' },
      actions: [
        {
          action: 'play',
          title: 'Play Now'
        },
        {
          action: 'snooze',
          title: 'Remind Later'
        }
      ]
    });
  }

  // Schedule recurring notifications
  scheduleDailyChallenge(): void {
    // Schedule for 10 AM every day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    this.scheduleNotification({
      title: 'Daily Challenge Available!',
      body: 'A new challenge is waiting for you!',
      tag: 'daily-challenge'
    }, timeUntilTomorrow);
  }

  schedulePlayReminder(hoursFromNow: number = 24): void {
    const delayMs = hoursFromNow * 60 * 60 * 1000;
    
    this.scheduleNotification({
      title: 'Miss playing already?',
      body: 'Come back and beat your high score!',
      tag: 'play-reminder'
    }, delayMs);
  }
}

// Export singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance();

// React hook for using push notifications
import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [isSupported] = useState(pushNotificationManager.isNotificationSupported());
  const [permission, setPermission] = useState<NotificationPermission>(
    pushNotificationManager.getPermissionStatus()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check subscription status
    const checkSubscription = async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    };

    if (isSupported) {
      checkSubscription();
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await pushNotificationManager.requestPermission();
    setPermission(pushNotificationManager.getPermissionStatus());
    setIsSubscribed(granted);
    return granted;
  };

  const unsubscribe = async (): Promise<boolean> => {
    const success = await pushNotificationManager.unsubscribeFromPushNotifications();
    setIsSubscribed(!success);
    return success;
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    unsubscribe,
    showNotification: pushNotificationManager.showNotification.bind(pushNotificationManager),
    scheduleNotification: pushNotificationManager.scheduleNotification.bind(pushNotificationManager),
  };
}