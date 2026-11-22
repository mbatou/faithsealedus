'use client';

// The framed keepsake a guest downloads: the photo on a near-black passe-
// partout, a champagne-gold hairline, and the couple's signature band below —
// the same frame they saw on the camera. Drawn on the phone; the stored
// original stays clean for the couple's album and prints.

import { COUPLE } from '@/lib/brand';

const NOIR = '#0B0B0B';
const GOLD = '#C6A15B';
const IVORY = '#F4EFE6';
const DIM = '#8C877E';

function cssFont(varName: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode_failed'));
    };
    img.src = url;
  });
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // Letter-spacing where supported (Chrome, Safari 17+); plain text otherwise.
  if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
}

export async function renderKeepsake(
  photo: Blob,
  opts: { line: string; by: string },
): Promise<Blob> {
  const img = await loadImage(photo);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const base = Math.min(W, H);
  const m = Math.round(base * 0.05); // passe-partout
  const band = Math.round(base * 0.3); // signature band
  const cw = W + 2 * m;
  const ch = H + m + band;

  const serif = cssFont('--font-serif', 'Georgia, serif');
  const sans = cssFont('--font-sans', 'system-ui, sans-serif');
  const namesPx = Math.round(base * 0.06);
  const linePx = Math.round(base * 0.024);
  const byPx = Math.round(base * 0.026);
  // Make sure the site's fonts are ready before drawing with them.
  await Promise.all([
    document.fonts?.load(`italic 500 ${namesPx}px ${serif}`),
    document.fonts?.load(`600 ${linePx}px ${sans}`),
  ]).catch(() => {});

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no_canvas');

  ctx.fillStyle = NOIR;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, m, m, W, H);

  // Gold hairline, floating just outside the photo.
  const g = Math.round(base * 0.012);
  ctx.strokeStyle = 'rgba(198,161,91,0.85)';
  ctx.lineWidth = Math.max(1, base * 0.0025);
  ctx.strokeRect(m - g, m - g, W + 2 * g, H + 2 * g);

  const cx = cw / 2;
  const top = m + H;

  // The union mark: two interlocked rings.
  const r = base * 0.024;
  ctx.lineWidth = Math.max(1, base * 0.0022);
  ctx.strokeStyle = GOLD;
  for (const dx of [-r * 0.46, r * 0.46]) {
    ctx.beginPath();
    ctx.arc(cx + dx, top + band * 0.22, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = IVORY;
  ctx.font = `italic 500 ${namesPx}px ${serif}`;
  spaced(ctx, 0);
  ctx.fillText(COUPLE, cx, top + band * 0.47);

  ctx.fillStyle = GOLD;
  ctx.font = `600 ${linePx}px ${sans}`;
  spaced(ctx, linePx * 0.32);
  ctx.fillText(opts.line.toUpperCase(), cx, top + band * 0.67);

  ctx.fillStyle = DIM;
  ctx.font = `400 ${byPx}px ${sans}`;
  spaced(ctx, 0);
  ctx.fillText(opts.by, cx, top + band * 0.83);

  const out = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode_failed'))), 'image/jpeg', 0.9),
  );
  canvas.width = canvas.height = 0;
  return out;
}

/**
 * Hand the keepsake to the phone: the share sheet ("Save image") where
 * available, otherwise a plain download. Call from a tap, with the blob
 * already rendered, so the browser still counts it as the guest's gesture.
 */
export async function saveKeepsake(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/jpeg' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return; // guest closed the sheet
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
