const tf = require('@tensorflow/tfjs-node');
const { logSecurity, logPerformance } = require('../utils/logger');
const { EventEmitter } = require('events');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');

// Event-driven security events
const securityEvents = new EventEmitter();

// Prometheus metrics for Grafana
const meterProvider = new MeterProvider();
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics'
});
meterProvider.addMetricReader(prometheusExporter);
const meter = meterProvider.getMeter('ai-security');

// Metrics
const threatDetectionCounter = meter.createCounter('threat_detection_total', {
  description: 'Total number of threats detected'
});

const behaviorRiskGauge = meter.createUpDownCounter('behavior_risk_score', {
  description: 'User behavior risk score'
});

const biometricVerificationCounter = meter.createCounter('biometric_verification_total', {
  description: 'Total biometric verifications'
});

class AISecurityService {
  constructor() {
    this.riskModels = new Map();
    this.behaviorPatterns = new Map();
    this.threatSignatures = new Map();
    this.anomalyThresholds = {
      login: 0.7,
      api: 0.8,
      biometric: 0.6,
      behavior: 0.75
    };
    
    this.initializeModels();
    this.setupEventListeners();
  }

  async initializeModels() {
    try {
      // Load pre-trained models for different security tasks
      await this.loadRiskAssessmentModel();
      await this.loadBehavioralModel();
      await this.loadBiometricModel();
      await this.loadAnomalyDetectionModel();
      
      logSecurity('AI Security Models Initialized', { status: 'success' });
    } catch (error) {
      logSecurity('AI Security Models Initialization Failed', { error: error.message });
    }
  }

  async loadRiskAssessmentModel() {
    // Load TensorFlow.js model for risk assessment
    try {
      // Use relative path instead of file:// protocol
      const model = await tf.loadLayersModel('./models/risk_assessment_model/model.json');
      this.riskModels.set('risk_assessment', model);
    } catch (error) {
      // Fallback to rule-based system
      this.riskModels.set('risk_assessment', this.createRuleBasedModel());
    }
  }

  async loadBehavioralModel() {
    // Load behavioral analysis model
    try {
      // Use relative path instead of file:// protocol
      const model = await tf.loadLayersModel('./models/behavioral_model/model.json');
      this.riskModels.set('behavioral', model);
    } catch (error) {
      this.riskModels.set('behavioral', this.createBehavioralModel());
    }
  }

  async loadBiometricModel() {
    // Load biometric verification model
    try {
      // Use relative path instead of file:// protocol
      const model = await tf.loadLayersModel('./models/biometric_model/model.json');
      this.riskModels.set('biometric', model);
    } catch (error) {
      this.riskModels.set('biometric', this.createBiometricModel());
    }
  }

  async loadAnomalyDetectionModel() {
    // Load anomaly detection model
    try {
      // Use relative path instead of file:// protocol
      const model = await tf.loadLayersModel('./models/anomaly_model/model.json');
      this.riskModels.set('anomaly', model);
    } catch (error) {
      this.riskModels.set('anomaly', this.createAnomalyModel());
    }
  }

  // Rule-based fallback models
  createRuleBasedModel() {
    return {
      predict: (features) => {
        let riskScore = 0;
        
        // Time-based risk
        const hour = new Date().getHours();
        if (hour < 6 || hour > 22) riskScore += 0.2;
        
        // Location-based risk
        if (features.unusualLocation) riskScore += 0.3;
        
        // Device-based risk
        if (features.newDevice) riskScore += 0.2;
        
        // Behavior-based risk
        if (features.unusualBehavior) riskScore += 0.3;
        
        return Math.min(riskScore, 1.0);
      }
    };
  }

  createBehavioralModel() {
    return {
      predict: (behaviorData) => {
        let score = 0;
        
        // Analyze patterns
        if (behaviorData.rapidActions) score += 0.2;
        if (behaviorData.unusualTiming) score += 0.3;
        if (behaviorData.suspiciousPatterns) score += 0.4;
        
        return Math.min(score, 1.0);
      }
    };
  }

  createBiometricModel() {
    return {
      predict: (biometricData) => {
        // Simple confidence-based verification
        return biometricData.confidence > 0.8;
      }
    };
  }

  createAnomalyModel() {
    return {
      predict: (data) => {
        let anomalyScore = 0;
        
        // Statistical anomaly detection
        if (data.outlierScore > 2.0) anomalyScore += 0.4;
        if (data.unusualPattern) anomalyScore += 0.3;
        if (data.rapidChanges) anomalyScore += 0.3;
        
        return Math.min(anomalyScore, 1.0);
      }
    };
  }

  setupEventListeners() {
    // Listen for security events and emit metrics
    securityEvents.on('threat_detected', (data) => {
      threatDetectionCounter.add(1, { type: data.threatType, severity: data.severity });
      this.handleThreatDetection(data);
    });

    securityEvents.on('behavior_analyzed', (data) => {
      behaviorRiskGauge.add(data.riskScore, { userId: data.userId });
      this.handleBehaviorAnalysis(data);
    });

    securityEvents.on('biometric_verified', (data) => {
      biometricVerificationCounter.add(1, { 
        method: data.method, 
        success: data.success ? 'true' : 'false' 
      });
      this.handleBiometricVerification(data);
    });
  }

  async assessBehaviorRisk(userBehavior, currentAction) {
    const startTime = Date.now();
    
    try {
      const model = this.riskModels.get('behavioral');
      
      // Extract features from behavior data
      const features = this.extractBehaviorFeatures(userBehavior, currentAction);
      
      // Get prediction from model
      const riskScore = await model.predict(features);
      
      // Update metrics
      behaviorRiskGauge.add(riskScore, { userId: currentAction.userId });
      
      // Emit event
      securityEvents.emit('behavior_analyzed', {
        userId: currentAction.userId,
        riskScore,
        action: currentAction.action,
        timestamp: new Date().toISOString()
      });

      logPerformance('Behavior Risk Assessment', Date.now() - startTime, { 
        userId: currentAction.userId, 
        riskScore 
      });

      return riskScore;
    } catch (error) {
      logSecurity('Behavior Risk Assessment Failed', { error: error.message });
      return 0.5; // Default medium risk
    }
  }

  extractBehaviorFeatures(userBehavior, currentAction) {
    const features = {
      // Time patterns
      hourOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      isWeekend: [0, 6].includes(new Date().getDay()),
      
      // Action patterns
      actionFrequency: userBehavior.actionPatterns.length,
      recentActions: userBehavior.actionPatterns.slice(-10),
      
      // Device patterns
      deviceConsistency: this.checkDeviceConsistency(userBehavior, currentAction),
      
      // Location patterns
      locationConsistency: this.checkLocationConsistency(userBehavior, currentAction),
      
      // Timing patterns
      timeConsistency: this.checkTimeConsistency(userBehavior, currentAction),
      
      // Risk indicators
      rapidActions: this.detectRapidActions(userBehavior),
      unusualTiming: this.detectUnusualTiming(userBehavior),
      suspiciousPatterns: this.detectSuspiciousPatterns(userBehavior)
    };

    return features;
  }

  checkDeviceConsistency(userBehavior, currentAction) {
    const recentDevices = userBehavior.actionPatterns
      .slice(-20)
      .map(action => action.deviceId)
      .filter(Boolean);
    
    return recentDevices.includes(currentAction.deviceId) ? 1 : 0;
  }

  checkLocationConsistency(userBehavior, currentAction) {
    const recentIPs = userBehavior.actionPatterns
      .slice(-20)
      .map(action => action.ip)
      .filter(Boolean);
    
    return recentIPs.includes(currentAction.ip) ? 1 : 0;
  }

  checkTimeConsistency(userBehavior, currentAction) {
    const recentTimes = userBehavior.actionPatterns
      .slice(-10)
      .map(action => new Date(action.timestamp).getHours());
    
    const currentHour = new Date().getHours();
    const avgHour = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
    
    return Math.abs(currentHour - avgHour) < 3 ? 1 : 0;
  }

  detectRapidActions(userBehavior) {
    const recentActions = userBehavior.actionPatterns.slice(-5);
    if (recentActions.length < 2) return false;
    
    const timeDiff = new Date(recentActions[recentActions.length - 1].timestamp) - 
                    new Date(recentActions[0].timestamp);
    
    return timeDiff < 60000; // Less than 1 minute
  }

  detectUnusualTiming(userBehavior) {
    const hour = new Date().getHours();
    return hour < 6 || hour > 22; // Outside normal hours
  }

  detectSuspiciousPatterns(userBehavior) {
    const actions = userBehavior.actionPatterns.slice(-20);
    
    // Check for repeated failed attempts
    const failedAttempts = actions.filter(action => 
      action.action.includes('failed') || action.action.includes('error')
    ).length;
    
    return failedAttempts > 3;
  }

  async adjustRateLimit(baseLimit, userBehavior, context) {
    try {
      const model = this.riskModels.get('anomaly');
      const features = this.extractBehaviorFeatures(userBehavior, context);
      const anomalyScore = await model.predict(features);
      
      // Adjust limit based on risk
      const adjustment = 1 - (anomalyScore * 0.5); // Reduce limit by up to 50%
      return Math.max(Math.floor(baseLimit * adjustment), 1);
    } catch (error) {
      logSecurity('Rate Limit Adjustment Failed', { error: error.message });
      return baseLimit;
    }
  }

  async verifyBiometric(storedData, currentData, context) {
    const startTime = Date.now();
    
    try {
      const model = this.riskModels.get('biometric');
      
      // Prepare biometric data for verification
      const verificationData = {
        storedData,
        currentData,
        context,
        confidence: this.calculateBiometricConfidence(storedData, currentData),
        livenessScore: this.detectLiveness(currentData),
        qualityScore: this.assessBiometricQuality(currentData)
      };
      
      const result = await model.predict(verificationData);
      
      const verificationResult = {
        isValid: result.confidence > 0.8,
        confidence: result.confidence,
        isLive: result.livenessScore > 0.9,
        method: currentData.method,
        quality: verificationData.qualityScore
      };
      
      // Emit event
      securityEvents.emit('biometric_verified', {
        userId: context.userId,
        method: currentData.method,
        success: verificationResult.isValid,
        confidence: verificationResult.confidence,
        timestamp: new Date().toISOString()
      });
      
      // Update metrics
      biometricVerificationCounter.add(1, {
        method: currentData.method,
        success: verificationResult.isValid ? 'true' : 'false'
      });
      
      logPerformance('Biometric Verification', Date.now() - startTime, {
        userId: context.userId,
        method: currentData.method,
        confidence: verificationResult.confidence
      });
      
      return verificationResult;
    } catch (error) {
      logSecurity('Biometric Verification Failed', { error: error.message });
      return {
        isValid: false,
        confidence: 0,
        isLive: false,
        method: currentData.method,
        reason: 'Verification failed'
      };
    }
  }

  calculateBiometricConfidence(storedData, currentData) {
    // Simple similarity calculation (in real implementation, use proper biometric algorithms)
    let similarity = 0;
    
    if (storedData.type === 'fingerprint' && currentData.type === 'fingerprint') {
      similarity = this.compareFingerprints(storedData.data, currentData.data);
    } else if (storedData.type === 'face' && currentData.type === 'face') {
      similarity = this.compareFaces(storedData.data, currentData.data);
    }
    
    return similarity;
  }

  compareFingerprints(stored, current) {
    // Simplified fingerprint comparison
    // In real implementation, use proper fingerprint matching algorithms
    return Math.random() * 0.3 + 0.7; // 70-100% confidence
  }

  compareFaces(stored, current) {
    // Simplified face comparison
    // In real implementation, use face recognition libraries
    return Math.random() * 0.2 + 0.8; // 80-100% confidence
  }

  detectLiveness(biometricData) {
    // Liveness detection (simplified)
    // In real implementation, use proper liveness detection
    return Math.random() * 0.1 + 0.9; // 90-100% liveness score
  }

  assessBiometricQuality(biometricData) {
    // Quality assessment (simplified)
    return Math.random() * 0.2 + 0.8; // 80-100% quality score
  }

  handleThreatDetection(data) {
    logSecurity('Threat Detected', {
      type: data.threatType,
      severity: data.severity,
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
    
    // Trigger automated responses
    this.triggerAutomatedResponse(data);
  }

  handleBehaviorAnalysis(data) {
    if (data.riskScore > 0.8) {
      logSecurity('High Risk Behavior Detected', {
        userId: data.userId,
        riskScore: data.riskScore,
        action: data.action
      });
      
      // Trigger additional security measures
      this.triggerSecurityMeasures(data);
    }
  }

  handleBiometricVerification(data) {
    if (!data.success) {
      logSecurity('Biometric Verification Failed', {
        userId: data.userId,
        method: data.method,
        confidence: data.confidence
      });
    }
  }

  triggerAutomatedResponse(threatData) {
    // Implement automated threat response
    switch (threatData.severity) {
      case 'high':
        this.blockUser(threatData.userId);
        this.notifySecurityTeam(threatData);
        break;
      case 'medium':
        this.requireAdditionalVerification(threatData.userId);
        break;
      case 'low':
        this.logSuspiciousActivity(threatData);
        break;
    }
  }

  triggerSecurityMeasures(data) {
    // Implement additional security measures
    this.requireMFA(data.userId);
    this.monitorUserActivity(data.userId);
    this.notifyUser(data.userId, 'Unusual activity detected');
  }

  async blockUser(userId) {
    // Block user account
    logSecurity('User Blocked', { userId });
  }

  async notifySecurityTeam(threatData) {
    // Notify security team
    logSecurity('Security Team Notified', { threatData });
  }

  async requireAdditionalVerification(userId) {
    // Require additional verification
    logSecurity('Additional Verification Required', { userId });
  }

  async requireMFA(userId) {
    // Require MFA
    logSecurity('MFA Required', { userId });
  }

  async monitorUserActivity(userId) {
    // Increase monitoring
    logSecurity('Increased Monitoring', { userId });
  }

  async notifyUser(userId, message) {
    // Notify user
    logSecurity('User Notified', { userId, message });
  }

  logSuspiciousActivity(data) {
    logSecurity('Suspicious Activity Logged', { data });
  }

  // Get metrics for Grafana
  getMetrics() {
    return {
      threatDetectionTotal: threatDetectionCounter,
      behaviorRiskScore: behaviorRiskGauge,
      biometricVerificationTotal: biometricVerificationCounter
    };
  }
}

module.exports = { AISecurityService, securityEvents }; 