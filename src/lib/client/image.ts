// Client-side photo preparation: decode (HEIC included), resize, re-encode as
// JPEG. Drawing through a canvas drops ALL metadata — GPS included — while
// the decoder applies the EXIF orientation, so the result is upright with no
// orientation tag needed.

const FULL_MAX = 2048;
const THUMB_MAX = 480;
const FULL_TARGET_BYTES = 1.2 * 1024 * 1024;

export interface PreparedPhoto {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

type Drawable = ImageBitmap | HTMLImageElement;
type Source = Drawable | HTMLCanvasElement | HTMLVideoElement;

function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
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

async function decodeBlob(blob: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img>, which also honours EXIF orientation */
    }
  }
  return loadImage(blob);
}

async function decode(file: File): Promise<Drawable> {
  try {
    return await decodeBlob(file);
  } catch (err) {
    // Safari decodes HEIC natively (and iOS usually hands us a JPEG anyway).
    // Elsewhere, convert with heic2any — loaded only when actually needed.
    if (!isHeic(file)) throw err;
    const { default: heic2any } = await import('heic2any');
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    return decodeBlob(Array.isArray(out) ? out[0] : out);
  }
}

function dims(img: Source): { w: number; h: number } {
  if (img instanceof HTMLImageElement) return { w: img.naturalWidth, h: img.naturalHeight };
  if (img instanceof HTMLVideoElement) return { w: img.videoWidth, h: img.videoHeight };
  return { w: img.width, h: img.height };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode_failed'))), 'image/jpeg', quality),
  );
}

function render(img: Source, maxSide: number): HTMLCanvasElement {
  const { w, h } = dims(img);
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no_canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, cw, ch);
  return canvas;
}

/** Compress a full-size canvas (≤ 2048 px) into the upload + thumbnail pair. */
async function encode(big: HTMLCanvasElement): Promise<PreparedPhoto> {
  let full = await toBlob(big, 0.82);
  for (const q of [0.74, 0.66, 0.58]) {
    if (full.size <= FULL_TARGET_BYTES) break;
    full = await toBlob(big, q);
  }
  const small = render(big, THUMB_MAX);
  const thumb = await toBlob(small, 0.76);
  const width = big.width;
  const height = big.height;
  // Free canvas memory promptly — phones are tight on it.
  big.width = big.height = 0;
  small.width = small.height = 0;
  return { full, thumb, width, height };
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const img = await decode(file);
  try {
    return await encode(render(img, FULL_MAX));
  } finally {
    if ('close' in img) img.close();
  }
}

/**
 * Freeze the current camera frame (synchronously — this is the shutter
 * moment), scaled to ≤ 2048 px and turned `rotateCcw` degrees
 * counter-clockwise. A canvas carries no metadata, so there's no GPS either.
 */
export function grabFrame(video: HTMLVideoElement, rotateCcw: 0 | 90 | 180 | 270): HTMLCanvasElement {
  const { w: vw, h: vh } = dims(video);
  if (!vw || !vh) throw new Error('no_frame');
  const scale = Math.min(1, FULL_MAX / Math.max(vw, vh));
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);
  const quarter = rotateCcw === 90 || rotateCcw === 270;
  const canvas = document.createElement('canvas');
  canvas.width = quarter ? h : w;
  canvas.height = quarter ? w : h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no_canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-rotateCcw * Math.PI) / 180); // canvas angles run clockwise
  ctx.drawImage(video, -w / 2, -h / 2, w, h);
  return canvas;
}

export function prepareFromCanvas(canvas: HTMLCanvasElement): Promise<PreparedPhoto> {
  return encode(canvas);
}
