const { Sequelize } = require('sequelize');
const { dbConfig } = require('./config');
const { logger } = require('../utils/logger');

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: (msg) => logger.debug(`Database: ${msg}`),
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Import models
    require('../models/User');
    require('../models/Department');
    require('../models/Attendance');
    require('../models/BiometricData');
    require('../models/Task');
    require('../models/Notification');
    require('../models/Report');
    require('../models/AIAnalytics');
    require('../models/Device');
    require('../models/Schedule');
    require('../models/Leave');
    require('../models/Payroll');

    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synced');
    }

    logger.info('✅ Database initialized successfully');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Close database connection
async function closeDatabase() {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
}

// Database transaction helper
async function withTransaction(callback) {
  const t = await sequelize.transaction();
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Database health check
async function healthCheck() {
  const startTime = Date.now();
  
  try {
    await sequelize.authenticate();
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

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  closeDatabase,
  withTransaction,
  healthCheck,
}; 