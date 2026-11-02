const NOISE_SECONDS = 2;
const FILTER_BASE_HZ = 300;
const FILTER_RANGE_HZ = 600;
const FILTER_Q = 0.6;
const MAX_GAIN = 0.035;
const SMOOTHING_SECONDS = 0.3;

export type WindSound = {
  setIntensity: (intensity: number) => void;
  setMuted: (muted: boolean) => void;
  dispose: () => void;
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

export function createWindSound(): WindSound {
  const context = new AudioContext();

  const source = context.createBufferSource();
  source.buffer = createBrownNoise(context);
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = FILTER_BASE_HZ;
  filter.Q.value = FILTER_Q;

  const gain = context.createGain();
  gain.gain.value = 0;

  source.connect(filter).connect(gain).connect(context.destination);
  source.start();

  let intensity = 0;
  let muted = false;

  const apply = () => {
    const now = context.currentTime;
    const level = muted ? 0 : intensity;
    gain.gain.setTargetAtTime(level * MAX_GAIN, now, SMOOTHING_SECONDS);
    filter.frequency.setTargetAtTime(FILTER_BASE_HZ + level * FILTER_RANGE_HZ, now, SMOOTHING_SECONDS);
  };

  const resumeOnGesture = () => {
    void context.resume();
  };
  window.addEventListener("pointerdown", resumeOnGesture);
  window.addEventListener("keydown", resumeOnGesture);

  return {
    setIntensity: (value) => {
      intensity = Math.min(1, Math.max(0, value));
      apply();
    },
    setMuted: (value) => {
      muted = value;
      apply();
    },
    dispose: () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      source.stop();
      void context.close();
    },
  };
}
