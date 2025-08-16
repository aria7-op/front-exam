'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Attendance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      // Check-in/Check-out Times
      checkIn: {
        type: Sequelize.DATE,
        allowNull: true
      },
      checkOut: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // AI-Powered Fields
      aiVerification: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-powered verification results and confidence scores'
      },
      aiAnomalyScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'AI-calculated anomaly score for this attendance record'
      },
      aiBehavioralAnalysis: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-analyzed behavioral patterns for this attendance'
      },
      aiPredictions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated predictions and insights'
      },
      aiRecommendations: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated recommendations for this attendance'
      },
      // Biometric and Security Fields
      biometricData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Biometric verification data (face, fingerprint, voice, etc.)'
      },
      verificationMethod: {
        type: Sequelize.ENUM('biometric', 'qr_code', 'rfid', 'manual', 'mobile_app', 'voice', 'face_recognition', 'iris', 'behavioral'),
        allowNull: false,
        defaultValue: 'manual'
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 1.0,
        validate: {
          min: 0,
          max: 1
        }
      },
      // Location and Device Information
      checkInLocation: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'GPS coordinates and location data for check-in'
      },
      checkOutLocation: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'GPS coordinates and location data for check-out'
      },
      deviceInfo: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Device information (IP, user agent, device ID, etc.)'
      },
      // Work Hours and Productivity
      totalHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Total work hours for the day'
      },
      breakTime: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: 0.0,
        comment: 'Total break time in hours'
      },
      productivityScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'AI-calculated productivity score'
      },
      // Status and Approval
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'early_departure', 'half_day', 'leave', 'holiday', 'weekend', 'pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Anomaly and Security
      isAnomaly: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      anomalyScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      anomalyDetails: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Detailed anomaly information and analysis'
      },
      fraudScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
        comment: 'AI-calculated fraud probability score'
      },
      // Additional Information
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tags for categorization and filtering'
      },
      // Audit Fields
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      indexes: [
        {
          unique: true,
          fields: ['userId', 'date']
        },
        {
          fields: ['userId']
        },
        {
          fields: ['date']
        },
        {
          fields: ['status']
        },
        {
          fields: ['isApproved']
        },
        {
          fields: ['isAnomaly']
        },
        {
          fields: ['verificationMethod']
        },
        {
          fields: ['createdAt']
        },
        {
          fields: ['aiAnomalyScore']
        },
        {
          fields: ['productivityScore']
        }
      ],
      comment: 'Advanced AI-powered Attendance table with comprehensive tracking, biometric verification, and behavioral analysis'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Attendance');
  }
}; 