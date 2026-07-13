import React, { useState, useEffect, useRef } from 'react';
import { useGameSettings } from '../../lib/gameSettings';

interface FPSCounterProps {
  gameStats?: {
    score: number;
    level: number;
    lives: number;
    collectiblesCollected: number;
    obstaclesAvoided: number;
    timePlayed: number;
  };
}

export const FPSCounter: React.FC<FPSCounterProps> = ({ gameStats }) => {
  const { settings } = useGameSettings();
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [onePercentLow, setOnePercentLow] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Don't render if FPS counter is disabled in settings
  if (!settings.display.showFPS) {
    return null;
  }
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const detailedFpsHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const calculateFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      // Calculate instant FPS for more granular 1% low tracking
      if (delta > 0) {
        const instantFps = Math.round(1000 / delta);
        detailedFpsHistoryRef.current.push(instantFps);
        
        // Keep detailed history for 1% lows calculation
        if (detailedFpsHistoryRef.current.length > 1000) {
          detailedFpsHistoryRef.current.shift();
        }
      }
      
      if (delta >= 1000) { // Update display every second
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(currentFps);
        
        // Track FPS history for average
        fpsHistoryRef.current.push(currentFps);
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }
        
        const avg = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
        setAvgFps(Math.round(avg));
        
        // Calculate 1% lows
        if (detailedFpsHistoryRef.current.length >= 100) {
          const sortedFps = [...detailedFpsHistoryRef.current].sort((a, b) => a - b);
          const onePercentIndex = Math.floor(sortedFps.length * 0.01);
          const onePercentLowValue = sortedFps.slice(0, Math.max(1, onePercentIndex)).reduce((a, b) => a + b, 0) / Math.max(1, onePercentIndex);
          setOnePercentLow(Math.round(onePercentLowValue));
        }
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      frameCountRef.current++;
      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    calculateFPS();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-2 left-2 z-50 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg p-2 font-mono text-xs text-white/60 hover:text-white border border-white/20 transition-all duration-200"
      >
        Show Stats
      </button>
    );
  }

  return (
    <div className="fixed top-2 left-2 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 font-mono text-xs text-white border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <div className="text-cyan-400 font-bold">PERFORMANCE</div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white text-xs transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="text-gray-300">FPS:</div>
        <div className={`font-bold ${getFpsColor(fps)}`}>{fps}</div>
        
        <div className="text-gray-300">Avg FPS:</div>
        <div className={`font-bold ${getFpsColor(avgFps)}`}>{avgFps}</div>
        
        <div className="text-gray-300">1% Low:</div>
        <div className={`font-bold ${getFpsColor(onePercentLow)}`}>{onePercentLow}</div>
        
        {/* Game Stats */}
        {gameStats && (
          <>
            <div className="col-span-2 text-center text-purple-400 font-bold mt-2 mb-1 border-b border-white/20 pb-1">
              GAME STATS
            </div>
            
            <div className="text-gray-300">Score:</div>
            <div className="text-yellow-400 font-bold">{gameStats.score.toLocaleString()}</div>
            
            <div className="text-gray-300">Level:</div>
            <div className="text-blue-400 font-bold">{gameStats.level}</div>
            
            <div className="text-gray-300">Lives:</div>
            <div className="text-red-400 font-bold">{gameStats.lives}</div>
            
            <div className="text-gray-300">Collected:</div>
            <div className="text-green-400 font-bold">{gameStats.collectiblesCollected}</div>
            
            <div className="text-gray-300">Avoided:</div>
            <div className="text-orange-400 font-bold">{gameStats.obstaclesAvoided}</div>
            
            <div className="text-gray-300">Time:</div>
            <div className="text-cyan-400 font-bold">{formatTime(gameStats.timePlayed)}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default FPSCounter;