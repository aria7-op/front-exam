const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logSecurity } = require('../utils/logger');
const { AdminController } = require('../controllers/admin.controller');
const { rateLimit } = require('../middleware/rateLimiter');

// =============================================================================
// ADVANCED AI-POWERED ADMINISTRATION ROUTES WITH REAL-TIME MONITORING
// =============================================================================

// AI-Powered Comprehensive System Health Check
router.get('/health/advanced',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { includeAI, includePredictions, detailedMetrics } = req.query;
      
      // AI-powered advanced system health check
      const healthReport = await AdminController.getAdvancedSystemHealth({
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true',
        detailedMetrics: detailedMetrics === 'true'
      });

      // Real-time health alert via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService && healthReport.overallStatus === 'poor') {
        socketService.sendAdminNotification({
          type: 'system_health_critical',
          data: healthReport,
          timestamp: new Date().toISOString(),
          priority: 'critical',
          requiresImmediate: true
        });
      }

      res.json({
        success: true,
        data: healthReport,
        metadata: {
          overallStatus: healthReport.overallStatus,
          processingTime: healthReport.processingTime,
          aiInsights: healthReport.aiInsights,
          recommendations: healthReport.recommendations
        }
      });
    } catch (error) {
      logSecurity('Advanced System Health Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get advanced system health',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered System Settings Management
router.get('/settings/advanced',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { includeAI, includeOptimization } = req.query;
      
      // AI-powered advanced system settings
      const settings = await AdminController.getAdvancedSystemSettings({
        includeAI: includeAI === 'true',
        includeOptimization: includeOptimization === 'true'
      });

      res.json({
        success: true,
        data: settings,
        metadata: {
          lastUpdated: settings.lastUpdated,
          nextReview: settings.nextReview,
          aiInsights: settings.aiInsights,
          optimizationRecommendations: settings.optimizationRecommendations
        }
      });
    } catch (error) {
      logSecurity('Advanced System Settings Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get advanced system settings',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered User Management and Analytics
router.get('/users/analytics',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { departmentId, includeAI, includeBehavioral, timeRange } = req.query;
      
      // AI-powered advanced user analytics
      const analytics = await AdminController.getAdvancedUserAnalytics({
        departmentId,
        includeAI: includeAI === 'true',
        includeBehavioral: includeBehavioral === 'true',
        timeRange: timeRange || '30d'
      });

      // Real-time user analytics update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'user_analytics_updated',
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

// AI-Powered System Performance Monitoring
router.get('/performance/advanced',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { includeAI, includePredictions, monitoringLevel } = req.query;
      
      // AI-powered advanced system performance monitoring
      const performance = await AdminController.getAdvancedSystemPerformance({
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true',
        monitoringLevel: monitoringLevel || 'comprehensive'
      });

      // Set up Server-Sent Events for real-time performance monitoring
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial performance data
      res.write(`data: ${JSON.stringify({
        type: 'performance_initial',
        data: performance,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Set up real-time performance updates
      const updateInterval = setInterval(async () => {
        try {
          const updatedPerformance = await AdminController.getAdvancedSystemPerformance({
            includeAI: includeAI === 'true',
            includePredictions: false,
            monitoringLevel: monitoringLevel || 'comprehensive'
          });

          res.write(`data: ${JSON.stringify({
            type: 'performance_update',
            data: updatedPerformance,
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          res.write(`data: ${JSON.stringify({
            type: 'performance_error',
            error: error.message,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      }, 10000); // Update every 10 seconds

      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(updateInterval);
      });
    } catch (error) {
      logSecurity('Advanced System Performance Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get advanced system performance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Security Monitoring and Threat Detection
router.get('/security/monitoring',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticateToken,
  requireRole(['admin', 'security']),
  async (req, res) => {
    try {
      const { includeAI, includeThreats, timeRange } = req.query;
      
      // AI-powered advanced security monitoring
      const securityMonitoring = await AdminController.getAdvancedSecurityMonitoring({
        includeAI: includeAI === 'true',
        includeThreats: includeThreats === 'true',
        timeRange: timeRange || '24h'
      });

      // Real-time security alert via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService && securityMonitoring.threatAnalysis?.critical?.length > 0) {
        socketService.sendAdminNotification({
          type: 'security_threat_detected',
          data: securityMonitoring.threatAnalysis.critical,
          timestamp: new Date().toISOString(),
          priority: 'critical',
          requiresImmediate: true
        });
      }

      res.json({
        success: true,
        data: securityMonitoring,
        metadata: {
          processingTime: securityMonitoring.processingTime,
          aiInsights: securityMonitoring.aiInsights,
          threatAnalysis: securityMonitoring.threatAnalysis,
          recommendations: securityMonitoring.recommendations
        }
      });
    } catch (error) {
      logSecurity('Advanced Security Monitoring Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get advanced security monitoring',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered System Maintenance and Optimization
router.post('/maintenance/advanced',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { maintenanceType, includeAI, includeOptimization } = req.body;
      
      // AI-powered advanced system maintenance
      const maintenance = await AdminController.performAdvancedSystemMaintenance({
        maintenanceType: maintenanceType || 'comprehensive',
        includeAI: includeAI || true,
        includeOptimization: includeOptimization || true
      });

      // Real-time maintenance update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'system_maintenance_completed',
          data: maintenance,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: maintenance,
        metadata: {
          maintenanceType,
          processingTime: maintenance.processingTime,
          aiInsights: maintenance.aiInsights,
          optimizationResult: maintenance.optimizationResult
        }
      });
    } catch (error) {
      logSecurity('Advanced System Maintenance Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to perform advanced system maintenance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Backup and Disaster Recovery Management
router.post('/backup-recovery/advanced',
  rateLimit({ windowMs: 30 * 60 * 1000, max: 2 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { operation, includeAI, includeTesting } = req.body;
      
      // AI-powered advanced backup and recovery management
      const backupRecovery = await AdminController.manageAdvancedBackupRecovery({
        operation: operation || 'backup',
        includeAI: includeAI || true,
        includeTesting: includeTesting || false
      });

      // Real-time backup/recovery update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'backup_recovery_completed',
          data: backupRecovery,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: backupRecovery,
        metadata: {
          operation,
          processingTime: backupRecovery.processingTime,
          aiInsights: backupRecovery.aiInsights,
          testingResult: backupRecovery.testingResult
        }
      });
    } catch (error) {
      logSecurity('Advanced Backup Recovery Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to perform advanced backup and recovery',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Compliance and Audit Management
router.post('/compliance-audit/advanced',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin', 'compliance']),
  async (req, res) => {
    try {
      const { complianceType, includeAI, includeAudit } = req.body;
      
      // AI-powered advanced compliance and audit management
      const complianceAudit = await AdminController.manageAdvancedComplianceAudit({
        complianceType: complianceType || 'general',
        includeAI: includeAI || true,
        includeAudit: includeAudit || true
      });

      // Real-time compliance/audit update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'compliance_audit_completed',
          data: complianceAudit,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: complianceAudit,
        metadata: {
          complianceType,
          processingTime: complianceAudit.processingTime,
          aiInsights: complianceAudit.aiInsights,
          auditResult: complianceAudit.auditResult
        }
      });
    } catch (error) {
      logSecurity('Advanced Compliance Audit Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to perform advanced compliance and audit',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered System Configuration Management
router.put('/configuration/advanced',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { configuration, includeAI, includeValidation } = req.body;
      
      // AI-powered advanced system configuration management
      const configResult = await AdminController.manageAdvancedConfiguration({
        configuration,
        includeAI: includeAI || true,
        includeValidation: includeValidation || true
      });

      // Real-time configuration update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'system_configuration_updated',
          data: configResult,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: configResult,
        metadata: {
          processingTime: configResult.processingTime,
          aiInsights: configResult.aiInsights,
          validationResult: configResult.validationResult
        }
      });
    } catch (error) {
      logSecurity('Advanced Configuration Management Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to manage advanced system configuration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered System Analytics and Insights
router.get('/analytics/insights',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { analyticsType, timeRange, includeAI, includePredictions } = req.query;
      
      // AI-powered advanced system analytics and insights
      const analytics = await AdminController.generateAdvancedAnalytics({
        analyticsType: analyticsType || 'comprehensive',
        timeRange: timeRange || '30d',
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true'
      });

      res.json({
        success: true,
        data: analytics,
        metadata: {
          analyticsType,
          timeRange,
          processingTime: analytics.processingTime,
          aiInsights: analytics.aiInsights,
          predictions: analytics.predictions
        }
      });
    } catch (error) {
      logSecurity('Advanced Analytics Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// Legacy routes for backward compatibility
router.get('/health', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Redirect to advanced health check
    const healthReport = await AdminController.getAdvancedSystemHealth({
      includeAI: false,
      includePredictions: false,
      detailedMetrics: false
    });
    
    res.json({
      success: true,
      data: { status: healthReport.overallStatus, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logSecurity('Legacy Health Check Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Health check failed', error: error.message });
  }
});

router.get('/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Redirect to advanced settings
    const settings = await AdminController.getAdvancedSystemSettings({
      includeAI: false,
      includeOptimization: false
    });
    
    res.json({
      success: true,
      data: { settings: settings.currentSettings }
    });
  } catch (error) {
    logSecurity('Legacy Settings Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to get settings', error: error.message });
  }
});

module.exports = router; 