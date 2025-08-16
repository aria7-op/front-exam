const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('development', 'research', 'maintenance', 'consulting', 'training', 'internal', 'client', 'strategic'),
    defaultValue: 'development',
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'),
    defaultValue: 'planning',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent', 'critical'),
    defaultValue: 'medium',
    allowNull: false
  },
  complexity: {
    type: DataTypes.ENUM('simple', 'moderate', 'complex', 'very_complex'),
    defaultValue: 'moderate'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
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
  estimatedHours: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  actualHours: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  actualCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients',
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
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  objectives: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  deliverables: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  milestones: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  risks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  issues: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  resources: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      human: [],
      equipment: [],
      materials: [],
      budget: {}
    }
  },
  constraints: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      time: null,
      budget: null,
      scope: null,
      quality: null,
      resources: null
    }
  },
  assumptions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  dependencies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  stakeholders: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  communicationPlan: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      channels: [],
      frequency: 'weekly',
      recipients: [],
      templates: []
    }
  },
  qualityMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      defectRate: 0.00,
      customerSatisfaction: 0.00,
      codeQuality: 0.00,
      testCoverage: 0.00,
      performanceScore: 0.00
    }
  },
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      scheduleVariance: 0.00,
      costVariance: 0.00,
      scopeVariance: 0.00,
      qualityVariance: 0.00,
      riskVariance: 0.00
    }
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about project performance'
  },
  automationRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Automation rules for project management'
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
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  parentProjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  isSubProject: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subProjects: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of sub-project IDs'
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
  tableName: 'projects',
  timestamps: true,
  indexes: [
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['type']
    },
    {
      fields: ['ownerId']
    },
    {
      fields: ['managerId']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['departmentId']
    },
    {
      fields: ['startDate']
    },
    {
      fields: ['endDate']
    },
    {
      fields: ['isTemplate']
    },
    {
      fields: ['parentProjectId']
    }
  ],
  hooks: {
    beforeCreate: async (project) => {
      // Auto-generate project code if not provided
      if (!project.code) {
        project.code = await Project.generateProjectCode(project.name);
      }
      
      // Auto-calculate estimated hours based on complexity
      if (!project.estimatedHours) {
        project.estimatedHours = Project.calculateEstimatedHours(project.complexity);
      }
      
      // Set end date if not provided
      if (!project.endDate && project.estimatedHours) {
        const endDate = new Date(project.startDate);
        endDate.setDate(endDate.getDate() + Math.ceil(project.estimatedHours / 8)); // 8 hours per day
        project.endDate = endDate;
      }
    },
    beforeUpdate: async (project) => {
      // Auto-update progress based on completed milestones
      if (project.changed('milestones')) {
        project.progress = Project.calculateProgress(project.milestones);
      }
      
      // Auto-complete project when progress is 100%
      if (project.progress >= 100 && project.status !== 'completed') {
        project.status = 'completed';
        project.actualEndDate = new Date();
      }
      
      // Recalculate estimated hours if complexity changed
      if (project.changed('complexity')) {
        project.estimatedHours = Project.calculateEstimatedHours(project.complexity);
      }
    },
    afterCreate: async (project) => {
      // Emit project event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('project_created', {
        projectId: project.id,
        ownerId: project.ownerId,
        type: project.type,
        status: project.status,
        timestamp: project.createdAt
      });
    },
    afterUpdate: async (project) => {
      // Emit project update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('project_updated', {
        projectId: project.id,
        status: project.status,
        progress: project.progress,
        timestamp: project.updatedAt
      });
    }
  }
});

// Instance methods
Project.prototype.isOverdue = function() {
  if (!this.endDate) return false;
  return new Date() > new Date(this.endDate) && this.status !== 'completed';
};

Project.prototype.getOverdueDays = function() {
  if (!this.isOverdue()) return 0;
  const now = new Date();
  const endDate = new Date(this.endDate);
  return Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
};

Project.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Project.prototype.isActive = function() {
  return ['active', 'planning'].includes(this.status);
};

Project.prototype.isOnHold = function() {
  return this.status === 'on_hold';
};

Project.prototype.calculateScheduleVariance = function() {
  if (!this.endDate || !this.actualEndDate) return 0;
  
  const plannedEnd = new Date(this.endDate);
  const actualEnd = new Date(this.actualEndDate);
  const variance = (actualEnd - plannedEnd) / (1000 * 60 * 60 * 24);
  
  return variance;
};

Project.prototype.calculateCostVariance = function() {
  if (!this.budget || !this.actualCost) return 0;
  
  const variance = this.budget - this.actualCost;
  return variance;
};

Project.prototype.calculateEfficiency = function() {
  if (!this.estimatedHours || !this.actualHours) return 0;
  
  const efficiency = (this.estimatedHours / this.actualHours) * 100;
  return Math.min(efficiency, 200); // Cap at 200% efficiency
};

Project.prototype.getDuration = function() {
  const start = this.actualStartDate || this.startDate;
  const end = this.actualEndDate || this.endDate || new Date();
  
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
};

Project.prototype.addMilestone = function(title, description, dueDate, weight = 1) {
  const milestones = this.milestones || [];
  milestones.push({
    id: Date.now().toString(),
    title,
    description,
    dueDate,
    weight,
    completed: false,
    completedAt: null,
    timestamp: new Date().toISOString()
  });
  
  this.milestones = milestones;
  this.progress = Project.calculateProgress(milestones);
  
  return this.save();
};

Project.prototype.completeMilestone = function(milestoneId) {
  const milestones = this.milestones || [];
  const milestone = milestones.find(m => m.id === milestoneId);
  
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date().toISOString();
    this.milestones = milestones;
    this.progress = Project.calculateProgress(milestones);
    return this.save();
  }
  
  return Promise.reject(new Error('Milestone not found'));
};

Project.prototype.addRisk = function(description, probability, impact, mitigation) {
  const risks = this.risks || [];
  risks.push({
    id: Date.now().toString(),
    description,
    probability,
    impact,
    mitigation,
    status: 'active',
    timestamp: new Date().toISOString()
  });
  
  this.risks = risks;
  return this.save();
};

Project.prototype.addIssue = function(description, severity, assignee) {
  const issues = this.issues || [];
  issues.push({
    id: Date.now().toString(),
    description,
    severity,
    assignee,
    status: 'open',
    timestamp: new Date().toISOString()
  });
  
  this.issues = issues;
  return this.save();
};

// Class methods
Project.generateProjectCode = async function(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const code = `${prefix}-${timestamp}`;
  
  // Check if code already exists
  const existing = await this.findOne({ where: { code } });
  if (existing) {
    return Project.generateProjectCode(name);
  }
  
  return code;
};

Project.calculateEstimatedHours = function(complexity) {
  const complexityMultipliers = {
    simple: 40,
    moderate: 80,
    complex: 160,
    very_complex: 320
  };
  
  return complexityMultipliers[complexity] || 80;
};

Project.calculateProgress = function(milestones) {
  if (!milestones || milestones.length === 0) return 0;
  
  const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 1), 0);
  const completedWeight = milestones
    .filter(m => m.completed)
    .reduce((sum, m) => sum + (m.weight || 1), 0);
  
  return Math.round((completedWeight / totalWeight) * 100);
};

Project.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Project.findByOwner = function(ownerId, options = {}) {
  return this.findAll({
    where: { ownerId, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Project.findByManager = function(managerId, options = {}) {
  return this.findAll({
    where: { managerId, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Project.findOverdue = function(options = {}) {
  return this.findAll({
    where: {
      endDate: {
        [sequelize.Op.lt]: new Date()
      },
      status: {
        [sequelize.Op.ne]: 'completed'
      },
      ...options
    },
    order: [['endDate', 'ASC']]
  });
};

Project.getStatistics = function(ownerId, startDate, endDate) {
  return this.findAll({
    where: {
      ownerId,
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'status',
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('estimatedHours')), 'totalEstimatedHours'],
      [sequelize.fn('SUM', sequelize.col('actualHours')), 'totalActualHours'],
      [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']
    ],
    group: ['status', 'type']
  });
};

// Associations
Project.associate = (models) => {
  // One-to-Many relationships
  Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
  Project.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
  Project.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Project.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  Project.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
  Project.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  Project.belongsTo(Project, { foreignKey: 'parentProjectId', as: 'parentProject' });
  Project.hasMany(Project, { foreignKey: 'parentProjectId', as: 'subProjects' });
  
  Project.hasMany(models.Task, { foreignKey: 'projectId', as: 'tasks' });
  Project.hasMany(models.Attendance, { foreignKey: 'projectId', as: 'attendanceRecords' });
  Project.hasMany(models.Notification, { foreignKey: 'projectId', as: 'notifications' });
  Project.hasMany(models.Document, { foreignKey: 'projectId', as: 'documents' });
  Project.hasMany(models.Meeting, { foreignKey: 'projectId', as: 'meetings' });
  Project.hasMany(models.Comment, { foreignKey: 'projectId', as: 'comments' });
  
  // Many-to-Many relationships
  Project.belongsToMany(models.User, { 
    through: 'project_members',
    foreignKey: 'projectId',
    otherKey: 'userId',
    as: 'members'
  });
  
  Project.belongsToMany(models.Department, { 
    through: 'project_departments',
    foreignKey: 'projectId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  Project.belongsToMany(models.Technology, { 
    through: 'project_technologies',
    foreignKey: 'projectId',
    otherKey: 'technologyId',
    as: 'technologies'
  });
  
  Project.belongsToMany(models.Skill, { 
    through: 'project_skills',
    foreignKey: 'projectId',
    otherKey: 'skillId',
    as: 'requiredSkills'
  });
  
  Project.belongsToMany(models.Tag, { 
    through: 'project_tags',
    foreignKey: 'projectId',
    otherKey: 'tagId',
    as: 'tags'
  });
};

module.exports = { Project }; 