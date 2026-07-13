import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "loading" | "playing" | "gameOver" | "ended";
export type TransitionType = "fadeIn" | "slideDown" | "scale" | "spin" | "none";

interface GameState {
  phase: GamePhase;
  transitionType: TransitionType;
  isTransitioning: boolean;
  score: number;
  level: number;
  lives: number;
  gameSpeed: number;
  combo: number;
  comboTimer: number;
  cheatMode: boolean;
  
  // Game statistics for FPS counter
  gameStats: {
    collectiblesCollected: number;
    obstaclesAvoided: number;
    timePlayed: number;
    startTime: number;
  };

  // Enhanced cheat system
  activeCheatEffects: {
    godMode: boolean;
    slowMotion: boolean;
    doubleScore: boolean;
    superSpeed: boolean;
    rainbowMode: boolean;
    bigPlayer: boolean;
    tinyPlayer: boolean;
    infiniteLives: boolean;
    noObstacles: boolean;
    autoCollect: boolean;
    extraLives: boolean;
    tripleScore: boolean;
    maxSpeed: boolean;
    gigaPlayer: boolean;
    microPlayer: boolean;
    allPowerUps: boolean;
    scoreBoost: boolean;
    timeFreeze: boolean;
  };
  
  joystickMode: boolean;

  // Power-ups
  activePowerUps: {
    shield: number;
    speed: number;
    magnet: number;
  };

  // Game actions
  start: () => void;
  restart: () => void;
  end: () => void;
  
  // Transition actions
  startTransition: (toPhase: GamePhase, transitionType?: TransitionType) => void;
  completeTransition: () => void;

  // Score and progression
  addScore: (points: number) => void;
  loseLife: () => void;
  nextLevel: () => void;
  resetGame: () => void;

  // Combo system
  addCombo: () => void;
  resetCombo: () => void;
  updateCombo: () => void;

  // Power-up system
  activatePowerUp: (type: 'shield' | 'speed' | 'magnet') => void;
  updatePowerUps: () => void;

  // Enhanced cheat system
  enableCheatMode: () => void;
  disableCheatMode: () => void;
  activateCheatEffect: (effect: keyof GameState['activeCheatEffects']) => void;
  deactivateCheatEffect: (effect: keyof GameState['activeCheatEffects']) => void;
  toggleCheatEffect: (effect: keyof GameState['activeCheatEffects']) => void;
  clearAllCheats: () => void;
  toggleJoystickMode: () => void;
  
  // Game stats tracking
  incrementCollectibles: () => void;
  incrementObstaclesAvoided: () => void;
  updateTimePlayed: () => void;
  startGameTimer: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    transitionType: "none",
    isTransitioning: false,
    score: 0,
    level: 1,
    lives: 3,
    gameSpeed: 1,
    combo: 0,
    comboTimer: 0,
    cheatMode: false,
    joystickMode: false,
    gameStats: {
      collectiblesCollected: 0,
      obstaclesAvoided: 0,
      timePlayed: 0,
      startTime: 0,
    },
    activeCheatEffects: {
      godMode: false,
      slowMotion: false,
      doubleScore: false,
      superSpeed: false,
      rainbowMode: false,
      bigPlayer: false,
      tinyPlayer: false,
      infiniteLives: false,
      noObstacles: false,
      autoCollect: false,
      extraLives: false,
      tripleScore: false,
      maxSpeed: false,
      gigaPlayer: false,
      microPlayer: false,
      allPowerUps: false,
      scoreBoost: false,
      timeFreeze: false,
    },
    activePowerUps: {
      shield: 0,
      speed: 0,
      magnet: 0
    },

    start: () => {
      set((state) => {
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },

    restart: () => {
      set(() => ({ 
        phase: "ready",
        score: 0,
        level: 1,
        lives: 3,
        gameSpeed: 1,
        combo: 0,
        comboTimer: 0,
        cheatMode: false,
        gameStats: {
          collectiblesCollected: 0,
          obstaclesAvoided: 0,
          timePlayed: 0,
          startTime: 0,
        },
        activeCheatEffects: {
          godMode: false,
          slowMotion: false,
          doubleScore: false,
          superSpeed: false,
          rainbowMode: false,
          bigPlayer: false,
          tinyPlayer: false,
          infiniteLives: false,
          noObstacles: false,
          autoCollect: false,
          extraLives: false,
          tripleScore: false,
          maxSpeed: false,
          gigaPlayer: false,
          microPlayer: false,
          allPowerUps: false,
          scoreBoost: false,
          timeFreeze: false,
        },
        activePowerUps: {
          shield: 0,
          speed: 0,
          magnet: 0
        }
      }));
    },

    end: () => {
      const currentState = get();
      if (currentState.phase === "playing") {
        currentState.startTransition("gameOver", "spin");
      }
    },

    addScore: (points: number) => {
      set((state) => {
        const comboMultiplier = Math.min(1 + state.combo * 0.1, 3);
        let scoreMultiplier = 1;
        
        // Apply cheat score multipliers
        if (state.activeCheatEffects.tripleScore) scoreMultiplier *= 3;
        else if (state.activeCheatEffects.doubleScore) scoreMultiplier *= 2;
        
        if (state.activeCheatEffects.scoreBoost) scoreMultiplier *= 1.5;
        
        const adjustedPoints = Math.floor(points * comboMultiplier * scoreMultiplier);
        const newScore = state.score + adjustedPoints;

        // Level up every 1500 points
        const newLevel = Math.floor(newScore / 1500) + 1;
        const levelChanged = newLevel > state.level;

        return {
          score: newScore,
          level: newLevel,
          gameSpeed: levelChanged ? Math.min(2.5, 1 + (newLevel - 1) * 0.15) : state.gameSpeed
        };
      });
    },

    loseLife: () => {
      set((state) => {
        // Check if shield is active or extra lives cheat is enabled
        if (state.activePowerUps.shield > 0) {
          return { 
            activePowerUps: { ...state.activePowerUps, shield: 0 },
            combo: 0,
            comboTimer: 0
          };
        }

        // If extra lives cheat is active, add a life instead of losing one
        if (state.activeCheatEffects.extraLives) {
          return {
            lives: Math.min(state.lives + 1, 9), // Cap at 9 lives
            combo: 0,
            comboTimer: 0
          };
        }

        const newLives = state.lives - 1;
        if (newLives <= 0) {
          return { 
            lives: 0, 
            phase: "ended",
            combo: 0,
            comboTimer: 0
          };
        }
        return { 
          lives: newLives,
          combo: 0,
          comboTimer: 0
        };
      });
    },

    nextLevel: () => {
      set((state) => ({
        level: state.level + 1,
        gameSpeed: Math.min(2.5, 1 + state.level * 0.15)
      }));
    },

    resetGame: () => {
      set(() => ({
        score: 0,
        level: 1,
        lives: 3,
        gameSpeed: 1,
        combo: 0,
        comboTimer: 0,
        cheatMode: false,
        activeCheatEffects: {
          godMode: false,
          slowMotion: false,
          doubleScore: false,
          superSpeed: false,
          rainbowMode: false,
          bigPlayer: false,
          tinyPlayer: false,
          infiniteLives: false,
          noObstacles: false,
          autoCollect: false,
          extraLives: false,
          tripleScore: false,
          maxSpeed: false,
          gigaPlayer: false,
          microPlayer: false,
          allPowerUps: false,
          scoreBoost: false,
          timeFreeze: false,
        },
        activePowerUps: {
          shield: 0,
          speed: 0,
          magnet: 0
        }
      }));
    },

    addCombo: () => {
      set((state) => ({
        combo: state.combo + 1,
        comboTimer: 180 // 3 seconds at 60fps
      }));
    },

    resetCombo: () => {
      set(() => ({
        combo: 0,
        comboTimer: 0
      }));
    },

    updateCombo: () => {
      set((state) => {
        if (state.comboTimer > 0) {
          const newTimer = state.comboTimer - 1;
          if (newTimer <= 0) {
            return { combo: 0, comboTimer: 0 };
          }
          return { comboTimer: newTimer };
        }
        return {};
      });
    },

    activatePowerUp: (type: 'shield' | 'speed' | 'magnet') => {
      set((state) => {
        // Shield lasts 5 seconds, others last 8 seconds
        const duration = type === 'shield' ? 300 : 480; // 5 seconds = 300 frames, 8 seconds = 480 frames at 60fps
        
        return {
          activePowerUps: {
            ...state.activePowerUps,
            [type]: duration
          }
        };
      });
    },

    updatePowerUps: () => {
      set((state) => {
        const newPowerUps = { ...state.activePowerUps };
        let changed = false;

        Object.keys(newPowerUps).forEach(key => {
          const typedKey = key as keyof typeof newPowerUps;
          if (newPowerUps[typedKey] > 0) {
            newPowerUps[typedKey] = Math.max(0, newPowerUps[typedKey] - 1);
            changed = true;
          }
        });

        return changed ? { activePowerUps: newPowerUps } : {};
      });
    },

    enableCheatMode: () => {
      set(() => ({ cheatMode: true }));
    },

    disableCheatMode: () => {
      set(() => ({ cheatMode: false }));
    },

    activateCheatEffect: (effect: keyof GameState['activeCheatEffects']) => {
      set((state) => ({
        activeCheatEffects: {
          ...state.activeCheatEffects,
          [effect]: true
        }
      }));
    },

    deactivateCheatEffect: (effect: keyof GameState['activeCheatEffects']) => {
      set((state) => ({
        activeCheatEffects: {
          ...state.activeCheatEffects,
          [effect]: false
        }
      }));
    },

    toggleCheatEffect: (effect: keyof GameState['activeCheatEffects']) => {
      set((state) => ({
        activeCheatEffects: {
          ...state.activeCheatEffects,
          [effect]: !state.activeCheatEffects[effect]
        }
      }));
    },

    clearAllCheats: () => {
      set(() => ({
        cheatMode: false,
        activeCheatEffects: {
          godMode: false,
          slowMotion: false,
          doubleScore: false,
          superSpeed: false,
          rainbowMode: false,
          bigPlayer: false,
          tinyPlayer: false,
          infiniteLives: false,
          noObstacles: false,
          autoCollect: false,
          extraLives: false,
          tripleScore: false,
          maxSpeed: false,
          gigaPlayer: false,
          microPlayer: false,
          allPowerUps: false,
          scoreBoost: false,
          timeFreeze: false,
        }
      }));
    },
    
    toggleJoystickMode: () => set((state) => ({ joystickMode: !state.joystickMode })),
    
    // Transition actions
    startTransition: (toPhase: GamePhase, transitionType: TransitionType = "fadeIn") => {
      set({ 
        isTransitioning: true, 
        transitionType,
        phase: "loading"
      });
      
      // Complete transition after animation duration
      setTimeout(() => {
        set({ 
          phase: toPhase, 
          isTransitioning: false,
          transitionType: "none"
        });
      }, 600); // 600ms transition duration
    },
    
    completeTransition: () => {
      set({ 
        isTransitioning: false,
        transitionType: "none"
      });
    },
    
    // Game stats tracking
    incrementCollectibles: () => {
      set((state) => ({
        gameStats: {
          ...state.gameStats,
          collectiblesCollected: state.gameStats.collectiblesCollected + 1
        }
      }));
    },
    
    incrementObstaclesAvoided: () => {
      set((state) => ({
        gameStats: {
          ...state.gameStats,
          obstaclesAvoided: state.gameStats.obstaclesAvoided + 1
        }
      }));
    },
    
    updateTimePlayed: () => {
      set((state) => {
        const now = Date.now();
        const timePlayed = state.gameStats.startTime > 0 ? 
          (now - state.gameStats.startTime) / 1000 : 0;
        return {
          gameStats: {
            ...state.gameStats,
            timePlayed
          }
        };
      });
    },
    
    startGameTimer: () => {
      set((state) => ({
        gameStats: {
          ...state.gameStats,
          startTime: Date.now()
        }
      }));
    },
  }))
);