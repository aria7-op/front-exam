const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { MonitoringService } = require('../services/monitoring.service');
const { logSecurity } = require('../utils/logger');

const monitoringService = new MonitoringService();

/**
 * @swagger
 * /api/v1/monitoring/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health information
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const healthStatus = await monitoringService.getSystemHealth();
    res.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logSecurity('Health Check Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitoring/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [performance, security, attendance, tasks]
 *         description: Type of metrics to retrieve
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *         description: Time period for metrics
 *     responses:
 *       200:
 *         description: System metrics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/metrics', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { type = 'performance', period = 'day' } = req.query;
    const metrics = await monitoringService.getMetrics(type, period);
    
    res.json({
      success: true,
      data: metrics,
      type,
      period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logSecurity('Metrics Retrieval Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitoring/alerts:
 *   get:
 *     summary: Get system alerts
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Alert severity filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved, acknowledged]
 *         description: Alert status filter
 *     responses:
 *       200:
 *         description: System alerts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/alerts', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { severity, status } = req.query;
    const alerts = await monitoringService.getAlerts(severity, status);
    
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logSecurity('Alerts Retrieval Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitoring/alerts/{alertId}/acknowledge:
 *   post:
 *     summary: Acknowledge an alert
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert acknowledged
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal server error
 */
router.post('/alerts/:alertId/acknowledge', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { alertId } = req.params;
    const result = await monitoringService.acknowledgeAlert(alertId, req.user.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: result
    });
  } catch (error) {
    logSecurity('Alert Acknowledgment Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitoring/performance:
 *   get:
 *     summary: Get performance metrics
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance metrics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/performance', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const performance = await monitoringService.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logSecurity('Performance Metrics Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitoring/security:
 *   get:
 *     summary: Get security monitoring data
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security monitoring data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/security', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const securityData = await monitoringService.getSecurityMetrics();
    
    res.json({
      success: true,
      data: securityData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logSecurity('Security Metrics Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get security metrics',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitoring/logs:
 *   get:
 *     summary: Get system logs
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: Log level filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of logs to retrieve
 *     responses:
 *       200:
 *         description: System logs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { level, limit = 100 } = req.query;
    const logs = await monitoringService.getSystemLogs(level, parseInt(limit));
    
    res.json({
      success: true,
      data: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logSecurity('Logs Retrieval Error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get logs',
      error: error.message
    });
  }
});

module.exports = router; 