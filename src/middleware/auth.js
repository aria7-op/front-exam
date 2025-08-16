const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtConfig } = require('../config/config');
const { logSecurity, logPerformance } = require('../utils/logger');
const { getCache, setCache, deleteCache } = require('../config/redis');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');
const { User } = require('../models/User');
const { BiometricData } = require('../models/BiometricData');
const { AISecurityService } = require('../services/ai.security.service');
const { EventEmitter } = require('events');

// Global event emitter for security events
const securityEvents = new EventEmitter();

// AI Security Service instance
const aiSecurity = new AISecurityService();

// Advanced rate limiting with AI-based anomaly detection
const loginAttempts = new Map();
const suspiciousActivities = new Map();

// Multi-factor authentication cache
const mfaCache = new Map();

// Behavioral analysis cache
const behaviorCache = new Map();

// Advanced JWT token management
class TokenManager {
  static async generateTokens(userId, deviceInfo = {}) {
    const startTime = Date.now();
    
    try {
      // Generate access token with device fingerprint
      const accessToken = jwt.sign(
        { 
          userId, 
          deviceId: deviceInfo.deviceId,
          sessionId: deviceInfo.sessionId,
          iat: Date.now()
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // Generate refresh token with longer expiry
      const refreshToken = jwt.sign(
        { 
          userId, 
          tokenType: 'refresh',
          deviceId: deviceInfo.deviceId,
          sessionId: deviceInfo.sessionId
        },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshExpiresIn }
      );

      // Store refresh token in Redis with device info
      await setCache(`refresh:${userId}:${deviceInfo.deviceId}`, {
        token: refreshToken,
        deviceInfo,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      }, 30 * 24 * 60 * 60); // 30 days

      // Log performance
      logPerformance('Token Generation', Date.now() - startTime, { userId });

      return { accessToken, refreshToken };
    } catch (error) {
      logSecurity('Token Generation Failed', { userId, error: error.message });
      throw error;
    }
  }

  static async verifyToken(token, tokenType = 'access') {
    const startTime = Date.now();
    
    try {
      const secret = tokenType === 'refresh' ? jwtConfig.refreshSecret : jwtConfig.secret;
      const decoded = jwt.verify(token, secret);

      // Check if token is blacklisted
      const isBlacklisted = await getCache(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new AuthenticationError('Token has been revoked');
      }

      // Verify device consistency
      if (decoded.deviceId) {
        const storedSession = await getCache(`refresh:${decoded.userId}:${decoded.deviceId}`);
        if (!storedSession) {
          throw new AuthenticationError('Invalid session');
        }
      }

      logPerformance('Token Verification', Date.now() - startTime, { userId: decoded.userId });
      return decoded;
    } catch (error) {
      logSecurity('Token Verification Failed', { token: token.substring(0, 20), error: error.message });
      throw new AuthenticationError('Invalid token');
    }
  }

  static async revokeToken(token, userId) {
    try {
      // Add to blacklist
      const decoded = jwt.decode(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      await setCache(`blacklist:${token}`, true, ttl);

      // Remove refresh token
      if (decoded.deviceId) {
        await deleteCache(`refresh:${userId}:${decoded.deviceId}`);
      }

      logSecurity('Token Revoked', { userId, deviceId: decoded.deviceId });
    } catch (error) {
      logSecurity('Token Revocation Failed', { error: error.message });
    }
  }
}

// AI-Powered Behavioral Analysis
class BehavioralAnalyzer {
  static async analyzeUserBehavior(userId, action, context = {}) {
    try {
      const userBehavior = await getCache(`behavior:${userId}`) || {
        loginPatterns: [],
        actionPatterns: [],
        devicePatterns: [],
        timePatterns: [],
        riskScore: 0
      };

      const currentTime = new Date();
      const behavior = {
        action,
        timestamp: currentTime.toISOString(),
        context,
        ip: context.ip,
        userAgent: context.userAgent,
        deviceId: context.deviceId
      };

      // Update behavior patterns
      userBehavior.actionPatterns.push(behavior);
      
      // Keep only last 100 actions
      if (userBehavior.actionPatterns.length > 100) {
        userBehavior.actionPatterns = userBehavior.actionPatterns.slice(-100);
      }

      // AI-based risk assessment
      const riskScore = await aiSecurity.assessBehaviorRisk(userBehavior, behavior);
      userBehavior.riskScore = riskScore;

      // Store updated behavior
      await setCache(`behavior:${userId}`, userBehavior, 24 * 60 * 60); // 24 hours

      // Emit security event if high risk
      if (riskScore > 0.7) {
        securityEvents.emit('highRiskBehavior', { userId, behavior, riskScore });
      }

      return { riskScore, isSuspicious: riskScore > 0.8 };
    } catch (error) {
      logSecurity('Behavioral Analysis Failed', { userId, error: error.message });
      return { riskScore: 0, isSuspicious: false };
    }
  }
}

// Advanced Rate Limiting with AI
class IntelligentRateLimiter {
  static async checkRateLimit(userId, action, context = {}) {
    try {
      const key = `ratelimit:${userId}:${action}`;
      const currentAttempts = await getCache(key) || 0;
      
      // Get user's normal behavior pattern
      const userBehavior = await getCache(`behavior:${userId}`);
      const baseLimit = this.getBaseLimit(action);
      
      // AI adjusts limit based on user behavior
      const adjustedLimit = await aiSecurity.adjustRateLimit(baseLimit, userBehavior, context);
      
      if (currentAttempts >= adjustedLimit) {
        // Log suspicious activity
        logSecurity('Rate Limit Exceeded', { userId, action, attempts: currentAttempts });
        
        // Increase risk score
        await BehavioralAnalyzer.analyzeUserBehavior(userId, 'rate_limit_exceeded', context);
        
        return { allowed: false, retryAfter: 300 }; // 5 minutes
      }

      // Increment attempts
      await setCache(key, currentAttempts + 1, 60); // 1 minute window
      
      return { allowed: true, remaining: adjustedLimit - currentAttempts - 1 };
    } catch (error) {
      logSecurity('Rate Limit Check Failed', { userId, error: error.message });
      return { allowed: true, remaining: 10 }; // Fallback
    }
  }

  static getBaseLimit(action) {
    const limits = {
      login: 5,
      register: 3,
      password_reset: 3,
      biometric_verify: 10,
      api_call: 100
    };
    return limits[action] || 10;
  }
}

// Biometric Authentication Middleware
class BiometricAuth {
  static async verifyBiometric(userId, biometricData, context = {}) {
    const startTime = Date.now();
    
    try {
      // Get user's stored biometric data
      const userBiometric = await BiometricData.findOne({ where: { userId } });
      if (!userBiometric) {
        throw new AuthenticationError('Biometric data not found');
      }

      // AI-powered biometric verification
      const verificationResult = await aiSecurity.verifyBiometric(
        userBiometric.data,
        biometricData,
        context
      );

      if (!verificationResult.isValid) {
        logSecurity('Biometric Verification Failed', { 
          userId, 
          confidence: verificationResult.confidence,
          reason: verificationResult.reason 
        });
        throw new AuthenticationError('Biometric verification failed');
      }

      // Check for liveness detection
      if (!verificationResult.isLive) {
        logSecurity('Liveness Detection Failed', { userId });
        throw new AuthenticationError('Liveness detection failed');
      }

      // Update last used timestamp
      await userBiometric.update({ lastUsed: new Date() });

      logPerformance('Biometric Verification', Date.now() - startTime, { userId });
      
      return {
        success: true,
        confidence: verificationResult.confidence,
        method: verificationResult.method
      };
    } catch (error) {
      logSecurity('Biometric Verification Error', { userId, error: error.message });
      throw error;
    }
  }
}

// Multi-Factor Authentication
class MFAManager {
  static async generateMFA(userId, method = 'totp') {
    try {
      const mfaCode = this.generateSecureCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store MFA code
      await setCache(`mfa:${userId}`, {
        code: mfaCode,
        method,
        expiresAt: expiresAt.toISOString(),
        attempts: 0
      }, 300); // 5 minutes

      // Send MFA code via preferred method
      await this.sendMFACode(userId, mfaCode, method);

      return { success: true, method };
    } catch (error) {
      logSecurity('MFA Generation Failed', { userId, error: error.message });
      throw error;
    }
  }

  static async verifyMFA(userId, code) {
    try {
      const mfaData = await getCache(`mfa:${userId}`);
      if (!mfaData) {
        throw new AuthenticationError('MFA code expired');
      }

      if (mfaData.attempts >= 3) {
        await deleteCache(`mfa:${userId}`);
        throw new AuthenticationError('Too many MFA attempts');
      }

      if (mfaData.code !== code) {
        mfaData.attempts += 1;
        await setCache(`mfa:${userId}`, mfaData, 300);
        throw new AuthenticationError('Invalid MFA code');
      }

      // Clear MFA data
      await deleteCache(`mfa:${userId}`);
      
      return { success: true };
    } catch (error) {
      logSecurity('MFA Verification Failed', { userId, error: error.message });
      throw error;
    }
  }

  static generateSecureCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendMFACode(userId, code, method) {
    // Implementation for sending MFA codes via email/SMS
    // This would integrate with your notification service
    logSecurity('MFA Code Sent', { userId, method });
  }
}

// Main Authentication Middleware
const authenticate = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = await TokenManager.verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Behavioral analysis
    const behaviorResult = await BehavioralAnalyzer.analyzeUserBehavior(
      user.id,
      'api_access',
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        deviceId: decoded.deviceId,
        path: req.path,
        method: req.method
      }
    );

    // Block if suspicious behavior detected
    if (behaviorResult.isSuspicious) {
      logSecurity('Suspicious Behavior Detected', { 
        userId: user.id, 
        riskScore: behaviorResult.riskScore 
      });
      throw new AuthenticationError('Suspicious activity detected');
    }

    // Rate limiting
    const rateLimitResult = await IntelligentRateLimiter.checkRateLimit(
      user.id,
      'api_call',
      { ip: req.ip, path: req.path }
    );

    if (!rateLimitResult.allowed) {
      throw new AuthenticationError('Rate limit exceeded');
    }

    // Attach user and context to request
    req.user = user;
    req.authContext = {
      deviceId: decoded.deviceId,
      sessionId: decoded.sessionId,
      riskScore: behaviorResult.riskScore
    };

    logPerformance('Authentication', Date.now() - startTime, { userId: user.id });
    next();
  } catch (error) {
    logSecurity('Authentication Failed', { 
      ip: req.ip, 
      userAgent: req.headers['user-agent'],
      error: error.message 
    });
    next(error);
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      logSecurity('Unauthorized Access Attempt', { 
        userId: req.user.id, 
        role: req.user.role, 
        requiredRoles: roles,
        path: req.path 
      });
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

// Biometric authentication middleware
const authenticateBiometric = async (req, res, next) => {
  try {
    const { biometricData, userId } = req.body;
    
    if (!biometricData || !userId) {
      throw new AuthenticationError('Biometric data required');
    }

    const result = await BiometricAuth.verifyBiometric(userId, biometricData, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.biometricResult = result;
    next();
  } catch (error) {
    next(error);
  }
};

// MFA verification middleware
const requireMFA = async (req, res, next) => {
  try {
    const { mfaCode } = req.body;
    
    if (!mfaCode) {
      throw new AuthenticationError('MFA code required');
    }

    const result = await MFAManager.verifyMFA(req.user.id, mfaCode);
    req.mfaVerified = true;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  authenticateBiometric,
  requireMFA,
  TokenManager,
  BehavioralAnalyzer,
  IntelligentRateLimiter,
  BiometricAuth,
  MFAManager,
  securityEvents
}; 