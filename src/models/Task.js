const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
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
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
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
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold', 'blocked'),
    defaultValue: 'pending',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent', 'critical'),
    defaultValue: 'medium',
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('feature', 'bug', 'improvement', 'research', 'documentation', 'testing', 'maintenance', 'meeting'),
    defaultValue: 'feature',
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  actualHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  estimatedStartDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualStartDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  complexity: {
    type: DataTypes.ENUM('simple', 'moderate', 'complex', 'very_complex'),
    defaultValue: 'moderate'
  },
  effort: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium'
  },
  dependencies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of task IDs this task depends on'
  },
  blockers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of blocking issues or dependencies'
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of file attachments'
  },
  comments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of task comments'
  },
  timeEntries: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of time tracking entries'
  },
  checkpoints: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of milestone checkpoints'
  },
  qualityMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      accuracy: 0.00,
      completeness: 0.00,
      efficiency: 0.00,
      satisfaction: 0.00
    }
  },
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      velocity: 0.00,
      throughput: 0.00,
      cycleTime: 0.00,
      leadTime: 0.00
    }
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about task performance'
  },
  riskAssessment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      riskLevel: 'low',
      riskScore: 0.00,
      riskFactors: [],
      mitigationStrategies: []
    }
  },
  collaborationData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      teamMembers: [],
      stakeholders: [],
      communicationChannels: [],
      meetingMinutes: []
    }
  },
  automationData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Data related to automated task processing'
  },
  integrationData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Data from external integrations (Jira, Trello, etc.)'
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
    comment: 'Pattern for recurring tasks'
  },
  parentTaskId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  isSubtask: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subtasks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of subtask IDs'
  },
  approvalRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  visibility: {
    type: DataTypes.ENUM('private', 'team', 'department', 'organization', 'public'),
    defaultValue: 'private'
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
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
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata for extensibility'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    {
      fields: ['assignedTo']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['dueDate']
    },
    {
      fields: ['projectId']
    },
    {
      fields: ['parentTaskId']
    }
  ],
  hooks: {
    beforeCreate: async (task) => {
      // Auto-calculate estimated hours based on complexity and effort
      if (!task.estimatedHours) {
        task.estimatedHours = Task.calculateEstimatedHours(task.complexity, task.effort);
      }
      
      // Set estimated dates if not provided
      if (!task.estimatedStartDate) {
        task.estimatedStartDate = new Date();
      }
      
      if (!task.estimatedEndDate && task.estimatedHours) {
        const endDate = new Date(task.estimatedStartDate);
        endDate.setHours(endDate.getHours() + (task.estimatedHours * 24)); // Convert hours to days
        task.estimatedEndDate = endDate;
      }
      
      // Set due date if not provided
      if (!task.dueDate && task.estimatedEndDate) {
        task.dueDate = task.estimatedEndDate;
      }
    },
    beforeUpdate: async (task) => {
      // Auto-update progress based on status
      if (task.changed('status')) {
        task.progress = Task.calculateProgress(task.status);
      }
      
      // Auto-complete task when status is completed
      if (task.status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
        task.progress = 100;
      }
      
      // Recalculate estimated hours if complexity or effort changed
      if (task.changed('complexity') || task.changed('effort')) {
        task.estimatedHours = Task.calculateEstimatedHours(task.complexity, task.effort);
      }
    },
    afterCreate: async (task) => {
      // Emit task event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('task_created', {
        taskId: task.id,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        priority: task.priority,
        status: task.status,
        timestamp: task.createdAt
      });
    },
    afterUpdate: async (task) => {
      // Emit task update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('task_updated', {
        taskId: task.id,
        assignedTo: task.assignedTo,
        status: task.status,
        progress: task.progress,
        timestamp: task.updatedAt
      });
    }
  }
});

// Instance methods
Task.prototype.isOverdue = function() {
  if (!this.dueDate) return false;
  return new Date() > new Date(this.dueDate) && this.status !== 'completed';
};

Task.prototype.getOverdueDays = function() {
  if (!this.isOverdue()) return 0;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  return Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
};

Task.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Task.prototype.isInProgress = function() {
  return ['in_progress', 'review'].includes(this.status);
};

Task.prototype.isBlocked = function() {
  return this.status === 'blocked' || this.blockers.length > 0;
};

Task.prototype.addTimeEntry = function(startTime, endTime, description = '', activity = 'work') {
  const timeEntries = this.timeEntries || [];
  const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  
  timeEntries.push({
    start: startTime,
    end: endTime,
    duration,
    description,
    activity,
    timestamp: new Date().toISOString()
  });
  
  this.timeEntries = timeEntries;
  this.actualHours = timeEntries.reduce((total, entry) => total + entry.duration, 0);
  
  return this.save();
};

Task.prototype.addComment = function(userId, content, type = 'comment') {
  const comments = this.comments || [];
  comments.push({
    id: Date.now().toString(),
    userId,
    content,
    type,
    timestamp: new Date().toISOString()
  });
  
  this.comments = comments;
  return this.save();
};

Task.prototype.addCheckpoint = function(title, description, dueDate) {
  const checkpoints = this.checkpoints || [];
  checkpoints.push({
    id: Date.now().toString(),
    title,
    description,
    dueDate,
    completed: false,
    completedAt: null,
    timestamp: new Date().toISOString()
  });
  
  this.checkpoints = checkpoints;
  return this.save();
};

Task.prototype.completeCheckpoint = function(checkpointId) {
  const checkpoints = this.checkpoints || [];
  const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
  
  if (checkpoint) {
    checkpoint.completed = true;
    checkpoint.completedAt = new Date().toISOString();
    this.checkpoints = checkpoints;
    return this.save();
  }
  
  return Promise.reject(new Error('Checkpoint not found'));
};

Task.prototype.addBlocker = function(description, type = 'dependency', severity = 'medium') {
  const blockers = this.blockers || [];
  blockers.push({
    id: Date.now().toString(),
    description,
    type,
    severity,
    resolved: false,
    resolvedAt: null,
    timestamp: new Date().toISOString()
  });
  
  this.blockers = blockers;
  return this.save();
};

Task.prototype.resolveBlocker = function(blockerId) {
  const blockers = this.blockers || [];
  const blocker = blockers.find(b => b.id === blockerId);
  
  if (blocker) {
    blocker.resolved = true;
    blocker.resolvedAt = new Date().toISOString();
    this.blockers = blockers;
    return this.save();
  }
  
  return Promise.reject(new Error('Blocker not found'));
};

Task.prototype.calculateEfficiency = function() {
  if (!this.estimatedHours || !this.actualHours) return 0;
  
  const efficiency = (this.estimatedHours / this.actualHours) * 100;
  return Math.min(efficiency, 200); // Cap at 200% efficiency
};

Task.prototype.getVelocity = function() {
  if (!this.actualHours || !this.actualStartDate) return 0;
  
  const startDate = new Date(this.actualStartDate);
  const endDate = this.actualEndDate ? new Date(this.actualEndDate) : new Date();
  const days = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
  
  return this.actualHours / days;
};

// Class methods
Task.calculateEstimatedHours = function(complexity, effort) {
  const complexityMultipliers = {
    simple: 1,
    moderate: 2,
    complex: 4,
    very_complex: 8
  };
  
  const effortMultipliers = {
    low: 0.5,
    medium: 1,
    high: 2,
    very_high: 4
  };
  
  const baseHours = 4; // Base hours for a medium complexity, medium effort task
  const complexityMultiplier = complexityMultipliers[complexity] || 1;
  const effortMultiplier = effortMultipliers[effort] || 1;
  
  return baseHours * complexityMultiplier * effortMultiplier;
};

Task.calculateProgress = function(status) {
  const progressMap = {
    pending: 0,
    in_progress: 25,
    review: 75,
    completed: 100,
    cancelled: 0,
    on_hold: 50,
    blocked: 10
  };
  
  return progressMap[status] || 0;
};

Task.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: { assignedTo: userId, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Task.findByProject = function(projectId, options = {}) {
  return this.findAll({
    where: { projectId, ...options },
    order: [['priority', 'DESC'], ['dueDate', 'ASC']]
  });
};

Task.findOverdue = function(options = {}) {
  return this.findAll({
    where: {
      dueDate: {
        [sequelize.Op.lt]: new Date()
      },
      status: {
        [sequelize.Op.ne]: 'completed'
      },
      ...options
    },
    order: [['dueDate', 'ASC']]
  });
};

Task.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['priority', 'DESC'], ['dueDate', 'ASC']]
  });
};

Task.getStatistics = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      assignedTo: userId,
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'status',
      'priority',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('estimatedHours')), 'totalEstimatedHours'],
      [sequelize.fn('SUM', sequelize.col('actualHours')), 'totalActualHours'],
      [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']
    ],
    group: ['status', 'priority']
  });
};

Task.getPerformanceMetrics = function(userId, period = 'month') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return this.findAll({
    where: {
      assignedTo: userId,
      createdAt: {
        [sequelize.Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalTasks'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "completed" THEN 1 ELSE 0 END')), 'completedTasks'],
      [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress'],
      [sequelize.fn('SUM', sequelize.col('estimatedHours')), 'totalEstimatedHours'],
      [sequelize.fn('SUM', sequelize.col('actualHours')), 'totalActualHours']
    ]
  });
};

// Associations
Task.associate = (models) => {
  // One-to-Many relationships
  Task.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'assignee' });
  Task.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Task.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  Task.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
  Task.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  Task.belongsTo(Task, { foreignKey: 'parentTaskId', as: 'parentTask' });
  Task.hasMany(Task, { foreignKey: 'parentTaskId', as: 'subtasks' });
  
  Task.hasMany(models.Notification, { foreignKey: 'taskId', as: 'notifications' });
  Task.hasMany(models.Attendance, { foreignKey: 'taskId', as: 'attendanceRecords' });
  Task.hasMany(models.Document, { foreignKey: 'taskId', as: 'documents' });
  Task.hasMany(models.Comment, { foreignKey: 'taskId', as: 'comments' });
  
  // Many-to-Many relationships
  Task.belongsToMany(models.User, { 
    through: 'task_assignees',
    foreignKey: 'taskId',
    otherKey: 'userId',
    as: 'assignees'
  });
  
  Task.belongsToMany(models.Department, { 
    through: 'department_tasks',
    foreignKey: 'taskId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  Task.belongsToMany(models.Skill, { 
    through: 'task_skills',
    foreignKey: 'taskId',
    otherKey: 'skillId',
    as: 'requiredSkills'
  });
  
  Task.belongsToMany(models.Technology, { 
    through: 'task_technologies',
    foreignKey: 'taskId',
    otherKey: 'technologyId',
    as: 'technologies'
  });
  
  Task.belongsToMany(models.Tag, { 
    through: 'task_tags',
    foreignKey: 'taskId',
    otherKey: 'tagId',
    as: 'tags'
  });
};

module.exports = { Task }; 