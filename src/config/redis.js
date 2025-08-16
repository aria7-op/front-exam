const redis = require('redis');
const { redisConfig } = require('./config');
const { logger } = require('../utils/logger');

// Create Redis client
const client = redis.createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password,
  database: redisConfig.db,
});

// Redis connection event handlers
client.on('connect', () => {
  logger.info('✅ Redis client connected');
});

client.on('ready', () => {
  logger.info('✅ Redis client ready');
});

client.on('error', (err) => {
  logger.error('❌ Redis client error:', err);
});

client.on('end', () => {
  logger.info('🔌 Redis client disconnected');
});

// Initialize Redis
async function initializeRedis() {
  try {
    await client.connect();
    logger.info('✅ Redis initialized successfully');
  } catch (error) {
    logger.error('❌ Redis initialization failed:', error);
    throw error;
  }
}

// Close Redis connection
async function closeRedis() {
  try {
    await client.quit();
    logger.info('✅ Redis connection closed');
  } catch (error) {
    logger.error('❌ Error closing Redis connection:', error);
  }
}

// Redis health check
async function healthCheck() {
  const startTime = Date.now();
  
  try {
    await client.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Unknown error',
    };
  }
}

// Cache helper functions
async function setCache(key, value, ttl = 3600) {
  try {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    await client.setEx(key, ttl, serializedValue);
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
}

async function getCache(key) {
  try {
    const value = await client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

async function deleteCache(key) {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
}

async function clearCache() {
  try {
    await client.flushDb();
    return true;
  } catch (error) {
    logger.error('Cache clear error:', error);
    return false;
  }
}

// Session storage functions
async function setSession(sessionId, sessionData, ttl = 86400) {
  return await setCache(`session:${sessionId}`, sessionData, ttl);
}

async function getSession(sessionId) {
  return await getCache(`session:${sessionId}`);
}

async function deleteSession(sessionId) {
  return await deleteCache(`session:${sessionId}`);
}

// Rate limiting functions
async function incrementRateLimit(key, windowMs) {
  try {
    const current = await client.incr(key);
    if (current === 1) {
      await client.expire(key, Math.ceil(windowMs / 1000));
    }
    return current;
  } catch (error) {
    logger.error('Rate limit increment error:', error);
    return 0;
  }
}

async function getRateLimit(key) {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error('Rate limit get error:', error);
    return null;
  }
}

module.exports = {
  client,
  initializeRedis,
  closeRedis,
  healthCheck,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  incrementRateLimit,
  getRateLimit,
}; 