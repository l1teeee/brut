import { gsap } from "@/lib/gsap";
import { constrainBody, randomVelocity, stepBody, type Body, type Rect } from "@/lib/bounce-physics";

const MAX_THROW_SPEED = 900;
const MAX_STEP_SECONDS = 0.05;
const THROW_SMOOTHING = 0.3;

type BouncingWordsOptions = {
  container: HTMLElement;
  words: HTMLElement[];
  obstacles: HTMLElement[];
  areObstaclesActive: () => boolean;
  onCrash: () => void;
};

type Word = {
  el: HTMLElement;
  body: Body;
  baseX: number;
  baseY: number;
  setX: (value: number) => void;
  setY: (value: number) => void;
  dragging: boolean;
  grabOffsetX: number;
  grabOffsetY: number;
  lastPointerX: number;
  lastPointerY: number;
  lastPointerTime: number;
};

function rectInside(el: HTMLElement, container: HTMLElement): Rect {
  const rect = el.getBoundingClientRect();
  const origin = container.getBoundingClientRect();
  return { left: rect.left - origin.left, top: rect.top - origin.top, width: rect.width, height: rect.height };
}

function clampThrow(body: Body): void {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed <= MAX_THROW_SPEED) return;
  body.vx *= MAX_THROW_SPEED / speed;
  body.vy *= MAX_THROW_SPEED / speed;
}

function createWord(el: HTMLElement): Word {
  const { vx, vy } = randomVelocity();
  const baseX = el.offsetLeft;
  const baseY = el.offsetTop;
  return {
    el,
    body: { x: baseX, y: baseY, vx, vy, width: el.offsetWidth, height: el.offsetHeight },
    baseX,
    baseY,
    setX: gsap.quickSetter(el, "x", "px") as (value: number) => void,
    setY: gsap.quickSetter(el, "y", "px") as (value: number) => void,
    dragging: false,
    grabOffsetX: 0,
    grabOffsetY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
  };
}

export function startBouncingWords(options: BouncingWordsOptions): () => void {
  const { container, words, obstacles, areObstaclesActive, onCrash } = options;
  const state = words.map(createWord);

  const pointInContainer = (event: PointerEvent) => {
    const origin = container.getBoundingClientRect();
    return { x: event.clientX - origin.left, y: event.clientY - origin.top };
  };

  const listeners = state.map((word) => {
    const onDown = (event: PointerEvent) => {
      const point = pointInContainer(event);
      word.dragging = true;
      word.el.setPointerCapture(event.pointerId);
      word.grabOffsetX = point.x - word.body.x;
      word.grabOffsetY = point.y - word.body.y;
      word.lastPointerX = point.x;
      word.lastPointerY = point.y;
      word.lastPointerTime = performance.now();
      word.body.vx = 0;
      word.body.vy = 0;
    };
    const onMove = (event: PointerEvent) => {
      if (!word.dragging) return;
      const point = pointInContainer(event);
      const now = performance.now();
      const elapsedSeconds = Math.max(0.001, (now - word.lastPointerTime) / 1000);
      const pointerVx = (point.x - word.lastPointerX) / elapsedSeconds;
      const pointerVy = (point.y - word.lastPointerY) / elapsedSeconds;
      word.body.vx += (pointerVx - word.body.vx) * THROW_SMOOTHING;
      word.body.vy += (pointerVy - word.body.vy) * THROW_SMOOTHING;
      word.body.x = point.x - word.grabOffsetX;
      word.body.y = point.y - word.grabOffsetY;
      word.lastPointerX = point.x;
      word.lastPointerY = point.y;
      word.lastPointerTime = now;
    };
    const onUp = (event: PointerEvent) => {
      if (!word.dragging) return;
      word.dragging = false;
      word.el.releasePointerCapture(event.pointerId);
      clampThrow(word.body);
    };
    word.el.addEventListener("pointerdown", onDown);
    word.el.addEventListener("pointermove", onMove);
    word.el.addEventListener("pointerup", onUp);
    word.el.addEventListener("pointercancel", onUp);
    return { word, onDown, onMove, onUp };
  });

  const tick = (_time: number, deltaTime: number) => {
    const dtSeconds = Math.min(MAX_STEP_SECONDS, deltaTime / 1000);
    const bounds: Rect = { left: 0, top: 0, width: container.clientWidth, height: container.clientHeight };
    const obstacleRects = areObstaclesActive() ? obstacles.map((obstacle) => rectInside(obstacle, container)) : [];
    state.forEach((word) => {
      word.body.width = word.el.offsetWidth;
      word.body.height = word.el.offsetHeight;
      if (word.dragging) {
        constrainBody(word.body, bounds, obstacleRects);
      } else if (stepBody(word.body, dtSeconds, bounds, obstacleRects)) {
        onCrash();
      }
      word.setX(word.body.x - word.baseX);
      word.setY(word.body.y - word.baseY);
    });
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    listeners.forEach(({ word, onDown, onMove, onUp }) => {
      word.el.removeEventListener("pointerdown", onDown);
      word.el.removeEventListener("pointermove", onMove);
      word.el.removeEventListener("pointerup", onUp);
      word.el.removeEventListener("pointercancel", onUp);
    });
    gsap.set(words, { x: 0, y: 0 });
  };
}
