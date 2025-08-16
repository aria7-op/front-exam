const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { User, Department } = require('../models');
const { logSecurity } = require('../utils/logger');
const rateLimit = require('express-rate-limit');
const UserController = require('../controllers/UserController');

// Get all users
router.get('/', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, department } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (department) whereClause.departmentId = department;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    logSecurity('Users Retrieval Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to get users', error: error.message });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logSecurity('User Retrieval Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to get user', error: error.message });
  }
});

// Update user
router.put('/:userId', [
  authenticateToken,
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('role').optional().isIn(['employee', 'manager', 'admin']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { userId } = req.params;
    const updateData = req.body;

    if (updateData.role && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can update user roles' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email is already taken' });
      }
    }

    await user.update(updateData);
    logSecurity('User Updated', { updatedUserId: userId, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive, departmentId: user.departmentId }
    });
  } catch (error) {
    logSecurity('User Update Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

// Delete user (soft delete)
router.delete('/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId === userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ isActive: false });
    logSecurity('User Deactivated', { deactivatedUserId: userId, deactivatedBy: req.user.userId });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    logSecurity('User Deactivation Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to deactivate user', error: error.message });
  }
});

// Search users
router.get('/search', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const { Op } = require('sequelize');
    const users = await User.findAll({
              where: {
          [Op.or]: [
            { firstName: { [Op.like]: `%${q}%` } },
            { lastName: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } }
          ],
          isActive: true
        },
      attributes: { exclude: ['password'] },
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      order: [['firstName', 'ASC']]
    });

    res.json({ success: true, data: users, query: q });
  } catch (error) {
    logSecurity('User Search Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to search users', error: error.message });
  }
});

// =============================================================================
// ADVANCED AI-POWERED USER MANAGEMENT ROUTES WITH REAL-TIME ANALYTICS
// =============================================================================

// AI-Powered Advanced User Analytics
router.get('/analytics/advanced',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId, departmentId, includeAI, includeBehavioral, timeRange } = req.query;
      
      // AI-powered advanced user analytics
      const analytics = await UserController.getAdvancedUserAnalytics({
        userId,
        departmentId,
        includeAI: includeAI === 'true',
        includeBehavioral: includeBehavioral === 'true',
        timeRange: timeRange || '30d'
      });

      // Real-time analytics update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'user_analytics_advanced',
          data: analytics,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: analytics,
        metadata: {
          processingTime: analytics.processingTime,
          aiInsights: analytics.aiInsights,
          behavioralAnalysis: analytics.behavioralAnalysis
        }
      });
    } catch (error) {
      logSecurity('Advanced User Analytics Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get advanced user analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Advanced User Search and Discovery
router.post('/search/advanced',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { query, filters, includeAI, searchType, limit } = req.body;
      
      // AI-powered advanced user search
      const searchResults = await UserController.searchUsersAdvanced({
        query,
        filters,
        includeAI: includeAI || true,
        searchType: searchType || 'comprehensive',
        limit: limit || 20
      });

      res.json({
        success: true,
        data: searchResults,
        metadata: {
          query: searchResults.query,
          searchTime: searchResults.searchTime,
          totalResults: searchResults.totalResults,
          aiAnalysis: searchResults.aiAnalysis
        }
      });
    } catch (error) {
      logSecurity('Advanced User Search Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to perform advanced user search',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Advanced User Profile Management
router.put('/profile/advanced/:userId',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { profileData, includeAI, includeOptimization } = req.body;
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // AI-powered advanced user profile management
      const profileResult = await UserController.manageAdvancedUserProfile({
        userId,
        profileData,
        includeAI: includeAI || true,
        includeOptimization: includeOptimization || true
      });

      // Real-time profile update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(userId, {
          type: 'profile_updated_advanced',
          data: profileResult,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: profileResult,
        metadata: {
          processingTime: profileResult.processingTime,
          aiInsights: profileResult.aiInsights,
          optimizationRecommendations: profileResult.optimizationRecommendations
        }
      });
    } catch (error) {
      logSecurity('Advanced User Profile Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to manage advanced user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Performance Analysis
router.get('/performance/analysis/:userId',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange, includeAI, includePredictions, analysisType } = req.query;
      
      // AI-powered user performance analysis
      const performanceReport = await UserController.analyzeUserPerformance({
        userId,
        timeRange: timeRange || '30d',
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true',
        analysisType: analysisType || 'comprehensive'
      });

      // Real-time performance update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(userId, {
          type: 'performance_analysis_completed',
          data: performanceReport,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: performanceReport,
        metadata: {
          userId: performanceReport.userId,
          timeRange: performanceReport.timeRange,
          processingTime: performanceReport.processingTime,
          aiInsights: performanceReport.aiInsights,
          predictions: performanceReport.predictions
        }
      });
    } catch (error) {
      logSecurity('User Performance Analysis Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to analyze user performance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Behavior Analysis
router.get('/behavior/analysis/:userId',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange, includeAI, includePatterns, analysisDepth } = req.query;
      
      // AI-powered user behavior analysis
      const behaviorReport = await UserController.analyzeUserBehaviorAdvanced({
        userId,
        timeRange: timeRange || '30d',
        includeAI: includeAI === 'true',
        includePatterns: includePatterns === 'true',
        analysisDepth: analysisDepth || 'comprehensive'
      });

      // Real-time behavior analysis update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService && behaviorReport.riskAssessment?.riskLevel === 'high') {
        socketService.sendManagerNotification({
          type: 'high_risk_behavior_detected',
          data: behaviorReport,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: behaviorReport,
        metadata: {
          userId: behaviorReport.userId,
          timeRange: behaviorReport.timeRange,
          processingTime: behaviorReport.processingTime,
          aiInsights: behaviorReport.aiInsights,
          patterns: behaviorReport.patterns
        }
      });
    } catch (error) {
      logSecurity('User Behavior Analysis Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to analyze user behavior',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Security Analysis
router.get('/security/analysis/:userId',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'security']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { includeAI, includeThreats, timeRange } = req.query;
      
      // AI-powered user security analysis
      const securityReport = await UserController.analyzeUserSecurity({
        userId,
        includeAI: includeAI === 'true',
        includeThreats: includeThreats === 'true',
        timeRange: timeRange || '30d'
      });

      // Real-time security alert via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService && securityReport.threatAnalysis?.critical?.length > 0) {
        socketService.sendAdminNotification({
          type: 'user_security_threat_detected',
          data: securityReport,
          timestamp: new Date().toISOString(),
          priority: 'critical',
          requiresImmediate: true
        });
      }

      res.json({
        success: true,
        data: securityReport,
        metadata: {
          userId: securityReport.userId,
          processingTime: securityReport.processingTime,
          aiInsights: securityReport.aiInsights,
          threatAnalysis: securityReport.threatAnalysis
        }
      });
    } catch (error) {
      logSecurity('User Security Analysis Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to analyze user security',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Recommendations and Suggestions
router.get('/recommendations/:userId',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { recommendationType, includeAI, includePersonalization } = req.query;
      
      // AI-powered user recommendations
      const recommendations = await UserController.generateUserRecommendations({
        userId,
        recommendationType: recommendationType || 'comprehensive',
        includeAI: includeAI === 'true',
        includePersonalization: includePersonalization === 'true'
      });

      // Real-time recommendations update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(userId, {
          type: 'recommendations_generated',
          data: recommendations,
          timestamp: new Date().toISOString(),
          priority: 'low'
        });
      }

      res.json({
        success: true,
        data: recommendations,
        metadata: {
          userId: recommendations.userId,
          recommendationType: recommendations.recommendationType,
          aiRecommendations: recommendations.aiRecommendations,
          personalizedSuggestions: recommendations.personalizedSuggestions
        }
      });
    } catch (error) {
      logSecurity('User Recommendations Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate user recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Activity Monitoring
router.get('/activity/monitoring/:userId',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { includeAI, includeRealTime, monitoringLevel } = req.query;
      
      // AI-powered user activity monitoring
      const activityMonitoring = await UserController.monitorUserActivity({
        userId,
        includeAI: includeAI === 'true',
        includeRealTime: includeRealTime === 'true',
        monitoringLevel: monitoringLevel || 'comprehensive'
      });

      // Set up Server-Sent Events for real-time activity monitoring
      if (includeRealTime === 'true') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });

        // Send initial activity data
        res.write(`data: ${JSON.stringify({
          type: 'activity_initial',
          data: activityMonitoring,
          timestamp: new Date().toISOString()
        })}\n\n`);

        // Set up real-time activity updates
        const updateInterval = setInterval(async () => {
          try {
            const updatedActivity = await UserController.monitorUserActivity({
              userId,
              includeAI: includeAI === 'true',
              includeRealTime: false,
              monitoringLevel: monitoringLevel || 'comprehensive'
            });

            res.write(`data: ${JSON.stringify({
              type: 'activity_update',
              data: updatedActivity,
              timestamp: new Date().toISOString()
            })}\n\n`);
          } catch (error) {
            res.write(`data: ${JSON.stringify({
              type: 'activity_error',
              error: error.message,
              timestamp: new Date().toISOString()
            })}\n\n`);
          }
        }, 15000); // Update every 15 seconds

        // Clean up on client disconnect
        req.on('close', () => {
          clearInterval(updateInterval);
        });
      } else {
        res.json({
          success: true,
          data: activityMonitoring,
          metadata: {
            userId: activityMonitoring.userId,
            monitoringLevel: activityMonitoring.monitoringLevel,
            aiInsights: activityMonitoring.aiInsights,
            realTimeData: activityMonitoring.realTimeData
          }
        });
      }
    } catch (error) {
      logSecurity('User Activity Monitoring Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to monitor user activity',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Onboarding and Training Recommendations
router.post('/onboarding/recommendations',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId, onboardingType, includeAI, includePersonalization } = req.body;
      
      // AI-powered user onboarding recommendations
      const onboardingRecommendations = await UserController.generateOnboardingRecommendations({
        userId,
        onboardingType: onboardingType || 'comprehensive',
        includeAI: includeAI || true,
        includePersonalization: includePersonalization || true
      });

      // Real-time onboarding update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(userId, {
          type: 'onboarding_recommendations_generated',
          data: onboardingRecommendations,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: onboardingRecommendations,
        metadata: {
          userId: onboardingRecommendations.userId,
          onboardingType: onboardingRecommendations.onboardingType,
          aiRecommendations: onboardingRecommendations.aiRecommendations,
          personalizedSuggestions: onboardingRecommendations.personalizedSuggestions
        }
      });
    } catch (error) {
      logSecurity('User Onboarding Recommendations Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate onboarding recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Career Development and Growth Analysis
router.get('/career/development/:userId',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { includeAI, includePredictions, timeRange } = req.query;
      
      // AI-powered user career development analysis
      const careerDevelopment = await UserController.analyzeCareerDevelopment({
        userId,
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true',
        timeRange: timeRange || '1y'
      });

      res.json({
        success: true,
        data: careerDevelopment,
        metadata: {
          userId: careerDevelopment.userId,
          timeRange: careerDevelopment.timeRange,
          aiInsights: careerDevelopment.aiInsights,
          predictions: careerDevelopment.predictions,
          recommendations: careerDevelopment.recommendations
        }
      });
    } catch (error) {
      logSecurity('User Career Development Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to analyze career development',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

module.exports = router; 