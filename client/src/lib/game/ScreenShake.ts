export class ScreenShake {
  intensity: number;
  duration: number;
  currentTime: number;
  
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.currentTime = 0;
  }
  
  start(intensity: number, duration: number) {
    this.intensity = intensity;
    this.duration = duration;
    this.currentTime = 0;
  }
  
  update() {
    if (this.currentTime < this.duration) {
      this.currentTime++;
    }
  }
  
  getOffset(): { x: number; y: number } {
    if (this.currentTime >= this.duration) {
      return { x: 0, y: 0 };
    }
    
    const progress = this.currentTime / this.duration;
    const fadeOut = 1 - progress;
    const currentIntensity = this.intensity * fadeOut;
    
    return {
      x: (Math.random() - 0.5) * currentIntensity * 2,
      y: (Math.random() - 0.5) * currentIntensity * 2
    };
  }
  
  isActive(): boolean {
    return this.currentTime < this.duration;
  }
}