'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [2, 50]
        }
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [2, 50]
        }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [6, 255]
        }
      },
      role: {
        type: Sequelize.ENUM('employee', 'manager', 'admin', 'hr', 'supervisor', 'security', 'compliance', 'finance'),
        defaultValue: 'employee',
        allowNull: false
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      loginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lockedUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // AI-Powered Fields
      aiProfile: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated user profile with behavioral patterns, preferences, and insights'
      },
      aiRiskScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'AI-calculated risk score based on behavior and security patterns'
      },
      aiBehavioralPattern: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-analyzed behavioral patterns and trends'
      },
      aiPerformanceMetrics: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-calculated performance metrics and predictions'
      },
      aiSecurityProfile: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated security profile with threat assessments'
      },
      aiRecommendations: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated personalized recommendations'
      },
      // Advanced User Fields
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [10, 15]
        }
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      hireDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true
      },
      skills: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'User skills and competencies'
      },
      preferences: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'User preferences and settings'
      },
      // Security and Compliance Fields
      twoFactorEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      twoFactorSecret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passwordExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      securityQuestions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // Audit and Tracking Fields
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
          fields: ['email']
        },
        {
          fields: ['role']
        },
        {
          fields: ['departmentId']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['aiRiskScore']
        },
        {
          fields: ['createdAt']
        },
        {
          fields: ['lastLogin']
        }
      ],
      comment: 'Advanced AI-powered Users table with comprehensive user management, behavioral analysis, and security features'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
}; 