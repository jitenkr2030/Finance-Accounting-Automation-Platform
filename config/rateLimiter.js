const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Redis client for rate limiting
let redisClient;

/**
 * Initialize Redis client for rate limiting
 */
const initializeRedisClient = () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis client error:', err);
      });
      
      return redisClient.connect();
    }
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
  }
  return Promise.resolve(null);
};

/**
 * Create rate limiter with Redis store
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60)
        }
      });
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Use Redis store if available, otherwise use memory store
  if (redisClient) {
    finalOptions.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  }

  return rateLimit(finalOptions);
};

/**
 * Custom key generator for rate limiting
 */
const customKeyGenerator = (req) => {
  // Use user ID if authenticated, otherwise use IP
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  
  // Use API key if present
  if (req.headers['x-api-key']) {
    return `api_key:${req.headers['x-api-key']}`;
  }
  
  // Fallback to IP
  return req.ip;
};

/**
 * Rate limit configuration for different endpoints
 */

// General API rate limiting
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  keyGenerator: customKeyGenerator,
  skip: (req) => {
    // Skip rate limiting for health checks and documentation
    return req.path.startsWith('/api/health') || 
           req.path.startsWith('/api-docs') || 
           req.path.startsWith('/api-explorer');
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  keyGenerator: (req) => req.ip, // Use IP for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: 900 // 15 minutes
      }
    });
  }
});

// File upload rate limiting
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'File upload limit exceeded, please try again later.',
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Payment processing rate limiting
const paymentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment operations per hour
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'Payment processing limit exceeded, please try again later.',
    error: {
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED'
    }
  }
});

// External API call rate limiting
const externalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 calls per minute
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'External API call limit exceeded.',
    error: {
      code: 'EXTERNAL_API_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Report generation rate limiting
const reportLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reports per hour
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'Report generation limit exceeded.',
    error: {
      code: 'REPORT_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Search rate limiting
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'Search request limit exceeded.',
    error: {
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Dashboard/data retrieval rate limiting
const dashboardLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 dashboard requests per minute
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'Dashboard access limit exceeded.',
    error: {
      code: 'DASHBOARD_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Bulk operations rate limiting
const bulkLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 bulk operations per hour
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'Bulk operation limit exceeded.',
    error: {
      code: 'BULK_RATE_LIMIT_EXCEEDED'
    }
  }
});

// API key specific rate limiting
const apiKeyLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute for API key users
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  skip: (req) => {
    // Don't rate limit if no API key provided
    return !req.headers['x-api-key'];
  }
});

// Admin endpoint rate limiting (more restrictive)
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 admin operations per 15 minutes
  keyGenerator: customKeyGenerator,
  skip: (req) => {
    // Only apply to admin routes
    return !req.path.startsWith('/api/admin');
  },
  message: {
    success: false,
    message: 'Admin operation limit exceeded.',
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Webhook rate limiting
const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 webhook calls per minute
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Webhook rate limit exceeded.',
    error: {
      code: 'WEBHOOK_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Dynamic rate limiter based on user role
const roleBasedLimiter = (req, res, next) => {
  let limiter;
  
  if (req.user) {
    switch (req.user.role) {
      case 'admin':
        limiter = createRateLimiter({
          windowMs: 60 * 1000,
          max: 1000, // Admins get higher limits
          keyGenerator: customKeyGenerator
        });
        break;
      case 'manager':
        limiter = createRateLimiter({
          windowMs: 60 * 1000,
          max: 500, // Managers get medium limits
          keyGenerator: customKeyGenerator
        });
        break;
      case 'accountant':
        limiter = createRateLimiter({
          windowMs: 60 * 1000,
          max: 300, // Accountants get standard limits
          keyGenerator: customKeyGenerator
        });
        break;
      default:
        limiter = createRateLimiter({
          windowMs: 60 * 1000,
          max: 100, // Regular users get lower limits
          keyGenerator: customKeyGenerator
        });
    }
  } else {
    // No user, apply strict limits
    limiter = createRateLimiter({
      windowMs: 60 * 1000,
      max: 50,
      keyGenerator: customKeyGenerator
    });
  }
  
  limiter(req, res, next);
};

/**
 * IP-based rate limiting with different tiers
 */
const tieredRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Default limit
  keyGenerator: (req) => {
    // Implement IP tiering based on reputation
    const ip = req.ip;
    
    // This would typically check against a database of IP reputations
    // For now, we'll use a simple heuristic
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
      return `internal:${ip}`; // Internal networks get higher limits
    }
    
    return `external:${ip}`;
  },
  skip: (req) => {
    // Skip rate limiting for internal IPs
    return req.ip.startsWith('10.') || 
           req.ip.startsWith('192.168.') || 
           req.ip.startsWith('172.');
  }
});

/**
 * Conditional rate limiting
 */
const conditionalRateLimiter = (condition, customLimiter) => {
  return (req, res, next) => {
    if (condition(req)) {
      return customLimiter(req, res, next);
    }
    next();
  };
};

/**
 * Burst protection for critical endpoints
 */
const burstProtection = createRateLimiter({
  windowMs: 1000, // 1 second
  max: 10, // Max 10 requests per second
  keyGenerator: customKeyGenerator,
  message: {
    success: false,
    message: 'Request burst detected, please slow down.',
    error: {
      code: 'BURST_PROTECTION'
    }
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Request burst detected, please slow down.',
      error: {
        code: 'BURST_PROTECTION',
        retryAfter: 1
      }
    });
  }
});

/**
 * Rate limit monitoring and logging
 */
const rateLimitMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log rate limit hits for monitoring
    if (res.statusCode === 429) {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    
    // Log slow requests
    if (duration > 5000) {
      console.warn('Slow request detected:', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};

/**
 * Get rate limit status for a user/IP
 */
const getRateLimitStatus = async (identifier) => {
  try {
    if (!redisClient) {
      return null;
    }
    
    const key = `rate-limit:${identifier}`;
    const data = await redisClient.get(key);
    
    if (data) {
      const parsed = JSON.parse(data);
      return {
        limit: parsed.limit,
        remaining: Math.max(0, parsed.limit - parsed.total),
        resetTime: new Date(parsed.resetTime),
        total: parsed.total
      };
    }
    
    return {
      limit: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      remaining: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      resetTime: new Date(Date.now() + (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000),
      total: 0
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return null;
  }
};

/**
 * Reset rate limit for a specific identifier (admin function)
 */
const resetRateLimit = async (identifier) => {
  try {
    if (!redisClient) {
      return false;
    }
    
    const keys = [
      `rate-limit:${identifier}`,
      `rate-limit:user:${identifier}`,
      `rate-limit:api_key:${identifier}`,
      `rate-limit:internal:${identifier}`,
      `rate-limit:external:${identifier}`
    ];
    
    for (const key of keys) {
      await redisClient.del(key);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
    return false;
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  paymentLimiter,
  externalApiLimiter,
  reportLimiter,
  searchLimiter,
  dashboardLimiter,
  bulkLimiter,
  apiKeyLimiter,
  adminLimiter,
  webhookLimiter,
  roleBasedLimiter,
  tieredRateLimiter,
  conditionalRateLimiter,
  burstProtection,
  rateLimitMonitor,
  initializeRedisClient,
  getRateLimitStatus,
  resetRateLimit,
  createRateLimiter
};