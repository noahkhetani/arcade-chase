import { Vector2, GAME_CONFIG } from "../utils/gameUtils";

export class Collectible {
  position: Vector2;
  size: number;
  color: string;
  value: number;
  pulsePhase: number;
  originalSize: number;
  type: string;
  glowIntensity: number;

  constructor(x: number, y: number, value: number = 15) {
    this.position = { x, y };
    this.size = GAME_CONFIG.COLLECTIBLE_SIZE;
    this.originalSize = this.size;
    this.color = GAME_CONFIG.COLORS.COLLECTIBLE;
    this.value = value;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.type = 'common';
    this.glowIntensity = 0.4;
  }

  update() {
    // Enhanced pulsing animation based on rarity
    const pulseSpeed = this.type === 'epic' ? 0.15 : this.type === 'rare' ? 0.12 : 0.1;
    this.pulsePhase += pulseSpeed;
    
    const pulseIntensity = this.type === 'epic' ? 4 : this.type === 'rare' ? 3 : 2;
    this.size = this.originalSize + Math.sin(this.pulsePhase) * pulseIntensity;
    
    // Update glow intensity
    this.glowIntensity = (Math.sin(this.pulsePhase * 2) + 1) * 0.5;
    if (this.type === 'epic') this.glowIntensity *= 1.5;
    else if (this.type === 'rare') this.glowIntensity *= 1.2;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Enhanced glow effect based on rarity
    const baseGlow = this.type === 'epic' ? 35 : this.type === 'rare' ? 25 : 20;
    const glowSize = this.size + (this.glowIntensity * (this.type === 'epic' ? 15 : this.type === 'rare' ? 10 : 8));
    ctx.shadowBlur = baseGlow + (this.glowIntensity * 15);
    ctx.shadowColor = this.color;
    
    // Multiple glow layers for premium effect
    if (this.type !== 'common') {
      // Outer aura for rare/epic
      ctx.globalAlpha = 0.2 + (this.glowIntensity * 0.3);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, glowSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Outer glow ring
    ctx.globalAlpha = 0.4 + (this.glowIntensity * 0.3);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner core with enhanced brightness
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 20;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Enhanced sparkle effects for rare/epic items
    if (this.type === 'epic') {
      // Epic: Cross pattern with 8 sparkles
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = this.glowIntensity;
      for (let i = 0; i < 8; i++) {
        const angle = (this.pulsePhase + i * Math.PI / 4);
        const distance = this.size * 0.8;
        const sparkleX = this.position.x + Math.cos(angle) * distance;
        const sparkleY = this.position.y + Math.sin(angle) * distance;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Epic: Center bright flash
      ctx.globalAlpha = this.glowIntensity * 0.8;
      ctx.fillStyle = '#FFFF88';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (this.type === 'rare') {
      // Rare: Diamond pattern with 6 sparkles
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = this.glowIntensity;
      for (let i = 0; i < 6; i++) {
        const angle = (this.pulsePhase + i * Math.PI / 3);
        const distance = this.size * 0.7;
        const sparkleX = this.position.x + Math.cos(angle) * distance;
        const sparkleY = this.position.y + Math.sin(angle) * distance;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Rare: Center glow
      ctx.globalAlpha = this.glowIntensity * 0.6;
      ctx.fillStyle = '#DD88FF';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Common: Simple center highlight
      ctx.globalAlpha = this.glowIntensity * 0.4;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}
