export type Rect = { left: number; top: number; width: number; height: number };

export type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
};

const CRUISE_SPEED = 90;
const SPEED_DAMPING_PER_SECOND = 1.5;

export function randomVelocity(): { vx: number; vy: number } {
  const angle = Math.random() * Math.PI * 2;
  const speed = CRUISE_SPEED * (0.7 + Math.random() * 0.6);
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

// After a throw, speed eases back down to cruise speed instead of stopping.
function settleSpeed(body: Body, dtSeconds: number): void {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed <= CRUISE_SPEED) return;
  const damped = Math.max(CRUISE_SPEED, speed * (1 - SPEED_DAMPING_PER_SECOND * dtSeconds));
  body.vx *= damped / speed;
  body.vy *= damped / speed;
}

function bounceOffBounds(body: Body, bounds: Rect): void {
  const maxX = bounds.left + bounds.width - body.width;
  const maxY = bounds.top + bounds.height - body.height;
  if (body.x < bounds.left) {
    body.x = bounds.left;
    body.vx = Math.abs(body.vx);
  } else if (body.x > maxX) {
    body.x = maxX;
    body.vx = -Math.abs(body.vx);
  }
  if (body.y < bounds.top) {
    body.y = bounds.top;
    body.vy = Math.abs(body.vy);
  } else if (body.y > maxY) {
    body.y = maxY;
    body.vy = -Math.abs(body.vy);
  }
}

// Pushes the body out along the axis of least overlap and sends it away from the obstacle.
function bounceOffObstacle(body: Body, obstacle: Rect): boolean {
  const overlapLeft = body.x + body.width - obstacle.left;
  const overlapRight = obstacle.left + obstacle.width - body.x;
  const overlapTop = body.y + body.height - obstacle.top;
  const overlapBottom = obstacle.top + obstacle.height - body.y;
  if (overlapLeft <= 0 || overlapRight <= 0 || overlapTop <= 0 || overlapBottom <= 0) return false;

  if (Math.min(overlapLeft, overlapRight) < Math.min(overlapTop, overlapBottom)) {
    const fromLeft = overlapLeft < overlapRight;
    body.x += fromLeft ? -overlapLeft : overlapRight;
    body.vx = fromLeft ? -Math.abs(body.vx) : Math.abs(body.vx);
  } else {
    const fromTop = overlapTop < overlapBottom;
    body.y += fromTop ? -overlapTop : overlapBottom;
    body.vy = fromTop ? -Math.abs(body.vy) : Math.abs(body.vy);
  }
  return true;
}

// Advances one body and returns true when it crashed into the obstacle during this step.
export function stepBody(body: Body, dtSeconds: number, bounds: Rect, obstacle: Rect | null): boolean {
  settleSpeed(body, dtSeconds);
  body.x += body.vx * dtSeconds;
  body.y += body.vy * dtSeconds;
  bounceOffBounds(body, bounds);
  return obstacle ? bounceOffObstacle(body, obstacle) : false;
}
