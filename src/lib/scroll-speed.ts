import { gsap } from "@/lib/gsap";

type SpeedListener = (pixelsPerSecond: number) => void;

const listeners = new Set<SpeedListener>();
let lastY = 0;

function measure(_time: number, deltaTime: number): void {
  if (deltaTime <= 0) return;
  const y = window.scrollY;
  const speed = Math.abs(y - lastY) / (deltaTime / 1000);
  lastY = y;
  listeners.forEach((listener) => listener(speed));
}

export function subscribeScrollSpeed(listener: SpeedListener): () => void {
  if (listeners.size === 0) {
    lastY = window.scrollY;
    gsap.ticker.add(measure);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) gsap.ticker.remove(measure);
  };
}
