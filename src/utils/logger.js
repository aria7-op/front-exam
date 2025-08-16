const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // HTTP requests log file
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Custom logging functions
const logError = (error, context = '') => {
  const message = context ? `${context}: ${error.message}` : error.message;
  logger.error(message, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

const logInfo = (message, data = {}) => {
  logger.info(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

const logWarn = (message, data = {}) => {
  logger.warn(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

const logDebug = (message, data = {}) => {
  logger.debug(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

const logHttp = (message, data = {}) => {
  logger.http(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Performance logging
const logPerformance = (operation, duration, data = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  const message = `${operation} completed in ${duration}ms`;
  
  logger[level](message, {
    operation,
    duration,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Security logging
const logSecurity = (event, data = {}) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    ...data,
    timestamp: new Date().toISOString(),
    ip: data.ip || 'unknown',
    userAgent: data.userAgent || 'unknown',
  });
};

// Database logging
const logDatabase = (operation, query, duration, data = {}) => {
  const level = duration > 500 ? 'warn' : 'debug';
  const message = `Database ${operation}: ${duration}ms`;
  
  logger[level](message, {
    operation,
    query,
    duration,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// API logging
const logAPI = (method, path, statusCode, duration, data = {}) => {
  const level = statusCode >= 400 ? 'warn' : 'http';
  const message = `${method} ${path} - ${statusCode} (${duration}ms)`;
  
  logger[level](message, {
    method,
    path,
    statusCode,
    duration,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logger,
  logError,
  logInfo,
  logWarn,
  logDebug,
  logHttp,
  logPerformance,
  logSecurity,
  logDatabase,
  logAPI,
}; 