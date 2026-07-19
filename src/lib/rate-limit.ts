// Basic in-memory per-key rate limit. Enough to blunt casual abuse on a
// low-traffic form; on serverless each instance keeps its own window. Swap for
// Upstash/Redis if you need it shared across instances.

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((ts: number) => now - ts < windowMs);
  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > 5000) {
    for (const k of Array.from(buckets.keys())) {
      const times = buckets.get(k) ?? [];
      if (times.every((ts: number) => now - ts >= windowMs)) buckets.delete(k);
    }
  }
  return recent.length > limit;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
