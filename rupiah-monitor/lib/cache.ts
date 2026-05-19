// Simple in-memory cache. Berfungsi per Vercel function instance.
// Untuk production scale tinggi, ganti ke Vercel KV / Upstash Redis.

type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

export function getCache<T>(key: string): T | null {
  const e = store.get(key) as Entry<T> | undefined;
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(key);
    return null;
  }
  return e.value;
}

export function setCache<T>(key: string, value: T, ttlSeconds: number) {
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);
