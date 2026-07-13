import React, { useEffect, useState } from 'react';
import { useGame } from '../../lib/stores/useGame';
import { wakeLockManager } from '../../lib/mobile-utils';

export default function WakeLockManager() {
  const { phase } = useGame();
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);

  useEffect(() => {
    // Check if Wake Lock API is supported
    setWakeLockSupported('wakeLock' in navigator);
  }, []);

  useEffect(() => {
    if (!wakeLockSupported) return;

    const handleGameStart = async () => {
      if (phase === 'playing' && !wakeLockActive) {
        const success = await wakeLockManager.requestWakeLock();
        setWakeLockActive(success);
        
        if (success) {
          console.log('Screen wake lock activated for gameplay');
        }
      } else if (phase !== 'playing' && wakeLockActive) {
        await wakeLockManager.releaseWakeLock();
        setWakeLockActive(false);
        console.log('Screen wake lock released');
      }
    };

    handleGameStart();

    // Handle visibility change (when user switches tabs)
    const handleVisibilityChange = async () => {
      if (document.hidden && wakeLockActive) {
        await wakeLockManager.releaseWakeLock();
        setWakeLockActive(false);
      } else if (!document.hidden && phase === 'playing' && !wakeLockActive) {
        const success = await wakeLockManager.requestWakeLock();
        setWakeLockActive(success);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockActive) {
        wakeLockManager.releaseWakeLock();
      }
    };
  }, [phase, wakeLockActive, wakeLockSupported]);

  // This component doesn't render anything visible
  return null;
}