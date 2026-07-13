import { Vector2, GAME_CONFIG, randomInRange } from "../utils/gameUtils";

interface Particle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class ParticleSystem {
  particles: Particle[];

  constructor() {
    this.particles = [];
  }

  createExplosion(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randomInRange(-0.3, 0.3);
      const speed = randomInRange(3, 8);
      
      this.particles.push({
        position: { x: x + randomInRange(-2, 2), y: y + randomInRange(-2, 2) },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: randomInRange(40, 80),
        maxLife: randomInRange(40, 80),
        size: randomInRange(2, 6),
        color
      });
    }
  }

  createCollectionBurst(x: number, y: number, color: string) {
    // Create sparkle burst effect for collectibles
    for (let i = 0; i < 12; i++) {
      const angle = randomInRange(0, Math.PI * 2);
      const speed = randomInRange(4, 10);
      
      this.particles.push({
        position: { x, y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: 45,
        maxLife: 45,
        size: randomInRange(1, 4),
        color: i % 3 === 0 ? '#ffffff' : color
      });
    }
  }

  createPowerUpEffect(x: number, y: number, color: string) {
    // Create special effect for power-up collection
    for (let i = 0; i < 15; i++) {
      const angle = randomInRange(0, Math.PI * 2);
      const speed = randomInRange(2, 12);
      
      this.particles.push({
        position: { x, y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: 90,
        maxLife: 90,
        size: randomInRange(3, 8),
        color: i % 4 === 0 ? '#ffffff' : color
      });
    }
  }

  createTrail(x: number, y: number, color: string) {
    this.particles.push({
      position: { x: x + randomInRange(-5, 5), y: y + randomInRange(-5, 5) },
      velocity: { x: randomInRange(-1, 1), y: randomInRange(-1, 1) },
      life: 30,
      maxLife: 30,
      size: randomInRange(2, 4),
      color
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      
      // Apply gravity/friction
      particle.velocity.y += 0.1;
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;
      
      // Update life
      particle.life--;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5;
      
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
