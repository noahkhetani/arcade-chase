import { Player } from "./Player";
import { Collectible } from "./Collectible";
import { Obstacle } from "./Obstacle";
import { PowerUp, PowerUpType } from "./PowerUp";
import { ParticleSystem } from "./ParticleSystem";
import { ScreenShake } from "./ScreenShake";
import { checkCollision, randomInRange, distance, GAME_CONFIG } from "../utils/gameUtils";

export class GameEngine {
  player: Player;
  collectibles: Collectible[];
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  particles: ParticleSystem;
  screenShake: ScreenShake;
  canvasWidth: number;
  canvasHeight: number;
  lastSpawnTime: number;
  lastObstacleSpawn: number;
  lastPowerUpSpawn: number;
  backgroundStars: Array<{x: number, y: number, size: number, speed: number, alpha: number}> = [];
  comboMultiplier: number = 1;
  comboTimer: number = 0;
  lastCollectionTime: number = 0;
  
  // Callbacks for stats tracking
  onCollectibleCollected?: () => void;
  onObstacleAvoided?: () => void;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.player = new Player(canvasWidth / 2, canvasHeight / 2);
    this.collectibles = [];
    this.obstacles = [];
    this.powerUps = [];
    this.particles = new ParticleSystem();
    this.screenShake = new ScreenShake();
    this.lastSpawnTime = 0;
    this.lastObstacleSpawn = 0;
    this.lastPowerUpSpawn = 0;
    this.backgroundStars = [];
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.lastCollectionTime = 0;
    
    // Initialize background stars
    this.initBackgroundStars();
    
    // Spawn initial collectibles with harder spacing
    this.spawnInitialCollectibles();
  }

  initBackgroundStars() {
    for (let i = 0; i < 150; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random() * 0.8 + 0.2
      });
    }
  }

  spawnInitialCollectibles() {
    // Start with fewer collectibles to increase difficulty
    for (let i = 0; i < 3; i++) {
      this.spawnCollectible();
    }
  }

  spawnCollectible() {
    let x, y;
    let attempts = 0;
    
    do {
      x = randomInRange(30, this.canvasWidth - 30);
      y = randomInRange(30, this.canvasHeight - 30);
      attempts++;
    } while (
      attempts < 50 && 
      checkCollision(this.player.position, { x, y }, this.player.size, GAME_CONFIG.COLLECTIBLE_SIZE)
    );
    
    this.collectibles.push(new Collectible(x, y));
  }

  spawnObstacle(gameSpeed: number) {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;
    
    const speed = randomInRange(1, 3) * gameSpeed;
    
    switch (side) {
      case 0: // Top
        x = randomInRange(0, this.canvasWidth);
        y = -GAME_CONFIG.OBSTACLE_SIZE;
        vx = randomInRange(-1, 1);
        vy = speed;
        break;
      case 1: // Right
        x = this.canvasWidth + GAME_CONFIG.OBSTACLE_SIZE;
        y = randomInRange(0, this.canvasHeight);
        vx = -speed;
        vy = randomInRange(-1, 1);
        break;
      case 2: // Bottom
        x = randomInRange(0, this.canvasWidth);
        y = this.canvasHeight + GAME_CONFIG.OBSTACLE_SIZE;
        vx = randomInRange(-1, 1);
        vy = -speed;
        break;
      case 3: // Left
        x = -GAME_CONFIG.OBSTACLE_SIZE;
        y = randomInRange(0, this.canvasHeight);
        vx = speed;
        vy = randomInRange(-1, 1);
        break;
      default:
        x = 0;
        y = 0;
        vx = 0;
        vy = 0;
    }
    
    this.obstacles.push(new Obstacle(x, y, vx, vy));
  }

  spawnPowerUp() {
    let x, y;
    let attempts = 0;
    
    do {
      x = randomInRange(50, this.canvasWidth - 50);
      y = randomInRange(50, this.canvasHeight - 50);
      attempts++;
    } while (
      attempts < 50 && 
      checkCollision(this.player.position, { x, y }, this.player.size, GAME_CONFIG.COLLECTIBLE_SIZE + 4)
    );
    
    const powerUpTypes: PowerUpType[] = ['shield', 'speed', 'magnet'];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    this.powerUps.push(new PowerUp(x, y, randomType));
  }

  update(input: { left: boolean; right: boolean; up: boolean; down: boolean }, gameSpeed: number, level: number, activePowerUps: any, magnetActive: boolean = false, cheatEffects?: any, onMove?: () => void): { scoreGained: number; hit: boolean; collected: number; powerUpCollected?: string; comboMultiplier?: number; comboTimer?: number } {
    let scoreGained = 0;
    let hit = false;
    let collected = 0;
    let powerUpCollected: string | undefined;
    
    // Dynamic difficulty scaling based on level
    const difficultyMultiplier = 1 + (level * GAME_CONFIG.DIFFICULTY_SCALING.LEVEL_MULTIPLIER * 0.1);
    const scaledObstacleSpawnRate = GAME_CONFIG.OBSTACLE_SPAWN_RATE * (1 + level * GAME_CONFIG.DIFFICULTY_SCALING.SPAWN_RATE_INCREASE);
    const scaledCollectibleSpawnRate = GAME_CONFIG.BASE_SPAWN_RATE * (1 + level * GAME_CONFIG.DIFFICULTY_SCALING.SPAWN_RATE_INCREASE * 0.5);
    
    // Apply cheat effects
    const safeCheatEffects = cheatEffects || {};
    
    // Update player shield status and speed boost
    this.player.shieldActive = activePowerUps.shield > 0 || safeCheatEffects.godMode;
    
    // Debug god mode shield
    if (safeCheatEffects.godMode) {
      console.log('God mode setting shield active:', this.player.shieldActive);
    }
    let speedBoost = 1;
    
    // Apply speed boost from power-ups or cheats
    if (activePowerUps.speed > 0) speedBoost = 1.8;
    if (safeCheatEffects.maxSpeed) speedBoost = 2.5;
    else if (safeCheatEffects.superSpeed) speedBoost = 2;
    
    // Apply player size effects
    let baseSize = 15; // Default size
    if (safeCheatEffects.gigaPlayer) {
      this.player.size = baseSize * 3;
    } else if (safeCheatEffects.bigPlayer) {
      this.player.size = baseSize * 2;
    } else if (safeCheatEffects.tinyPlayer) {
      this.player.size = baseSize * 0.5;
    } else if (safeCheatEffects.microPlayer) {
      this.player.size = baseSize * 0.25;
    } else {
      this.player.size = baseSize;
    }
    
    // Update player with movement callback
    this.player.update(input, gameSpeed, this.canvasWidth, this.canvasHeight, speedBoost, safeCheatEffects, onMove);
    
    // Update collectibles
    for (const collectible of this.collectibles) {
      collectible.update();
      
      // Check if any magnet effect should be active
      const hasAnyMagnetEffect = magnetActive || safeCheatEffects.autoCollect;
      
      // Magnet effect - attract collectibles to player
      if (hasAnyMagnetEffect) {
        const magnetRange = safeCheatEffects.autoCollect ? 200 : 120;
        const distanceToPlayer = distance(this.player.position, collectible.position);
        
        if (distanceToPlayer < magnetRange) {
          const dx = this.player.position.x - collectible.position.x;
          const dy = this.player.position.y - collectible.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const pullStrength = safeCheatEffects.autoCollect ? 6 : (magnetActive ? 3 : 2);
            collectible.position.x += (dx / dist) * pullStrength;
            collectible.position.y += (dy / dist) * pullStrength;
          }
        }
      }
    }
    
    // Update power-ups
    for (const powerUp of this.powerUps) {
      powerUp.update();
    }
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(this.canvasWidth, this.canvasHeight);
      
      // Remove obstacles that are too far off screen
      if (obstacle.position.x < -100 || obstacle.position.x > this.canvasWidth + 100 ||
          obstacle.position.y < -100 || obstacle.position.y > this.canvasHeight + 100) {
        this.obstacles.splice(i, 1);
        
        // Track obstacle avoidance for stats (only count obstacles that went off-screen naturally)
        if (this.onObstacleAvoided && obstacle.position.y > this.canvasHeight) {
          this.onObstacleAvoided();
        }
      }
    }
    
    // Update particles
    this.particles.update();
    
    // Update screen shake
    this.screenShake.update();
    
    // Check collectible collisions
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      if (checkCollision(this.player.position, collectible.position, this.player.size, collectible.size)) {
        let points = collectible.value;
        
        // Apply score cheat effects
        if (safeCheatEffects.tripleScore) {
          points *= 3;
        } else if (safeCheatEffects.doubleScore) {
          points *= 2;
        }
        
        if (safeCheatEffects.scoreBoost) {
          points = Math.floor(points * 1.5);
        }
        
        scoreGained += points;
        collected++;
        
        // Create enhanced collection particle effect with rainbow colors if cheat is active
        const effectColor = safeCheatEffects.rainbowMode 
          ? `hsl(${Date.now() % 360}, 100%, 50%)`
          : GAME_CONFIG.COLORS.SUCCESS;
          
        this.particles.createCollectionBurst(
          collectible.position.x,
          collectible.position.y,
          effectColor
        );
        
        this.collectibles.splice(i, 1);
        this.spawnCollectible();
        
        // Track collectible collection for stats
        if (this.onCollectibleCollected) {
          this.onCollectibleCollected();
        }
      }
    }
    
    // Check power-up collisions
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (checkCollision(this.player.position, powerUp.position, this.player.size, powerUp.size)) {
        powerUpCollected = powerUp.type;
        
        // Create power-up collection particle effect
        this.particles.createPowerUpEffect(
          powerUp.position.x,
          powerUp.position.y,
          powerUp.color
        );
        
        this.powerUps.splice(i, 1);
      }
    }
    
    // Check obstacle collisions with invulnerability frames
    const isInvulnerable = safeCheatEffects.godMode || safeCheatEffects.noObstacles || this.player.shieldActive || this.player.invulnerabilityFrames > 0;
    
    if (!isInvulnerable) {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obstacle = this.obstacles[i];
        if (checkCollision(this.player.position, obstacle.position, this.player.size, obstacle.size)) {
          hit = true;
          
          // Add invulnerability frames to prevent multiple hits
          this.player.invulnerabilityFrames = 60; // 1 second at 60fps
          
          // Remove the obstacle that was hit
          this.obstacles.splice(i, 1);
          
          // Start screen shake effect
          this.screenShake.start(8, 300);
          
          // Create hit particle effect
          this.particles.createExplosion(
            obstacle.position.x,
            obstacle.position.y,
            GAME_CONFIG.COLORS.PRIMARY,
            12
          );
          break; // Only process one collision per frame
        }
      }
    }
    
    // Advanced spawning system with difficulty scaling
    const now = Date.now();
    const maxCollectibles = Math.min(GAME_CONFIG.DIFFICULTY_SCALING.MAX_COLLECTIBLES, 6 + Math.floor(level / 3));
    const maxObstacles = Math.min(GAME_CONFIG.DIFFICULTY_SCALING.MAX_OBSTACLES, 8 + Math.floor(level / 2));
    
    // Dynamic spawn intervals based on level
    const collectibleSpawnInterval = Math.max(1200, 2800 - (level * 150));
    const obstacleSpawnInterval = Math.max(800, 2200 - (level * 180));
    
    // Spawn collectibles with increased frequency
    if (now - this.lastSpawnTime > collectibleSpawnInterval && this.collectibles.length < maxCollectibles) {
      if (Math.random() < scaledCollectibleSpawnRate) {
        this.spawnCollectible();
        this.lastSpawnTime = now;
      }
    }
    
    // Spawn obstacles with aggressive scaling (skip if no obstacles cheat is active)
    if (!safeCheatEffects.noObstacles && this.obstacles.length < maxObstacles) {
      if (now - this.lastObstacleSpawn > obstacleSpawnInterval && Math.random() < scaledObstacleSpawnRate) {
        this.spawnObstacle(gameSpeed * difficultyMultiplier);
        this.lastObstacleSpawn = now;
      }
    }
    
    // Spawn power-ups less frequently to increase difficulty
    const powerUpSpawnInterval = Math.max(12000, 20000 - (level * 400));
    if (now - this.lastPowerUpSpawn > powerUpSpawnInterval && this.powerUps.length < 2 && Math.random() < GAME_CONFIG.POWERUP_SPAWN_RATE) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = now;
    }
    
    return { 
      scoreGained, 
      hit, 
      collected, 
      powerUpCollected, 
      comboMultiplier: this.comboMultiplier,
      comboTimer: this.comboTimer 
    };
  }

  render(ctx: CanvasRenderingContext2D, cheatEffects?: any) {
    // Create animated starfield background
    const time = Date.now() * 0.001;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, GAME_CONFIG.COLORS.BACKGROUND);
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Animated stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % this.canvasWidth;
      const y = (i * 71) % this.canvasHeight;
      const twinkle = Math.sin(time * 2 + i * 0.5) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle * 0.6 + 0.2;
      const size = Math.sin(i) * 1.5 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // Moving grid pattern
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    const offset = (time * 20) % gridSize;
    
    for (let x = -offset; x <= this.canvasWidth + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }
    
    for (let y = -offset; y <= this.canvasHeight + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
    // Apply screen shake offset
    const shakeOffset = this.screenShake.getOffset();
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);
    
    // Render particles (behind everything)
    this.particles.render(ctx);
    
    // Render collectibles
    for (const collectible of this.collectibles) {
      collectible.render(ctx);
    }
    
    // Render power-ups
    for (const powerUp of this.powerUps) {
      powerUp.render(ctx);
    }
    
    // Render obstacles
    for (const obstacle of this.obstacles) {
      obstacle.render(ctx);
    }
    
    // Render player (on top)
    this.player.render(ctx, cheatEffects);
    
    ctx.restore();
  }

  resize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    
    // Keep player in bounds after resize
    this.player.position.x = Math.min(this.player.position.x, width - this.player.size / 2);
    this.player.position.y = Math.min(this.player.position.y, height - this.player.size / 2);
  }
}
