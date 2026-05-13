// Simple in-memory cache middleware with TTL

const cacheStore = new Map();

const setCache = (key, data, ttlMs) => {
  const expiresAt = Date.now() + ttlMs;
  cacheStore.set(key, { data, expiresAt });
};

const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
};

export const cacheMiddleware = (ttlSeconds = 30) => {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `${req.originalUrl}`;
    const cached = getCache(key);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Hijack res.json to store response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        setCache(key, body, ttlSeconds * 1000);
      } catch (e) {
        // ignore cache set errors
      }
      return originalJson(body);
    };

    next();
  };
};

export default cacheMiddleware;
