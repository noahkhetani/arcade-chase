import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  Vibration,
  AppState,
  AsyncStorage
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = SCREEN_WIDTH;
const GAME_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function App() {
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, ended
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, invulnerable: false });
  const [collectibles, setCollectibles] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [cheatMode, setCheatMode] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [showFPS, setShowFPS] = useState(false);
  const [fps, setFps] = useState(0);
  
  const gameLoopRef = useRef();
  const lastSpawnRef = useRef(0);
  const lastFpsRef = useRef(0);
  const frameCountRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });

  // Load saved data
  useEffect(() => {
    loadGameData();
    lockOrientation();
    
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' && gameState === 'playing') {
        setGameState('paused');
      }
    };
    
    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, []);

  const lockOrientation = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  };

  const loadGameData = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem('highScore');
      if (savedHighScore) setHighScore(parseInt(savedHighScore));
    } catch (error) {
      console.log('Failed to load game data');
    }
  };

  const saveHighScore = async (newScore) => {
    try {
      if (newScore > highScore) {
        setHighScore(newScore);
        await AsyncStorage.setItem('highScore', newScore.toString());
      }
    } catch (error) {
      console.log('Failed to save high score');
    }
  };

  // Initialize game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameSpeed(1);
    setCombo(0);
    setActivePowerUp(null);
    setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, invulnerable: false });
    setCollectibles([]);
    setObstacles([]);
    setPowerUps([]);
    velocityRef.current = { x: 0, y: 0 };
    gameLoop();
  }, []);

  const pauseGame = () => {
    setGameState('paused');
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
  };

  const resumeGame = () => {
    setGameState('playing');
    gameLoop();
  };

  // Enhanced game loop with better performance
  const gameLoop = useCallback(() => {
    const now = Date.now();
    
    // FPS calculation
    frameCountRef.current++;
    if (now - lastFpsRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsRef.current = now;
    }
    
    // Dynamic spawn rate based on level
    const spawnRate = Math.max(1000, 2500 - (level * 200));
    if (now - lastSpawnRef.current > spawnRate) {
      spawnItems();
      lastSpawnRef.current = now;
    }
    
    // Update game difficulty
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setGameSpeed(1 + (newLevel - 1) * 0.2);
    }
    
    // Update items with enhanced physics
    updateItems();
    
    // Smooth player movement
    updatePlayerMovement();
    
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame ? requestAnimationFrame(gameLoop) : setTimeout(gameLoop, 16); // 60 FPS
    }
  }, [gameState, level, score]);

  const updatePlayerMovement = () => {
    // Apply velocity-based movement for smoother controls
    if (Math.abs(velocityRef.current.x) > 0.1 || Math.abs(velocityRef.current.y) > 0.1) {
      setPlayer(prev => ({
        x: Math.max(20, Math.min(GAME_WIDTH - 20, prev.x + velocityRef.current.x)),
        y: Math.max(20, Math.min(GAME_HEIGHT - 20, prev.y + velocityRef.current.y))
      }));
      
      // Apply friction
      velocityRef.current.x *= 0.85;
      velocityRef.current.y *= 0.85;
    }
  };

  const spawnItems = () => {
    const random = Math.random();
    
    // Spawn collectibles more frequently
    if (random < 0.7) {
      setCollectibles(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * (GAME_WIDTH - 40) + 20,
        y: -20,
        type: 'collectible',
        value: 10 + (level * 5),
        size: 15 + Math.random() * 10
      }]);
    }
    
    // Spawn obstacles less frequently at higher levels
    if (random < 0.4 + (level * 0.1)) {
      setObstacles(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * (GAME_WIDTH - 50) + 25,
        y: -20,
        type: 'obstacle',
        speed: 2 + (level * 0.5),
        rotation: 0
      }]);
    }
    
    // Spawn power-ups occasionally
    if (random > 0.95) {
      const powerUpTypes = ['shield', 'magnet', 'double'];
      setPowerUps(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * (GAME_WIDTH - 40) + 20,
        y: -20,
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        rotation: 0
      }]);
    }
  };

  const updateItems = () => {
    const baseSpeed = 2 * gameSpeed;
    
    // Move collectibles down with magnetic effect
    setCollectibles(prev => prev
      .map(item => {
        let newY = item.y + baseSpeed;
        let newX = item.x;
        
        // Magnetic power-up effect
        if (activePowerUp === 'magnet') {
          const dx = player.x - item.x;
          const dy = player.y - item.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80) {
            newX += (dx / distance) * 3;
            newY += (dy / distance) * 3;
          }
        }
        
        return { ...item, y: newY, x: newX, rotation: (item.rotation || 0) + 2 };
      })
      .filter(item => item.y < GAME_HEIGHT + 50)
    );
    
    // Move obstacles down with rotation
    setObstacles(prev => prev
      .map(item => ({ 
        ...item, 
        y: item.y + (item.speed || baseSpeed), 
        rotation: (item.rotation || 0) + 3 
      }))
      .filter(item => item.y < GAME_HEIGHT + 50)
    );
    
    // Move power-ups down
    setPowerUps(prev => prev
      .map(item => ({ 
        ...item, 
        y: item.y + baseSpeed * 0.8, 
        rotation: (item.rotation || 0) + 5 
      }))
      .filter(item => item.y < GAME_HEIGHT + 50)
    );
    
    // Check collisions
    checkCollisions();
  };

  const checkCollisions = () => {
    const playerRadius = cheatMode ? 40 : 20;
    
    // Check collectible collisions
    setCollectibles(prev => {
      const remaining = [];
      let pointsGained = 0;
      let comboIncrease = 0;
      
      prev.forEach(collectible => {
        const distance = Math.sqrt(
          Math.pow(player.x - collectible.x, 2) + 
          Math.pow(player.y - collectible.y, 2)
        );
        
        if (distance < (collectible.size || 15) + playerRadius) {
          const points = (collectible.value || 10) * (activePowerUp === 'double' ? 2 : 1);
          pointsGained += points;
          comboIncrease++;
          Vibration.vibrate(50);
        } else {
          remaining.push(collectible);
        }
      });
      
      if (pointsGained > 0) {
        setScore(prev => prev + pointsGained);
        setCombo(prev => prev + comboIncrease);
      }
      
      return remaining;
    });
    
    // Check power-up collisions
    setPowerUps(prev => {
      const remaining = [];
      
      prev.forEach(powerUp => {
        const distance = Math.sqrt(
          Math.pow(player.x - powerUp.x, 2) + 
          Math.pow(player.y - powerUp.y, 2)
        );
        
        if (distance < 25 + playerRadius) {
          activatePowerUp(powerUp.type);
          Vibration.vibrate([100, 50, 100]);
        } else {
          remaining.push(powerUp);
        }
      });
      
      return remaining;
    });
    
    // Check obstacle collisions with invulnerability frames
    if (!cheatMode && activePowerUp !== 'shield' && !player.invulnerable) {
      setObstacles(prev => {
        const remaining = [];
        let hitDetected = false;
        
        prev.forEach(obstacle => {
          const distance = Math.sqrt(
            Math.pow(player.x - obstacle.x, 2) + 
            Math.pow(player.y - obstacle.y, 2)
          );
          
          if (distance < 25 + playerRadius && !hitDetected) {
            hitDetected = true;
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                endGame();
              }
              return newLives;
            });
            setCombo(0); // Reset combo on hit
            
            // Add invulnerability frames
            setPlayer(prev => ({ ...prev, invulnerable: true }));
            setTimeout(() => {
              setPlayer(prev => ({ ...prev, invulnerable: false }));
            }, 1000); // 1 second of invulnerability
            
            Vibration.vibrate([200, 100, 200]);
          } else {
            remaining.push(obstacle);
          }
        });
        
        return remaining;
      });
    }
  };

  const activatePowerUp = (type) => {
    setActivePowerUp(type);
    setTimeout(() => setActivePowerUp(null), type === 'shield' ? 5000 : 8000);
  };

  const endGame = async () => {
    setGameState('ended');
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    await saveHighScore(score);
  };

  // Enhanced pan responder with velocity
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => gameState === 'playing',
    onPanResponderGrant: () => {
      velocityRef.current = { x: 0, y: 0 };
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gameState === 'playing') {
        const sensitivity = cheatMode ? 1.5 : 1;
        velocityRef.current.x = gestureState.dx * 0.1 * sensitivity;
        velocityRef.current.y = gestureState.dy * 0.1 * sensitivity;
      }
    },
    onPanResponderRelease: () => {
      // Keep some momentum
      velocityRef.current.x *= 0.5;
      velocityRef.current.y *= 0.5;
    },
  });

  // Enhanced cheat code system
  const activateCheatCode = () => {
    Alert.prompt(
      '🔒 Secret Access',
      'Enter the sacred numbers:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unlock',
          onPress: (passcode) => {
            if (passcode === '7456660641') {
              setCheatMode(true);
              setShowFPS(true);
              Alert.alert(
                '🎮 GOD MODE ACTIVATED',
                'Invincibility enabled!\nExtra features unlocked!\nFPS counter enabled!',
                [{ text: 'Epic!', style: 'default' }]
              );
              Vibration.vibrate([100, 50, 100, 50, 200]);
            } else if (passcode !== null && passcode !== '') {
              Alert.alert('❌ Access Denied', 'Invalid passcode sequence');
              Vibration.vibrate(500);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Arcade Collector</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Score: {score.toLocaleString()}</Text>
          <Text style={styles.statText}>Level: {level}</Text>
          <Text style={styles.statText}>Lives: {lives}</Text>
          {combo > 1 && <Text style={styles.comboText}>Combo x{combo}</Text>}
          {cheatMode && <Text style={styles.cheatText}>⚡ GOD MODE</Text>}
          {activePowerUp && <Text style={styles.powerUpText}>🔋 {activePowerUp.toUpperCase()}</Text>}
          {showFPS && <Text style={styles.fpsText}>FPS: {fps}</Text>}
        </View>
      </View>

      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {gameState === 'ready' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>🎮 Arcade Collector</Text>
            <Text style={styles.highScoreText}>High Score: {highScore.toLocaleString()}</Text>
            <Text style={styles.instructions}>
              🎯 Drag to move your character{'\n'}
              💎 Collect blue gems for points{'\n'}
              ⚠️ Avoid red obstacles{'\n'}
              🔋 Grab power-ups for bonuses
            </Text>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>🚀 START GAME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cheatButton} onPress={activateCheatCode}>
              <Text style={styles.cheatButtonText}>🔓 SECRET ACCESS</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'paused' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>⏸️ Game Paused</Text>
            <Text style={styles.instructions}>Game paused while app was in background</Text>
            <TouchableOpacity style={styles.button} onPress={resumeGame}>
              <Text style={styles.buttonText}>▶️ RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={startGame}>
              <Text style={styles.buttonText}>🔄 RESTART</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'ended' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>💀 Game Over</Text>
            <Text style={styles.finalScore}>Final Score: {score.toLocaleString()}</Text>
            <Text style={styles.levelText}>Reached Level: {level}</Text>
            {score > highScore && <Text style={styles.newRecordText}>🎉 NEW HIGH SCORE! 🎉</Text>}
            <Text style={styles.highScoreText}>Best: {Math.max(score, highScore).toLocaleString()}</Text>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>🎮 PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Player with enhanced visuals */}
        <View
          style={[
            styles.player,
            {
              left: player.x - (cheatMode ? 25 : 15),
              top: player.y - (cheatMode ? 25 : 15),
              width: cheatMode ? 50 : 30,
              height: cheatMode ? 50 : 30,
              borderRadius: cheatMode ? 25 : 15,
              backgroundColor: cheatMode ? '#FFD700' : 
                            activePowerUp === 'shield' ? '#00FF00' :
                            activePowerUp === 'magnet' ? '#FF00FF' :
                            activePowerUp === 'double' ? '#FF8800' : '#00FFFF',
              shadowOpacity: cheatMode ? 0.8 : 0.5,
              opacity: player.invulnerable ? 0.5 : 1.0,
            }
          ]}
        >
          {activePowerUp && (
            <View style={styles.powerUpEffect} />
          )}
        </View>

        {/* Collectibles with enhanced visuals */}
        {collectibles.map(item => (
          <View
            key={item.id}
            style={[
              styles.collectible,
              { 
                left: item.x - (item.size || 15) / 2, 
                top: item.y - (item.size || 15) / 2,
                width: item.size || 15,
                height: item.size || 15,
                borderRadius: (item.size || 15) / 2,
                transform: [{ rotate: `${item.rotation || 0}deg` }]
              }
            ]}
          />
        ))}

        {/* Power-ups */}
        {powerUps.map(item => (
          <View
            key={item.id}
            style={[
              styles.powerUp,
              { 
                left: item.x - 15, 
                top: item.y - 15,
                backgroundColor: item.type === 'shield' ? '#00FF00' :
                               item.type === 'magnet' ? '#FF00FF' : '#FF8800',
                transform: [{ rotate: `${item.rotation || 0}deg` }]
              }
            ]}
          />
        ))}

        {/* Obstacles with rotation */}
        {obstacles.map(item => (
          <View
            key={item.id}
            style={[
              styles.obstacle,
              { 
                left: item.x - 12.5, 
                top: item.y - 12.5,
                transform: [{ rotate: `${item.rotation || 0}deg` }]
              }
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cheatText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  comboText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  powerUpText: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  fpsText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
  highScoreText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  levelText: {
    color: '#00FFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  newRecordText: {
    color: '#FF6B35',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: '#7F8C8D',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#34495E',
    margin: 10,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  finalScore: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#00FFFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: '#2C3E50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cheatButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cheatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  player: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00FFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.5,
    elevation: 5,
  },
  powerUpEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    top: '-10%',
    left: '-10%',
    opacity: 0.6,
  },
  collectible: {
    position: 'absolute',
    backgroundColor: '#3498DB',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
    elevation: 4,
  },
  powerUp: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.8,
    elevation: 6,
  },
  obstacle: {
    position: 'absolute',
    width: 25,
    height: 25,
    backgroundColor: '#E74C3C',
    transform: [{ rotate: '45deg' }],
  },
});