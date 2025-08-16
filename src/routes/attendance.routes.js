const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimiter');

// Validation schemas
const attendanceSchemas = {
  checkIn: {
    body: {
      userId: { type: 'string', required: true },
      method: { type: 'string', enum: ['biometric', 'qr_code', 'rfid', 'manual', 'mobile_app', 'voice', 'face_recognition'], required: true },
      location: { type: 'object', required: false },
      biometricData: { type: 'object', required: false },
      deviceInfo: { type: 'object', required: false },
      notes: { type: 'string', required: false }
    }
  },
  checkOut: {
    body: {
      userId: { type: 'string', required: true },
      location: { type: 'object', required: false },
      notes: { type: 'string', required: false },
      tasksCompleted: { type: 'number', required: false },
      projectAssignments: { type: 'array', required: false }
    }
  },
  predictAttendance: {
    body: {
      userId: { type: 'string', required: true },
      date: { type: 'string', required: true }
    }
  },
  approveAttendance: {
    body: {
      approved: { type: 'boolean', required: true },
      notes: { type: 'string', required: false },
      aiRecommendation: { type: 'boolean', required: false }
    }
  }
};

// Rate limiting configurations
const attendanceRateLimits = {
  checkIn: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 check-ins per 15 minutes
  checkOut: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 check-outs per 15 minutes
  dashboard: { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
  history: { windowMs: 60 * 1000, max: 20 }, // 20 requests per minute
  prediction: { windowMs: 5 * 60 * 1000, max: 5 } // 5 predictions per 5 minutes
};

// Check-in and Check-out Routes
router.post('/check-in', 
  rateLimit(attendanceRateLimits.checkIn),
  authenticate,
  validateRequest(attendanceSchemas.checkIn),
  AttendanceController.checkIn
);

router.post('/check-out',
  rateLimit(attendanceRateLimits.checkOut),
  authenticate,
  validateRequest(attendanceSchemas.checkOut),
  AttendanceController.checkOut
);

// Attendance History and Analytics
router.get('/history/:userId',
  rateLimit(attendanceRateLimits.history),
  authenticate,
  authorize(['admin', 'manager', 'hr', 'supervisor']),
  AttendanceController.getAttendanceHistory
);

router.get('/dashboard',
  rateLimit(attendanceRateLimits.dashboard),
  authenticate,
  authorize(['admin', 'manager', 'hr', 'supervisor']),
  AttendanceController.getDashboard
);

// AI-Powered Features
router.post('/predict',
  rateLimit(attendanceRateLimits.prediction),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  validateRequest(attendanceSchemas.predictAttendance),
  AttendanceController.predictAttendance
);

// Approval Routes
router.put('/:attendanceId/approve',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  validateRequest(attendanceSchemas.approveAttendance),
  AttendanceController.approveAttendance
);

// =============================================================================
// ADVANCED AI-POWERED ATTENDANCE ROUTES WITH REAL-TIME WEBSOCKET INTEGRATION
// =============================================================================

// Real-time Attendance Status with AI Analytics
router.get('/live-status',
  rateLimit({ windowMs: 30 * 1000, max: 50 }), // 50 requests per 30 seconds
  authenticate,
  authorize(['admin', 'manager', 'hr', 'supervisor']),
  async (req, res) => {
    try {
      const { departmentId, includeAI, realTimeUpdates } = req.query;
      
      // Get real-time attendance status with AI analysis
      const liveStatus = await AttendanceController.getLiveAttendanceStatus({
        departmentId,
        includeAI: includeAI === 'true',
        realTimeUpdates: realTimeUpdates === 'true'
      });

      // Emit real-time update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'attendance_status_update',
          data: liveStatus,
          timestamp: new Date().toISOString(),
          recipients: ['managers', 'admin']
        });
      }

      res.json({
        success: true,
        data: liveStatus,
        metadata: {
          lastUpdate: new Date().toISOString(),
          nextUpdate: new Date(Date.now() + 30000).toISOString(), // 30 seconds
          aiInsights: liveStatus.aiInsights,
          realTimeEnabled: true
        }
      });
    } catch (error) {
      logSecurity('Live Status Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to get live attendance status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Advanced Analytics with Real-time Streaming
router.get('/analytics/advanced',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { startDate, endDate, departmentId, analyticsType, includeAI, streamUpdates } = req.query;
      
      // Advanced AI analytics with real-time streaming
      const analyticsResult = await AttendanceController.generateAdvancedAnalytics({
        startDate,
        endDate,
        departmentId,
        analyticsType: analyticsType || 'comprehensive',
        includeAI: includeAI === 'true',
        streamUpdates: streamUpdates === 'true'
      });

      // Set up Server-Sent Events for real-time analytics updates
      if (streamUpdates === 'true') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });

        // Send initial analytics data
        res.write(`data: ${JSON.stringify({
          type: 'analytics_initial',
          data: analyticsResult,
          timestamp: new Date().toISOString()
        })}\n\n`);

        // Set up real-time analytics updates
        const updateInterval = setInterval(async () => {
          try {
            const updatedAnalytics = await AttendanceController.getRealTimeAnalytics({
              departmentId,
              includeAI: includeAI === 'true'
            });

            res.write(`data: ${JSON.stringify({
              type: 'analytics_update',
              data: updatedAnalytics,
              timestamp: new Date().toISOString()
            })}\n\n`);
          } catch (error) {
            res.write(`data: ${JSON.stringify({
              type: 'analytics_error',
              error: error.message,
              timestamp: new Date().toISOString()
            })}\n\n`);
          }
        }, 10000); // Update every 10 seconds

        // Clean up on client disconnect
        req.on('close', () => {
          clearInterval(updateInterval);
        });
      } else {
        res.json({
          success: true,
          data: analyticsResult,
          metadata: {
            processingTime: analyticsResult.processingTime,
            aiConfidence: analyticsResult.aiConfidence,
            dataFreshness: 'real-time',
            nextUpdate: new Date(Date.now() + 60000).toISOString()
          }
        });
      }
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

// AI-Powered Predictive Analytics with Machine Learning
router.post('/predict/advanced',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId, date, predictionType, includeFactors, modelType } = req.body;
      
      // Advanced AI prediction using ensemble models
      const prediction = await AttendanceController.generateAdvancedPrediction({
        userId,
        date,
        predictionType: predictionType || 'attendance',
        includeFactors: includeFactors || true,
        modelType: modelType || 'ensemble',
        confidenceThreshold: 0.85,
        includeUncertainty: true
      });

      // Real-time prediction update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(userId, {
          type: 'prediction_update',
          data: prediction,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: prediction,
        metadata: {
          modelVersion: prediction.modelVersion,
          confidence: prediction.confidence,
          uncertainty: prediction.uncertainty,
          factors: prediction.factors,
          nextPrediction: prediction.nextPrediction,
          modelPerformance: prediction.modelPerformance
        }
      });
    } catch (error) {
      logSecurity('Advanced Prediction Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced prediction',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// Multi-Modal Biometric Attendance with AI Verification
router.post('/biometric/advanced',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticate,
  async (req, res) => {
    try {
      const { biometricData, type, location, deviceInfo, aiVerification, verificationMethods } = req.body;
      
      // Advanced multi-modal AI verification
      const verificationResult = await AttendanceController.processAdvancedBiometricAttendance({
        userId: req.user.userId,
        biometricData,
        type,
        location,
        deviceInfo,
        aiVerification: aiVerification || true,
        verificationMethods: verificationMethods || ['face', 'fingerprint', 'voice', 'behavior', 'iris'],
        livenessDetection: true,
        fraudDetection: true,
        spoofingDetection: true
      });

      // Real-time attendance update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.broadcastNotification({
          type: 'advanced_attendance_marked',
          data: {
            userId: req.user.userId,
            type: verificationResult.type,
            timestamp: verificationResult.timestamp,
            confidence: verificationResult.confidence,
            aiVerified: verificationResult.aiVerified,
            fraudScore: verificationResult.fraudScore,
            verificationMethods: verificationResult.verificationMethods
          },
          recipients: ['managers', 'admin'],
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: verificationResult,
        metadata: {
          verificationTime: verificationResult.verificationTime,
          aiConfidence: verificationResult.aiConfidence,
          fraudScore: verificationResult.fraudScore,
          livenessScore: verificationResult.livenessScore,
          nextAction: verificationResult.nextAction,
          securityLevel: verificationResult.securityLevel
        }
      });
    } catch (error) {
      logSecurity('Advanced Biometric Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Advanced biometric verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Anomaly Detection with Real-time Alerting
router.get('/anomalies/advanced',
  rateLimit({ windowMs: 60 * 1000, max: 15 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { severity, timeRange, includeAI, autoResolve, detectionMethods } = req.query;
      
      // Advanced AI anomaly detection with multiple algorithms
      const anomalies = await AttendanceController.detectAdvancedAnomalies({
        severity: severity || 'all',
        timeRange: timeRange || '24h',
        includeAI: includeAI === 'true',
        autoResolve: autoResolve === 'true',
        detectionMethods: detectionMethods ? detectionMethods.split(',') : ['statistical', 'ml', 'behavioral', 'temporal', 'spatial'],
        confidenceThreshold: 0.8
      });

      // Real-time anomaly alerts via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        if (anomalies.critical.length > 0) {
          socketService.sendAdminNotification({
            type: 'critical_anomaly_detected',
            data: anomalies.critical,
            timestamp: new Date().toISOString(),
            priority: 'critical',
            requiresImmediate: true
          });
        }
        
        if (anomalies.high.length > 0) {
          socketService.sendManagerNotification({
            type: 'high_anomaly_detected',
            data: anomalies.high,
            timestamp: new Date().toISOString(),
            priority: 'high'
          });
        }
      }

      res.json({
        success: true,
        data: anomalies,
        metadata: {
          detectionTime: anomalies.detectionTime,
          aiConfidence: anomalies.aiConfidence,
          autoResolved: anomalies.autoResolved,
          detectionMethods: anomalies.detectionMethods,
          nextScan: new Date(Date.now() + 30000).toISOString(), // 30 seconds
          alertThreshold: anomalies.alertThreshold
        }
      });
    } catch (error) {
      logSecurity('Advanced Anomaly Detection Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to detect advanced anomalies',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Behavioral Analysis and Risk Assessment
router.get('/behavior/analysis',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { userId, timeRange, includeAI, riskAssessment } = req.query;
      
      // Advanced behavioral analysis with AI
      const behaviorAnalysis = await AttendanceController.analyzeUserBehavior({
        userId,
        timeRange: timeRange || '30d',
        includeAI: includeAI === 'true',
        riskAssessment: riskAssessment === 'true',
        analysisDepth: 'comprehensive'
      });

      // Real-time behavioral insights via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService && behaviorAnalysis.riskLevel === 'high') {
        socketService.sendManagerNotification({
          type: 'high_risk_behavior_detected',
          data: behaviorAnalysis,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: behaviorAnalysis,
        metadata: {
          analysisTime: behaviorAnalysis.analysisTime,
          aiConfidence: behaviorAnalysis.aiConfidence,
          riskLevel: behaviorAnalysis.riskLevel,
          recommendations: behaviorAnalysis.recommendations,
          nextAnalysis: new Date(Date.now() + 3600000).toISOString() // 1 hour
        }
      });
    } catch (error) {
      logSecurity('Behavior Analysis Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to analyze user behavior',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Advanced Reports with Real-time Generation
router.get('/reports/ai-generated',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { reportType, dateRange, departmentId, includeAI, format, realTime } = req.query;
      
      // AI-powered advanced report generation
      const report = await AttendanceController.generateAIReport({
        reportType,
        dateRange,
        departmentId,
        includeAI: includeAI === 'true',
        format: format || 'json',
        realTime: realTime === 'true',
        includeInsights: true,
        includePredictions: true,
        includeRecommendations: true,
        includeVisualizations: true
      });

      // Real-time report update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'ai_report_generated',
          data: {
            reportId: report.id,
            type: reportType,
            status: 'completed',
            downloadUrl: report.downloadUrl,
            insights: report.aiInsights,
            predictions: report.predictions
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
          predictions: report.predictions,
          recommendations: report.recommendations,
          visualizations: report.visualizations,
          nextUpdate: report.nextUpdate,
          modelVersion: report.modelVersion
        }
      });
    } catch (error) {
      logSecurity('AI Report Generation Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);
router.get('/status/:userId', 
  authenticate,
  AttendanceController.getCurrentStatus
);

// Attendance Reports
router.get('/reports/daily',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getDailyReport
);

router.get('/reports/weekly',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getWeeklyReport
);

router.get('/reports/monthly',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getMonthlyReport
);

// Anomaly Detection
router.get('/anomalies',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getAnomalies
);

router.post('/anomalies/:attendanceId/resolve',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.resolveAnomaly
);

// Biometric Integration
router.post('/biometric/verify',
  authenticate,
  AttendanceController.verifyBiometric
);

router.post('/biometric/enroll',
  authenticate,
  AttendanceController.enrollBiometric
);

// Location-based Attendance
router.post('/location/validate',
  authenticate,
  AttendanceController.validateLocation
);

router.get('/location/nearby',
  authenticate,
  AttendanceController.getNearbyOffices
);

// Break Management
router.post('/:attendanceId/breaks/start',
  authenticate,
  AttendanceController.startBreak
);

router.post('/:attendanceId/breaks/end',
  authenticate,
  AttendanceController.endBreak
);

router.get('/:attendanceId/breaks',
  authenticate,
  AttendanceController.getBreaks
);

// Overtime Management
router.post('/:attendanceId/overtime/request',
  authenticate,
  AttendanceController.requestOvertime
);

router.put('/overtime/:requestId/approve',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.approveOvertime
);

router.get('/overtime/pending',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getPendingOvertime
);

// Leave Integration
router.post('/:attendanceId/leave/request',
  authenticate,
  AttendanceController.requestLeave
);

router.get('/leave/balance/:userId',
  authenticate,
  AttendanceController.getLeaveBalance
);

// Performance Analytics
router.get('/analytics/performance/:userId',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getPerformanceAnalytics
);

router.get('/analytics/team/:departmentId',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getTeamAnalytics
);

// Export and Integration
router.get('/export/csv',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.exportToCSV
);

router.get('/export/pdf',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.exportToPDF
);

router.post('/import/csv',
  authenticate,
  authorize(['admin', 'hr']),
  AttendanceController.importFromCSV
);

// API Integration
router.post('/webhook/attendance',
  AttendanceController.handleWebhook
);

router.get('/api/status',
  AttendanceController.getAPIStatus
);

// Bulk Operations
router.post('/bulk/check-in',
  authenticate,
  authorize(['admin', 'hr']),
  AttendanceController.bulkCheckIn
);

router.post('/bulk/check-out',
  authenticate,
  authorize(['admin', 'hr']),
  AttendanceController.bulkCheckOut
);

router.post('/bulk/approve',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.bulkApprove
);

// Advanced Features
router.post('/schedule/auto-generate',
  authenticate,
  authorize(['admin', 'hr']),
  AttendanceController.autoGenerateSchedule
);

router.post('/schedule/optimize',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.optimizeSchedule
);

router.get('/schedule/:userId',
  authenticate,
  AttendanceController.getUserSchedule
);

// Notification and Alerts
router.post('/alerts/configure',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.configureAlerts
);

router.get('/alerts/:userId',
  authenticate,
  AttendanceController.getUserAlerts
);

router.post('/alerts/:alertId/acknowledge',
  authenticate,
  AttendanceController.acknowledgeAlert
);

// Health and Wellness
router.post('/wellness/check',
  authenticate,
  AttendanceController.checkWellness
);

router.get('/wellness/report/:userId',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getWellnessReport
);

// Compliance and Audit
router.get('/compliance/audit',
  authenticate,
  authorize(['admin', 'hr']),
  AttendanceController.getComplianceAudit
);

router.post('/compliance/validate',
  authenticate,
  authorize(['admin', 'hr']),
  AttendanceController.validateCompliance
);

// Mobile App Specific Routes
router.post('/mobile/check-in',
  rateLimit(attendanceRateLimits.checkIn),
  authenticate,
  AttendanceController.mobileCheckIn
);

router.post('/mobile/check-out',
  rateLimit(attendanceRateLimits.checkOut),
  authenticate,
  AttendanceController.mobileCheckOut
);

router.get('/mobile/status',
  authenticate,
  AttendanceController.getMobileStatus
);

// Offline Support
router.post('/offline/sync',
  authenticate,
  AttendanceController.syncOfflineData
);

router.get('/offline/pending',
  authenticate,
  AttendanceController.getPendingOfflineData
);

// Advanced Analytics
router.get('/analytics/trends',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getAttendanceTrends
);

router.get('/analytics/predictions',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getAttendancePredictions
);

router.get('/analytics/patterns',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  AttendanceController.getAttendancePatterns
);

// System Health and Monitoring
router.get('/health/status',
  AttendanceController.getSystemHealth
);

router.get('/health/metrics',
  authenticate,
  authorize(['admin']),
  AttendanceController.getSystemMetrics
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Attendance Route Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in attendance system',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router; 