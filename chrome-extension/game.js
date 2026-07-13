// arcade collector game - chrome extension version
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class Player {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.size = 20;
        this.speed = 5;
        this.color = '#4ECDC4';
    }

    update(input, canvasWidth, canvasHeight, speedMultiplier = 1) {
        const effectiveSpeed = this.speed * speedMultiplier;
        
        if (input.left && this.position.x > this.size / 2) {
            this.position.x -= effectiveSpeed;
        }
        if (input.right && this.position.x < canvasWidth - this.size / 2) {
            this.position.x += effectiveSpeed;
        }
        if (input.up && this.position.y > this.size / 2) {
            this.position.y -= effectiveSpeed;
        }
        if (input.down && this.position.y < canvasHeight - this.size / 2) {
            this.position.y += effectiveSpeed;
        }
    }

    render(ctx, cheatEffects) {
        ctx.save();
        
        // Apply rainbow mode colors
        let playerColor = this.color;
        if (cheatEffects && cheatEffects.rainbowMode) {
            const hue = (Date.now() * 0.3) % 360;
            playerColor = `hsl(${hue}, 100%, 60%)`;
        }
        
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Collectible {
    constructor(x, y, value = 15) {
        this.position = new Vector2(x, y);
        this.size = 12;
        this.originalSize = this.size;
        this.value = value;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.type = 'common';
        this.glowIntensity = 0.4;
        
        // Enhanced rarity system - more rare/epic items, better rewards
        const rarity = Math.random();
        if (rarity < 0.4) {
            // Common (40%)
            this.color = '#4ECDC4'; // Cyan
            this.value = 15;
            this.type = 'common';
        } else if (rarity < 0.8) {
            // Rare (40%)
            this.color = '#9B59B6'; // Purple
            this.value = 50;
            this.type = 'rare';
            this.size = 15;
            this.originalSize = 15;
        } else {
            // Epic (20%)
            this.color = '#FFD700'; // Gold
            this.value = 125;
            this.type = 'epic';
            this.size = 18;
            this.originalSize = 18;
        }
    }

    update() {
        const pulseSpeed = this.type === 'epic' ? 0.15 : this.type === 'rare' ? 0.12 : 0.1;
        this.pulsePhase += pulseSpeed;
        
        const pulseIntensity = this.type === 'epic' ? 4 : this.type === 'rare' ? 3 : 2;
        this.size = this.originalSize + Math.sin(this.pulsePhase) * pulseIntensity;
        
        this.glowIntensity = (Math.sin(this.pulsePhase * 2) + 1) * 0.5;
        if (this.type === 'epic') this.glowIntensity *= 1.5;
        else if (this.type === 'rare') this.glowIntensity *= 1.2;
    }

    render(ctx, cheatEffects) {
        ctx.save();
        
        // Apply rainbow mode colors
        let collectibleColor = this.color;
        if (cheatEffects && cheatEffects.rainbowMode) {
            const hue = (Date.now() * 0.4 + this.position.x * 0.2) % 360;
            collectibleColor = `hsl(${hue}, 90%, 60%)`;
        }
        
        // Enhanced glow effects for different rarities
        const baseGlow = this.type === 'epic' ? 35 : this.type === 'rare' ? 25 : 20;
        const glowRadius = baseGlow + (this.glowIntensity * 15);
        
        // Create multiple glow layers for enhanced effect
        for (let i = 3; i >= 1; i--) {
            ctx.shadowBlur = glowRadius * i;
            ctx.shadowColor = collectibleColor;
            ctx.globalAlpha = 0.3 / i;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Main collectible with enhanced brightness
        ctx.shadowBlur = glowRadius;
        ctx.shadowColor = collectibleColor;
        ctx.globalAlpha = 1;
        ctx.fillStyle = collectibleColor;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Enhanced sparkle effects
        if (this.type === 'epic') {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = this.glowIntensity;
            for (let i = 0; i < 8; i++) {
                const angle = (this.pulsePhase + i * Math.PI / 4);
                const distance = this.size * 0.8;
                const sparkleX = this.position.x + Math.cos(angle) * distance;
                const sparkleY = this.position.y + Math.sin(angle) * distance;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'rare') {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = this.glowIntensity;
            for (let i = 0; i < 6; i++) {
                const angle = (this.pulsePhase + i * Math.PI / 3);
                const distance = this.size * 0.7;
                const sparkleX = this.position.x + Math.cos(angle) * distance;
                const sparkleY = this.position.y + Math.sin(angle) * distance;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}

class Obstacle {
    constructor(x, y, vx = 0, vy = 0) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.size = 30; // Make them bigger and more visible
        this.color = '#FF4444'; // Brighter red color
        this.rotation = 0;
        this.rotationSpeed = 0.15; // Increased from 0.08 to 0.15 for faster spinning
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.originalSize = this.size;
    }

    update(canvasWidth, canvasHeight) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        
        // Add pulsing animation
        this.pulsePhase += 0.1;
        this.size = this.originalSize + Math.sin(this.pulsePhase) * 3;

        // Bounce off walls
        if (this.position.x <= this.size / 2 || this.position.x >= canvasWidth - this.size / 2) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.y <= this.size / 2 || this.position.y >= canvasHeight - this.size / 2) {
            this.velocity.y = -this.velocity.y;
        }
    }

    render(ctx, cheatEffects) {
        ctx.save();
        
        // Apply rainbow mode colors
        let obstacleColor = this.color;
        if (cheatEffects && cheatEffects.rainbowMode) {
            const hue = (Date.now() * 0.2 + this.position.x * 0.1) % 360;
            obstacleColor = `hsl(${hue}, 80%, 50%)`;
        }
        
        // Enhanced glow effect for obstacles
        ctx.shadowColor = obstacleColor;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.8;
        
        // Draw spiky obstacle shape for better visibility
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = obstacleColor;
        
        // Create spiky diamond shape
        ctx.beginPath();
        const spikes = 8;
        const innerRadius = this.size * 0.3;
        const outerRadius = this.size * 0.5;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Add inner core
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = new Player(canvas.width / 2, canvas.height / 2);
        this.collectibles = [];
        this.obstacles = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameState = 'start';
        this.highScore = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.lastCollectionTime = 0;
        this.lastObstacleSpawn = 0;
        
        // Cheat system
        this.cheatMode = false;
        this.cheatPrompt = false;
        this.cheatMenuOpen = false;
        this.activeCheatEffects = {
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
        };
        
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false
        };

        // Background stars for visual enhancement
        this.stars = [];
        this.initStars();

        this.setupInitialObjects();
        this.loadHighScore(); // This is now async but we don't need to await it
        this.bindEvents();
        
        // Start spawning obstacles immediately
        this.lastObstacleSpawn = Date.now();
    }

    initStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    updateStars() {
        this.stars.forEach(star => {
            star.phase += star.twinkleSpeed;
            star.opacity = 0.3 + Math.sin(star.phase) * 0.4;
        });
    }

    renderStars() {
        this.ctx.save();
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    async loadHighScore() {
        try {
            // Try Chrome extension storage first
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(['arcadeCollectorHighScore']);
                this.highScore = result.arcadeCollectorHighScore || 0;
            } else {
                // Fallback to localStorage
                const saved = localStorage.getItem('arcadeCollectorHighScore');
                this.highScore = saved ? parseInt(saved) : 0;
            }
        } catch (error) {
            // Fallback to localStorage if Chrome storage fails
            const saved = localStorage.getItem('arcadeCollectorHighScore');
            this.highScore = saved ? parseInt(saved) : 0;
        }
    }

    async saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            
            try {
                // Try Chrome extension storage first
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    await chrome.storage.local.set({ 
                        arcadeCollectorHighScore: this.highScore 
                    });
                } else {
                    // Fallback to localStorage
                    localStorage.setItem('arcadeCollectorHighScore', this.highScore.toString());
                }
            } catch (error) {
                // Fallback to localStorage if Chrome storage fails
                localStorage.setItem('arcadeCollectorHighScore', this.highScore.toString());
            }
        }
    }

    setupInitialObjects() {
        for (let i = 0; i < 8; i++) {
            this.spawnCollectible();
        }
        
        for (let i = 0; i < 3; i++) {
            this.spawnObstacle();
        }
    }

    spawnCollectible() {
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const y = Math.random() * (this.canvas.height - 60) + 30;
        this.collectibles.push(new Collectible(x, y));
    }

    spawnObstacle() {
        // Spawn obstacles directly on screen for debugging - they should be visible immediately
        const x = 100 + Math.random() * (this.canvas.width - 200);
        const y = 100 + Math.random() * (this.canvas.height - 200);
        const speed = 4.5; // Increased from 2 to 4.5 for faster movement
        const vx = (Math.random() - 0.5) * speed;
        const vy = (Math.random() - 0.5) * speed;

        const newObstacle = new Obstacle(x, y, vx, vy);
        this.obstacles.push(newObstacle);
        // Obstacle created successfully
    }

    checkCollision(obj1, obj2, size1, size2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (size1 + size2) / 2;
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Update background stars for visual enhancement
        this.updateStars();

        // Apply cheat effects to player speed
        let speedMultiplier = 1;
        if (this.activeCheatEffects.maxSpeed) speedMultiplier = 3;
        else if (this.activeCheatEffects.superSpeed) speedMultiplier = 2;
        else if (this.activeCheatEffects.slowMotion) speedMultiplier = 0.3;
        else if (this.activeCheatEffects.timeFreeze) speedMultiplier = 0.1;

        // Apply player size cheats
        let originalSize = this.player.size;
        if (this.activeCheatEffects.gigaPlayer) this.player.size = originalSize * 3;
        else if (this.activeCheatEffects.bigPlayer) this.player.size = originalSize * 2;
        else if (this.activeCheatEffects.tinyPlayer) this.player.size = originalSize * 0.5;
        else if (this.activeCheatEffects.microPlayer) this.player.size = originalSize * 0.25;

        this.player.update(this.input, this.canvas.width, this.canvas.height, speedMultiplier);
        
        // Update collectibles and obstacles with time effects
        this.collectibles.forEach(collectible => {
            collectible.update();
            
            // Auto-collect cheat
            if (this.activeCheatEffects.autoCollect) {
                const dx = this.player.position.x - collectible.position.x;
                const dy = this.player.position.y - collectible.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const pullStrength = 0.3;
                    collectible.position.x += dx * pullStrength;
                    collectible.position.y += dy * pullStrength;
                }
            }
        });

        // Update obstacles (unless disabled by cheat)
        if (!this.activeCheatEffects.noObstacles) {
            this.obstacles.forEach(obstacle => obstacle.update(this.canvas.width, this.canvas.height));
        } else {
            // If obstacles are disabled, clear them
            this.obstacles = [];
        }

        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (this.checkCollision(this.player.position, collectible.position, this.player.size, collectible.size)) {
                let points = collectible.value;
                
                // Apply combo multiplier
                const currentTime = Date.now();
                if (currentTime - this.lastCollectionTime < 1000) {
                    this.combo = Math.min(this.combo + 1, 4);
                } else {
                    this.combo = 1;
                }
                this.lastCollectionTime = currentTime;
                this.comboTimer = 3000;
                
                points *= this.combo;
                
                // Apply scoring cheat effects
                if (this.activeCheatEffects.tripleScore) points *= 3;
                else if (this.activeCheatEffects.doubleScore) points *= 2;
                else if (this.activeCheatEffects.scoreBoost) points *= 1.5;
                
                this.score += Math.floor(points);
                
                this.collectibles.splice(i, 1);
                this.spawnCollectible();
                
                if (this.score >= this.level * 500) {
                    this.level++;
                    if (this.obstacles.length < 8) {
                        this.spawnObstacle();
                    }
                }
            }
        }

        // Check obstacle collisions (with cheat protection)
        for (const obstacle of this.obstacles) {
            if (this.checkCollision(this.player.position, obstacle.position, this.player.size, obstacle.size)) {
                // Apply cheat protection
                if (this.activeCheatEffects.godMode || this.activeCheatEffects.infiniteLives) {
                    // No damage in god mode or infinite lives
                    break;
                } else if (this.activeCheatEffects.extraLives) {
                    // Gain life instead of losing it
                    this.lives++;
                    break;
                }
                
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                } else {
                    this.player.position.x = this.canvas.width / 2;
                    this.player.position.y = this.canvas.height / 2;
                }
                break;
            }
        }

        if (this.comboTimer > 0) {
            this.comboTimer -= 16;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            return obstacle.position.x > -50 && obstacle.position.x < this.canvas.width + 50 &&
                   obstacle.position.y > -50 && obstacle.position.y < this.canvas.height + 50;
        });

        // Spawn obstacles on a timer (like web version)
        if (Date.now() - this.lastObstacleSpawn > 1000 && this.obstacles.length < 6) {
            this.spawnObstacle();
            this.lastObstacleSpawn = Date.now();
        }
    }

    render() {
        // Apply rainbow background mode or default dark space background
        if (this.activeCheatEffects.rainbowMode) {
            const hue = (Date.now() * 0.05) % 360;
            this.ctx.fillStyle = `hsl(${hue}, 30%, 5%)`;
        } else {
            // Create gradient background like web version
            const gradient = this.ctx.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, 0,
                this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
            );
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#0a0a1a');
            this.ctx.fillStyle = gradient;
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render animated background stars
        this.renderStars();

        if (this.gameState !== 'playing' && this.gameState !== 'paused') return;

        // Pass cheat effects to all render calls
        this.collectibles.forEach(collectible => collectible.render(this.ctx, this.activeCheatEffects));
        
        // Render obstacles
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx, this.activeCheatEffects));
        
        this.player.render(this.ctx, this.activeCheatEffects);
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            // Handle cheat menu activation
            if (e.key === '8' && !this.cheatPrompt && this.gameState === 'playing') {
                this.cheatPrompt = true;
                const passcode = prompt('🔒 Enter passcode:');
                
                // Check passcode
                if (passcode === '7456660641') {
                    this.openCheatMenu();
                } else if (passcode !== null) {
                    alert('❌ Invalid passcode!');
                }
                
                this.cheatPrompt = false;
                return;
            }
            
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.up = true;
                    e.preventDefault();
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.down = true;
                    e.preventDefault();
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = true;
                    e.preventDefault();
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = true;
                    e.preventDefault();
                    break;
                case 'KeyP':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.up = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.down = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = false;
                    break;
            }
        });
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseIndicator').style.display = 'block';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseIndicator').style.display = 'none';
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 0;
        this.comboTimer = 0;
        
        this.player.position.x = this.canvas.width / 2;
        this.player.position.y = this.canvas.height / 2;
        
        this.collectibles = [];
        this.obstacles = [];
        this.setupInitialObjects();
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.saveHighScore();
        
        document.getElementById('finalScore').textContent = `Final Score: ${this.score.toLocaleString()}`;
        document.getElementById('highScore').textContent = `High Score: ${this.highScore.toLocaleString()}`;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score.toLocaleString()}`;
        document.getElementById('level').textContent = `Level: ${this.level}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
        
        const comboDisplay = document.getElementById('comboDisplay');
        if (this.combo > 1 && this.comboTimer > 0) {
            comboDisplay.style.display = 'block';
            document.getElementById('comboMultiplier').textContent = `x${this.combo}`;
        } else {
            comboDisplay.style.display = 'none';
        }
    }

    // Cheat system methods
    openCheatMenu() {
        this.cheatMenuOpen = true;
        this.createCheatMenuHTML();
    }

    closeCheatMenu() {
        this.cheatMenuOpen = false;
        const cheatMenu = document.getElementById('cheatMenu');
        if (cheatMenu) {
            cheatMenu.remove();
        }
    }

    toggleCheatEffect(effectKey) {
        this.activeCheatEffects[effectKey] = !this.activeCheatEffects[effectKey];
        this.cheatMode = true;
        
        // Apply special effects immediately
        if (effectKey === 'infiniteLives' && this.activeCheatEffects[effectKey]) {
            this.lives = 999;
        }
        if (effectKey === 'extraLives' && this.activeCheatEffects[effectKey]) {
            this.lives += 5;
        }
        
        this.updateCheatMenuDisplay();
    }

    clearAllCheats() {
        Object.keys(this.activeCheatEffects).forEach(key => {
            this.activeCheatEffects[key] = false;
        });
        this.cheatMode = false;
        this.updateCheatMenuDisplay();
    }

    createCheatMenuHTML() {
        if (document.getElementById('cheatMenu')) return;

        const cheatMenu = document.createElement('div');
        cheatMenu.id = 'cheatMenu';
        cheatMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;

        const cheatPanel = document.createElement('div');
        cheatPanel.style.cssText = `
            background: #2a2a2a;
            border: 2px solid #4ECDC4;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            max-height: 500px;
            overflow-y: auto;
            color: white;
        `;

        cheatPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #4ECDC4; margin: 0;">🎮 CHEAT MENU</h2>
                <button onclick="game.closeCheatMenu()" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✕</button>
            </div>
            <div id="cheatCategories"></div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="game.clearAllCheats()" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Clear All</button>
                <button onclick="game.closeCheatMenu()" style="background: #4ECDC4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;

        cheatMenu.appendChild(cheatPanel);
        document.body.appendChild(cheatMenu);

        this.createCheatCategories();
    }

    createCheatCategories() {
        const categoriesContainer = document.getElementById('cheatCategories');
        if (!categoriesContainer) return;

        const categories = [
            {
                title: "Movement & Speed",
                cheats: [
                    { key: 'superSpeed', name: 'Super Speed', desc: 'Lightning fast movement' },
                    { key: 'maxSpeed', name: 'Max Speed', desc: 'Ludicrous speed' },
                    { key: 'slowMotion', name: 'Slow Motion', desc: 'Time slows down' },
                    { key: 'timeFreeze', name: 'Time Freeze', desc: 'Everything slows' },
                ]
            },
            {
                title: "Player Size",
                cheats: [
                    { key: 'bigPlayer', name: 'Big Player', desc: 'Giant player' },
                    { key: 'tinyPlayer', name: 'Tiny Player', desc: 'Small player' },
                    { key: 'gigaPlayer', name: 'Giga Player', desc: 'Massive player' },
                    { key: 'microPlayer', name: 'Micro Player', desc: 'Microscopic player' },
                ]
            },
            {
                title: "Scoring",
                cheats: [
                    { key: 'doubleScore', name: 'Double Score', desc: '2x points' },
                    { key: 'tripleScore', name: 'Triple Score', desc: '3x points' },
                    { key: 'scoreBoost', name: 'Score Boost', desc: '1.5x points' },
                ]
            },
            {
                title: "Lives & Survival",
                cheats: [
                    { key: 'godMode', name: 'God Mode', desc: 'Invincibility' },
                    { key: 'infiniteLives', name: 'Infinite Lives', desc: 'Never lose lives' },
                    { key: 'extraLives', name: 'Extra Lives', desc: 'Gain 5 lives' },
                ]
            },
            {
                title: "Gameplay",
                cheats: [
                    { key: 'noObstacles', name: 'No Obstacles', desc: 'Clear path' },
                    { key: 'autoCollect', name: 'Auto Collect', desc: 'Items come to you' },
                    { key: 'allPowerUps', name: 'All Power-ups', desc: 'Permanent abilities' },
                    { key: 'rainbowMode', name: 'Rainbow Mode', desc: 'Psychedelic colors' },
                ]
            }
        ];

        categoriesContainer.innerHTML = categories.map(category => `
            <div style="margin-bottom: 15px;">
                <h3 style="color: #4ECDC4; margin: 10px 0 5px 0; font-size: 14px;">${category.title}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 5px;">
                    ${category.cheats.map(cheat => `
                        <button id="cheat-${cheat.key}" onclick="game.toggleCheatEffect('${cheat.key}')" 
                                style="background: ${this.activeCheatEffects[cheat.key] ? '#4ECDC4' : '#555'}; 
                                       color: white; border: none; padding: 8px; border-radius: 3px; 
                                       cursor: pointer; font-size: 11px; text-align: left;">
                            <div style="font-weight: bold;">${cheat.name}</div>
                            <div style="font-size: 9px; opacity: 0.8;">${cheat.desc}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    updateCheatMenuDisplay() {
        Object.keys(this.activeCheatEffects).forEach(key => {
            const button = document.getElementById(`cheat-${key}`);
            if (button) {
                button.style.background = this.activeCheatEffects[key] ? '#4ECDC4' : '#555';
            }
        });
    }

    gameLoop() {
        this.update();
        this.render();
        this.updateUI();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Game initialization
let game;

function initGame() {
    console.log('Initializing game...');
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    game = new GameEngine(canvas);
    game.gameLoop();
    
    // Add backup event listeners for buttons in case onclick doesn't work
    const buttons = document.querySelectorAll('.game-button');
    buttons.forEach(button => {
        const text = button.textContent.trim();
        console.log('Setting up button:', text);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Button clicked:', text);
            
            switch(text) {
                case 'START GAME':
                    startGame();
                    break;
                case 'HOW TO PLAY':
                    showInstructions();
                    break;
                case 'PLAY AGAIN':
                    restartGame();
                    break;
                case 'MAIN MENU':
                    showStartScreen();
                    break;
                default:
                    console.log('Unknown button:', text);
            }
        });
    });
    
    console.log('Game initialized successfully');
}

function startGame() {
    console.log('Start game button clicked');
    if (!game) {
        console.error('Game not initialized!');
        return;
    }
    game.startGame();
    console.log('Game started');
}

function restartGame() {
    console.log('Restart game button clicked');
    if (!game) {
        console.error('Game not initialized!');
        return;
    }
    game.startGame();
    console.log('Game restarted');
}

function showStartScreen() {
    console.log('Show start screen button clicked');
    if (!game) {
        console.error('Game not initialized!');
        return;
    }
    game.gameState = 'start';
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').style.display = 'none';
    console.log('Start screen shown');
}

function showInstructions() {
    alert(`HOW TO PLAY ARCADE COLLECTOR:

🎮 CONTROLS:
• WASD or Arrow Keys to move
• P to pause/unpause

🎯 OBJECTIVE:
• Collect glowing items to score points
• Avoid red obstacles
• Survive as long as possible

💎 COLLECTIBLES:
• Cyan items: 15 points (Common - 40%)
• Purple items: 50 points (Rare - 40%)
• Gold items: 125 points (Epic - 20%)

⚡ COMBO SYSTEM:
• Collect items quickly for combo multipliers
• Up to 4x multiplier bonus
• Higher combos = higher scores

🚀 PROGRESSION:
• Every 500 points = new level
• Higher levels = more obstacles
• Challenge yourself to beat your high score!`);
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    setTimeout(initGame, 100); // Small delay to ensure all elements are ready
});

// Fallback initialization if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM is loading, waiting for DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately');
    setTimeout(initGame, 100);
}