/**
 * Lightweight in-memory sliding-window rate limiter.
 * Note: On serverless platforms (Vercel), state is per warm instance — acts as
 * a first-line defense against rapid automated bursts without external KV.
 */

type Bucket = {
  timestamps: number[];
};

const globalStore = globalThis as typeof globalThis & {
  __hiveRateLimitStore?: Map<string, Bucket>;
};

function getStore(): Map<string, Bucket> {
  if (!globalStore.__hiveRateLimitStore) {
    globalStore.__hiveRateLimitStore = new Map<string, Bucket>();
  }
  return globalStore.__hiveRateLimitStore;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const store = getStore();
  const now = Date.now();
  const cutoff = now - windowMs;

  // Periodic cleanup if map grows large
  if (store.size > 2000) {
    for (const [k, v] of store.entries()) {
      if (v.timestamps.every((t) => t <= cutoff)) {
        store.delete(k);
      }
    }
  }

  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}
