const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || 'https://localhost:3000',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'smart_attendance',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-here',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Smart Attendance <noreply@smartattendance.com>',
  },
  
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'smart-attendance-files',
  },
  
  biometric: {
    deviceTimeout: parseInt(process.env.BIOMETRIC_DEVICE_TIMEOUT || '30000', 10),
    faceRecognitionConfidence: parseFloat(process.env.FACE_RECOGNITION_CONFIDENCE || '0.8'),
    fingerprintMatchThreshold: parseFloat(process.env.FINGERPRINT_MATCH_THRESHOLD || '0.9'),
    rfidReadTimeout: parseInt(process.env.RFID_READ_TIMEOUT || '5000', 10),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  featureFlags: {
    enableAIAnalytics: process.env.ENABLE_AI_ANALYTICS === 'true',
    enableFaceRecognition: process.env.ENABLE_FACE_RECOGNITION === 'true',
    enableVoiceCommands: process.env.ENABLE_VOICE_COMMANDS === 'true',
    enablePushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableSMSNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  },
  
  timezone: process.env.DEFAULT_TIMEZONE || 'UTC',
};

// Validation function to ensure required environment variables are set
function validateConfig() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_PASSWORD',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate JWT secrets are strong enough
  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }
}

// Export individual configs for specific modules
const dbConfig = config.database;
const redisConfig = config.redis;
const jwtConfig = config.jwt;
const emailConfig = config.email;
const smsConfig = config.sms;
const awsConfig = config.aws;
const biometricConfig = config.biometric;
const featureFlags = config.featureFlags;

module.exports = {
  config,
  validateConfig,
  dbConfig,
  redisConfig,
  jwtConfig,
  emailConfig,
  smsConfig,
  awsConfig,
  biometricConfig,
  featureFlags,
}; 