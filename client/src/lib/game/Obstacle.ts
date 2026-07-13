import { Vector2, GAME_CONFIG } from "../utils/gameUtils";

export class Obstacle {
  position: Vector2;
  velocity: Vector2;
  size: number;
  color: string;
  rotationSpeed: number;
  rotation: number;
  pulsePhase: number = 0;
  spikes: Array<{angle: number, length: number}> = [];

  constructor(x: number, y: number, vx: number = 0, vy: number = 0) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.size = GAME_CONFIG.OBSTACLE_SIZE;
    this.color = GAME_CONFIG.COLORS.OBSTACLE;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.rotation = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    
    // Generate procedural spikes for enhanced difficulty
    const spikeCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < spikeCount; i++) {
      this.spikes.push({
        angle: (Math.PI * 2 * i) / spikeCount,
        length: 8 + Math.random() * 6
      });
    }
  }

  update(canvasWidth: number, canvasHeight: number) {
    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Update rotation
    this.rotation += this.rotationSpeed;
    
    // Bounce off walls
    if (this.position.x <= this.size / 2 || this.position.x >= canvasWidth - this.size / 2) {
      this.velocity.x *= -1;
      this.position.x = Math.max(this.size / 2, Math.min(canvasWidth - this.size / 2, this.position.x));
    }
    
    if (this.position.y <= this.size / 2 || this.position.y >= canvasHeight - this.size / 2) {
      this.velocity.y *= -1;
      this.position.y = Math.max(this.size / 2, Math.min(canvasHeight - this.size / 2, this.position.y));
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    
    // Draw intense warning glow with multiple layers
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 25;
    
    // Outer danger aura
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff4444';
    const auraSize = this.size * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -auraSize);
    ctx.lineTo(auraSize, 0);
    ctx.lineTo(0, auraSize);
    ctx.lineTo(-auraSize, 0);
    ctx.closePath();
    ctx.fill();
    
    // Main obstacle with gradient effect
    ctx.globalAlpha = 1;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size / 2);
    gradient.addColorStop(0, '#ffff44');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, '#cc8800');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    
    // Draw diamond shape with inner details
    const halfSize = this.size / 2;
    ctx.beginPath();
    ctx.moveTo(0, -halfSize);
    ctx.lineTo(halfSize, 0);
    ctx.lineTo(0, halfSize);
    ctx.lineTo(-halfSize, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add warning symbol in center
    ctx.fillStyle = '#cc0000';
    ctx.globalAlpha = 0.8;
    const symbolSize = this.size * 0.2;
    ctx.fillRect(-symbolSize/2, -symbolSize/2, symbolSize, symbolSize);
    
    ctx.restore();
  }
}
