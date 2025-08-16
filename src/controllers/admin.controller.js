const { User, Department, Attendance, Task, SystemLog, SystemSetting } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { logPerformance, logSecurity } = require('../utils/logger');
const { AIService } = require('../services/ai.service');
const { MonitoringService } = require('../services/monitoring.service');
const { SecurityService } = require('../services/security.service');
const { getCache, setCache } = require('../config/redis');
const { Op } = require('sequelize');
const moment = require('moment');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const aiService = new AIService();
const monitoringService = new MonitoringService();
const securityService = new SecurityService();

class AdminController {
  // AI-Powered Comprehensive System Health Check
  static getAdvancedSystemHealth = asyncHandler(async (options) => {
    const { includeAI, includePredictions, detailedMetrics } = options;
    
    try {
      const startTime = Date.now();
      
      // System health metrics
      const systemMetrics = await this.getSystemMetrics();
      
      // Database health
      const databaseHealth = await this.checkDatabaseHealth();
      
      // Service health
      const serviceHealth = await this.checkServiceHealth();
      
      // Security health
      const securityHealth = await this.checkSecurityHealth();
      
      // AI-powered health analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateHealthAIInsights({
          systemMetrics,
          databaseHealth,
          serviceHealth,
          securityHealth
        });
      }

      // Health predictions
      let predictions = null;
      if (includePredictions) {
        predictions = await this.generateHealthPredictions({
          systemMetrics,
          databaseHealth,
          serviceHealth,
          securityHealth
        });
      }

      const healthReport = {
        timestamp: new Date().toISOString(),
        overallStatus: this.calculateOverallHealthStatus({
          systemMetrics,
          databaseHealth,
          serviceHealth,
          securityHealth
        }),
        systemMetrics: detailedMetrics ? systemMetrics : this.getSummaryMetrics(systemMetrics),
        databaseHealth,
        serviceHealth,
        securityHealth,
        aiInsights,
        predictions,
        recommendations: await this.generateHealthRecommendations({
          systemMetrics,
          databaseHealth,
          serviceHealth,
          securityHealth
        }),
        processingTime: Date.now() - startTime
      };

      return healthReport;
    } catch (error) {
      logSecurity('Advanced System Health Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered System Settings Management
  static getAdvancedSystemSettings = asyncHandler(async (options) => {
    const { includeAI, includeOptimization } = options;
    
    try {
      // Get current system settings
      const currentSettings = await this.getCurrentSystemSettings();
      
      // AI-powered settings analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateSettingsAIInsights(currentSettings);
      }

      // Settings optimization recommendations
      let optimizationRecommendations = null;
      if (includeOptimization) {
        optimizationRecommendations = await this.generateSettingsOptimization(currentSettings);
      }

      return {
        currentSettings,
        aiInsights,
        optimizationRecommendations,
        lastUpdated: new Date().toISOString(),
        nextReview: new Date(Date.now() + 86400000).toISOString() // 24 hours
      };
    } catch (error) {
      logSecurity('Advanced System Settings Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered User Management and Analytics
  static getAdvancedUserAnalytics = asyncHandler(async (options) => {
    const { departmentId, includeAI, includeBehavioral, timeRange } = options;
    
    try {
      const startTime = Date.now();
      
      // Get user data
      const userData = await this.getUserData(departmentId, timeRange);
      
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

      return {
        userData,
        aiInsights,
        behavioralAnalysis,
        analytics: await this.generateUserAnalytics(userData),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced User Analytics Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered System Performance Monitoring
  static getAdvancedSystemPerformance = asyncHandler(async (options) => {
    const { includeAI, includePredictions, monitoringLevel } = options;
    
    try {
      const startTime = Date.now();
      
      // System performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(monitoringLevel);
      
      // AI-powered performance analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generatePerformanceAIInsights(performanceMetrics);
      }

      // Performance predictions
      let predictions = null;
      if (includePredictions) {
        predictions = await this.generatePerformancePredictions(performanceMetrics);
      }

      return {
        performanceMetrics,
        aiInsights,
        predictions,
        recommendations: await this.generatePerformanceRecommendations(performanceMetrics),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced System Performance Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered Security Monitoring and Threat Detection
  static getAdvancedSecurityMonitoring = asyncHandler(async (options) => {
    const { includeAI, includeThreats, timeRange } = options;
    
    try {
      const startTime = Date.now();
      
      // Security monitoring data
      const securityData = await this.getSecurityMonitoringData(timeRange);
      
      // AI-powered security analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateSecurityAIInsights(securityData);
      }

      // Threat detection
      let threatAnalysis = null;
      if (includeThreats) {
        threatAnalysis = await this.detectSecurityThreats(securityData);
      }

      return {
        securityData,
        aiInsights,
        threatAnalysis,
        recommendations: await this.generateSecurityRecommendations(securityData),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced Security Monitoring Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered System Maintenance and Optimization
  static performAdvancedSystemMaintenance = asyncHandler(async (options) => {
    const { maintenanceType, includeAI, includeOptimization } = options;
    
    try {
      const startTime = Date.now();
      
      // Perform system maintenance
      const maintenanceResult = await this.performMaintenance(maintenanceType);
      
      // AI-powered maintenance analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateMaintenanceAIInsights(maintenanceResult);
      }

      // System optimization
      let optimizationResult = null;
      if (includeOptimization) {
        optimizationResult = await this.optimizeSystem(maintenanceResult);
      }

      return {
        maintenanceResult,
        aiInsights,
        optimizationResult,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced System Maintenance Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered Backup and Disaster Recovery Management
  static manageAdvancedBackupRecovery = asyncHandler(async (options) => {
    const { operation, includeAI, includeTesting } = options;
    
    try {
      const startTime = Date.now();
      
      // Perform backup/recovery operation
      const operationResult = await this.performBackupRecoveryOperation(operation);
      
      // AI-powered analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateBackupRecoveryAIInsights(operationResult);
      }

      // Recovery testing
      let testingResult = null;
      if (includeTesting) {
        testingResult = await this.testRecoveryProcedures(operationResult);
      }

      return {
        operationResult,
        aiInsights,
        testingResult,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced Backup Recovery Error', { error: error.message });
      throw error;
    }
  });

  // AI-Powered Compliance and Audit Management
  static manageAdvancedComplianceAudit = asyncHandler(async (options) => {
    const { complianceType, includeAI, includeAudit } = options;
    
    try {
      const startTime = Date.now();
      
      // Compliance management
      const complianceResult = await this.manageCompliance(complianceType);
      
      // AI-powered compliance analysis
      let aiInsights = null;
      if (includeAI) {
        aiInsights = await this.generateComplianceAIInsights(complianceResult);
      }

      // Audit management
      let auditResult = null;
      if (includeAudit) {
        auditResult = await this.manageAudit(complianceResult);
      }

      return {
        complianceResult,
        aiInsights,
        auditResult,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logSecurity('Advanced Compliance Audit Error', { error: error.message });
      throw error;
    }
  });

  // Helper methods for system health monitoring
  static async getSystemMetrics() {
    const cpuUsage = os.loadavg();
    const memoryUsage = process.memoryUsage();
    const uptime = os.uptime();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();

    return {
      cpu: {
        loadAverage: cpuUsage,
        usage: await this.getCPUUsage()
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: totalMemory,
        free: freeMemory,
        usage: ((totalMemory - freeMemory) / totalMemory) * 100
      },
      uptime,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    };
  }

  static async checkDatabaseHealth() {
    try {
      // Test database connection
      await User.findOne({ limit: 1 });
      
      // Check database performance
      const startTime = Date.now();
      await User.count();
      const queryTime = Date.now() - startTime;

      return {
        status: 'healthy',
        connection: 'active',
        queryTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connection: 'failed',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  static async checkServiceHealth() {
    const services = [
      { name: 'redis', check: () => this.checkRedisHealth() },
      { name: 'queue', check: () => this.checkQueueHealth() },
      { name: 'ai', check: () => this.checkAIHealth() },
      { name: 'monitoring', check: () => this.checkMonitoringHealth() }
    ];

    const results = {};
    for (const service of services) {
      try {
        results[service.name] = await service.check();
      } catch (error) {
        results[service.name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    return results;
  }

  static async checkSecurityHealth() {
    return await securityService.checkSystemSecurity();
  }

  // AI-powered analysis methods
  static async generateHealthAIInsights(healthData) {
    return await aiService.generateHealthInsights(healthData);
  }

  static async generateHealthPredictions(healthData) {
    return await aiService.generateHealthPredictions(healthData);
  }

  static async generateSettingsAIInsights(settings) {
    return await aiService.generateSettingsInsights(settings);
  }

  static async generateUserAIInsights(userData) {
    return await aiService.generateUserInsights(userData);
  }

  static async generatePerformanceAIInsights(performanceData) {
    return await aiService.generatePerformanceInsights(performanceData);
  }

  static async generateSecurityAIInsights(securityData) {
    return await aiService.generateSecurityInsights(securityData);
  }

  static async generateMaintenanceAIInsights(maintenanceData) {
    return await aiService.generateMaintenanceInsights(maintenanceData);
  }

  static async generateBackupRecoveryAIInsights(backupData) {
    return await aiService.generateBackupRecoveryInsights(backupData);
  }

  static async generateComplianceAIInsights(complianceData) {
    return await aiService.generateComplianceInsights(complianceData);
  }

  // Data gathering methods
  static async getCurrentSystemSettings() {
    const settings = await SystemSetting.findAll();
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });
    return settingsMap;
  }

  static async getUserData(departmentId, timeRange) {
    const whereClause = {};
    if (departmentId) whereClause.departmentId = departmentId;

    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });

    // Get user activity data
    const userActivity = await this.getUserActivityData(users.map(u => u.id), timeRange);

    return {
      users,
      activity: userActivity,
      statistics: await this.calculateUserStatistics(users, userActivity)
    };
  }

  static async getPerformanceMetrics(monitoringLevel) {
    return await monitoringService.getPerformanceMetrics(monitoringLevel);
  }

  static async getSecurityMonitoringData(timeRange) {
    return await securityService.getMonitoringData(timeRange);
  }

  // Utility methods
  static calculateOverallHealthStatus(healthData) {
    const { systemMetrics, databaseHealth, serviceHealth, securityHealth } = healthData;
    
    // Calculate overall health score
    let score = 100;
    
    // System metrics impact
    if (systemMetrics.memory.usage > 90) score -= 20;
    if (systemMetrics.cpu.loadAverage[0] > 5) score -= 15;
    
    // Database health impact
    if (databaseHealth.status !== 'healthy') score -= 25;
    
    // Service health impact
    const unhealthyServices = Object.values(serviceHealth).filter(s => s.status !== 'healthy').length;
    score -= unhealthyServices * 10;
    
    // Security health impact
    if (securityHealth.status !== 'healthy') score -= 20;
    
    // Determine status
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  static getSummaryMetrics(systemMetrics) {
    return {
      cpuUsage: systemMetrics.cpu.loadAverage[0],
      memoryUsage: systemMetrics.memory.usage,
      uptime: systemMetrics.uptime
    };
  }

  static async getCPUUsage() {
    try {
      const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | cut -d\'%\' -f1');
      return parseFloat(stdout.trim());
    } catch (error) {
      return 0;
    }
  }

  static async checkRedisHealth() {
    try {
      const redis = require('../config/redis');
      await redis.ping();
      return { status: 'healthy', connection: 'active' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  static async checkQueueHealth() {
    try {
      const Queue = require('bull');
      const queue = new Queue('default');
      const jobCounts = await queue.getJobCounts();
      return { status: 'healthy', jobCounts };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  static async checkAIHealth() {
    try {
      // Test AI service connectivity
      const testResult = await aiService.testConnection();
      return { status: 'healthy', testResult };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  static async checkMonitoringHealth() {
    try {
      const health = await monitoringService.checkHealth();
      return { status: 'healthy', health };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Additional helper methods
  static async generateHealthRecommendations(healthData) {
    const recommendations = [];
    
    if (healthData.systemMetrics.memory.usage > 90) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Memory usage is critically high. Consider increasing memory or optimizing applications.',
        action: 'optimize_memory'
      });
    }
    
    if (healthData.systemMetrics.cpu.loadAverage[0] > 5) {
      recommendations.push({
        type: 'cpu',
        priority: 'high',
        message: 'CPU load is high. Consider load balancing or scaling.',
        action: 'optimize_cpu'
      });
    }
    
    if (healthData.databaseHealth.status !== 'healthy') {
      recommendations.push({
        type: 'database',
        priority: 'critical',
        message: 'Database health issues detected. Immediate attention required.',
        action: 'fix_database'
      });
    }
    
    return recommendations;
  }

  static async generateSettingsOptimization(settings) {
    return await aiService.generateSettingsOptimization(settings);
  }

  static async analyzeUserBehavior(userData) {
    return await aiService.analyzeUserBehavior(userData);
  }

  static async generateUserAnalytics(userData) {
    return await analyticsService.generateUserAnalytics(userData);
  }

  static async generatePerformancePredictions(performanceData) {
    return await aiService.generatePerformancePredictions(performanceData);
  }

  static async generatePerformanceRecommendations(performanceData) {
    return await aiService.generatePerformanceRecommendations(performanceData);
  }

  static async detectSecurityThreats(securityData) {
    return await securityService.detectThreats(securityData);
  }

  static async generateSecurityRecommendations(securityData) {
    return await securityService.generateRecommendations(securityData);
  }

  static async performMaintenance(maintenanceType) {
    return await monitoringService.performMaintenance(maintenanceType);
  }

  static async generateMaintenanceAIInsights(maintenanceData) {
    return await aiService.generateMaintenanceInsights(maintenanceData);
  }

  static async optimizeSystem(maintenanceData) {
    return await monitoringService.optimizeSystem(maintenanceData);
  }

  static async performBackupRecoveryOperation(operation) {
    return await monitoringService.performBackupRecovery(operation);
  }

  static async generateBackupRecoveryAIInsights(backupData) {
    return await aiService.generateBackupRecoveryInsights(backupData);
  }

  static async testRecoveryProcedures(operationResult) {
    return await monitoringService.testRecovery(operationResult);
  }

  static async manageCompliance(complianceType) {
    return await securityService.manageCompliance(complianceType);
  }

  static async generateComplianceAIInsights(complianceData) {
    return await aiService.generateComplianceInsights(complianceData);
  }

  static async manageAudit(complianceData) {
    return await securityService.manageAudit(complianceData);
  }

  static async getUserActivityData(userIds, timeRange) {
    const endDate = moment();
    const startDate = moment().subtract(this.parseTimeRange(timeRange), 'days');
    
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

    return { attendance, tasks };
  }

  static async calculateUserStatistics(users, activity) {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalAttendance: activity.attendance.length,
      totalTasks: activity.tasks.length,
      averageAttendanceRate: this.calculateAverageAttendanceRate(activity.attendance),
      averageTaskCompletion: this.calculateAverageTaskCompletion(activity.tasks)
    };
  }

  static parseTimeRange(timeRange) {
    const ranges = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    return ranges[timeRange] || 30;
  }

  static calculateAverageAttendanceRate(attendance) {
    if (attendance.length === 0) return 0;
    const uniqueUsers = new Set(attendance.map(a => a.userId)).size;
    const totalDays = attendance.length;
    return (totalDays / (uniqueUsers * 30)) * 100; // Assuming 30 days
  }

  static calculateAverageTaskCompletion(tasks) {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    return (completedTasks / tasks.length) * 100;
  }
}

module.exports = { AdminController }; 