// Web Audio API synthesized sound effects & real-time audio level monitoring
// Lightweight, zero external audio asset dependency, works on all mobile & desktop browsers

let audioCtx: AudioContext | null = null;
let isSoundMuted = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleMuteSound(): boolean {
  isSoundMuted = !isSoundMuted;
  return isSoundMuted;
}

export function getMuteState(): boolean {
  return isSoundMuted;
}

/**
 * Play soft pop for hearts / likes
 */
export function playHeartSound(): void {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const pitch = 450 + Math.random() * 200;
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // ignore audio block
  }
}

/**
 * Play chime for coin purchase or daily bonus
 */
export function playCoinSound(): void {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.06);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.06);
      osc.stop(ctx.currentTime + index * 0.06 + 0.2);
    });
  } catch {
    // ignore
  }
}

/**
 * Play energetic fanfare for luxury gifts (Crown, Car, Rocket)
 */
export function playGiftFanfare(): void {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0.09, ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.35);
    });
  } catch {
    // ignore
  }
}

/**
 * Comprehensive Audio Test Chime: tests speakers / headphones with pleasant melodic chords
 */
export function playTestSound(): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    // Harmonic chime: C4, E4, G4, C5, G5
    const chord = [261.63, 329.63, 392.0, 523.25, 783.99];
    chord.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startTime = ctx.currentTime + index * 0.07;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });

    return true;
  } catch (e) {
    console.warn('Audio test playback failed:', e);
    return false;
  }
}

/**
 * Play cheers & applause sound effect
 */
export function playApplauseSound(): void {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Synthesized noise bursts for clapping / applause
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {
    // ignore
  }
}

/**
 * Real-time microphone audio level meter using Web Audio AnalyserNode
 * Returns a cleanup function that stops monitoring
 */
export function monitorMicrophoneLevel(
  mediaStream: MediaStream,
  onLevel: (levelPercent: number, isSpeaking: boolean) => void
): () => void {
  try {
    const ctx = getAudioContext();
    if (!ctx || !mediaStream.getAudioTracks().length) {
      return () => {};
    }

    const source = ctx.createMediaStreamSource(mediaStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isRunning = true;
    let animationId: number;

    const checkLevel = () => {
      if (!isRunning) return;
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Convert to 0 - 100 scale with threshold
      const levelPercent = Math.min(100, Math.round((avg / 128) * 100));
      const isSpeaking = levelPercent > 12;

      onLevel(levelPercent, isSpeaking);

      animationId = requestAnimationFrame(checkLevel);
    };

    checkLevel();

    return () => {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
      try {
        source.disconnect();
      } catch {}
    };
  } catch (err) {
    console.warn('Microphone monitoring not available:', err);
    return () => {};
  }
}
