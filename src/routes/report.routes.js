const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logSecurity } = require('../utils/logger');
const { ReportController } = require('../controllers/report.controller');
const { rateLimit } = require('../middleware/rateLimiter');

// =============================================================================
// ADVANCED AI-POWERED REPORTING ROUTES WITH REAL-TIME WEBSOCKET INTEGRATION
// =============================================================================

// AI-Powered Advanced Attendance Report Generation
router.get('/attendance/advanced',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { startDate, endDate, departmentId, userId, reportType, includeAI, format, realTime } = req.query;
      
      // AI-powered advanced attendance report
      const report = await ReportController.generateAdvancedAttendanceReport({
        startDate,
        endDate,
        departmentId,
        userId,
        reportType: reportType || 'comprehensive',
        includeAI: includeAI === 'true',
        format: format || 'json',
        realTime: realTime === 'true'
      });

      // Real-time report update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'advanced_attendance_report_generated',
          data: {
            reportId: report.id,
            type: 'attendance',
            status: 'completed',
            downloadUrl: report.downloadUrl,
            insights: report.aiInsights
          },
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          generationTime: report.generationTime,
          aiInsights: report.aiInsights,
          modelVersion: report.modelVersion,
          nextUpdate: report.nextUpdate
        }
      });
    } catch (error) {
      logSecurity('Advanced Attendance Report Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced attendance report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Performance Report with Behavioral Analysis
router.get('/performance/advanced',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { period, departmentId, userId, includeAI, includeBehavioral, format } = req.query;
      
      // AI-powered advanced performance report
      const report = await ReportController.generateAdvancedPerformanceReport({
        period: period || '30d',
        departmentId,
        userId,
        includeAI: includeAI === 'true',
        includeBehavioral: includeBehavioral === 'true',
        format: format || 'json'
      });

      // Real-time report update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'advanced_performance_report_generated',
          data: {
            reportId: report.id,
            type: 'performance',
            status: 'completed',
            downloadUrl: report.downloadUrl,
            behavioralAnalysis: report.behavioralAnalysis
          },
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          generationTime: report.generationTime,
          aiInsights: report.aiInsights,
          behavioralAnalysis: report.behavioralAnalysis,
          modelVersion: report.modelVersion
        }
      });
    } catch (error) {
      logSecurity('Advanced Performance Report Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced performance report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Financial Report with Cost Analysis
router.get('/financial/advanced',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin', 'finance']),
  async (req, res) => {
    try {
      const { startDate, endDate, departmentId, includeAI, includePredictions, format } = req.query;
      
      // AI-powered advanced financial report
      const report = await ReportController.generateAdvancedFinancialReport({
        startDate,
        endDate,
        departmentId,
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true',
        format: format || 'json'
      });

      // Real-time report update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'advanced_financial_report_generated',
          data: {
            reportId: report.id,
            type: 'financial',
            status: 'completed',
            downloadUrl: report.downloadUrl,
            insights: report.aiInsights
          },
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          generationTime: report.generationTime,
          aiInsights: report.aiInsights,
          modelVersion: report.modelVersion
        }
      });
    } catch (error) {
      logSecurity('Advanced Financial Report Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced financial report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Security Report with Threat Analysis
router.get('/security/advanced',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'security']),
  async (req, res) => {
    try {
      const { timeRange, includeAI, includeThreats, format } = req.query;
      
      // AI-powered advanced security report
      const report = await ReportController.generateAdvancedSecurityReport({
        timeRange: timeRange || '24h',
        includeAI: includeAI === 'true',
        includeThreats: includeThreats === 'true',
        format: format || 'json'
      });

      // Real-time security alert via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'advanced_security_report_generated',
          data: {
            reportId: report.id,
            type: 'security',
            status: 'completed',
            downloadUrl: report.downloadUrl,
            threatAnalysis: report.data.threatAssessment
          },
          timestamp: new Date().toISOString(),
          priority: 'critical'
        });
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          generationTime: report.generationTime,
          aiInsights: report.aiInsights,
          threatAnalysis: report.data.threatAssessment,
          modelVersion: report.modelVersion
        }
      });
    } catch (error) {
      logSecurity('Advanced Security Report Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced security report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Compliance Report with Audit Trail
router.get('/compliance/advanced',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin', 'compliance']),
  async (req, res) => {
    try {
      const { complianceType, timeRange, includeAI, includeAudit, format } = req.query;
      
      // AI-powered advanced compliance report
      const report = await ReportController.generateAdvancedComplianceReport({
        complianceType: complianceType || 'general',
        timeRange: timeRange || '30d',
        includeAI: includeAI === 'true',
        includeAudit: includeAudit === 'true',
        format: format || 'json'
      });

      // Real-time compliance update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendAdminNotification({
          type: 'advanced_compliance_report_generated',
          data: {
            reportId: report.id,
            type: 'compliance',
            status: 'completed',
            downloadUrl: report.downloadUrl,
            complianceStatus: report.data.complianceStatus
          },
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          generationTime: report.generationTime,
          aiInsights: report.aiInsights,
          auditTrail: report.data.auditTrail,
          modelVersion: report.modelVersion
        }
      });
    } catch (error) {
      logSecurity('Advanced Compliance Report Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced compliance report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// Real-time Report Dashboard with Live Updates
router.get('/dashboard/live',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { dashboardType, includeAI, realTimeUpdates } = req.query;
      
      // Get real-time report dashboard
      const dashboard = await ReportController.getRealTimeReportDashboard({
        dashboardType: dashboardType || 'comprehensive',
        includeAI: includeAI === 'true',
        realTimeUpdates: realTimeUpdates === 'true'
      });

      // Set up Server-Sent Events for real-time updates
      if (realTimeUpdates === 'true') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });

        // Send initial dashboard data
        res.write(`data: ${JSON.stringify({
          type: 'dashboard_initial',
          data: dashboard,
          timestamp: new Date().toISOString()
        })}\n\n`);

        // Set up real-time dashboard updates
        const updateInterval = setInterval(async () => {
          try {
            const updatedDashboard = await ReportController.getRealTimeReportDashboard({
              dashboardType: dashboardType || 'comprehensive',
              includeAI: includeAI === 'true',
              realTimeUpdates: false
            });

            res.write(`data: ${JSON.stringify({
              type: 'dashboard_update',
              data: updatedDashboard,
              timestamp: new Date().toISOString()
            })}\n\n`);
          } catch (error) {
            res.write(`data: ${JSON.stringify({
              type: 'dashboard_error',
              error: error.message,
              timestamp: new Date().toISOString()
            })}\n\n`);
          }
        }, 30000); // Update every 30 seconds

        // Clean up on client disconnect
        req.on('close', () => {
          clearInterval(updateInterval);
        });
      } else {
        res.json({
          success: true,
          data: dashboard,
          metadata: {
            dashboardType: dashboard.dashboardType,
            realTimeUpdates: dashboard.realTimeUpdates,
            nextUpdate: dashboard.nextUpdate
          }
        });
      }
    } catch (error) {
      logSecurity('Real-time Dashboard Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get real-time dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Custom Report Generator
router.post('/custom/generate',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { reportConfig, dataSources, includeAI, format } = req.body;
      
      // AI-powered custom report generation
      const report = await ReportController.generateCustomReport({
        reportConfig,
        dataSources,
        includeAI: includeAI || true,
        format: format || 'json'
      });

      // Real-time custom report update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'custom_report_generated',
          data: {
            reportId: report.id,
            type: 'custom',
            status: 'completed',
            downloadUrl: report.downloadUrl,
            config: report.config
          },
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          generationTime: report.generationTime,
          aiInsights: report.aiInsights,
          modelVersion: report.modelVersion
        }
      });
    } catch (error) {
      logSecurity('Custom Report Generation Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Report Analytics and Insights
router.get('/analytics/insights',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticateToken,
  requireRole(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { reportType, timeRange, includeAI, includePredictions } = req.query;
      
      // Get report analytics and insights
      const analytics = await ReportController.generateReportAnalytics({
        reportType: reportType || 'all',
        timeRange: timeRange || '30d',
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true'
      });

      res.json({
        success: true,
        data: analytics,
        metadata: {
          reportType,
          timeRange,
          aiInsights: analytics.aiInsights,
          predictions: analytics.predictions
        }
      });
    } catch (error) {
      logSecurity('Report Analytics Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate report analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// Legacy routes for backward compatibility
router.get('/attendance', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate, departmentId, userId } = req.query;
    
    // Redirect to advanced route
    const report = await ReportController.generateAdvancedAttendanceReport({
      startDate,
      endDate,
      departmentId,
      userId,
      reportType: 'basic',
      includeAI: false,
      format: 'json',
      realTime: false
    });
    
    res.json({
      success: true,
      data: { report: report.data.summary }
    });
  } catch (error) {
    logSecurity('Legacy Report Generation Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
});

router.get('/performance', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { period, departmentId } = req.query;
    
    // Redirect to advanced route
    const report = await ReportController.generateAdvancedPerformanceReport({
      period: period || '30d',
      departmentId,
      userId: null,
      includeAI: false,
      includeBehavioral: false,
      format: 'json'
    });
    
    res.json({
      success: true,
      data: { report: report.data.summary }
    });
  } catch (error) {
    logSecurity('Legacy Performance Report Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to generate performance report', error: error.message });
  }
});

module.exports = router; 