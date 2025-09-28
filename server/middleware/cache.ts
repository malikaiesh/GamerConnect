import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  maxAge?: number; // seconds
  public?: boolean;
  staleWhileRevalidate?: number; // seconds
  mustRevalidate?: boolean;
}

// Memory cache for API responses
const responseCache = new Map<string, {
  data: any;
  timestamp: number;
  maxAge: number;
}>();

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.maxAge * 1000) {
      responseCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export function httpCache(options: CacheOptions = {}) {
  const {
    maxAge = 300, // 5 minutes default
    public: isPublic = true,
    staleWhileRevalidate = 60,
    mustRevalidate = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Build cache control header
    const cacheControl = [];
    if (isPublic) {
      cacheControl.push('public');
    } else {
      cacheControl.push('private');
    }
    cacheControl.push(`max-age=${maxAge}`);
    if (staleWhileRevalidate > 0) {
      cacheControl.push(`stale-while-revalidate=${staleWhileRevalidate}`);
    }
    if (mustRevalidate) {
      cacheControl.push('must-revalidate');
    }

    res.set('Cache-Control', cacheControl.join(', '));
    res.set('Vary', 'Accept-Encoding');
    
    next();
  };
}

export function memoryCache(maxAge: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query parameters
    const cacheKey = req.originalUrl;
    const cached = responseCache.get(cacheKey);
    const now = Date.now();

    // Check if we have a valid cached response
    if (cached && (now - cached.timestamp) < cached.maxAge * 1000) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Age', Math.floor((now - cached.timestamp) / 1000).toString());
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = function(data: any) {
      // Cache the response
      responseCache.set(cacheKey, {
        data,
        timestamp: now,
        maxAge
      });

      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

// Cache configuration for different endpoint types
export const cacheConfigs = {
  // Static content that rarely changes
  static: {
    maxAge: 3600, // 1 hour
    public: true,
    staleWhileRevalidate: 300
  },

  // Semi-static content (categories, settings)
  semiStatic: {
    maxAge: 1800, // 30 minutes  
    public: true,
    staleWhileRevalidate: 180
  },

  // Dynamic content with some caching
  dynamic: {
    maxAge: 300, // 5 minutes
    public: true,
    staleWhileRevalidate: 60
  },

  // User-specific content
  private: {
    maxAge: 60, // 1 minute
    public: false,
    staleWhileRevalidate: 30
  },

  // Real-time content (minimal caching)
  realtime: {
    maxAge: 30, // 30 seconds
    public: false,
    mustRevalidate: true
  }
};

// Predefined cache middleware for common use cases
export const staticCache = httpCache(cacheConfigs.static);
export const semiStaticCache = httpCache(cacheConfigs.semiStatic);
export const dynamicCache = httpCache(cacheConfigs.dynamic);
export const privateCache = httpCache(cacheConfigs.private);
export const realtimeCache = httpCache(cacheConfigs.realtime);

// Memory cache variants
export const staticMemoryCache = memoryCache(3600);
export const semiStaticMemoryCache = memoryCache(1800);
export const dynamicMemoryCache = memoryCache(300);

// Combined cache middleware (HTTP + Memory)
export function combinedCache(options: CacheOptions & { memoryMaxAge?: number } = {}) {
  const { memoryMaxAge = options.maxAge || 300, ...httpOptions } = options;
  
  return [
    httpCache(httpOptions),
    memoryCache(memoryMaxAge)
  ];
}

// Cache clearing utilities
export function clearCache(pattern?: string) {
  if (pattern) {
    // Clear cache entries matching pattern
    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    responseCache.clear();
  }
}

export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp < value.maxAge * 1000) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: responseCache.size,
    validEntries,
    expiredEntries,
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
  };
}