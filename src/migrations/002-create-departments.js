'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Departments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [2, 100]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [2, 10]
        }
      },
      // AI-Powered Fields
      aiAnalytics: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated department analytics and insights'
      },
      aiPerformanceMetrics: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-calculated department performance metrics'
      },
      aiPredictions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated predictions for department performance'
      },
      aiRecommendations: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI-generated recommendations for department improvement'
      },
      // Department Management Fields
      managerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      budget: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Department budget allocation'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contactInfo: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Department contact information'
      },
      // Status and Configuration
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Department-specific settings and configurations'
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
          fields: ['name']
        },
        {
          unique: true,
          fields: ['code']
        },
        {
          fields: ['managerId']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['createdAt']
        }
      ],
      comment: 'AI-powered Departments table with advanced analytics and management features'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Departments');
  }
}; 