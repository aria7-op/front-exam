const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimiter');

// Validation schemas
const taskSchemas = {
  createTask: {
    body: {
      title: { type: 'string', required: true, minLength: 3, maxLength: 255 },
      description: { type: 'string', required: false },
      assignedTo: { type: 'string', required: true },
      projectId: { type: 'string', required: false },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent', 'critical'], required: false },
      type: { type: 'string', enum: ['feature', 'bug', 'improvement', 'research', 'documentation', 'testing', 'maintenance', 'meeting'], required: false },
      estimatedHours: { type: 'number', required: false, min: 0 },
      dueDate: { type: 'string', required: false },
      dependencies: { type: 'array', required: false },
      tags: { type: 'array', required: false },
      complexity: { type: 'string', enum: ['simple', 'moderate', 'complex', 'very_complex'], required: false },
      effort: { type: 'string', enum: ['low', 'medium', 'high', 'very_high'], required: false },
      isRecurring: { type: 'boolean', required: false },
      recurrencePattern: { type: 'object', required: false }
    }
  },
  updateTask: {
    body: {
      title: { type: 'string', required: false, minLength: 3, maxLength: 255 },
      description: { type: 'string', required: false },
      status: { type: 'string', enum: ['pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold', 'blocked'], required: false },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent', 'critical'], required: false },
      progress: { type: 'number', required: false, min: 0, max: 100 },
      dueDate: { type: 'string', required: false },
      estimatedHours: { type: 'number', required: false, min: 0 },
      actualHours: { type: 'number', required: false, min: 0 },
      tags: { type: 'array', required: false },
      blockers: { type: 'array', required: false }
    }
  },
  addTimeEntry: {
    body: {
      startTime: { type: 'string', required: true },
      endTime: { type: 'string', required: true },
      description: { type: 'string', required: false },
      activity: { type: 'string', required: false }
    }
  },
  addComment: {
    body: {
      content: { type: 'string', required: true, minLength: 1 },
      type: { type: 'string', enum: ['comment', 'update', 'question', 'suggestion'], required: false }
    }
  },
  optimizeAssignment: {
    body: {
      tasks: { type: 'array', required: true },
      teamMembers: { type: 'array', required: true }
    }
  }
};

// Rate limiting configurations
const taskRateLimits = {
  create: { windowMs: 5 * 60 * 1000, max: 20 }, // 20 tasks per 5 minutes
  update: { windowMs: 60 * 1000, max: 30 }, // 30 updates per minute
  list: { windowMs: 60 * 1000, max: 50 }, // 50 requests per minute
  timeEntry: { windowMs: 60 * 1000, max: 10 }, // 10 time entries per minute
  comment: { windowMs: 60 * 1000, max: 20 }, // 20 comments per minute
  analytics: { windowMs: 5 * 60 * 1000, max: 10 } // 10 analytics requests per 5 minutes
};

// Task CRUD Operations
router.post('/',
  rateLimit(taskRateLimits.create),
  authenticate,
  authorize(['admin', 'manager', 'hr', 'supervisor']),
  validateRequest(taskSchemas.createTask),
  TaskController.createTask
);

router.get('/',
  rateLimit(taskRateLimits.list),
  authenticate,
  TaskController.getTasks
);

router.get('/:taskId',
  authenticate,
  TaskController.getTaskDetails
);

router.put('/:taskId',
  rateLimit(taskRateLimits.update),
  authenticate,
  validateRequest(taskSchemas.updateTask),
  TaskController.updateTask
);

router.delete('/:taskId',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.deleteTask
);

// Time Tracking
router.post('/:taskId/time-entries',
  rateLimit(taskRateLimits.timeEntry),
  authenticate,
  validateRequest(taskSchemas.addTimeEntry),
  TaskController.addTimeEntry
);

router.get('/:taskId/time-entries',
  authenticate,
  TaskController.getTimeEntries
);

router.put('/:taskId/time-entries/:entryId',
  authenticate,
  TaskController.updateTimeEntry
);

router.delete('/:taskId/time-entries/:entryId',
  authenticate,
  TaskController.deleteTimeEntry
);

// Comments and Collaboration
router.post('/:taskId/comments',
  rateLimit(taskRateLimits.comment),
  authenticate,
  validateRequest(taskSchemas.addComment),
  TaskController.addComment
);

router.get('/:taskId/comments',
  authenticate,
  TaskController.getComments
);

router.put('/:taskId/comments/:commentId',
  authenticate,
  TaskController.updateComment
);

router.delete('/:taskId/comments/:commentId',
  authenticate,
  TaskController.deleteComment
);

// Task Management Features
router.post('/:taskId/start',
  authenticate,
  TaskController.startTask
);

router.post('/:taskId/pause',
  authenticate,
  TaskController.pauseTask
);

router.post('/:taskId/complete',
  authenticate,
  TaskController.completeTask
);

router.post('/:taskId/reopen',
  authenticate,
  TaskController.reopenTask
);

// Subtasks Management
router.post('/:taskId/subtasks',
  authenticate,
  TaskController.createSubtask
);

router.get('/:taskId/subtasks',
  authenticate,
  TaskController.getSubtasks
);

router.put('/:taskId/subtasks/:subtaskId',
  authenticate,
  TaskController.updateSubtask
);

router.delete('/:taskId/subtasks/:subtaskId',
  authenticate,
  TaskController.deleteSubtask
);

// Dependencies Management
router.post('/:taskId/dependencies',
  authenticate,
  TaskController.addDependency
);

router.get('/:taskId/dependencies',
  authenticate,
  TaskController.getDependencies
);

router.delete('/:taskId/dependencies/:dependencyId',
  authenticate,
  TaskController.removeDependency
);

// Blockers Management
router.post('/:taskId/blockers',
  authenticate,
  TaskController.addBlocker
);

router.get('/:taskId/blockers',
  authenticate,
  TaskController.getBlockers
);

router.put('/:taskId/blockers/:blockerId/resolve',
  authenticate,
  TaskController.resolveBlocker
);

// Checkpoints and Milestones
router.post('/:taskId/checkpoints',
  authenticate,
  TaskController.addCheckpoint
);

router.get('/:taskId/checkpoints',
  authenticate,
  TaskController.getCheckpoints
);

router.put('/:taskId/checkpoints/:checkpointId/complete',
  authenticate,
  TaskController.completeCheckpoint
);

// Attachments
router.post('/:taskId/attachments',
  authenticate,
  TaskController.addAttachment
);

router.get('/:taskId/attachments',
  authenticate,
  TaskController.getAttachments
);

router.delete('/:taskId/attachments/:attachmentId',
  authenticate,
  TaskController.deleteAttachment
);

// Task Analytics and Reports
router.get('/analytics/overview',
  rateLimit(taskRateLimits.analytics),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getTaskAnalytics
);

router.get('/analytics/user/:userId',
  rateLimit(taskRateLimits.analytics),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getUserTaskAnalytics
);

router.get('/analytics/project/:projectId',
  rateLimit(taskRateLimits.analytics),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getProjectTaskAnalytics
);

router.get('/analytics/team/:teamId',
  rateLimit(taskRateLimits.analytics),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getTeamTaskAnalytics
);

// AI-Powered Features
router.post('/optimize/assignment',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  validateRequest(taskSchemas.optimizeAssignment),
  TaskController.optimizeTaskAssignment
);

router.post('/ai/generate',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.generateTasksWithAI
);

router.post('/ai/optimize/:taskId',
  authenticate,
  TaskController.optimizeTaskWithAI
);

router.get('/ai/recommendations/:taskId',
  authenticate,
  TaskController.getAIRecommendations
);

// Task Templates
router.post('/templates',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.createTaskTemplate
);

router.get('/templates',
  authenticate,
  TaskController.getTaskTemplates
);

router.post('/templates/:templateId/use',
  authenticate,
  TaskController.useTaskTemplate
);

// Bulk Operations
router.post('/bulk/create',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.bulkCreateTasks
);

router.post('/bulk/update',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.bulkUpdateTasks
);

router.post('/bulk/delete',
  authenticate,
  authorize(['admin', 'hr']),
  TaskController.bulkDeleteTasks
);

router.post('/bulk/assign',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.bulkAssignTasks
);

// Task Scheduling and Planning
router.post('/schedule/generate',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.generateTaskSchedule
);

router.post('/schedule/optimize',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.optimizeTaskSchedule
);

router.get('/schedule/:userId',
  authenticate,
  TaskController.getUserTaskSchedule
);

// Task Automation
router.post('/automation/rules',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.createAutomationRule
);

router.get('/automation/rules',
  authenticate,
  TaskController.getAutomationRules
);

router.post('/automation/trigger',
  authenticate,
  TaskController.triggerAutomation
);

// Task Integration
router.post('/integrations/webhook',
  TaskController.handleWebhook
);

router.get('/integrations/status',
  authenticate,
  TaskController.getIntegrationStatus
);

router.post('/integrations/sync',
  authenticate,
  TaskController.syncWithExternalSystem
);

// Task Export and Import
router.get('/export/csv',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.exportTasksToCSV
);

router.get('/export/pdf',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.exportTasksToPDF
);

router.post('/import/csv',
  authenticate,
  authorize(['admin', 'hr']),
  TaskController.importTasksFromCSV
);

// Task Notifications
router.post('/notifications/configure',
  authenticate,
  TaskController.configureTaskNotifications
);

router.get('/notifications/:taskId',
  authenticate,
  TaskController.getTaskNotifications
);

router.post('/notifications/:notificationId/acknowledge',
  authenticate,
  TaskController.acknowledgeNotification
);

// Task Performance and Metrics
router.get('/performance/metrics',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getPerformanceMetrics
);

router.get('/performance/trends',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getPerformanceTrends
);

router.get('/performance/benchmarks',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getPerformanceBenchmarks
);

// Task Quality and Reviews
router.post('/:taskId/reviews',
  authenticate,
  TaskController.createTaskReview
);

router.get('/:taskId/reviews',
  authenticate,
  TaskController.getTaskReviews
);

router.put('/:taskId/reviews/:reviewId',
  authenticate,
  TaskController.updateTaskReview
);

// Task Risk Management
router.post('/:taskId/risks',
  authenticate,
  TaskController.addTaskRisk
);

router.get('/:taskId/risks',
  authenticate,
  TaskController.getTaskRisks
);

router.put('/:taskId/risks/:riskId/mitigate',
  authenticate,
  TaskController.mitigateTaskRisk
);

// Task Collaboration
router.post('/:taskId/collaborators',
  authenticate,
  TaskController.addCollaborator
);

router.get('/:taskId/collaborators',
  authenticate,
  TaskController.getCollaborators
);

router.delete('/:taskId/collaborators/:collaboratorId',
  authenticate,
  TaskController.removeCollaborator
);

// Task Search and Filtering
router.get('/search/advanced',
  authenticate,
  TaskController.advancedTaskSearch
);

router.get('/search/suggestions',
  authenticate,
  TaskController.getSearchSuggestions
);

router.post('/search/save',
  authenticate,
  TaskController.saveSearchQuery
);

// Task Workflow Management
router.post('/workflows',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.createWorkflow
);

router.get('/workflows',
  authenticate,
  TaskController.getWorkflows
);

router.post('/:taskId/workflow/execute',
  authenticate,
  TaskController.executeWorkflow
);

// Task Reporting
router.get('/reports/summary',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getTaskSummaryReport
);

router.get('/reports/detailed',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getDetailedTaskReport
);

router.get('/reports/custom',
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  TaskController.getCustomTaskReport
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Task Route Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in task management system',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// =============================================================================
// ADVANCED AI-POWERED TASK MANAGEMENT ROUTES WITH REAL-TIME WEBSOCKET INTEGRATION
// =============================================================================

// AI-Powered Task Optimization and Smart Assignment
router.post('/optimize/ai',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { departmentId, optimizationType, includeAI, constraints } = req.body;
      
      // AI-powered task optimization
      const optimizationResult = await TaskController.optimizeTaskAssignment({
        departmentId,
        optimizationType: optimizationType || 'workload_balance',
        includeAI: includeAI || true,
        constraints: constraints || {},
        optimizationAlgorithms: ['genetic', 'machine_learning', 'constraint_satisfaction']
      });

      // Real-time optimization update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'task_optimization_completed',
          data: optimizationResult,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: optimizationResult,
        metadata: {
          optimizationTime: optimizationResult.optimizationTime,
          improvementScore: optimizationResult.improvementScore,
          aiConfidence: optimizationResult.aiConfidence,
          recommendations: optimizationResult.recommendations
        }
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Task Optimization Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize task assignment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// Real-time Task Performance Monitoring with AI Analytics
router.get('/performance/live',
  rateLimit({ windowMs: 30 * 1000, max: 50 }),
  authenticate,
  authorize(['admin', 'manager', 'hr', 'supervisor']),
  async (req, res) => {
    try {
      const { departmentId, includeAI, monitoringLevel } = req.query;
      
      // Real-time task performance monitoring
      const livePerformance = await TaskController.getLiveTaskPerformance({
        departmentId,
        includeAI: includeAI === 'true',
        monitoringLevel: monitoringLevel || 'comprehensive'
      });

      // Set up Server-Sent Events for real-time updates
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial performance data
      res.write(`data: ${JSON.stringify({
        type: 'performance_initial',
        data: livePerformance,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Set up real-time performance updates
      const updateInterval = setInterval(async () => {
        try {
          const updatedPerformance = await TaskController.getRealTimeTaskMetrics({
            departmentId,
            includeAI: includeAI === 'true'
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
      }, 15000); // Update every 15 seconds

      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(updateInterval);
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Live Performance Monitoring Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to start live performance monitoring',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Task Prediction and Forecasting
router.post('/predict/advanced',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { taskId, predictionType, includeFactors, modelType, timeHorizon } = req.body;
      
      // Advanced AI task prediction
      const prediction = await TaskController.generateAdvancedTaskPrediction({
        taskId,
        predictionType: predictionType || 'completion_time',
        includeFactors: includeFactors || true,
        modelType: modelType || 'ensemble',
        timeHorizon: timeHorizon || '7d',
        confidenceThreshold: 0.85
      });

      // Real-time prediction update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(prediction.assigneeId, {
          type: 'task_prediction_update',
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
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Advanced Task Prediction Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate advanced task prediction',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Task Anomaly Detection
router.get('/anomalies/advanced',
  rateLimit({ windowMs: 60 * 1000, max: 15 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { severity, timeRange, includeAI, autoResolve, detectionMethods } = req.query;
      
      // Advanced AI task anomaly detection
      const anomalies = await TaskController.detectAdvancedTaskAnomalies({
        severity: severity || 'all',
        timeRange: timeRange || '24h',
        includeAI: includeAI === 'true',
        autoResolve: autoResolve === 'true',
        detectionMethods: detectionMethods ? detectionMethods.split(',') : ['performance', 'timeline', 'resource', 'behavioral'],
        confidenceThreshold: 0.8
      });

      // Real-time anomaly alerts via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        if (anomalies.critical.length > 0) {
          socketService.sendAdminNotification({
            type: 'critical_task_anomaly_detected',
            data: anomalies.critical,
            timestamp: new Date().toISOString(),
            priority: 'critical',
            requiresImmediate: true
          });
        }
        
        if (anomalies.high.length > 0) {
          socketService.sendManagerNotification({
            type: 'high_task_anomaly_detected',
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
          nextScan: new Date(Date.now() + 60000).toISOString(), // 1 minute
          alertThreshold: anomalies.alertThreshold
        }
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Advanced Task Anomaly Detection Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to detect advanced task anomalies',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Resource Allocation and Workload Balancing
router.post('/resources/optimize',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { departmentId, optimizationType, includeAI, constraints, timeHorizon } = req.body;
      
      // AI-powered resource optimization
      const optimizationResult = await TaskController.optimizeResourceAllocation({
        departmentId,
        optimizationType: optimizationType || 'workload_balance',
        includeAI: includeAI || true,
        constraints: constraints || {},
        timeHorizon: timeHorizon || '7d',
        optimizationAlgorithms: ['genetic', 'machine_learning', 'linear_programming']
      });

      // Real-time resource optimization update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'resource_optimization_completed',
          data: optimizationResult,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: optimizationResult,
        metadata: {
          optimizationTime: optimizationResult.optimizationTime,
          efficiencyGain: optimizationResult.efficiencyGain,
          resourceUtilization: optimizationResult.resourceUtilization,
          recommendations: optimizationResult.recommendations,
          nextOptimization: optimizationResult.nextOptimization
        }
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Resource Optimization Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize resource allocation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Task Analytics and Insights
router.get('/analytics/ai-powered',
  rateLimit({ windowMs: 60 * 1000, max: 20 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { startDate, endDate, departmentId, analyticsType, includeAI, includePredictions } = req.query;
      
      // AI-powered task analytics
      const analytics = await TaskController.generateAITaskAnalytics({
        startDate,
        endDate,
        departmentId,
        analyticsType: analyticsType || 'comprehensive',
        includeAI: includeAI === 'true',
        includePredictions: includePredictions === 'true',
        includeInsights: true,
        includeRecommendations: true
      });

      // Real-time analytics update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'task_analytics_generated',
          data: {
            analyticsId: analytics.id,
            type: analyticsType,
            insights: analytics.aiInsights,
            predictions: analytics.predictions
          },
          timestamp: new Date().toISOString(),
          priority: 'low'
        });
      }

      res.json({
        success: true,
        data: analytics,
        metadata: {
          generationTime: analytics.generationTime,
          aiInsights: analytics.aiInsights,
          predictions: analytics.predictions,
          recommendations: analytics.recommendations,
          nextUpdate: analytics.nextUpdate,
          modelVersion: analytics.modelVersion
        }
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('AI Task Analytics Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI task analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Task Automation and Smart Workflows
router.post('/automate/workflow',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { workflowType, triggers, actions, includeAI, conditions } = req.body;
      
      // AI-powered workflow automation
      const automationResult = await TaskController.createAIAutomatedWorkflow({
        workflowType,
        triggers,
        actions,
        includeAI: includeAI || true,
        conditions: conditions || {},
        automationLevel: 'intelligent'
      });

      // Real-time automation update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendManagerNotification({
          type: 'workflow_automation_created',
          data: automationResult,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: automationResult,
        metadata: {
          creationTime: automationResult.creationTime,
          automationLevel: automationResult.automationLevel,
          aiIntelligence: automationResult.aiIntelligence,
          expectedEfficiency: automationResult.expectedEfficiency,
          nextReview: automationResult.nextReview
        }
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Workflow Automation Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to create AI automated workflow',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

// AI-Powered Task Quality Assessment and Improvement
router.post('/quality/assess',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }),
  authenticate,
  authorize(['admin', 'manager', 'hr']),
  async (req, res) => {
    try {
      const { taskId, assessmentType, includeAI, qualityMetrics } = req.body;
      
      // AI-powered task quality assessment
      const qualityAssessment = await TaskController.assessTaskQuality({
        taskId,
        assessmentType: assessmentType || 'comprehensive',
        includeAI: includeAI || true,
        qualityMetrics: qualityMetrics || ['accuracy', 'efficiency', 'timeliness', 'collaboration'],
        assessmentDepth: 'detailed'
      });

      // Real-time quality assessment update via WebSocket
      const socketService = req.app.get('socketService');
      if (socketService) {
        socketService.sendNotification(qualityAssessment.assigneeId, {
          type: 'task_quality_assessment',
          data: qualityAssessment,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        data: qualityAssessment,
        metadata: {
          assessmentTime: qualityAssessment.assessmentTime,
          qualityScore: qualityAssessment.qualityScore,
          improvementAreas: qualityAssessment.improvementAreas,
          recommendations: qualityAssessment.recommendations,
          nextAssessment: qualityAssessment.nextAssessment
        }
      });
    } catch (error) {
      // Assuming logSecurity is defined elsewhere or will be added
      // logSecurity('Task Quality Assessment Error', { error: error.message, userId: req.user?.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to assess task quality',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
);

module.exports = router; 