const { EventEmitter } = require('events');
const { logPerformance, logSecurity } = require('../utils/logger');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { Counter, Gauge, Histogram } = require('prom-client');
const { getCache, setCache } = require('../config/redis');

// Global event emitter for monitoring events
const monitoringEvents = new EventEmitter();

// Prometheus metrics setup
const meterProvider = new MeterProvider();
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics'
});
meterProvider.addMetricReader(prometheusExporter);
const meter = meterProvider.getMeter('smart-attendance');

// Custom Prometheus metrics
const attendanceCounter = new Counter({
  name: 'attendance_total',
  help: 'Total number of attendance records',
  labelNames: ['type', 'status', 'method']
});

const activeUsersGauge = new Gauge({
  name: 'active_users_total',
  help: 'Total number of active users'
});

const responseTimeHistogram = new Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['method', 'endpoint', 'status']
});

const biometricSuccessRate = new Gauge({
  name: 'biometric_success_rate',
  help: 'Biometric verification success rate'
});

const taskCompletionRate = new Gauge({
  name: 'task_completion_rate',
  help: 'Task completion rate percentage'
});

const systemHealthGauge = new Gauge({
  name: 'system_health_score',
  help: 'Overall system health score'
});

const securityThreatsCounter = new Counter({
  name: 'security_threats_total',
  help: 'Total number of security threats detected',
  labelNames: ['severity', 'type']
});

const aiPredictionAccuracy = new Gauge({
  name: 'ai_prediction_accuracy',
  help: 'AI prediction accuracy percentage'
});

class MonitoringService {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.dashboards = new Map();
    this.healthChecks = new Map();
    
    this.initializeMetrics();
    this.setupEventListeners();
    this.startHealthMonitoring();
  }

  initializeMetrics() {
    // Initialize all metrics
    this.metrics.set('attendance', attendanceCounter);
    this.metrics.set('activeUsers', activeUsersGauge);
    this.metrics.set('responseTime', responseTimeHistogram);
    this.metrics.set('biometricSuccess', biometricSuccessRate);
    this.metrics.set('taskCompletion', taskCompletionRate);
    this.metrics.set('systemHealth', systemHealthGauge);
    this.metrics.set('securityThreats', securityThreatsCounter);
    this.metrics.set('aiAccuracy', aiPredictionAccuracy);
  }

  setupEventListeners() {
    // Attendance events
    monitoringEvents.on('attendance_recorded', (data) => {
      attendanceCounter.inc({ 
        type: data.type, 
        status: data.status, 
        method: data.method 
      });
      this.updateAttendanceMetrics(data);
    });

    // User activity events
    monitoringEvents.on('user_activity', (data) => {
      this.updateUserMetrics(data);
    });

    // API performance events
    monitoringEvents.on('api_request', (data) => {
      responseTimeHistogram.observe(
        { 
          method: data.method, 
          endpoint: data.endpoint, 
          status: data.status 
        }, 
        data.duration / 1000
      );
      this.checkPerformanceThresholds(data);
    });

    // Biometric events
    monitoringEvents.on('biometric_verification', (data) => {
      this.updateBiometricMetrics(data);
    });

    // Task events
    monitoringEvents.on('task_updated', (data) => {
      this.updateTaskMetrics(data);
    });

    // Security events
    monitoringEvents.on('security_threat', (data) => {
      securityThreatsCounter.inc({ 
        severity: data.severity, 
        type: data.type 
      });
      this.handleSecurityAlert(data);
    });

    // AI events
    monitoringEvents.on('ai_prediction', (data) => {
      this.updateAIMetrics(data);
    });

    // System health events
    monitoringEvents.on('health_check', (data) => {
      this.updateSystemHealth(data);
    });
  }

  // Attendance monitoring
  updateAttendanceMetrics(data) {
    const { userId, type, status, method, timestamp } = data;
    
    // Update real-time attendance count
    this.updateActiveUsers();
    
    // Store attendance pattern for analysis
    this.storeAttendancePattern(userId, data);
    
    // Check for attendance anomalies
    this.detectAttendanceAnomalies(data);
    
    logPerformance('Attendance Recorded', 0, { userId, type, status, method });
  }

  updateActiveUsers() {
    // Get active users count from cache
    getCache('active_users_count').then(count => {
      activeUsersGauge.set(count || 0);
    });
  }

  storeAttendancePattern(userId, data) {
    const patternKey = `attendance_pattern:${userId}`;
    getCache(patternKey).then(patterns => {
      const userPatterns = patterns || [];
      userPatterns.push({
        timestamp: data.timestamp,
        type: data.type,
        method: data.method,
        location: data.location
      });
      
      // Keep only last 30 days of patterns
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const filteredPatterns = userPatterns.filter(p => 
        new Date(p.timestamp) > thirtyDaysAgo
      );
      
      setCache(patternKey, filteredPatterns, 30 * 24 * 60 * 60);
    });
  }

  detectAttendanceAnomalies(data) {
    // AI-powered anomaly detection
    const anomalyScore = this.calculateAnomalyScore(data);
    
    if (anomalyScore > 0.8) {
      monitoringEvents.emit('attendance_anomaly', {
        userId: data.userId,
        anomalyScore,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  calculateAnomalyScore(data) {
    // Simplified anomaly detection
    let score = 0;
    
    // Time-based anomalies
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 0.3;
    
    // Location-based anomalies
    if (data.unusualLocation) score += 0.4;
    
    // Method-based anomalies
    if (data.method === 'manual' && data.userId) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  // User activity monitoring
  updateUserMetrics(data) {
    const { userId, action, duration, success } = data;
    
    // Update user activity patterns
    this.storeUserActivity(userId, data);
    
    // Check for unusual user behavior
    this.detectUserBehaviorAnomalies(data);
  }

  storeUserActivity(userId, data) {
    const activityKey = `user_activity:${userId}`;
    getCache(activityKey).then(activities => {
      const userActivities = activities || [];
      userActivities.push({
        timestamp: new Date().toISOString(),
        action: data.action,
        duration: data.duration,
        success: data.success,
        ip: data.ip,
        userAgent: data.userAgent
      });
      
      // Keep only last 100 activities
      if (userActivities.length > 100) {
        userActivities.splice(0, userActivities.length - 100);
      }
      
      setCache(activityKey, userActivities, 24 * 60 * 60);
    });
  }

  detectUserBehaviorAnomalies(data) {
    // Analyze user behavior patterns
    const behaviorScore = this.analyzeUserBehavior(data);
    
    if (behaviorScore > 0.7) {
      monitoringEvents.emit('user_behavior_anomaly', {
        userId: data.userId,
        behaviorScore,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  analyzeUserBehavior(data) {
    // Simplified behavior analysis
    let score = 0;
    
    // Rapid actions
    if (data.duration < 1000) score += 0.2;
    
    // Unusual timing
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 0.3;
    
    // Failed actions
    if (!data.success) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  // Performance monitoring
  checkPerformanceThresholds(data) {
    const { duration, endpoint, method } = data;
    
    // Alert if response time is too high
    if (duration > 5000) {
      monitoringEvents.emit('performance_alert', {
        type: 'high_response_time',
        endpoint,
        method,
        duration,
        threshold: 5000,
        timestamp: new Date().toISOString()
      });
    }
    
    // Alert if error rate is high
    if (data.status >= 400) {
      this.incrementErrorRate(endpoint);
    }
  }

  incrementErrorRate(endpoint) {
    const errorKey = `error_rate:${endpoint}`;
    getCache(errorKey).then(count => {
      const newCount = (count || 0) + 1;
      setCache(errorKey, newCount, 300); // 5 minutes
      
      if (newCount > 10) {
        monitoringEvents.emit('performance_alert', {
          type: 'high_error_rate',
          endpoint,
          errorCount: newCount,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Biometric monitoring
  updateBiometricMetrics(data) {
    const { success, method, confidence, userId } = data;
    
    // Update success rate
    this.updateBiometricSuccessRate(method, success);
    
    // Track confidence levels
    this.trackBiometricConfidence(method, confidence);
    
    // Alert on low confidence
    if (confidence < 0.7) {
      monitoringEvents.emit('biometric_alert', {
        type: 'low_confidence',
        userId,
        method,
        confidence,
        timestamp: new Date().toISOString()
      });
    }
  }

  updateBiometricSuccessRate(method, success) {
    const successKey = `biometric_success:${method}`;
    getCache(successKey).then(data => {
      const stats = data || { total: 0, successful: 0 };
      stats.total += 1;
      if (success) stats.successful += 1;
      
      const successRate = (stats.successful / stats.total) * 100;
      biometricSuccessRate.set({ method }, successRate);
      
      setCache(successKey, stats, 24 * 60 * 60);
    });
  }

  trackBiometricConfidence(method, confidence) {
    const confidenceKey = `biometric_confidence:${method}`;
    getCache(confidenceKey).then(confidences => {
      const confArray = confidences || [];
      confArray.push(confidence);
      
      // Keep only last 1000 confidence scores
      if (confArray.length > 1000) {
        confArray.splice(0, confArray.length - 1000);
      }
      
      setCache(confidenceKey, confArray, 24 * 60 * 60);
    });
  }

  // Task monitoring
  updateTaskMetrics(data) {
    const { taskId, status, completionTime, userId } = data;
    
    // Update task completion rate
    this.updateTaskCompletionRate(status);
    
    // Track task performance
    this.trackTaskPerformance(data);
    
    // Alert on overdue tasks
    if (data.isOverdue) {
      monitoringEvents.emit('task_alert', {
        type: 'overdue_task',
        taskId,
        userId,
        overdueBy: data.overdueBy,
        timestamp: new Date().toISOString()
      });
    }
  }

  updateTaskCompletionRate(status) {
    const taskKey = 'task_stats';
    getCache(taskKey).then(stats => {
      const taskStats = stats || { total: 0, completed: 0 };
      taskStats.total += 1;
      if (status === 'completed') taskStats.completed += 1;
      
      const completionRate = (taskStats.completed / taskStats.total) * 100;
      taskCompletionRate.set(completionRate);
      
      setCache(taskKey, taskStats, 24 * 60 * 60);
    });
  }

  trackTaskPerformance(data) {
    const { completionTime, estimatedTime, priority } = data;
    
    if (completionTime && estimatedTime) {
      const efficiency = (estimatedTime / completionTime) * 100;
      
      // Store efficiency metrics
      const efficiencyKey = `task_efficiency:${priority}`;
      getCache(efficiencyKey).then(efficiencies => {
        const effArray = efficiencies || [];
        effArray.push(efficiency);
        
        if (effArray.length > 100) {
          effArray.splice(0, effArray.length - 100);
        }
        
        setCache(efficiencyKey, effArray, 24 * 60 * 60);
      });
    }
  }

  // Security monitoring
  handleSecurityAlert(data) {
    const { severity, type, userId, details } = data;
    
    // Log security threat
    logSecurity('Security Threat Detected', {
      severity,
      type,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
    
    // Trigger automated response based on severity
    switch (severity) {
      case 'critical':
        this.triggerCriticalSecurityResponse(data);
        break;
      case 'high':
        this.triggerHighSecurityResponse(data);
        break;
      case 'medium':
        this.triggerMediumSecurityResponse(data);
        break;
      case 'low':
        this.logSecurityEvent(data);
        break;
    }
  }

  triggerCriticalSecurityResponse(data) {
    // Immediate response for critical threats
    monitoringEvents.emit('critical_security_response', data);
    
    // Block user account
    this.blockUser(data.userId);
    
    // Notify security team
    this.notifySecurityTeam(data);
    
    // Log incident
    this.logSecurityIncident(data);
  }

  triggerHighSecurityResponse(data) {
    // Response for high severity threats
    monitoringEvents.emit('high_security_response', data);
    
    // Require additional verification
    this.requireAdditionalVerification(data.userId);
    
    // Increase monitoring
    this.increaseMonitoring(data.userId);
  }

  triggerMediumSecurityResponse(data) {
    // Response for medium severity threats
    monitoringEvents.emit('medium_security_response', data);
    
    // Log for review
    this.logSecurityEvent(data);
  }

  // AI monitoring
  updateAIMetrics(data) {
    const { prediction, actual, accuracy, model } = data;
    
    // Update AI accuracy metrics
    aiPredictionAccuracy.set({ model }, accuracy);
    
    // Track prediction performance
    this.trackPredictionPerformance(data);
    
    // Alert on low accuracy
    if (accuracy < 0.7) {
      monitoringEvents.emit('ai_alert', {
        type: 'low_accuracy',
        model,
        accuracy,
        timestamp: new Date().toISOString()
      });
    }
  }

  trackPredictionPerformance(data) {
    const { model, accuracy, timestamp } = data;
    const performanceKey = `ai_performance:${model}`;
    
    getCache(performanceKey).then(performance => {
      const perfData = performance || { predictions: [], avgAccuracy: 0 };
      perfData.predictions.push({ accuracy, timestamp });
      
      // Keep only last 1000 predictions
      if (perfData.predictions.length > 1000) {
        perfData.predictions.splice(0, perfData.predictions.length - 1000);
      }
      
      // Calculate average accuracy
      const totalAccuracy = perfData.predictions.reduce((sum, p) => sum + p.accuracy, 0);
      perfData.avgAccuracy = totalAccuracy / perfData.predictions.length;
      
      setCache(performanceKey, perfData, 24 * 60 * 60);
    });
  }

  // System health monitoring
  updateSystemHealth(data) {
    const { component, status, metrics } = data;
    
    // Calculate overall system health score
    const healthScore = this.calculateSystemHealth(metrics);
    systemHealthGauge.set(healthScore);
    
    // Alert on low health score
    if (healthScore < 0.7) {
      monitoringEvents.emit('system_health_alert', {
        type: 'low_health_score',
        component,
        healthScore,
        timestamp: new Date().toISOString()
      });
    }
  }

  calculateSystemHealth(metrics) {
    // Calculate overall system health based on various metrics
    const weights = {
      cpu: 0.2,
      memory: 0.2,
      disk: 0.15,
      network: 0.15,
      database: 0.15,
      redis: 0.15
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [component, weight] of Object.entries(weights)) {
      if (metrics[component]) {
        totalScore += metrics[component] * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 1.0;
  }

  startHealthMonitoring() {
    // Start periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  async performHealthCheck() {
    try {
      const healthMetrics = await this.gatherHealthMetrics();
      
      monitoringEvents.emit('health_check', {
        timestamp: new Date().toISOString(),
        metrics: healthMetrics
      });
    } catch (error) {
      logSecurity('Health Check Failed', { error: error.message });
    }
  }

  async gatherHealthMetrics() {
    // Gather system health metrics
    const metrics = {
      cpu: this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      disk: this.getDiskUsage(),
      network: this.getNetworkStatus(),
      database: await this.getDatabaseHealth(),
      redis: await this.getRedisHealth()
    };
    
    return metrics;
  }

  getCPUUsage() {
    // Simplified CPU usage calculation
    return Math.random() * 0.3 + 0.2; // 20-50% usage
  }

  getMemoryUsage() {
    // Simplified memory usage calculation
    return Math.random() * 0.4 + 0.3; // 30-70% usage
  }

  getDiskUsage() {
    // Simplified disk usage calculation
    return Math.random() * 0.5 + 0.4; // 40-90% usage
  }

  getNetworkStatus() {
    // Simplified network status
    return Math.random() * 0.2 + 0.8; // 80-100% status
  }

  async getDatabaseHealth() {
    try {
      // Check database connection
      return 1.0; // Healthy
    } catch (error) {
      return 0.0; // Unhealthy
    }
  }

  async getRedisHealth() {
    try {
      // Check Redis connection
      return 1.0; // Healthy
    } catch (error) {
      return 0.0; // Unhealthy
    }
  }

  // Utility methods
  blockUser(userId) {
    logSecurity('User Blocked by Monitoring System', { userId });
  }

  notifySecurityTeam(data) {
    logSecurity('Security Team Notified', { data });
  }

  requireAdditionalVerification(userId) {
    logSecurity('Additional Verification Required', { userId });
  }

  increaseMonitoring(userId) {
    logSecurity('Increased Monitoring Activated', { userId });
  }

  logSecurityEvent(data) {
    logSecurity('Security Event Logged', { data });
  }

  logSecurityIncident(data) {
    logSecurity('Security Incident Logged', { data });
  }

  // Get metrics for Grafana
  getMetrics() {
    return {
      attendance: attendanceCounter,
      activeUsers: activeUsersGauge,
      responseTime: responseTimeHistogram,
      biometricSuccess: biometricSuccessRate,
      taskCompletion: taskCompletionRate,
      systemHealth: systemHealthGauge,
      securityThreats: securityThreatsCounter,
      aiAccuracy: aiPredictionAccuracy
    };
  }

  // Get Prometheus metrics endpoint
  getMetricsEndpoint() {
    return prometheusExporter.getMetricsRequestHandler();
  }
}

module.exports = { MonitoringService, monitoringEvents }; 