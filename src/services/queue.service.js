const Queue = require('bull');
const Redis = require('ioredis');
const { logSecurity } = require('../utils/logger');
const { config } = require('../config/config');
const { User, Attendance, Notification, Task } = require('../models');
const { Op } = require('sequelize');

class AdvancedQueueService {
  constructor() {
    this.queues = new Map();
    this.redis = new Redis(config.redis.url);
    this.aiProcessor = null;
    this.monitoringData = {
      processedJobs: 0,
      failedJobs: 0,
      averageProcessingTime: 0,
      queueSizes: {},
      performanceMetrics: {}
    };
  }

  async initialize() {
    try {
      // Initialize AI processor for intelligent job processing
      await this.initializeAIProcessor();
      
      // Create advanced queues with AI-powered features
      await this.createQueues();
      
      // Setup intelligent monitoring
      this.setupIntelligentMonitoring();
      
      // Initialize predictive analytics
      await this.initializePredictiveAnalytics();
      
      logSecurity('Advanced Queue Service Initialized', { 
        queuesCount: this.queues.size,
        aiEnabled: !!this.aiProcessor 
      });
    } catch (error) {
      logSecurity('Queue Service Initialization Error', { error: error.message });
      throw error;
    }
  }

  async initializeAIProcessor() {
    try {
      // Initialize AI model for intelligent job prioritization and processing
      this.aiProcessor = {
        // AI-powered job prioritization
        prioritizeJobs: async (jobs) => {
          const priorities = await Promise.all(jobs.map(async (job) => {
            const priority = await this.calculateJobPriority(job);
            return { job, priority };
          }));
          
          return priorities.sort((a, b) => b.priority - a.priority);
        },

        // Intelligent retry strategy
        calculateRetryStrategy: async (job, error) => {
          const retryCount = job.attemptsMade;
          const errorType = this.classifyError(error);
          const userContext = await this.getUserContext(job.data.userId);
          
          // AI determines optimal retry strategy based on error type and user context
          const strategy = await this.determineOptimalRetryStrategy(errorType, retryCount, userContext);
          
          return {
            delay: strategy.delay,
            maxAttempts: strategy.maxAttempts,
            backoff: strategy.backoff
          };
        },

        // Predictive job scheduling
        predictJobDuration: async (jobType, jobData) => {
          const historicalData = await this.getHistoricalJobData(jobType);
          const prediction = await this.predictProcessingTime(historicalData, jobData);
          
          return {
            estimatedDuration: prediction.duration,
            confidence: prediction.confidence,
            factors: prediction.factors
          };
        },

        // Intelligent resource allocation
        allocateResources: async (job) => {
          const systemLoad = await this.getSystemLoad();
          const jobRequirements = await this.analyzeJobRequirements(job);
          const optimalResources = await this.calculateOptimalResources(systemLoad, jobRequirements);
          
          return optimalResources;
        }
      };
    } catch (error) {
      logSecurity('AI Processor Initialization Error', { error: error.message });
      // Fallback to basic processing if AI fails
      this.aiProcessor = null;
    }
  }

  async createQueues() {
    // Advanced Attendance Processing Queue with AI
    const attendanceQueue = new Queue('attendance-processing', {
      redis: config.redis.url,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    // AI-powered job processor
    attendanceQueue.process(async (job) => {
      return await this.processAttendanceJob(job);
    });

    // Intelligent error handling
    attendanceQueue.on('failed', async (job, err) => {
      await this.handleJobFailure(job, err);
    });

    // Performance monitoring
    attendanceQueue.on('completed', async (job) => {
      await this.recordJobSuccess(job);
    });

    this.queues.set('attendance', attendanceQueue);

    // Advanced Notification Queue with Smart Delivery
    const notificationQueue = new Queue('notification-delivery', {
      redis: config.redis.url,
      defaultJobOptions: {
        attempts: 3,
        backoff: 'exponential',
        delay: 1000
      }
    });

    notificationQueue.process(async (job) => {
      return await this.processNotificationJob(job);
    });

    this.queues.set('notifications', notificationQueue);

    // AI Analytics Queue for Advanced Reporting
    const analyticsQueue = new Queue('ai-analytics', {
      redis: config.redis.url,
      defaultJobOptions: {
        attempts: 3,
        backoff: 'exponential',
        delay: 5000
      }
    });

    analyticsQueue.process(async (job) => {
      return await this.processAnalyticsJob(job);
    });

    this.queues.set('analytics', analyticsQueue);

    // Real-time Data Processing Queue
    const realtimeQueue = new Queue('realtime-processing', {
      redis: config.redis.url,
      defaultJobOptions: {
        attempts: 2,
        backoff: 'fixed',
        delay: 100
      }
    });

    realtimeQueue.process(async (job) => {
      return await this.processRealtimeJob(job);
    });

    this.queues.set('realtime', realtimeQueue);

    // AI Model Training Queue
    const trainingQueue = new Queue('ai-training', {
      redis: config.redis.url,
      defaultJobOptions: {
        attempts: 1,
        timeout: 3600000 // 1 hour timeout for training
      }
    });

    trainingQueue.process(async (job) => {
      return await this.processTrainingJob(job);
    });

    this.queues.set('training', trainingQueue);
  }

  async processAttendanceJob(job) {
    const startTime = Date.now();
    const { userId, attendanceData, biometricData, locationData } = job.data;

    try {
      // AI-powered attendance validation
      const validationResult = await this.validateAttendanceWithAI(attendanceData, biometricData);
      
      if (!validationResult.isValid) {
        throw new Error(`AI validation failed: ${validationResult.reason}`);
      }

      // Intelligent fraud detection
      const fraudScore = await this.detectFraud(userId, attendanceData, locationData);
      
      if (fraudScore > 0.8) {
        await this.handlePotentialFraud(userId, attendanceData, fraudScore);
      }

      // Advanced attendance processing
      const processedAttendance = await this.processAttendanceAdvanced(userId, attendanceData, validationResult);
      
      // Real-time analytics update
      await this.updateRealTimeAnalytics(userId, processedAttendance);
      
      // Predictive insights generation
      await this.generatePredictiveInsights(userId, processedAttendance);

      const processingTime = Date.now() - startTime;
      await this.recordPerformanceMetrics('attendance', processingTime);

      return {
        success: true,
        attendanceId: processedAttendance.id,
        fraudScore,
        processingTime,
        insights: processedAttendance.insights
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.recordPerformanceMetrics('attendance', processingTime, error);
      throw error;
    }
  }

  async processNotificationJob(job) {
    const { userId, notificationData, deliveryPreferences } = job.data;

    try {
      // AI-powered notification optimization
      const optimizedNotification = await this.optimizeNotification(notificationData, deliveryPreferences);
      
      // Intelligent delivery timing
      const optimalTime = await this.calculateOptimalDeliveryTime(userId, optimizedNotification);
      
      // Multi-channel delivery with smart routing
      const deliveryResult = await this.deliverNotificationMultiChannel(userId, optimizedNotification, optimalTime);
      
      // Delivery analytics
      await this.recordDeliveryAnalytics(userId, optimizedNotification, deliveryResult);

      return {
        success: true,
        deliveryChannels: deliveryResult.channels,
        deliveryTime: optimalTime,
        engagementPrediction: deliveryResult.engagementPrediction
      };
    } catch (error) {
      throw error;
    }
  }

  async processAnalyticsJob(job) {
    const { analyticsType, data, timeRange } = job.data;

    try {
      // AI-powered analytics processing
      const analyticsResult = await this.processAnalyticsWithAI(analyticsType, data, timeRange);
      
      // Predictive modeling
      const predictions = await this.generatePredictions(analyticsResult);
      
      // Anomaly detection
      const anomalies = await this.detectAnomalies(analyticsResult);
      
      // Insight generation
      const insights = await this.generateInsights(analyticsResult, predictions, anomalies);

      return {
        success: true,
        analytics: analyticsResult,
        predictions,
        anomalies,
        insights
      };
    } catch (error) {
      throw error;
    }
  }

  async processRealtimeJob(job) {
    const { eventType, eventData, timestamp } = job.data;

    try {
      // Real-time event processing
      const processedEvent = await this.processRealtimeEvent(eventType, eventData, timestamp);
      
      // Live dashboard updates
      await this.updateLiveDashboard(processedEvent);
      
      // Real-time alerts
      await this.checkRealtimeAlerts(processedEvent);

      return {
        success: true,
        eventProcessed: true,
        alertsTriggered: processedEvent.alerts
      };
    } catch (error) {
      throw error;
    }
  }

  async processTrainingJob(job) {
    const { modelType, trainingData, hyperparameters } = job.data;

    try {
      // AI model training with advanced features
      const trainingResult = await this.trainAIModel(modelType, trainingData, hyperparameters);
      
      // Model validation
      const validationResult = await this.validateModel(trainingResult.model);
      
      // Model deployment
      if (validationResult.isValid) {
        await this.deployModel(trainingResult.model);
      }

      return {
        success: true,
        modelId: trainingResult.modelId,
        accuracy: validationResult.accuracy,
        deployed: validationResult.isValid
      };
    } catch (error) {
      throw error;
    }
  }

  // AI-powered helper methods
  async calculateJobPriority(job) {
    const factors = {
      userRole: await this.getUserRolePriority(job.data.userId),
      jobType: this.getJobTypePriority(job.name),
      urgency: await this.calculateUrgency(job.data),
      resourceAvailability: await this.getResourceAvailability(),
      historicalSuccess: await this.getHistoricalSuccessRate(job.name)
    };

    // AI algorithm to calculate priority score
    const priorityScore = await this.aiCalculatePriority(factors);
    return priorityScore;
  }

  async determineOptimalRetryStrategy(errorType, retryCount, userContext) {
    const strategies = {
      network: { delay: 5000, maxAttempts: 5, backoff: 'exponential' },
      validation: { delay: 1000, maxAttempts: 2, backoff: 'fixed' },
      system: { delay: 10000, maxAttempts: 3, backoff: 'exponential' },
      ai: { delay: 2000, maxAttempts: 4, backoff: 'exponential' }
    };

    const baseStrategy = strategies[errorType] || strategies.system;
    
    // AI adjusts strategy based on user context and historical data
    const adjustedStrategy = await this.aiAdjustRetryStrategy(baseStrategy, userContext, retryCount);
    
    return adjustedStrategy;
  }

  async validateAttendanceWithAI(attendanceData, biometricData) {
    // Advanced AI validation using multiple models
    const faceValidation = await this.validateFaceRecognition(biometricData.face);
    const fingerprintValidation = await this.validateFingerprint(biometricData.fingerprint);
    const locationValidation = await this.validateLocation(attendanceData.location);
    const timeValidation = await this.validateTimePattern(attendanceData.timestamp);

    const confidenceScore = this.calculateConfidenceScore([
      faceValidation,
      fingerprintValidation,
      locationValidation,
      timeValidation
    ]);

    return {
      isValid: confidenceScore > 0.85,
      confidence: confidenceScore,
      reason: confidenceScore <= 0.85 ? 'Low confidence score' : null,
      details: {
        face: faceValidation,
        fingerprint: fingerprintValidation,
        location: locationValidation,
        time: timeValidation
      }
    };
  }

  async detectFraud(userId, attendanceData, locationData) {
    // Advanced fraud detection using AI
    const behavioralAnalysis = await this.analyzeUserBehavior(userId);
    const locationAnomaly = await this.detectLocationAnomaly(userId, locationData);
    const timeAnomaly = await this.detectTimeAnomaly(userId, attendanceData.timestamp);
    const deviceAnomaly = await this.detectDeviceAnomaly(attendanceData.deviceInfo);

    const fraudScore = this.calculateFraudScore([
      behavioralAnalysis,
      locationAnomaly,
      timeAnomaly,
      deviceAnomaly
    ]);

    return fraudScore;
  }

  async optimizeNotification(notificationData, deliveryPreferences) {
    // AI-powered notification optimization
    const userEngagement = await this.analyzeUserEngagement(notificationData.userId);
    const contentOptimization = await this.optimizeContent(notificationData.content);
    const timingOptimization = await this.optimizeTiming(notificationData.userId, deliveryPreferences);

    return {
      ...notificationData,
      content: contentOptimization.optimizedContent,
      timing: timingOptimization.optimalTime,
      channels: timingOptimization.optimalChannels,
      personalization: contentOptimization.personalization
    };
  }

  // Advanced monitoring and analytics
  setupIntelligentMonitoring() {
    setInterval(async () => {
      await this.updateMonitoringData();
      await this.checkSystemHealth();
      await this.optimizeQueuePerformance();
    }, 30000); // Every 30 seconds
  }

  async updateMonitoringData() {
    for (const [queueName, queue] of this.queues) {
      const queueSize = await queue.count();
      const waitingJobs = await queue.getWaiting();
      const activeJobs = await queue.getActive();
      const completedJobs = await queue.getCompleted();
      const failedJobs = await queue.getFailed();

      this.monitoringData.queueSizes[queueName] = {
        total: queueSize,
        waiting: waitingJobs.length,
        active: activeJobs.length,
        completed: completedJobs.length,
        failed: failedJobs.length
      };
    }
  }

  async checkSystemHealth() {
    const healthMetrics = {
      queuePerformance: await this.analyzeQueuePerformance(),
      resourceUtilization: await this.getResourceUtilization(),
      errorRates: await this.calculateErrorRates(),
      processingLatency: await this.calculateProcessingLatency()
    };

    // AI-powered health assessment
    const healthScore = await this.calculateHealthScore(healthMetrics);
    
    if (healthScore < 0.7) {
      await this.triggerHealthAlert(healthScore, healthMetrics);
    }
  }

  async optimizeQueuePerformance() {
    // AI-powered queue optimization
    const optimizationRecommendations = await this.generateOptimizationRecommendations();
    
    for (const recommendation of optimizationRecommendations) {
      await this.applyOptimization(recommendation);
    }
  }

  // Public methods for external use
  async addJob(queueName, jobData, options = {}) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    // AI-powered job optimization
    const optimizedJobData = await this.optimizeJobData(jobData);
    const optimizedOptions = await this.optimizeJobOptions(options, queueName);

    const job = await queue.add(optimizedJobData, optimizedOptions);
    
    logSecurity('Job Added to Queue', { 
      queueName, 
      jobId: job.id, 
      priority: optimizedOptions.priority 
    });

    return job;
  }

  async getQueueStatus(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const status = await queue.getJobCounts();
    const performance = this.monitoringData.queueSizes[queueName] || {};

    return {
      queueName,
      status,
      performance,
      health: await this.getQueueHealth(queueName)
    };
  }

  async getAllQueuesStatus() {
    const status = {};
    
    for (const queueName of this.queues.keys()) {
      status[queueName] = await this.getQueueStatus(queueName);
    }

    return {
      queues: status,
      overallHealth: await this.calculateOverallHealth(),
      aiProcessorStatus: !!this.aiProcessor
    };
  }

  async pauseQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
      logSecurity('Queue Paused', { queueName });
    }
  }

  async resumeQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
      logSecurity('Queue Resumed', { queueName });
    }
  }

  async cleanQueue(queueName, grace = 1000 * 60 * 60 * 24) { // 24 hours
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.clean(grace, 'completed');
      await queue.clean(grace, 'failed');
      logSecurity('Queue Cleaned', { queueName, grace });
    }
  }

  // Graceful shutdown
  async shutdown() {
    logSecurity('Queue Service Shutdown Initiated', { queuesCount: this.queues.size });
    
    const shutdownPromises = Array.from(this.queues.values()).map(queue => queue.close());
    await Promise.all(shutdownPromises);
    
    await this.redis.quit();
    
    logSecurity('Queue Service Shutdown Completed');
  }
}

module.exports = { AdvancedQueueService }; 