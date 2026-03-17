export const playAlertSound = (type: string, volume: number = 50) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const vol = volume / 100;
    
    if (type === 'sino') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } else if (type === 'beep') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gainNode.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(440, ctx.currentTime);
          gain2.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
          gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.1);
        } catch (e) {}
      }, 150);
    } else if (type === 'harpa') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start();
      osc.stop(ctx.currentTime + 1);
      
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          gain2.gain.setValueAtTime(vol, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
          osc2.start();
          osc2.stop(ctx.currentTime + 1);
        } catch (e) {}
      }, 200);
      
      setTimeout(() => {
        try {
          const osc3 = ctx.createOscillator();
          const gain3 = ctx.createGain();
          osc3.connect(gain3);
          gain3.connect(ctx.destination);
          osc3.type = 'triangle';
          osc3.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
          gain3.gain.setValueAtTime(vol, ctx.currentTime);
          gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
          osc3.start();
          osc3.stop(ctx.currentTime + 1.5);
        } catch (e) {}
      }, 400);
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};

let ambientAudioContext: AudioContext | null = null;
let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

export const playAmbientSound = (type: string, volume: number = 50) => {
  stopAmbientSound();
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    ambientAudioContext = new AudioContextClass();
    ambientGain = ambientAudioContext.createGain();
    ambientGain.connect(ambientAudioContext.destination);
    ambientGain.gain.value = volume / 100;
    
    const bufferSize = ambientAudioContext.sampleRate * 2; // 2 seconds buffer
    const buffer = ambientAudioContext.createBuffer(1, bufferSize, ambientAudioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise based on type
    for (let i = 0; i < bufferSize; i++) {
      if (type === 'chuva') {
        // Pink noise approximation for rain
        const white = Math.random() * 2 - 1;
        data[i] = (white + (data[i - 1] || 0) * 0.9) / 2;
      } else if (type === 'ondas') {
        // Brown noise approximation for waves, modulated by a sine wave
        const white = Math.random() * 2 - 1;
        data[i] = (white + (data[i - 1] || 0) * 0.99) / 2;
        // Modulate amplitude to simulate waves crashing
        const modulation = Math.sin(i / ambientAudioContext.sampleRate * Math.PI * 0.5); // 0.25 Hz
        data[i] *= (0.5 + 0.5 * modulation);
      } else if (type === 'cafeteria') {
        // White noise with some random peaks
        data[i] = (Math.random() * 2 - 1) * 0.5;
        if (Math.random() < 0.001) data[i] *= 2; // Occasional clatter
      } else if (type === 'lofi') {
        // Low frequency hum + vinyl crackle
        const hum = Math.sin(i / ambientAudioContext.sampleRate * Math.PI * 120) * 0.1; // 60Hz hum
        const crackle = Math.random() < 0.005 ? (Math.random() * 2 - 1) * 0.3 : 0;
        data[i] = hum + crackle;
      }
    }
    
    ambientSource = ambientAudioContext.createBufferSource();
    ambientSource.buffer = buffer;
    ambientSource.loop = true;
    
    // Add a lowpass filter for a more natural sound
    const filter = ambientAudioContext.createBiquadFilter();
    filter.type = 'lowpass';
    if (type === 'chuva') filter.frequency.value = 1000;
    else if (type === 'ondas') filter.frequency.value = 400;
    else if (type === 'cafeteria') filter.frequency.value = 2000;
    else if (type === 'lofi') filter.frequency.value = 800;
    
    ambientSource.connect(filter);
    filter.connect(ambientGain);
    
    ambientSource.start();
  } catch (e) {
    console.error('Ambient audio playback failed', e);
  }
};

export const stopAmbientSound = () => {
  if (ambientSource) {
    try {
      ambientSource.stop();
      ambientSource.disconnect();
    } catch (e) {}
    ambientSource = null;
  }
  if (ambientAudioContext) {
    try {
      ambientAudioContext.close();
    } catch (e) {}
    ambientAudioContext = null;
  }
};

export const updateAmbientVolume = (volume: number) => {
  if (ambientGain) {
    ambientGain.gain.value = volume / 100;
  }
};
