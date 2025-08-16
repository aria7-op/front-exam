import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
}

export interface BiometricConfig {
  deviceTimeout: number;
  faceRecognitionConfidence: number;
  fingerprintMatchThreshold: number;
  rfidReadTimeout: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface FeatureFlags {
  enableAIAnalytics: boolean;
  enableFaceRecognition: boolean;
  enableVoiceCommands: boolean;
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiVersion: string;
  corsOrigin: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JWTConfig;
  email: EmailConfig;
  sms: SMSConfig;
  aws: AWSConfig;
  biometric: BiometricConfig;
  rateLimit: RateLimitConfig;
  featureFlags: FeatureFlags;
  timezone: string;
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || 'https://localhost:3000',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'smart_attendance',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
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
export function validateConfig(): void {
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
export const dbConfig = config.database;
export const redisConfig = config.redis;
export const jwtConfig = config.jwt;
export const emailConfig = config.email;
export const smsConfig = config.sms;
export const awsConfig = config.aws;
export const biometricConfig = config.biometric;
export const featureFlags = config.featureFlags; 