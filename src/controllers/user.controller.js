const { User, Department, Attendance, Task, UserProfile, UserActivity } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { logPerformance, logSecurity } = require('../utils/logger');
const { AIService } = require('../services/ai.service');
const { UserService } = require('../services/user.service');
const { SecurityService } = require('../services/security.service');
const { getCache, setCache } = require('../config/redis');
const { Op } = require('sequelize');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const aiService = new AIService();
const userService = new UserService();
const securityService = new SecurityService();

class UserController {
  // AI-Powered Advanced User Analytics
  static getAdvancedUserAnalytics = asyncHandler(async (options) => {
    const { userId, departmentId, includeAI, includeBehavioral, timeRange } = options;
    
    try {
      const startTime = Date.now();
      
      // Get comprehensive user data
      const userData = await this.getComprehensiveUserData(userId, departmentId, timeRange);
      
      // AI-powered user analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateUserAIInsights(userData);
      }

      // Behavioral analysis
      let behavioralAnalysis = null;
      if (includeBehavioral) {
        behavioralAnalysis = await this.analyzeUserBehavior(userData);
      }

      // Generate comprehensive analytics
      const analytics = {
        userData,
        aiInsights,
        behavioralAnalysis,
        performanceMetrics: await this.calculatePerformanceMetrics(userData),
        attendanceAnalytics: await this.calculateAttendanceAnalytics(userData),
        productivityAnalytics: await this.calculateProductivityAnalytics(userData),
        riskAssessment: await this.assessUserRisk(userData),
        recommendations: await this.generateUserRecommendations(userData),
        processingTime: Date.now() - startTime
      };

      return analytics;
    } catch (error) {
      logSecurity('Advanced User Analytics Error', { error: error.message, userId });
      throw error;
    }
  });

  // AI-Powered User Search and Discovery
  static searchUsersAdvanced = asyncHandler(async (options) => {
    const { query, filters, includeAI, searchType, limit } = options;
    
    try {
      const startTime = Date.now();
      
      // AI-powered search
      let searchResults = null;
      if (includeAI) {
        searchResults = await this.performAISearch(query, filters, searchType);
      } else {
        searchResults = await this.performStandardSearch(query, filters, limit);
      }

      // AI-powered result analysis
      let aiAnalysis = null;
      if (includeAI) {
        aiAnalysis = await this.analyzeSearchResults(searchResults, query);
      }

      return {
        query,
        results: searchResults,
        aiAnalysis,
        searchTime: Date.now() - startTime,
        totalResults: searchResults.length
      };
    } catch (error) {
      logSecurity('Advanced User Search Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered User Profile Management
  static manageAdvancedUserProfile = asyncHandler(async (options) => {
    const { userId, profileData, includeAI, includeOptimization } = options;
    
    try {
      const startTime = Date.now();
      
      // Validate and process profile data
      const validatedData = await this.validateProfileData(profileData);
      
      // AI-powered profile analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateProfileAIInsights(validatedData, userId);
      }

      // Profile optimization
      let optimizationRecommendations = null;
      if (includeOptimization) {
        optimizationRecommendations = await this.optimizeUserProfile(validatedData, userId);
      }

      // Update user profile
      const updatedProfile = await this.updateUserProfile(userId, validatedData);

      return {
        profile: updatedProfile,
        aiInsights,
        optimizationRecommendations,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced User Profile Error', { error: error.message, userId });
      throw error;
    }
  });

  // AI-Powered User Performance Analysis
  static analyzeUserPerformance = asyncHandler(async (options) => {
    const { userId, timeRange, includeAI, includePredictions, analysisType } = options;
    
    try {
      const startTime = Date.now();
      
      // Get user performance data
      const performanceData = await this.getUserPerformanceData(userId, timeRange);
      
      // AI-powered performance analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generatePerformanceAIInsights(performanceData, analysisType);
      }

      // Performance predictions
      let predictions = null;
      if (includePredictions) {
        predictions = await this.generatePerformancePredictions(performanceData);
      }

      // Generate comprehensive performance report
      const performanceReport = {
        userId,
        timeRange,
        performanceData,
        aiInsights,
        predictions,
        metrics: await this.calculateDetailedPerformanceMetrics(performanceData),
        trends: await this.analyzePerformanceTrends(performanceData),
        comparisons: await this.generatePerformanceComparisons(performanceData),
        recommendations: await this.generatePerformanceRecommendations(performanceData),
        processingTime: Date.now() - startTime
      };

      return performanceReport;
    } catch (error) {
      logSecurity('User Performance Analysis Error', { error: error.message, userId });
      throw error;
    }
  });

  // AI-Powered User Behavior Analysis
  static analyzeUserBehaviorAdvanced = asyncHandler(async (options) => {
    const { userId, timeRange, includeAI, includePatterns, analysisDepth } = options;
    
    try {
      const startTime = Date.now();
      
      // Get user behavior data
      const behaviorData = await this.getUserBehaviorData(userId, timeRange);
      
      // AI-powered behavior analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateBehaviorAIInsights(behaviorData, analysisDepth);
      }

      // Pattern recognition
      let patterns = null;
      if (includePatterns) {
        patterns = await this.recognizeBehaviorPatterns(behaviorData);
      }

      // Generate comprehensive behavior report
      const behaviorReport = {
        userId,
        timeRange,
        behaviorData,
        aiInsights,
        patterns,
        analysis: await this.analyzeBehavioralTrends(behaviorData),
        riskAssessment: await this.assessBehavioralRisk(behaviorData),
        recommendations: await this.generateBehavioralRecommendations(behaviorData),
        processingTime: Date.now() - startTime
      };

      return behaviorReport;
    } catch (error) {
      logSecurity('User Behavior Analysis Error', { error: error.message, userId });
      throw error;
    }
  });

  // AI-Powered User Security Analysis
  static analyzeUserSecurity = asyncHandler(async (options) => {
    const { userId, includeAI, includeThreats, timeRange } = options;
    
    try {
      const startTime = Date.now();
      
      // Get user security data
      const securityData = await this.getUserSecurityData(userId, timeRange);
      
      // AI-powered security analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateSecurityAIInsights(securityData);
      }

      // Threat detection
      let threatAnalysis = null;
      if (includeThreats) {
        threatAnalysis = await this.detectUserThreats(securityData);
      }

      // Generate comprehensive security report
      const securityReport = {
        userId,
        securityData,
        aiInsights,
        threatAnalysis,
        riskAssessment: await this.assessUserSecurityRisk(securityData),
        recommendations: await this.generateSecurityRecommendations(securityData),
        processingTime: Date.now() - startTime
      };

      return securityReport;
    } catch (error) {
      logSecurity('User Security Analysis Error', { error: error.message, userId });
      throw error;
    }
  });

  // AI-Powered User Recommendations and Suggestions
  static generateUserRecommendations = asyncHandler(async (options) => {
    const { userId, recommendationType, includeAI, includePersonalization } = options;
    
    try {
      const startTime = Date.now();
      
      // Get user data for recommendations
      const userData = await this.getUserRecommendationData(userId);
      
      // AI-powered recommendations
      let aiRecommendations = null;
      if (includeAI) {
        aiRecommendations = await this.generateAIRecommendations(userData, recommendationType);
      }

      // Personalized suggestions
      let personalizedSuggestions = null;
      if (includePersonalization) {
        personalizedSuggestions = await this.generatePersonalizedSuggestions(userData, recommendationType);
      }

      return {
        userId,
        recommendationType,
        aiRecommendations,
        personalizedSuggestions,
        generalRecommendations: await this.generateGeneralRecommendations(userData),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('User Recommendations Error', { error: error.message, userId });
      throw error;
    }
  });

  // AI-Powered User Activity Monitoring
  static monitorUserActivity = asyncHandler(async (options) => {
    const { userId, includeAI, includeRealTime, monitoringLevel } = options;
    
    try {
      const startTime = Date.now();
      
      // Get user activity data
      const activityData = await this.getUserActivityData(userId, monitoringLevel);
      
      // AI-powered activity analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateActivityAIInsights(activityData);
      }

      // Real-time monitoring
      let realTimeData = null;
      if (includeRealTime) {
        realTimeData = await this.getRealTimeActivityData(userId);
      }

      return {
        userId,
        activityData,
        aiInsights,
        realTimeData,
        monitoringLevel,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('User Activity Monitoring Error', { error: error.message, userId });
      throw error;
    }
  });

  // Helper methods for data gathering
  static async getComprehensiveUserData(userId, departmentId, timeRange) {
    const endDate = moment();
    const startDate = moment().subtract(this.parseTimeRange(timeRange), 'days');
    
    const whereClause = {};
    if (userId) whereClause.id = userId;
    if (departmentId) whereClause.departmentId = departmentId;

    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: UserProfile,
          as: 'profile',
          attributes: ['id', 'skills', 'preferences', 'goals']
        }
      ]
    });

    // Get user activity data
    const userIds = users.map(u => u.id);
    const attendance = await Attendance.findAll({
      where: {
        userId: { [Op.in]: userIds },
        date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
        }
      }
    });

    const tasks = await Task.findAll({
      where: {
        assigneeId: { [Op.in]: userIds },
        createdAt: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      }
    });

    const activities = await UserActivity.findAll({
      where: {
        userId: { [Op.in]: userIds },
        timestamp: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      }
    });

    return {
      users,
      attendance,
      tasks,
      activities,
      timeRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    };
  }

  static async performAISearch(query, filters, searchType) {
    return await aiService.performUserSearch(query, filters, searchType);
  }

  static async performStandardSearch(query, filters, limit) {
    const whereClause = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${query}%` } },
        { lastName: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } }
      ],
      isActive: true
    };

    if (filters.role) whereClause.role = filters.role;
    if (filters.departmentId) whereClause.departmentId = filters.departmentId;

    return await User.findAll({
      where: whereClause,
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      limit: limit || 20,
      order: [['firstName', 'ASC']]
    });
  }

  static async validateProfileData(profileData) {
    // Validate profile data
    const validated = {};
    
    if (profileData.firstName) {
      validated.firstName = profileData.firstName.trim();
    }
    
    if (profileData.lastName) {
      validated.lastName = profileData.lastName.trim();
    }
    
    if (profileData.email) {
      validated.email = profileData.email.toLowerCase().trim();
    }
    
    if (profileData.phone) {
      validated.phone = profileData.phone.trim();
    }
    
    if (profileData.departmentId) {
      validated.departmentId = parseInt(profileData.departmentId);
    }
    
    return validated;
  }

  static async getUserPerformanceData(userId, timeRange) {
    const endDate = moment();
    const startDate = moment().subtract(this.parseTimeRange(timeRange), 'days');
    
    const attendance = await Attendance.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
        }
      },
      order: [['date', 'ASC']]
    });

    const tasks = await Task.findAll({
      where: {
        assigneeId: userId,
        createdAt: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      },
      order: [['createdAt', 'ASC']]
    });

    const activities = await UserActivity.findAll({
      where: {
        userId,
        timestamp: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      },
      order: [['timestamp', 'ASC']]
    });

    return {
      attendance,
      tasks,
      activities,
      timeRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    };
  }

  static async getUserBehaviorData(userId, timeRange) {
    const endDate = moment();
    const startDate = moment().subtract(this.parseTimeRange(timeRange), 'days');
    
    const activities = await UserActivity.findAll({
      where: {
        userId,
        timestamp: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      },
      order: [['timestamp', 'ASC']]
    });

    const attendance = await Attendance.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
        }
      },
      order: [['date', 'ASC']]
    });

    return {
      activities,
      attendance,
      timeRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    };
  }

  static async getUserSecurityData(userId, timeRange) {
    const endDate = moment();
    const startDate = moment().subtract(this.parseTimeRange(timeRange), 'days');
    
    // Get security-related activities
    const securityActivities = await UserActivity.findAll({
      where: {
        userId,
        type: { [Op.in]: ['login', 'logout', 'password_change', 'profile_update', 'security_violation'] },
        timestamp: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      },
      order: [['timestamp', 'DESC']]
    });

    return {
      securityActivities,
      timeRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    };
  }

  // AI-powered analysis methods
  static async generateUserAIInsights(userData) {
    return await aiService.generateUserInsights(userData);
  }

  static async analyzeUserBehavior(userData) {
    return await aiService.analyzeUserBehavior(userData);
  }

  static async generateProfileAIInsights(profileData, userId) {
    return await aiService.generateProfileInsights(profileData, userId);
  }

  static async generatePerformanceAIInsights(performanceData, analysisType) {
    return await aiService.generatePerformanceInsights(performanceData, analysisType);
  }

  static async generateBehaviorAIInsights(behaviorData, analysisDepth) {
    return await aiService.generateBehaviorInsights(behaviorData, analysisDepth);
  }

  static async generateSecurityAIInsights(securityData) {
    return await aiService.generateSecurityInsights(securityData);
  }

  static async generateActivityAIInsights(activityData) {
    return await aiService.generateActivityInsights(activityData);
  }

  // Data processing methods
  static async calculatePerformanceMetrics(userData) {
    return await userService.calculatePerformanceMetrics(userData);
  }

  static async calculateAttendanceAnalytics(userData) {
    return await userService.calculateAttendanceAnalytics(userData);
  }

  static async calculateProductivityAnalytics(userData) {
    return await userService.calculateProductivityAnalytics(userData);
  }

  static async assessUserRisk(userData) {
    return await userService.assessUserRisk(userData);
  }

  static async generateUserRecommendations(userData) {
    return await userService.generateRecommendations(userData);
  }

  // Additional helper methods
  static async analyzeSearchResults(searchResults, query) {
    return await aiService.analyzeSearchResults(searchResults, query);
  }

  static async optimizeUserProfile(profileData, userId) {
    return await userService.optimizeProfile(profileData, userId);
  }

  static async updateUserProfile(userId, profileData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    await user.update(profileData);
    return user;
  }

  static async generatePerformancePredictions(performanceData) {
    return await aiService.generatePerformancePredictions(performanceData);
  }

  static async calculateDetailedPerformanceMetrics(performanceData) {
    return await userService.calculateDetailedMetrics(performanceData);
  }

  static async analyzePerformanceTrends(performanceData) {
    return await userService.analyzePerformanceTrends(performanceData);
  }

  static async generatePerformanceComparisons(performanceData) {
    return await userService.generatePerformanceComparisons(performanceData);
  }

  static async generatePerformanceRecommendations(performanceData) {
    return await userService.generatePerformanceRecommendations(performanceData);
  }

  static async recognizeBehaviorPatterns(behaviorData) {
    return await aiService.recognizeBehaviorPatterns(behaviorData);
  }

  static async analyzeBehavioralTrends(behaviorData) {
    return await userService.analyzeBehavioralTrends(behaviorData);
  }

  static async assessBehavioralRisk(behaviorData) {
    return await userService.assessBehavioralRisk(behaviorData);
  }

  static async generateBehavioralRecommendations(behaviorData) {
    return await userService.generateBehavioralRecommendations(behaviorData);
  }

  static async detectUserThreats(securityData) {
    return await securityService.detectUserThreats(securityData);
  }

  static async assessUserSecurityRisk(securityData) {
    return await securityService.assessUserSecurityRisk(securityData);
  }

  static async generateSecurityRecommendations(securityData) {
    return await securityService.generateUserSecurityRecommendations(securityData);
  }

  static async generateAIRecommendations(userData, recommendationType) {
    return await aiService.generateUserRecommendations(userData, recommendationType);
  }

  static async generatePersonalizedSuggestions(userData, recommendationType) {
    return await userService.generatePersonalizedSuggestions(userData, recommendationType);
  }

  static async generateGeneralRecommendations(userData) {
    return await userService.generateGeneralRecommendations(userData);
  }

  static async getUserRecommendationData(userId) {
    return await userService.getRecommendationData(userId);
  }

  static async getUserActivityData(userId, monitoringLevel) {
    return await userService.getActivityData(userId, monitoringLevel);
  }

  static async getRealTimeActivityData(userId) {
    return await userService.getRealTimeActivityData(userId);
  }

  // Utility methods
  static parseTimeRange(timeRange) {
    const ranges = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    return ranges[timeRange] || 30;
  }
}

module.exports = { UserController }; 