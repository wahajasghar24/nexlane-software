// Simple in-memory rate limiter (per-process; Vercel serverless = per-instance).
// ponytail: in-memory Map, fine for SMB scale; if distributed rate limiting
// ever matters, swap for Redis/Upstash (same function signature).

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterMs: windowMs }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now }
  }

  bucket.count += 1
  return { ok: true, retryAfterMs: bucket.resetAt - now }
}

export function rateLimitKey(prefix: string, ip: string | null, extra = ''): string {
  return `${prefix}:${ip || 'unknown'}:${extra}`
}