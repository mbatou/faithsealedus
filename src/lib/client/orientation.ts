'use client';

// Which way up is the phone? With rotation lock on, the screen (and so the
// camera stream) stays portrait even when a guest shoots landscape — the
// native camera app fixes that with the motion sensor, so we do the same.

export type QuarterTurn = 0 | 90 | 180 | 270;

let deviceAngle: QuarterTurn | null = null;
let listening = false;
let asked = false;

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Snap to the nearest quarter turn, with hysteresis so 45° tilts don't flicker. */
function snap(prev: QuarterTurn | null, deg: number): QuarterTurn {
  const d = norm(deg);
  const nearest = ((Math.round(d / 90) % 4) * 90) as QuarterTurn;
  if (prev === null) return nearest;
  let diff = Math.abs(d - prev);
  if (diff > 180) diff = 360 - diff;
  return diff > 55 ? nearest : prev;
}

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  const b = (e.beta * Math.PI) / 180;
  const g = (e.gamma * Math.PI) / 180;
  // World "up" expressed in the device's own axes (W3C Z-X'-Y'' angles).
  const ux = -Math.sin(g) * Math.cos(b);
  const uy = Math.sin(b);
  // Phone lying flat: the screen plane says nothing about which way is up.
  if (Math.hypot(ux, uy) < 0.5) return;
  // 0 = upright portrait, 90 = turned counter-clockwise, 270 = clockwise.
  deviceAngle = snap(deviceAngle, (Math.atan2(ux, uy) * 180) / Math.PI);
}

export function startOrientation() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('deviceorientation', onOrientation);
}

export function stopOrientation() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('deviceorientation', onOrientation);
}

/**
 * iPhones ask before sharing motion data, and only from inside a tap. Call
 * this at the top of a click handler; it asks at most once per page.
 */
export function requestOrientationPermission() {
  if (asked || typeof window === 'undefined') return;
  asked = true;
  const D = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  if (D && typeof D.requestPermission === 'function') {
    D.requestPermission()
      .then((r) => r === 'granted' && startOrientation())
      .catch(() => {});
  }
}

function screenAngle(): QuarterTurn {
  const a =
    window.screen?.orientation?.angle ??
    (window as unknown as { orientation?: number }).orientation ??
    0;
  return (Math.round(norm(a) / 90) % 4) * 90 as QuarterTurn;
}

/**
 * How far to turn a captured frame counter-clockwise so the scene is upright.
 * The camera stream follows the screen; the photo should follow the phone.
 * Front-camera frames arrive un-mirrored, which flips the sideways cases.
 */
export function captureRotation(frontCamera: boolean): QuarterTurn {
  if (deviceAngle === null) return 0;
  const r = norm(deviceAngle - screenAngle()) as QuarterTurn;
  if (frontCamera && (r === 90 || r === 270)) return (360 - r) as QuarterTurn;
  return r;
}
