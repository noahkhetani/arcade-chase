import { Vector2, GAME_CONFIG } from "../utils/gameUtils";

export type PowerUpType = 'shield' | 'speed' | 'magnet';

export class PowerUp {
  position: Vector2;
  size: number;
  type: PowerUpType;
  color: string;
  pulsePhase: number;
  rotationPhase: number;
  originalSize: number;
  duration: number;

  constructor(x: number, y: number, type: PowerUpType) {
    this.position = { x, y };
    this.size = GAME_CONFIG.COLLECTIBLE_SIZE + 4;
    this.originalSize = this.size;
    this.type = type;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.rotationPhase = 0;
    this.duration = 8000; // 8 seconds effect
    
    switch (type) {
      case 'shield':
        this.color = GAME_CONFIG.COLORS.POWERUP_SHIELD;
        break;
      case 'speed':
        this.color = GAME_CONFIG.COLORS.POWERUP_SPEED;
        break;
      case 'magnet':
        this.color = GAME_CONFIG.COLORS.POWERUP_MAGNET;
        break;
    }
  }

  update() {
    this.pulsePhase += 0.15;
    this.rotationPhase += 0.05;
    this.size = this.originalSize + Math.sin(this.pulsePhase) * 3;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotationPhase);
    
    // Draw glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    
    // Draw outer ring
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw main power-up with symbol
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    // Main circle
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw symbol based on type
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    const symbolSize = this.size * 0.3;
    
    switch (this.type) {
      case 'shield':
        // Shield symbol
        ctx.beginPath();
        ctx.moveTo(0, -symbolSize);
        ctx.quadraticCurveTo(symbolSize, -symbolSize * 0.5, symbolSize, 0);
        ctx.quadraticCurveTo(symbolSize, symbolSize * 0.5, 0, symbolSize);
        ctx.quadraticCurveTo(-symbolSize, symbolSize * 0.5, -symbolSize, 0);
        ctx.quadraticCurveTo(-symbolSize, -symbolSize * 0.5, 0, -symbolSize);
        ctx.fill();
        break;
        
      case 'speed':
        // Lightning bolt
        ctx.beginPath();
        ctx.moveTo(-symbolSize * 0.3, -symbolSize);
        ctx.lineTo(symbolSize * 0.3, -symbolSize * 0.2);
        ctx.lineTo(-symbolSize * 0.1, -symbolSize * 0.2);
        ctx.lineTo(symbolSize * 0.3, symbolSize);
        ctx.lineTo(-symbolSize * 0.3, symbolSize * 0.2);
        ctx.lineTo(symbolSize * 0.1, symbolSize * 0.2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'magnet':
        // Magnet symbol
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-symbolSize * 0.3, 0, symbolSize * 0.4, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(symbolSize * 0.3, 0, symbolSize * 0.4, Math.PI, 0);
        ctx.stroke();
        break;
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}