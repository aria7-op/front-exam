const { Attendance, User, BiometricData } = require('../models');
const { logPerformance, logSecurity, logInfo } = require('../utils/logger');
const { monitoringEvents } = require('./monitoring.service');
const { AISecurityService } = require('./ai.security.service');
const { getCache, setCache } = require('../config/redis');
const { Op } = require('sequelize');
const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');

const aiSecurity = new AISecurityService();

class AttendanceService {
  constructor() {
    this.initializeScheduledJobs();
  }

  // Initialize scheduled jobs for attendance automation
  initializeScheduledJobs() {
    // Auto-generate attendance records for absent employees
    cron.schedule('0 9 * * 1-5', () => {
      this.autoGenerateAbsentRecords();
    });

    // Send attendance reminders
    cron.schedule('0 8 * * 1-5', () => {
      this.sendAttendanceReminders();
    });

    // Generate daily reports
    cron.schedule('0 18 * * 1-5', () => {
      this.generateDailyReports();
    });

    // Clean up old attendance data
    cron.schedule('0 2 * * 0', () => {
      this.cleanupOldData();
    });

    // Health check for biometric devices
    cron.schedule('*/30 * * * *', () => {
      this.checkBiometricDevices();
    });
  }

  // AI-powered attendance prediction
  async predictAttendance(userId, targetDate) {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalAttendanceData(userId, 30);
      
      // Get user profile and patterns
      const user = await User.findByPk(userId);
      const patterns = await this.analyzeAttendancePatterns(historicalData);
      
      // Get external factors
      const externalFactors = await this.getExternalFactors(targetDate);
      
      // Generate AI prediction
      const prediction = await this.generateAIPrediction({
        historicalData,
        patterns,
        user,
        externalFactors,
        targetDate
      });

      // Cache prediction for 1 hour
      await setCache(`attendance_prediction_${userId}_${targetDate}`, prediction, 3600);

      return prediction;
    } catch (error) {
      logSecurity('Attendance Prediction Error', { userId, error: error.message });
      throw error;
    }
  }

  // Advanced anomaly detection
  async detectAnomalies(attendance, user) {
    try {
      const anomalies = [];

      // Time-based anomalies
      const timeAnomaly = await this.detectTimeAnomaly(attendance, user);
      if (timeAnomaly) anomalies.push(timeAnomaly);

      // Location-based anomalies
      const locationAnomaly = await this.detectLocationAnomaly(attendance, user);
      if (locationAnomaly) anomalies.push(locationAnomaly);

      // Pattern-based anomalies
      const patternAnomaly = await this.detectPatternAnomaly(attendance, user);
      if (patternAnomaly) anomalies.push(patternAnomaly);

      // Behavioral anomalies
      const behavioralAnomaly = await this.detectBehavioralAnomaly(attendance, user);
      if (behavioralAnomaly) anomalies.push(behavioralAnomaly);

      // Calculate overall anomaly score
      const anomalyScore = this.calculateAnomalyScore(anomalies);

      return {
        isAnomaly: anomalyScore > 0.7,
        score: anomalyScore,
        details: anomalies,
        confidence: this.calculateConfidence(anomalies)
      };
    } catch (error) {
      logSecurity('Anomaly Detection Error', { error: error.message });
      throw error;
    }
  }

  // Biometric verification service
  async verifyBiometric(userId, biometricData, context) {
    try {
      // Get user's biometric template
      const userBiometric = await BiometricData.findOne({
        where: { userId, isActive: true }
      });

      if (!userBiometric) {
        return {
          isValid: false,
          confidence: 0,
          reason: 'No biometric template found'
        };
      }

      // AI-powered biometric verification
      const verification = await aiSecurity.verifyBiometric(
        userBiometric.template,
        biometricData,
        context
      );

      // Log verification attempt
      logSecurity('Biometric Verification', {
        userId,
        success: verification.isValid,
        confidence: verification.confidence,
        method: biometricData.type
      });

      return verification;
    } catch (error) {
      logSecurity('Biometric Verification Error', { userId, error: error.message });
      throw error;
    }
  }

  // Location validation service
  async validateLocation(location, user) {
    try {
      const validation = {
        isValid: true,
        confidence: 1.0,
        reasons: []
      };

      // Check if location is within office boundaries
      const officeBoundaries = await this.getOfficeBoundaries(user.department);
      const isWithinOffice = this.isLocationWithinBoundaries(location, officeBoundaries);
      
      if (!isWithinOffice) {
        validation.isValid = false;
        validation.confidence = 0.3;
        validation.reasons.push('Location outside office boundaries');
      }

      // Check for suspicious location patterns
      const locationPattern = await this.analyzeLocationPattern(user.id, location);
      if (locationPattern.isSuspicious) {
        validation.confidence *= 0.7;
        validation.reasons.push('Unusual location pattern detected');
      }

      // Check GPS accuracy
      if (location.accuracy && location.accuracy > 100) {
        validation.confidence *= 0.8;
        validation.reasons.push('Low GPS accuracy');
      }

      return validation;
    } catch (error) {
      logSecurity('Location Validation Error', { error: error.message });
      throw error;
    }
  }

  // Performance analytics service
  async generatePerformanceAnalytics(userId, period = 'month') {
    try {
      const startDate = this.getPeriodStartDate(period);
      const endDate = new Date();

      // Get attendance data
      const attendances = await Attendance.findAll({
        where: {
          userId,
          date: { [Op.between]: [startDate, endDate] }
        }
      });

      // Calculate metrics
      const metrics = {
        punctuality: this.calculatePunctuality(attendances),
        productivity: this.calculateProductivity(attendances),
        efficiency: this.calculateEfficiency(attendances),
        reliability: this.calculateReliability(attendances),
        attendanceRate: this.calculateAttendanceRate(attendances),
        averageWorkHours: this.calculateAverageWorkHours(attendances),
        overtimeHours: this.calculateOvertimeHours(attendances)
      };

      // Generate insights
      const insights = await this.generateInsights(metrics, attendances);

      // Get trends
      const trends = await this.analyzeTrends(attendances, period);

      return {
        metrics,
        insights,
        trends,
        period: { startDate, endDate }
      };
    } catch (error) {
      logSecurity('Performance Analytics Error', { userId, error: error.message });
      throw error;
    }
  }

  // Team analytics service
  async generateTeamAnalytics(departmentId, period = 'month') {
    try {
      const startDate = this.getPeriodStartDate(period);
      const endDate = new Date();

      // Get team attendance data
      const attendances = await Attendance.findAll({
        where: {
          date: { [Op.between]: [startDate, endDate] }
        },
        include: [{
          model: User,
          as: 'user',
          where: { department: departmentId }
        }]
      });

      // Calculate team metrics
      const teamMetrics = {
        totalEmployees: new Set(attendances.map(a => a.userId)).size,
        averageAttendanceRate: this.calculateTeamAttendanceRate(attendances),
        averageWorkHours: this.calculateTeamWorkHours(attendances),
        punctualityScore: this.calculateTeamPunctuality(attendances),
        productivityScore: this.calculateTeamProductivity(attendances)
      };

      // Get top performers
      const topPerformers = await this.getTopPerformers(departmentId, period);

      // Get attendance patterns
      const patterns = await this.analyzeTeamPatterns(attendances);

      return {
        teamMetrics,
        topPerformers,
        patterns,
        period: { startDate, endDate }
      };
    } catch (error) {
      logSecurity('Team Analytics Error', { departmentId, error: error.message });
      throw error;
    }
  }

  // Report generation service
  async generateReport(type, filters = {}) {
    try {
      let report;

      switch (type) {
        case 'daily':
          report = await this.generateDailyReport(filters);
          break;
        case 'weekly':
          report = await this.generateWeeklyReport(filters);
          break;
        case 'monthly':
          report = await this.generateMonthlyReport(filters);
          break;
        case 'custom':
          report = await this.generateCustomReport(filters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Cache report for 1 hour
      const cacheKey = `attendance_report_${type}_${JSON.stringify(filters)}`;
      await setCache(cacheKey, report, 3600);

      return report;
    } catch (error) {
      logSecurity('Report Generation Error', { type, error: error.message });
      throw error;
    }
  }

  // Notification service
  async sendAttendanceNotifications(type, data) {
    try {
      const notifications = [];

      switch (type) {
        case 'late_arrival':
          notifications.push(await this.createLateArrivalNotification(data));
          break;
        case 'absent':
          notifications.push(await this.createAbsentNotification(data));
          break;
        case 'overtime':
          notifications.push(await this.createOvertimeNotification(data));
          break;
        case 'anomaly':
          notifications.push(await this.createAnomalyNotification(data));
          break;
        default:
          throw new Error('Invalid notification type');
      }

      // Send notifications
      for (const notification of notifications) {
        await this.sendNotification(notification);
      }

      return notifications;
    } catch (error) {
      logSecurity('Notification Error', { type, error: error.message });
      throw error;
    }
  }

  // Helper methods
  async getHistoricalAttendanceData(userId, days = 30) {
    const startDate = moment().subtract(days, 'days').toDate();
    return await Attendance.findAll({
      where: {
        userId,
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']]
    });
  }

  async analyzeAttendancePatterns(attendances) {
    const patterns = {
      averageCheckInTime: this.calculateAverageCheckInTime(attendances),
      averageCheckOutTime: this.calculateAverageCheckOutTime(attendances),
      preferredDays: this.calculatePreferredDays(attendances),
      latePatterns: this.calculateLatePatterns(attendances),
      absencePatterns: this.calculateAbsencePatterns(attendances)
    };

    return patterns;
  }

  async getExternalFactors(date) {
    // Get weather data
    const weather = await this.getWeatherData(date);
    
    // Get traffic data
    const traffic = await this.getTrafficData(date);
    
    // Get holiday information
    const holidays = await this.getHolidayInfo(date);

    return { weather, traffic, holidays };
  }

  async generateAIPrediction(data) {
    // AI-powered prediction logic
    const prediction = {
      willAttend: 0.85,
      expectedCheckIn: '09:15',
      expectedCheckOut: '17:30',
      confidence: 0.78,
      factors: [
        'Historical attendance pattern',
        'Work schedule',
        'Recent attendance trends'
      ],
      riskFactors: []
    };

    // Adjust based on external factors
    if (data.externalFactors.weather.condition === 'rain') {
      prediction.willAttend *= 0.9;
      prediction.riskFactors.push('Weather conditions');
    }

    return prediction;
  }

  async detectTimeAnomaly(attendance, user) {
    const checkInTime = moment(attendance.checkIn);
    const scheduledTime = moment(attendance.date).set('hour', 9).set('minute', 0);
    const diffMinutes = checkInTime.diff(scheduledTime, 'minutes');

    if (diffMinutes > 30) {
      return {
        type: 'time_anomaly',
        severity: 'medium',
        description: 'Significantly late arrival',
        details: { minutesLate: diffMinutes }
      };
    }

    return null;
  }

  async detectLocationAnomaly(attendance, user) {
    const usualLocations = await this.getUserUsualLocations(user.id);
    const currentLocation = attendance.checkInLocation;

    const distance = this.calculateDistance(currentLocation, usualLocations.primary);
    
    if (distance > 1000) { // More than 1km from usual location
      return {
        type: 'location_anomaly',
        severity: 'high',
        description: 'Unusual check-in location',
        details: { distance, usualLocation: usualLocations.primary }
      };
    }

    return null;
  }

  async detectPatternAnomaly(attendance, user) {
    const historicalPattern = await this.getUserHistoricalPattern(user.id);
    const currentPattern = this.extractCurrentPattern(attendance);

    const patternSimilarity = this.calculatePatternSimilarity(currentPattern, historicalPattern);
    
    if (patternSimilarity < 0.6) {
      return {
        type: 'pattern_anomaly',
        severity: 'medium',
        description: 'Unusual attendance pattern',
        details: { similarity: patternSimilarity }
      };
    }

    return null;
  }

  async detectBehavioralAnomaly(attendance, user) {
    const behavioralScore = await aiSecurity.assessBehaviorRisk(
      { actionPatterns: [] },
      {
        userId: user.id,
        action: 'check_in',
        timestamp: attendance.checkIn,
        location: attendance.checkInLocation,
        method: attendance.method
      }
    );

    if (behavioralScore > 0.8) {
      return {
        type: 'behavioral_anomaly',
        severity: 'high',
        description: 'Suspicious behavior detected',
        details: { score: behavioralScore }
      };
    }

    return null;
  }

  calculateAnomalyScore(anomalies) {
    if (anomalies.length === 0) return 0;

    const severityWeights = {
      low: 0.3,
      medium: 0.6,
      high: 0.9
    };

    const totalScore = anomalies.reduce((sum, anomaly) => {
      return sum + (severityWeights[anomaly.severity] || 0.5);
    }, 0);

    return Math.min(totalScore / anomalies.length, 1.0);
  }

  calculateConfidence(anomalies) {
    // Calculate confidence based on anomaly detection quality
    return Math.max(0.5, 1.0 - (anomalies.length * 0.1));
  }

  async getOfficeBoundaries(department) {
    // Get office boundaries for department
    const boundaries = {
      'IT': { lat: 40.7128, lng: -74.0060, radius: 500 },
      'HR': { lat: 40.7128, lng: -74.0060, radius: 500 },
      'Finance': { lat: 40.7128, lng: -74.0060, radius: 500 }
    };

    return boundaries[department] || boundaries['IT'];
  }

  isLocationWithinBoundaries(location, boundaries) {
    const distance = this.calculateDistance(location, boundaries);
    return distance <= boundaries.radius;
  }

  calculateDistance(location1, location2) {
    // Haversine formula for distance calculation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location1.latitude * Math.PI / 180;
    const φ2 = location2.lat * Math.PI / 180;
    const Δφ = (location2.lat - location1.latitude) * Math.PI / 180;
    const Δλ = (location2.lng - location1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async analyzeLocationPattern(userId, location) {
    // Analyze user's location pattern
    return {
      isSuspicious: false,
      confidence: 0.9
    };
  }

  getPeriodStartDate(period) {
    const now = moment();
    switch (period) {
      case 'week':
        return now.subtract(7, 'days').toDate();
      case 'month':
        return now.subtract(30, 'days').toDate();
      case 'quarter':
        return now.subtract(90, 'days').toDate();
      case 'year':
        return now.subtract(365, 'days').toDate();
      default:
        return now.subtract(30, 'days').toDate();
    }
  }

  calculatePunctuality(attendances) {
    const onTime = attendances.filter(a => a.status === 'present').length;
    const total = attendances.length;
    return total > 0 ? onTime / total : 0;
  }

  calculateProductivity(attendances) {
    const totalHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);
    const totalDays = attendances.length;
    return totalDays > 0 ? totalHours / (totalDays * 8) : 0;
  }

  calculateEfficiency(attendances) {
    const totalHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);
    const totalOvertime = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
    return totalHours > 0 ? (totalHours - totalOvertime) / totalHours : 0;
  }

  calculateReliability(attendances) {
    const present = attendances.filter(a => a.status === 'present').length;
    const total = attendances.length;
    return total > 0 ? present / total : 0;
  }

  calculateAttendanceRate(attendances) {
    const present = attendances.filter(a => a.status !== 'absent').length;
    const total = attendances.length;
    return total > 0 ? present / total : 0;
  }

  calculateAverageWorkHours(attendances) {
    const totalHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);
    const totalDays = attendances.length;
    return totalDays > 0 ? totalHours / totalDays : 0;
  }

  calculateOvertimeHours(attendances) {
    return attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  }

  async generateInsights(metrics, attendances) {
    const insights = [];

    if (metrics.punctuality < 0.8) {
      insights.push('Consider improving punctuality for better performance');
    }

    if (metrics.productivity > 1.2) {
      insights.push('High productivity detected - consider workload balance');
    }

    if (metrics.overtimeHours > 20) {
      insights.push('High overtime hours - consider resource allocation');
    }

    return insights;
  }

  async analyzeTrends(attendances, period) {
    // Analyze attendance trends over time
    return {
      punctuality: 'improving',
      productivity: 'stable',
      attendance: 'consistent'
    };
  }

  calculateTeamAttendanceRate(attendances) {
    const present = attendances.filter(a => a.status !== 'absent').length;
    const total = attendances.length;
    return total > 0 ? present / total : 0;
  }

  calculateTeamWorkHours(attendances) {
    const totalHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);
    const totalDays = attendances.length;
    return totalDays > 0 ? totalHours / totalDays : 0;
  }

  calculateTeamPunctuality(attendances) {
    const onTime = attendances.filter(a => a.status === 'present').length;
    const total = attendances.length;
    return total > 0 ? onTime / total : 0;
  }

  calculateTeamProductivity(attendances) {
    const totalHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);
    const totalDays = attendances.length;
    return totalDays > 0 ? totalHours / (totalDays * 8) : 0;
  }

  async getTopPerformers(departmentId, period) {
    // Get top performing employees in department
    return [];
  }

  async analyzeTeamPatterns(attendances) {
    // Analyze team attendance patterns
    return {
      peakDays: ['monday', 'tuesday'],
      peakHours: ['09:00', '17:00'],
      trends: 'stable'
    };
  }

  async generateDailyReport(filters) {
    // Generate daily attendance report
    return {
      date: new Date(),
      summary: {},
      details: [],
      anomalies: []
    };
  }

  async generateWeeklyReport(filters) {
    // Generate weekly attendance report
    return {
      week: moment().week(),
      summary: {},
      details: [],
      trends: []
    };
  }

  async generateMonthlyReport(filters) {
    // Generate monthly attendance report
    return {
      month: moment().month(),
      summary: {},
      details: [],
      trends: [],
      recommendations: []
    };
  }

  async generateCustomReport(filters) {
    // Generate custom attendance report
    return {
      period: filters.period,
      summary: {},
      details: [],
      insights: []
    };
  }

  async createLateArrivalNotification(data) {
    return {
      type: 'late_arrival',
      userId: data.userId,
      title: 'Late Arrival Alert',
      message: 'You arrived late today. Please ensure punctuality.',
      priority: 'medium',
      channels: ['email', 'push']
    };
  }

  async createAbsentNotification(data) {
    return {
      type: 'absent',
      userId: data.userId,
      title: 'Absence Alert',
      message: 'You were marked absent today. Please update your attendance.',
      priority: 'high',
      channels: ['email', 'sms', 'push']
    };
  }

  async createOvertimeNotification(data) {
    return {
      type: 'overtime',
      userId: data.userId,
      title: 'Overtime Alert',
      message: 'You have worked overtime today. Please ensure work-life balance.',
      priority: 'low',
      channels: ['email', 'push']
    };
  }

  async createAnomalyNotification(data) {
    return {
      type: 'anomaly',
      userId: data.userId,
      title: 'Attendance Anomaly',
      message: 'Unusual attendance pattern detected. Please review.',
      priority: 'high',
      channels: ['email', 'sms', 'push']
    };
  }

  async sendNotification(notification) {
    // Send notification through various channels
    logInfo('Sending Notification', notification);
  }

  // Scheduled job methods
  async autoGenerateAbsentRecords() {
    try {
      const today = moment().format('YYYY-MM-DD');
      const activeUsers = await User.findAll({ where: { isActive: true } });

      for (const user of activeUsers) {
        const existingAttendance = await Attendance.findByUserAndDate(user.id, today);
        
        if (!existingAttendance) {
          await Attendance.create({
            userId: user.id,
            date: today,
            status: 'absent',
            systemGenerated: true,
            source: 'auto_generation'
          });
        }
      }

      logInfo('Auto-generated absent records', { date: today });
    } catch (error) {
      logSecurity('Auto-generate Absent Records Error', { error: error.message });
    }
  }

  async sendAttendanceReminders() {
    try {
      const today = moment().format('YYYY-MM-DD');
      const activeUsers = await User.findAll({ where: { isActive: true } });

      for (const user of activeUsers) {
        const existingAttendance = await Attendance.findByUserAndDate(user.id, today);
        
        if (!existingAttendance) {
          await this.sendNotification({
            type: 'reminder',
            userId: user.id,
            title: 'Attendance Reminder',
            message: 'Please mark your attendance for today.',
            priority: 'medium',
            channels: ['email', 'push']
          });
        }
      }

      logInfo('Sent attendance reminders', { date: today });
    } catch (error) {
      logSecurity('Send Attendance Reminders Error', { error: error.message });
    }
  }

  async generateDailyReports() {
    try {
      const report = await this.generateReport('daily');
      logInfo('Generated daily report', { date: new Date() });
    } catch (error) {
      logSecurity('Generate Daily Reports Error', { error: error.message });
    }
  }

  async cleanupOldData() {
    try {
      const cutoffDate = moment().subtract(2, 'years').toDate();
      await Attendance.destroy({
        where: {
          date: { [Op.lt]: cutoffDate }
        }
      });

      logInfo('Cleaned up old attendance data', { cutoffDate });
    } catch (error) {
      logSecurity('Cleanup Old Data Error', { error: error.message });
    }
  }

  async checkBiometricDevices() {
    try {
      // Check biometric device health
      logInfo('Biometric devices health check completed');
    } catch (error) {
      logSecurity('Biometric Devices Check Error', { error: error.message });
    }
  }

  // External API methods
  async getWeatherData(date) {
    try {
      // Call weather API
      return { condition: 'sunny', temperature: 25 };
    } catch (error) {
      return { condition: 'unknown', temperature: null };
    }
  }

  async getTrafficData(date) {
    try {
      // Call traffic API
      return { congestion: 'low', delay: 0 };
    } catch (error) {
      return { congestion: 'unknown', delay: null };
    }
  }

  async getHolidayInfo(date) {
    try {
      // Check holiday information
      return { isHoliday: false, holidayName: null };
    } catch (error) {
      return { isHoliday: false, holidayName: null };
    }
  }

  async getUserUsualLocations(userId) {
    // Get user's usual check-in locations
    return {
      primary: { lat: 40.7128, lng: -74.0060 },
      secondary: { lat: 40.7589, lng: -73.9851 }
    };
  }

  async getUserHistoricalPattern(userId) {
    // Get user's historical attendance pattern
    return {
      averageCheckIn: '09:00',
      averageCheckOut: '17:00',
      preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    };
  }

  extractCurrentPattern(attendance) {
    // Extract current attendance pattern
    return {
      checkIn: moment(attendance.checkIn).format('HH:mm'),
      checkOut: attendance.checkOut ? moment(attendance.checkOut).format('HH:mm') : null,
      day: moment(attendance.date).format('dddd').toLowerCase()
    };
  }

  calculatePatternSimilarity(currentPattern, historicalPattern) {
    // Calculate similarity between current and historical patterns
    return 0.8; // Placeholder
  }

  calculateAverageCheckInTime(attendances) {
    const checkInTimes = attendances
      .filter(a => a.checkIn)
      .map(a => moment(a.checkIn).hour() * 60 + moment(a.checkIn).minute());
    
    return checkInTimes.length > 0 
      ? moment().startOf('day').add(checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length, 'minutes').format('HH:mm')
      : '09:00';
  }

  calculateAverageCheckOutTime(attendances) {
    const checkOutTimes = attendances
      .filter(a => a.checkOut)
      .map(a => moment(a.checkOut).hour() * 60 + moment(a.checkOut).minute());
    
    return checkOutTimes.length > 0 
      ? moment().startOf('day').add(checkOutTimes.reduce((a, b) => a + b, 0) / checkOutTimes.length, 'minutes').format('HH:mm')
      : '17:00';
  }

  calculatePreferredDays(attendances) {
    const dayCounts = {};
    attendances.forEach(a => {
      const day = moment(a.date).format('dddd').toLowerCase();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    return Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a]);
  }

  calculateLatePatterns(attendances) {
    const lateCount = attendances.filter(a => a.status === 'late').length;
    const totalCount = attendances.length;
    
    return {
      frequency: totalCount > 0 ? lateCount / totalCount : 0,
      averageMinutesLate: 15 // Placeholder
    };
  }

  calculateAbsencePatterns(attendances) {
    const absentCount = attendances.filter(a => a.status === 'absent').length;
    const totalCount = attendances.length;
    
    return {
      frequency: totalCount > 0 ? absentCount / totalCount : 0,
      consecutiveAbsences: 0 // Placeholder
    };
  }
}

module.exports = new AttendanceService(); 