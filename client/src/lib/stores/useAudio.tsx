import { create } from "zustand";
import { gameSettings } from "../gameSettings";

let audioContext: AudioContext | null = null;
let backgroundOscillators: OscillatorNode[] = [];
let backgroundGains: GainNode[] = [];
let noiseBuffer: AudioBuffer | null = null;
let noiseSource: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;
let convolver: ConvolverNode | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
};

const playTone = (frequency: number, type: OscillatorType, duration: number, volume: number) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Check if sound effects are enabled in settings
  const settings = gameSettings.getSettings();
  if (!settings.audio.soundEffects) return;
  
  // Apply master volume from settings
  volume = volume * settings.audio.masterVolume;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Failed to play audio:', e);
  }
};

const playComplexTone = (frequencies: number[], type: OscillatorType, duration: number, volume: number, effects?: { reverb?: boolean; filter?: boolean; distortion?: boolean }) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      let destination: AudioNode = gainNode;
      
      // Add filter if requested
      if (effects?.filter) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 2, ctx.currentTime);
        filter.Q.setValueAtTime(1, ctx.currentTime);
        destination.connect(filter);
        destination = filter;
      }
      
      // Add distortion if requested
      if (effects?.distortion) {
        const waveshaper = ctx.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
        }
        
        waveshaper.curve = curve;
        waveshaper.oversample = '4x';
        
        destination.connect(waveshaper);
        destination = waveshaper;
      }
      
      // Add reverb if requested
      if (effects?.reverb && convolver) {
        const reverbGain = ctx.createGain();
        reverbGain.gain.setValueAtTime(0.3, ctx.currentTime);
        destination.connect(reverbGain);
        reverbGain.connect(convolver);
        convolver.connect(ctx.destination);
      }
      
      oscillator.connect(gainNode);
      destination.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      oscillator.type = type;
      
      const adjustedVolume = volume / frequencies.length;
      gainNode.gain.setValueAtTime(adjustedVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime + index * 0.02); // Slight stagger
      oscillator.stop(ctx.currentTime + duration);
    });
  } catch (e) {
    console.warn('Failed to play complex audio:', e);
  }
};

const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const output = noiseBuffer.getChannelData(channel);
    for (let i = 0; i < bufferSize; i++) {
      // Create pink noise (1/f noise) for more natural sound
      let pink = 0;
      for (let j = 0; j < 12; j++) {
        pink += Math.random() * Math.pow(2, -j);
      }
      output[i] = (pink - 6) * 0.1;
    }
  }
};

const createReverbBuffer = (ctx: AudioContext) => {
  const length = ctx.sampleRate * 3; // 3 seconds reverb
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const output = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 2);
      output[i] = (Math.random() * 2 - 1) * decay * 0.3;
    }
  }
  
  return buffer;
};

const startBackgroundLoop = (volume: number) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create buffers if they don't exist
    if (!noiseBuffer) {
      createNoiseBuffer(ctx);
    }

    // Create convolver for reverb
    if (!convolver) {
      convolver = ctx.createConvolver();
      convolver.buffer = createReverbBuffer(ctx);
    }

    // Complex ambient soundscape with multiple layers
    const frequencies = [55, 82.5, 110, 165, 220]; // Bass harmonics
    const waveTypes: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'sine', 'triangle'];
    const volumes = [0.08, 0.04, 0.02, 0.03, 0.015];
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // Add some randomness to frequency for organic feel
      const detune = (Math.random() - 0.5) * 10;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      oscillator.detune.setValueAtTime(detune, ctx.currentTime);
      oscillator.type = waveTypes[index];
      
      // Filter for warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 4, ctx.currentTime);
      filter.Q.setValueAtTime(0.3, ctx.currentTime);
      
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      // Slowly fade in with slight variations
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * volumes[index], ctx.currentTime + 2 + index * 0.5);
      
      // Add subtle LFO modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + index * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.001, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      oscillator.start(ctx.currentTime);
      lfo.start(ctx.currentTime);
      
      backgroundOscillators.push(oscillator, lfo);
      backgroundGains.push(gain, lfoGain);
    });

    // Enhanced atmospheric noise with filtering and reverb
    if (noiseBuffer && convolver) {
      noiseSource = ctx.createBufferSource();
      noiseGain = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();
      const filter2 = ctx.createBiquadFilter();
      const reverbGain = ctx.createGain();
      
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      
      // Multi-stage filtering for rich texture
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(300, ctx.currentTime);
      filter1.Q.setValueAtTime(2, ctx.currentTime);
      
      filter2.type = 'highpass';
      filter2.frequency.setValueAtTime(100, ctx.currentTime);
      
      // Route: noise -> filter1 -> filter2 -> split to direct and reverb
      noiseSource.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(noiseGain);
      filter2.connect(reverbGain);
      
      noiseGain.connect(ctx.destination);
      reverbGain.connect(convolver);
      convolver.connect(ctx.destination);
      
      noiseGain.gain.setValueAtTime(0, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(volume * 0.01, ctx.currentTime + 3);
      
      reverbGain.gain.setValueAtTime(0, ctx.currentTime);
      reverbGain.gain.linearRampToValueAtTime(volume * 0.005, ctx.currentTime + 4);
      
      noiseSource.start(ctx.currentTime);
    }

    // Add procedural wind-like sweeps
    setTimeout(() => {
      if (backgroundOscillators.length > 0) {
        const sweepOsc = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        const sweepFilter = ctx.createBiquadFilter();
        
        sweepOsc.type = 'sawtooth';
        sweepOsc.frequency.setValueAtTime(40, ctx.currentTime);
        sweepFilter.type = 'lowpass';
        sweepFilter.frequency.setValueAtTime(80, ctx.currentTime);
        sweepFilter.Q.setValueAtTime(3, ctx.currentTime);
        
        sweepOsc.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        
        sweepGain.gain.setValueAtTime(0, ctx.currentTime);
        sweepGain.gain.linearRampToValueAtTime(volume * 0.02, ctx.currentTime + 1);
        sweepGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 8);
        
        sweepFilter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 6);
        
        sweepOsc.start(ctx.currentTime);
        sweepOsc.stop(ctx.currentTime + 8);
        
        backgroundOscillators.push(sweepOsc);
        backgroundGains.push(sweepGain);
      }
    }, 5000);
    
  } catch (e) {
    console.warn('Failed to start background music:', e);
  }
};

const stopBackgroundLoop = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Fade out all oscillators
    backgroundGains.forEach(gain => {
      if (gain && gain.gain) {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      }
    });
    
    backgroundOscillators.forEach(osc => {
      if (osc) {
        try {
          osc.stop(ctx.currentTime + 1);
        } catch (e) {
          // Oscillator might already be stopped
        }
      }
    });
    
    if (noiseSource && noiseGain) {
      noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      noiseSource.stop(ctx.currentTime + 1);
      noiseSource = null;
      noiseGain = null;
    }
    
    // Clear arrays
    backgroundOscillators.length = 0;
    backgroundGains.length = 0;
    
  } catch (e) {
    console.warn('Failed to stop background music:', e);
  }
};

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  powerUpSound: HTMLAudioElement | null;
  collectSound: HTMLAudioElement | null;
  gameOverSound: HTMLAudioElement | null;
  levelUpSound: HTMLAudioElement | null;
  highScoreSound: HTMLAudioElement | null;
  isMuted: boolean;
  volume: number;
  isBackgroundMusicPlaying: boolean;

  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setPowerUpSound: (sound: HTMLAudioElement) => void;
  setCollectSound: (sound: HTMLAudioElement) => void;
  setGameOverSound: (sound: HTMLAudioElement) => void;
  setLevelUpSound: (sound: HTMLAudioElement) => void;
  setHighScoreSound: (sound: HTMLAudioElement) => void;

  // Control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playHit: () => void;
  playSuccess: () => void;
  playPowerUp: () => void;
  playCollect: () => void;
  playGameOver: () => void;
  playLevelUp: () => void;
  playHighScore: () => void;
  playMove: () => void;
  playPickup: () => void;
  playBoost: () => void;
  playMagnet: () => void;
  playShield: () => void;
  playDanger: () => void;
  playAmbientPulse: () => void;
  playEcho: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  initializeAudio: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  powerUpSound: null,
  collectSound: null,
  gameOverSound: null,
  levelUpSound: null,
  highScoreSound: null,
  isMuted: false,
  volume: 0.7,
  isBackgroundMusicPlaying: false,

  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setPowerUpSound: (sound) => set({ powerUpSound: sound }),
  setCollectSound: (sound) => set({ collectSound: sound }),
  setGameOverSound: (sound) => set({ gameOverSound: sound }),
  setLevelUpSound: (sound) => set({ levelUpSound: sound }),
  setHighScoreSound: (sound) => set({ highScoreSound: sound }),

  setVolume: (volume) => {
    const { isBackgroundMusicPlaying } = get();
    set({ volume });
    
    if (isBackgroundMusicPlaying) {
      const ctx = getAudioContext();
      if (ctx) {
        backgroundGains.forEach((gain, index) => {
          if (gain && gain.gain) {
            const baseVolumes = [0.08, 0.04, 0.02, 0.03, 0.015];
            const targetVolume = volume * (baseVolumes[index % baseVolumes.length] || 0.02);
            gain.gain.setValueAtTime(targetVolume, ctx.currentTime);
          }
        });
        
        if (noiseGain) {
          noiseGain.gain.setValueAtTime(volume * 0.01, ctx.currentTime);
        }
      }
    }
  },

  toggleMute: () => {
    const { isMuted, isBackgroundMusicPlaying } = get();
    const newMuted = !isMuted;
    set({ isMuted: newMuted });
    
    if (newMuted && isBackgroundMusicPlaying) {
      stopBackgroundLoop();
      set({ isBackgroundMusicPlaying: false });
    }
  },

  initializeAudio: () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    set({ isMuted: false });
  },

  startBackgroundMusic: () => {
    const { isMuted, volume, isBackgroundMusicPlaying } = get();
    const settings = gameSettings.getSettings();
    if (!isMuted && !isBackgroundMusicPlaying && settings.audio.backgroundMusic) {
      startBackgroundLoop(volume * settings.audio.masterVolume);
      set({ isBackgroundMusicPlaying: true });
    }
  },

  stopBackgroundMusic: () => {
    const { isBackgroundMusicPlaying } = get();
    if (isBackgroundMusicPlaying) {
      stopBackgroundLoop();
      set({ isBackgroundMusicPlaying: false });
    }
  },

  playHit: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Harsh impact sound with distortion
      playComplexTone([200, 150, 180, 120], 'sawtooth', 0.25, volume * 0.4, { distortion: true, filter: true });
    }
  },

  playSuccess: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Pleasant success chord with reverb
      playComplexTone([523, 659, 784, 1047], 'sine', 0.5, volume * 0.3, { reverb: true, filter: true });
    }
  },

  playPowerUp: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Rising power-up sound
      const ctx = getAudioContext();
      if (ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      }
    }
  },

  playCollect: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Quick collect blip with harmonics
      playComplexTone([440, 880], 'sine', 0.12, volume * 0.25);
    }
  },

  playGameOver: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Descending game over sequence
      const ctx = getAudioContext();
      if (ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.2);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1.2);
      }
    }
  },

  playLevelUp: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Triumphant level up fanfare with reverb
      playComplexTone([523, 659, 784, 1047, 1319], 'triangle', 1.0, volume * 0.4, { reverb: true, filter: true });
    }
  },

  playHighScore: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Epic high score celebration
      const ctx = getAudioContext();
      if (ctx) {
        // Multiple oscillators for a rich sound
        [523, 659, 784, 1047, 1319].forEach((freq, index) => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
          gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + index * 0.1 + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.8);
          
          oscillator.start(ctx.currentTime + index * 0.1);
          oscillator.stop(ctx.currentTime + index * 0.1 + 0.8);
        });
      }
    }
  },

  playMove: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Very subtle movement whoosh
      playTone(80, 'sine', 0.03, volume * 0.03);
    }
  },

  playPickup: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Quick pickup sound
      playTone(660, 'square', 0.08, volume * 0.2);
    }
  },

  playBoost: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Speed boost whoosh
      const ctx = getAudioContext();
      if (ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }
    }
  },

  playMagnet: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Magnetic pull sound
      playComplexTone([300, 450, 600], 'triangle', 0.4, volume * 0.25);
    }
  },

  playShield: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Shield activation sound
      playComplexTone([400, 800, 1200], 'sine', 0.6, volume * 0.3);
    }
  },

  playDanger: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Warning/danger sound with distortion
      playComplexTone([220, 110], 'square', 0.15, volume * 0.4, { distortion: true });
    }
  },

  playAmbientPulse: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Subtle ambient pulse for atmosphere
      const ctx = getAudioContext();
      if (ctx) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(60, ctx.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, ctx.currentTime);
        filter.Q.setValueAtTime(2, ctx.currentTime);
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume * 0.05, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 2);
      }
    }
  },

  playEcho: () => {
    const { isMuted, volume } = get();
    if (!isMuted) {
      // Echo effect for special moments
      const ctx = getAudioContext();
      if (ctx && convolver) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1);
        
        oscillator.connect(gain);
        gain.connect(convolver);
        convolver.connect(ctx.destination);
        
        gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1);
      }
    }
  },
}));