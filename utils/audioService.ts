
export type AmbientSoundType = 'chuva' | 'cafeteria' | 'lofi' | 'ondas' | 'none';
export type AlertSoundType = 'sino' | 'beep' | 'harpa' | 'none';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbient: AmbientSoundType = 'none';
  private volume: number = 0.5;

  constructor() {
    // AudioContext is initialized on first user interaction
  }

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
      this.masterGain.gain.value = this.volume;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(volume: number) {
    this.volume = volume / 100;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx!.currentTime, 0.1);
    }
  }

  playAlert(type: AlertSoundType) {
    this.init();
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    gain.connect(this.masterGain);
    osc.connect(gain);

    switch (type) {
      case 'sino':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
        osc.start(now);
        osc.stop(now + 2);
        
        // Add a second harmonic for a richer bell sound
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now);
        gain2.gain.setValueAtTime(0.2, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now);
        osc2.stop(now + 1.5);
        break;

      case 'beep':
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'harpa':
        const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        freqs.forEach((f, i) => {
          const o = this.audioCtx!.createOscillator();
          const g = this.audioCtx!.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0, now + i * 0.1);
          g.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 1);
          o.connect(g);
          g.connect(this.masterGain!);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 1);
        });
        break;
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as any).stop();
      } catch (e) {
        // Some nodes don't have stop()
        this.ambientSource.disconnect();
      }
      this.ambientSource = null;
    }
    this.currentAmbient = 'none';
  }

  playAmbient(type: AmbientSoundType) {
    this.init();
    if (!this.audioCtx || !this.masterGain) return;

    if (this.currentAmbient === type) return;
    this.stopAmbient();
    this.currentAmbient = type;

    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    const ambientGain = this.audioCtx.createGain();
    ambientGain.connect(this.masterGain);

    switch (type) {
      case 'chuva':
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        whiteNoise.connect(filter);
        filter.connect(ambientGain);
        ambientGain.gain.value = 0.5;
        break;

      case 'ondas':
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        const lfo = this.audioCtx.createOscillator();
        const lfoGain = this.audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // 5 seconds per wave
        lfoGain.gain.value = 0.3;
        lfo.connect(lfoGain.gain);
        ambientGain.gain.value = 0.4;
        whiteNoise.connect(filter);
        filter.connect(ambientGain);
        lfo.start();
        break;

      case 'cafeteria':
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        whiteNoise.connect(filter);
        filter.connect(ambientGain);
        ambientGain.gain.value = 0.3;
        
        // Add random "clinks"
        const scheduleClink = () => {
          if (this.currentAmbient !== 'cafeteria') return;
          const now = this.audioCtx!.currentTime;
          const clink = this.audioCtx!.createOscillator();
          const clinkGain = this.audioCtx!.createGain();
          clink.type = 'sine';
          clink.frequency.setValueAtTime(2000 + Math.random() * 1000, now);
          clinkGain.gain.setValueAtTime(0.05, now);
          clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          clink.connect(clinkGain);
          clinkGain.connect(this.masterGain!);
          clink.start(now);
          clink.stop(now + 0.1);
          setTimeout(scheduleClink, 2000 + Math.random() * 5000);
        };
        scheduleClink();
        break;

      case 'lofi':
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        whiteNoise.connect(filter);
        filter.connect(ambientGain);
        ambientGain.gain.value = 0.1; // vinyl crackle

        // Simple beat
        const scheduleBeat = (time: number) => {
          if (this.currentAmbient !== 'lofi') return;
          const now = time;
          
          // Kick
          const kick = this.audioCtx!.createOscillator();
          const kickGain = this.audioCtx!.createGain();
          kick.frequency.setValueAtTime(150, now);
          kick.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
          kickGain.gain.setValueAtTime(0.5, now);
          kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          kick.connect(kickGain);
          kickGain.connect(this.masterGain!);
          kick.start(now);
          kick.stop(now + 0.1);

          // Snare-ish
          const snareGain = this.audioCtx!.createGain();
          const snareFilter = this.audioCtx!.createBiquadFilter();
          snareFilter.type = 'highpass';
          snareFilter.frequency.value = 1000;
          const snareNoise = this.audioCtx!.createBufferSource();
          snareNoise.buffer = noiseBuffer;
          snareGain.gain.setValueAtTime(0, now + 0.5);
          snareGain.gain.linearRampToValueAtTime(0.2, now + 0.505);
          snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          snareNoise.connect(snareFilter);
          snareFilter.connect(snareGain);
          snareGain.connect(this.masterGain!);
          snareNoise.start(now + 0.5);
          snareNoise.stop(now + 0.6);

          setTimeout(() => scheduleBeat(this.audioCtx!.currentTime + 1), 1000);
        };
        scheduleBeat(this.audioCtx.currentTime);
        break;
    }

    whiteNoise.start();
    this.ambientSource = whiteNoise;
    this.ambientGain = ambientGain;
  }
}

export const audioService = new AudioService();
