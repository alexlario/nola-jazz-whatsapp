export function createRateLimiter({ windowMs = 60_000, maxRequests = 25 } = {}) {
  const hits = new Map();

  return function checkRateLimit(key) {
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((ts) => now - ts < windowMs);
    if (recent.length >= maxRequests) {
      hits.set(key, recent);
      return { allowed: false, remaining: 0 };
    }
    recent.push(now);
    hits.set(key, recent);
    return { allowed: true, remaining: maxRequests - recent.length };
  };
}
