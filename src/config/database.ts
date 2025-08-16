import knex from 'knex';
import { dbConfig } from '@/config/config';
import { logger } from '@/utils/logger';

// Create Knex instance
export const db = knex({
  client: 'postgresql',
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: '../migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: '../seeds',
  },
  debug: process.env.NODE_ENV === 'development',
  log: {
    warn(message: string) {
      logger.warn(`Database Warning: ${message}`);
    },
    error(message: string) {
      logger.error(`Database Error: ${message}`);
    },
    deprecate(message: string) {
      logger.warn(`Database Deprecation: ${message}`);
    },
    debug(message: string) {
      logger.debug(`Database Debug: ${message}`);
    },
  },
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Run migrations
    await db.migrate.latest();
    logger.info('✅ Database migrations completed');

    // Run seeds in development
    if (process.env.NODE_ENV === 'development') {
      await db.seed.run();
      logger.info('✅ Database seeds completed');
    }

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  try {
    await db.destroy();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (trx: knex.Knex.Transaction) => Promise<T>
): Promise<T> {
  return await db.transaction(callback);
}

// Database health check
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await db.raw('SELECT 1');
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
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export database instance
export default db; 