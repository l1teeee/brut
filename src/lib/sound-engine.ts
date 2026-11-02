const MASTER_GAIN = 1;
const NOISE_SECONDS = 2;

const WIND_FILTER_BASE_HZ = 600;
const WIND_FILTER_RANGE_HZ = 1400;
const WIND_FILTER_Q = 0.8;
const RUMBLE_FILTER_Q = 0.7;
const WIND_MAX_GAIN = 0.09;
const WIND_SMOOTHING_SECONDS = 0.3;

const NOTE_PEAK_GAIN = 0.15;
const NOTE_DECAY_SECONDS = 1.2;
const TICK_PEAK_GAIN = 0.08;
const TICK_DECAY_SECONDS = 0.08;
const RUMBLE_PEAK_GAIN = 0.3;
const RUMBLE_ATTACK_SECONDS = 0.15;
const RUMBLE_DECAY_SECONDS = 0.9;
const RUMBLE_FILTER_HZ = 420;
const CHORD_STAGGER_SECONDS = 0.06;

const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

export type SoundEngine = {
  isEnabled: () => boolean;
  subscribe: (listener: () => void) => () => void;
  toggle: () => void;
  setScrollIntensity: (intensity: number) => void;
  playNote: (frequency: number) => void;
  playTick: (frequency: number) => void;
  playChord: (frequencies: readonly number[]) => void;
  playRumble: () => void;
};

// Brown noise (integrated white noise) sounds like soft wind instead of hiss.
function createBrownNoise(context: AudioContext): AudioBuffer {
  const length = context.sampleRate * NOISE_SECONDS;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let last = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    samples[index] = last * 3.5;
  }
  return buffer;
}

function createWhiteNoise(context: AudioContext): AudioBuffer {
  const length = context.sampleRate * NOISE_SECONDS;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createEngine(): SoundEngine {
  const context = new AudioContext();
  const brownNoise = createBrownNoise(context);
  const whiteNoise = createWhiteNoise(context);
  const listeners = new Set<() => void>();
  let muted = false;

  const master = context.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(context.destination);

  const windSource = context.createBufferSource();
  windSource.buffer = whiteNoise;
  windSource.loop = true;
  const windFilter = context.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.Q.value = WIND_FILTER_Q;
  windFilter.frequency.value = WIND_FILTER_BASE_HZ;
  const windGain = context.createGain();
  windGain.gain.value = 0;
  windSource.connect(windFilter).connect(windGain).connect(master);
  windSource.start();

  const isEnabled = () => context.state === "running" && !muted;
  const notify = () => listeners.forEach((listener) => listener());

  const enable = () => {
    muted = false;
    void context.resume().then(notify);
  };

  // The toggle enables sound itself; unlocking here too would let its own click mute it again.
  const unlock = (event: Event) => {
    if (event.target instanceof Element && event.target.closest("[data-sound-toggle]")) return;
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, unlock));
    if (context.state !== "running") enable();
  };
  UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, unlock));

  const envelope = (peak: number, decaySeconds: number, attackSeconds = 0.01) => {
    const gain = context.createGain();
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + attackSeconds);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attackSeconds + decaySeconds);
    gain.connect(master);
    return { gain, stopAt: now + attackSeconds + decaySeconds + 0.05 };
  };

  const playTone = (frequency: number, type: OscillatorType, peak: number, decaySeconds: number) => {
    if (!isEnabled()) return;
    const { gain, stopAt } = envelope(peak, decaySeconds);
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start();
    oscillator.stop(stopAt);
  };

  return {
    isEnabled,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    toggle: () => {
      if (context.state !== "running") {
        enable();
        return;
      }
      muted = !muted;
      notify();
    },
    setScrollIntensity: (intensity) => {
      const level = isEnabled() ? Math.min(1, Math.max(0, intensity)) : 0;
      const now = context.currentTime;
      windGain.gain.setTargetAtTime(level * WIND_MAX_GAIN, now, WIND_SMOOTHING_SECONDS);
      windFilter.frequency.setTargetAtTime(WIND_FILTER_BASE_HZ + level * WIND_FILTER_RANGE_HZ, now, WIND_SMOOTHING_SECONDS);
    },
    playNote: (frequency) => playTone(frequency, "sine", NOTE_PEAK_GAIN, NOTE_DECAY_SECONDS),
    playTick: (frequency) => playTone(frequency, "triangle", TICK_PEAK_GAIN, TICK_DECAY_SECONDS),
    playChord: (frequencies) => {
      frequencies.forEach((frequency, index) => {
        window.setTimeout(() => playTone(frequency, "sine", NOTE_PEAK_GAIN, NOTE_DECAY_SECONDS), index * CHORD_STAGGER_SECONDS * 1000);
      });
    },
    playRumble: () => {
      if (!isEnabled()) return;
      const { gain, stopAt } = envelope(RUMBLE_PEAK_GAIN, RUMBLE_DECAY_SECONDS, RUMBLE_ATTACK_SECONDS);
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = RUMBLE_FILTER_Q;
      filter.frequency.value = RUMBLE_FILTER_HZ;
      const source = context.createBufferSource();
      source.buffer = brownNoise;
      source.connect(filter).connect(gain);
      source.start();
      source.stop(stopAt);
    },
  };
}

let engine: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  engine ??= createEngine();
  return engine;
}
