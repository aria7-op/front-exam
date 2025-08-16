const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  checkIn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkOut: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkInLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      latitude: null,
      longitude: null,
      address: null,
      accuracy: null,
      deviceInfo: null
    }
  },
  checkOutLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      latitude: null,
      longitude: null,
      address: null,
      accuracy: null,
      deviceInfo: null
    }
  },
  method: {
    type: DataTypes.ENUM('biometric', 'qr_code', 'rfid', 'manual', 'mobile_app', 'voice', 'face_recognition'),
    allowNull: false,
    defaultValue: 'manual'
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'early_departure', 'half_day', 'remote', 'sick', 'vacation', 'holiday'),
    allowNull: false,
    defaultValue: 'present'
  },
  workHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Total work hours for the day'
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Overtime hours worked'
  },
  breakTime: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Total break time in hours'
  },
  breaks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of break periods with start and end times'
  },
  biometricData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Biometric verification data'
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      deviceId: null,
      deviceType: null,
      os: null,
      browser: null,
      ipAddress: null,
      userAgent: null
    }
  },
  verificationData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional verification data (photos, signatures, etc.)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAnomaly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flagged by AI as unusual attendance pattern'
  },
  anomalyScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'AI-generated anomaly score'
  },
  anomalyDetails: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Details about detected anomalies'
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about attendance pattern'
  },
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      punctuality: 0.00,
      productivity: 0.00,
      efficiency: 0.00,
      reliability: 0.00
    }
  },
  weatherData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Weather conditions during attendance'
  },
  trafficData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Traffic conditions during commute'
  },
  healthData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Health-related data (temperature, symptoms, etc.)'
  },
  moodData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Mood and wellness data'
  },
  projectAssignments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Projects worked on during this attendance period'
  },
  tasksCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of tasks completed during this period'
  },
  meetingAttendances: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Meetings attended during this period'
  },
  collaborationMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      teamInteractions: 0,
      crossDepartmentWork: 0,
      mentorshipSessions: 0
    }
  },
  environmentalFactors: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Environmental factors affecting attendance'
  },
  personalFactors: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Personal factors affecting attendance'
  },
  systemGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this record was auto-generated by system'
  },
  source: {
    type: DataTypes.ENUM('manual', 'biometric_device', 'mobile_app', 'web_portal', 'api', 'ai_prediction'),
    defaultValue: 'manual'
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'Confidence level of the attendance record'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Tags for categorization and filtering'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata for extensibility'
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'date'],
      unique: true
    },
    {
      fields: ['date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['method']
    },
    {
      fields: ['isAnomaly']
    },
    {
      fields: ['isApproved']
    }
  ],
  hooks: {
    beforeCreate: async (attendance) => {
      // Auto-calculate work hours if check-in and check-out are provided
      if (attendance.checkIn && attendance.checkOut) {
        attendance.workHours = Attendance.calculateWorkHours(attendance.checkIn, attendance.checkOut, attendance.breakTime);
      }
      
      // Auto-determine status based on check-in time
      if (attendance.checkIn && !attendance.status) {
        attendance.status = Attendance.determineStatus(attendance.checkIn, attendance.workHours);
      }
    },
    beforeUpdate: async (attendance) => {
      // Recalculate work hours if check-out is updated
      if (attendance.changed('checkOut') && attendance.checkIn && attendance.checkOut) {
        attendance.workHours = Attendance.calculateWorkHours(attendance.checkIn, attendance.checkOut, attendance.breakTime);
      }
    },
    afterCreate: async (attendance) => {
      // Emit attendance event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('attendance_recorded', {
        userId: attendance.userId,
        type: attendance.status,
        method: attendance.method,
        timestamp: attendance.createdAt,
        location: attendance.checkInLocation
      });
    }
  }
});

// Instance methods
Attendance.prototype.isComplete = function() {
  return this.checkIn && this.checkOut;
};

Attendance.prototype.getWorkDuration = function() {
  if (!this.checkIn || !this.checkOut) return 0;
  return (new Date(this.checkOut) - new Date(this.checkIn)) / (1000 * 60 * 60);
};

Attendance.prototype.isLate = function() {
  if (!this.checkIn) return false;
  
  const checkInTime = new Date(this.checkIn);
  const scheduledStart = this.getScheduledStartTime();
  
  if (!scheduledStart) return false;
  
  const lateThreshold = 15; // 15 minutes
  const diffMinutes = (checkInTime - scheduledStart) / (1000 * 60);
  
  return diffMinutes > lateThreshold;
};

Attendance.prototype.isEarlyDeparture = function() {
  if (!this.checkOut) return false;
  
  const checkOutTime = new Date(this.checkOut);
  const scheduledEnd = this.getScheduledEndTime();
  
  if (!scheduledEnd) return false;
  
  const earlyThreshold = 30; // 30 minutes
  const diffMinutes = (scheduledEnd - checkOutTime) / (1000 * 60);
  
  return diffMinutes > earlyThreshold;
};

Attendance.prototype.getScheduledStartTime = function() {
  // This would need to be implemented based on user's work schedule
  // For now, return a default 9 AM
  const date = new Date(this.date);
  date.setHours(9, 0, 0, 0);
  return date;
};

Attendance.prototype.getScheduledEndTime = function() {
  // This would need to be implemented based on user's work schedule
  // For now, return a default 5 PM
  const date = new Date(this.date);
  date.setHours(17, 0, 0, 0);
  return date;
};

Attendance.prototype.addBreak = function(startTime, endTime, reason = 'general') {
  const breaks = this.breaks || [];
  breaks.push({
    start: startTime,
    end: endTime,
    reason,
    duration: (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)
  });
  
  this.breaks = breaks;
  this.breakTime = breaks.reduce((total, break_) => total + break_.duration, 0);
  
  return this.save();
};

Attendance.prototype.calculateOvertime = function() {
  if (!this.workHours) return 0;
  
  const standardHours = 8; // Standard work day
  const overtime = Math.max(0, this.workHours - standardHours);
  
  this.overtimeHours = overtime;
  return overtime;
};

// Class methods
Attendance.calculateWorkHours = function(checkIn, checkOut, breakTime = 0) {
  const totalMinutes = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60);
  const workMinutes = totalMinutes - (breakTime * 60);
  return Math.max(0, workMinutes / 60);
};

Attendance.determineStatus = function(checkIn, workHours) {
  const checkInTime = new Date(checkIn);
  const scheduledStart = new Date(checkIn);
  scheduledStart.setHours(9, 0, 0, 0);
  
  const lateThreshold = 15; // 15 minutes
  const diffMinutes = (checkInTime - scheduledStart) / (1000 * 60);
  
  if (diffMinutes > lateThreshold) {
    return 'late';
  }
  
  if (workHours < 4) {
    return 'half_day';
  }
  
  return 'present';
};

Attendance.findByUserAndDate = function(userId, date) {
  return this.findOne({ where: { userId, date } });
};

Attendance.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      userId,
      date: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC']]
  });
};

Attendance.findAnomalies = function(options = {}) {
  return this.findAll({
    where: {
      isAnomaly: true,
      ...options
    },
    order: [['date', 'DESC']]
  });
};

Attendance.getStatistics = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      userId,
      date: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('workHours')), 'totalWorkHours'],
      [sequelize.fn('SUM', sequelize.col('overtimeHours')), 'totalOvertime'],
      [sequelize.fn('AVG', sequelize.col('anomalyScore')), 'avgAnomalyScore']
    ],
    group: ['status']
  });
};

// Associations
Attendance.associate = (models) => {
  Attendance.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Attendance.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
  Attendance.hasMany(models.BiometricData, { foreignKey: 'attendanceId', as: 'biometricRecords' });
  Attendance.hasMany(models.Notification, { foreignKey: 'attendanceId', as: 'notifications' });
};

module.exports = { Attendance }; 