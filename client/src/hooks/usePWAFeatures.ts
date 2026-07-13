import { useEffect, useState } from 'react';
import { useGame } from '../lib/stores/useGame';
import { hapticManager, offlineStorageManager, wakeLockManager } from '../lib/mobile-utils';

export function usePWAFeatures() {
  const { phase, score, level } = useGame();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPromptShown, setInstallPromptShown] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Game-specific haptic feedback based on game events
  useEffect(() => {
    const handleGameEvents = () => {
      // Listen for custom game events
      const handleCollect = () => hapticManager.collectItem();
      const handleHit = () => hapticManager.hitObstacle();
      const handleLevelUp = () => hapticManager.levelUp();
      
      window.addEventListener('game:collect', handleCollect);
      window.addEventListener('game:hit', handleHit);
      window.addEventListener('game:levelup', handleLevelUp);
      
      return () => {
        window.removeEventListener('game:collect', handleCollect);
        window.removeEventListener('game:hit', handleHit);
        window.removeEventListener('game:levelup', handleLevelUp);
      };
    };

    return handleGameEvents();
  }, []);

  // Save game progress automatically
  useEffect(() => {
    if (score > 0) {
      offlineStorageManager.saveProgress(level, []);
    }
  }, [score, level]);

  // Wake lock management
  useEffect(() => {
    if (phase === 'playing') {
      wakeLockManager.requestWakeLock();
    } else {
      wakeLockManager.releaseWakeLock();
    }
  }, [phase]);

  return {
    isOnline,
    installPromptShown,
    setInstallPromptShown
  };
}

// Helper function to trigger game events with haptic feedback
export function triggerGameEvent(eventType: 'collect' | 'hit' | 'levelup' | 'gameover') {
  const event = new CustomEvent(`game:${eventType}`, { 
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
  
  // Also trigger appropriate haptic feedback
  switch (eventType) {
    case 'collect':
      hapticManager.collectItem();
      break;
    case 'hit':
      hapticManager.hitObstacle();
      break;
    case 'levelup':
      hapticManager.levelUp();
      break;
    case 'gameover':
      hapticManager.gameOver();
      break;
  }
}