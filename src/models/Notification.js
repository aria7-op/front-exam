const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'alert', 'reminder', 'update', 'announcement', 'system'),
    defaultValue: 'info',
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('attendance', 'task', 'project', 'department', 'user', 'system', 'security', 'performance', 'compliance', 'other'),
    defaultValue: 'other',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent', 'critical'),
    defaultValue: 'medium',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  channels: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['email'],
    validate: {
      isValidChannels: function(value) {
        const validChannels = ['email', 'sms', 'push', 'in_app', 'webhook', 'slack', 'teams'];
        return value.every(channel => validChannels.includes(channel));
      }
    }
  },
  recipients: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  },
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    validate: {
      min: 0,
      max: 10
    }
  },
  template: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  templateData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  deliveryAttempts: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about notification'
  },
  automationRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Automation rules for notification'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom fields for extensibility'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrencePattern: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      frequency: 'daily',
      interval: 1,
      endDate: null,
      maxOccurrences: null
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  visibility: {
    type: DataTypes.ENUM('private', 'team', 'department', 'organization', 'public'),
    defaultValue: 'private'
  },
  aiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
    validate: {
      min: 0,
      max: 1
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['status']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['projectId']
    },
    {
      fields: ['taskId']
    },
    {
      fields: ['departmentId']
    },
    {
      fields: ['scheduledAt']
    },
    {
      fields: ['sentAt']
    },
    {
      fields: ['readAt']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['updatedBy']
    }
  ],
  hooks: {
    beforeCreate: async (notification) => {
      // Set scheduled time if not provided
      if (!notification.scheduledAt) {
        notification.scheduledAt = new Date();
      }
      
      // Set expiration time if not provided (default 30 days)
      if (!notification.expiresAt) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        notification.expiresAt = expiresAt;
      }
    },
    afterCreate: async (notification) => {
      // Emit notification event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('notification_created', {
        notificationId: notification.id,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        timestamp: notification.createdAt
      });
    },
    afterUpdate: async (notification) => {
      // Emit notification update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('notification_updated', {
        notificationId: notification.id,
        status: notification.status,
        timestamp: notification.updatedAt
      });
    }
  }
});

// Instance methods
Notification.prototype.isPending = function() {
  return this.status === 'pending';
};

Notification.prototype.isSent = function() {
  return this.status === 'sent';
};

Notification.prototype.isDelivered = function() {
  return this.status === 'delivered';
};

Notification.prototype.isRead = function() {
  return this.status === 'read';
};

Notification.prototype.isFailed = function() {
  return this.status === 'failed';
};

Notification.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

Notification.prototype.isUrgent = function() {
  return ['urgent', 'critical'].includes(this.priority);
};

Notification.prototype.canRetry = function() {
  return this.retryCount < this.maxRetries && this.status === 'failed';
};

Notification.prototype.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

Notification.prototype.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

Notification.prototype.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

Notification.prototype.markAsFailed = function() {
  this.status = 'failed';
  this.retryCount += 1;
  return this.save();
};

Notification.prototype.addDeliveryAttempt = function(attempt) {
  const attempts = this.deliveryAttempts || [];
  attempts.push({
    timestamp: new Date().toISOString(),
    channel: attempt.channel,
    status: attempt.status,
    error: attempt.error || null
  });
  
  this.deliveryAttempts = attempts;
  return this.save();
};

Notification.prototype.getDeliveryStatus = function() {
  const attempts = this.deliveryAttempts || [];
  if (attempts.length === 0) return 'not_attempted';
  
  const lastAttempt = attempts[attempts.length - 1];
  return lastAttempt.status;
};

// Class methods
Notification.findByType = function(type, options = {}) {
  return this.findAll({
    where: { type, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Notification.findByCategory = function(category, options = {}) {
  return this.findAll({
    where: { category, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Notification.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Notification.findByPriority = function(priority, options = {}) {
  return this.findAll({
    where: { priority, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Notification.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: { userId, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Notification.findUnread = function(userId, options = {}) {
  return this.findAll({
    where: { 
      userId,
      status: {
        [sequelize.Op.in]: ['pending', 'sent', 'delivered']
      },
      ...options
    },
    order: [['priority', 'DESC'], ['createdAt', 'DESC']]
  });
};

Notification.findPending = function(options = {}) {
  return this.findAll({
    where: { 
      status: 'pending',
      scheduledAt: {
        [sequelize.Op.lte]: new Date()
      },
      ...options
    },
    order: [['priority', 'DESC'], ['scheduledAt', 'ASC']]
  });
};

Notification.findFailed = function(options = {}) {
  return this.findAll({
    where: { 
      status: 'failed',
      retryCount: {
        [sequelize.Op.lt]: sequelize.col('maxRetries')
      },
      ...options
    },
    order: [['createdAt', 'ASC']]
  });
};

Notification.getStatistics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'type',
      'category',
      'priority',
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.literal('EXTRACT(EPOCH FROM (sent_at - created_at))')), 'avgDeliveryTime']
    ],
    group: ['type', 'category', 'priority', 'status']
  });
};

// Associations
Notification.associate = (models) => {
  // One-to-Many relationships
  Notification.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
  Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'recipient' });
  Notification.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Notification.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  Notification.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  Notification.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
  Notification.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  
  // Many-to-Many relationships
  Notification.belongsToMany(models.User, { 
    through: 'user_notifications',
    foreignKey: 'notificationId',
    otherKey: 'userId',
    as: 'users'
  });
};

module.exports = { Notification }; 