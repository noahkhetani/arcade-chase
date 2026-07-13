import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGame } from "./lib/stores/useGame";
import { useAudio } from "./lib/stores/useAudio";
import GameCanvas from "./components/Game/GameCanvas";
import StartScreen from "./components/Game/StartScreen";
import GameOverScreen from "./components/Game/GameOverScreen";
import GameUI from "./components/Game/GameUI";
import TouchControls from "./components/Game/TouchControls";
import LoadingScreen from "./components/Game/LoadingScreen";
import InstallPWA from "./components/PWA/InstallPWA";
import AppUpdatePrompt from "./components/PWA/AppUpdatePrompt";
import SplashScreen from "./components/PWA/SplashScreen";
import WakeLockManager from "./components/PWA/WakeLockManager";
import AddToHomeScreen from "./components/PWA/AddToHomeScreen";
import NotificationOptIn from "./components/PWA/NotificationOptIn";
import { offlineStorageManager, hapticManager } from "./lib/mobile-utils";
import "./index.css";

const queryClient = new QueryClient();

function GameApp() {
  const { phase, transitionType, score, level } = useGame();
  const { setHitSound, setSuccessSound } = useAudio();
  const audioInitialized = useRef(false);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      if (!audioInitialized.current) {
        // Create audio elements for sound effects
        const hitAudio = new Audio();
        hitAudio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Hyvmw=";
        
        const successAudio = new Audio();
        successAudio.src = "data:audio/wav;base64,UklGRqIGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Hyvmz=";
        
        setHitSound(hitAudio);
        setSuccessSound(successAudio);
        audioInitialized.current = true;
      }
    };

    // Listen for any user interaction to initialize audio
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [setHitSound, setSuccessSound]);

  // Save progress offline
  useEffect(() => {
    if (phase === 'gameOver' || phase === 'ended') {
      offlineStorageManager.saveProgress(level, []); // Save current progress
      hapticManager.gameOver(); // Haptic feedback for game over
    }
  }, [phase, level]);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    setAppReady(true);
  };

  return (
    <div className="game-container responsive-wrapper">
      <SplashScreen show={showSplash} onComplete={handleSplashComplete} />
      
      {appReady && (
        <>
          <WakeLockManager />
          <InstallPWA />
          <AddToHomeScreen />
          <AppUpdatePrompt />
          <NotificationOptIn />
          
          {phase === "ready" && <StartScreen />}
          {phase === "loading" && <LoadingScreen transitionType={transitionType} />}
          {phase === "playing" && (
            <div className="game-playing-container">
              <GameCanvas />
              <GameUI />
              <TouchControls />
            </div>
          )}
          {(phase === "gameOver" || phase === "ended") && <GameOverScreen />}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameApp />
    </QueryClientProvider>
  );
}

export default App;
