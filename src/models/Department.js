const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 20]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('operational', 'support', 'management', 'technical', 'creative', 'sales', 'marketing', 'finance', 'hr', 'legal', 'it', 'research'),
    defaultValue: 'operational',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived', 'planning'),
    defaultValue: 'active',
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  parentDepartmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  headId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      building: null,
      floor: null,
      room: null,
      address: null,
      coordinates: null
    }
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      phone: null,
      email: null,
      extension: null,
      website: null
    }
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  actualSpending: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  headcount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  maxHeadcount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  technologies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tools: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  processes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  policies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  goals: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  kpis: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      productivity: 0.00,
      efficiency: 0.00,
      quality: 0.00,
      satisfaction: 0.00,
      retention: 0.00
    }
  },
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      attendanceRate: 0.00,
      taskCompletionRate: 0.00,
      projectSuccessRate: 0.00,
      employeeSatisfaction: 0.00,
      customerSatisfaction: 0.00
    }
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about department performance'
  },
  automationRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Automation rules for department operations'
  },
  integrationData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Data from external integrations'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom fields for extensibility'
  },
  workSchedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { start: '09:00', end: '17:00', flexible: false },
      tuesday: { start: '09:00', end: '17:00', flexible: false },
      wednesday: { start: '09:00', end: '17:00', flexible: false },
      thursday: { start: '09:00', end: '17:00', flexible: false },
      friday: { start: '09:00', end: '17:00', flexible: false },
      saturday: { start: null, end: null, flexible: false },
      sunday: { start: null, end: null, flexible: false }
    }
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      canManageUsers: false,
      canManageProjects: false,
      canViewReports: true,
      canManageBudget: false,
      canApproveRequests: false
    }
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      approvals: {
        required: false,
        approvers: []
      },
      reporting: {
        frequency: 'weekly',
        recipients: []
      }
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  visibility: {
    type: DataTypes.ENUM('private', 'department', 'organization', 'public'),
    defaultValue: 'organization'
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
  tableName: 'departments',
  timestamps: true,
  indexes: [
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['name'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['level']
    },
    {
      fields: ['parentDepartmentId']
    },
    {
      fields: ['headId']
    }
  ],
  hooks: {
    beforeCreate: async (department) => {
      // Auto-generate department code if not provided
      if (!department.code) {
        department.code = await Department.generateDepartmentCode(department.name);
      }
      
      // Set level based on parent department
      if (department.parentDepartmentId) {
        const parent = await Department.findByPk(department.parentDepartmentId);
        if (parent) {
          department.level = parent.level + 1;
        }
      }
    },
    beforeUpdate: async (department) => {
      // Update level if parent department changed
      if (department.changed('parentDepartmentId')) {
        if (department.parentDepartmentId) {
          const parent = await Department.findByPk(department.parentDepartmentId);
          if (parent) {
            department.level = parent.level + 1;
          }
        } else {
          department.level = 1;
        }
      }
      
      // Update headcount
      if (department.changed('headcount') && department.headcount > department.maxHeadcount) {
        department.headcount = department.maxHeadcount;
      }
    },
    afterCreate: async (department) => {
      // Emit department event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('department_created', {
        departmentId: department.id,
        name: department.name,
        type: department.type,
        status: department.status,
        timestamp: department.createdAt
      });
    },
    afterUpdate: async (department) => {
      // Emit department update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('department_updated', {
        departmentId: department.id,
        name: department.name,
        status: department.status,
        headcount: department.headcount,
        timestamp: department.updatedAt
      });
    }
  }
});

// Instance methods
Department.prototype.isActive = function() {
  return this.status === 'active';
};

Department.prototype.isParent = function() {
  return this.level === 1;
};

Department.prototype.isChild = function() {
  return this.level > 1;
};

Department.prototype.getFullPath = function() {
  // This would need to be implemented to get the full department hierarchy path
  return this.name;
};

Department.prototype.calculateBudgetUtilization = function() {
  if (!this.budget) return 0;
  return (this.actualSpending / this.budget) * 100;
};

Department.prototype.isOverBudget = function() {
  return this.calculateBudgetUtilization() > 100;
};

Department.prototype.calculateEfficiency = function() {
  const metrics = this.performanceMetrics || {};
  const efficiency = (
    (metrics.attendanceRate || 0) +
    (metrics.taskCompletionRate || 0) +
    (metrics.projectSuccessRate || 0)
  ) / 3;
  
  return efficiency;
};

Department.prototype.addSkill = function(skill) {
  const skills = this.skills || [];
  if (!skills.includes(skill)) {
    skills.push(skill);
    this.skills = skills;
    return this.save();
  }
  return Promise.resolve(this);
};

Department.prototype.removeSkill = function(skill) {
  const skills = this.skills || [];
  const index = skills.indexOf(skill);
  if (index > -1) {
    skills.splice(index, 1);
    this.skills = skills;
    return this.save();
  }
  return Promise.resolve(this);
};

Department.prototype.addTechnology = function(technology) {
  const technologies = this.technologies || [];
  if (!technologies.includes(technology)) {
    technologies.push(technology);
    this.technologies = technologies;
    return this.save();
  }
  return Promise.resolve(this);
};

Department.prototype.removeTechnology = function(technology) {
  const technologies = this.technologies || [];
  const index = technologies.indexOf(technology);
  if (index > -1) {
    technologies.splice(index, 1);
    this.technologies = technologies;
    return this.save();
  }
  return Promise.resolve(this);
};

Department.prototype.addGoal = function(goal) {
  const goals = this.goals || [];
  goals.push({
    id: Date.now().toString(),
    description: goal,
    status: 'active',
    createdAt: new Date().toISOString()
  });
  
  this.goals = goals;
  return this.save();
};

Department.prototype.completeGoal = function(goalId) {
  const goals = this.goals || [];
  const goal = goals.find(g => g.id === goalId);
  
  if (goal) {
    goal.status = 'completed';
    goal.completedAt = new Date().toISOString();
    this.goals = goals;
    return this.save();
  }
  
  return Promise.reject(new Error('Goal not found'));
};

Department.prototype.addProcess = function(process) {
  const processes = this.processes || [];
  processes.push({
    id: Date.now().toString(),
    name: process.name,
    description: process.description,
    steps: process.steps || [],
    status: 'active',
    createdAt: new Date().toISOString()
  });
  
  this.processes = processes;
  return this.save();
};

Department.prototype.updateProcess = function(processId, updates) {
  const processes = this.processes || [];
  const process = processes.find(p => p.id === processId);
  
  if (process) {
    Object.assign(process, updates);
    this.processes = processes;
    return this.save();
  }
  
  return Promise.reject(new Error('Process not found'));
};

// Class methods
Department.generateDepartmentCode = async function(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  const code = `${prefix}${timestamp}`;
  
  // Check if code already exists
  const existing = await this.findOne({ where: { code } });
  if (existing) {
    return Department.generateDepartmentCode(name);
  }
  
  return code;
};

Department.findByType = function(type, options = {}) {
  return this.findAll({
    where: { type, ...options },
    order: [['name', 'ASC']]
  });
};

Department.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['name', 'ASC']]
  });
};

Department.findByLevel = function(level, options = {}) {
  return this.findAll({
    where: { level, ...options },
    order: [['name', 'ASC']]
  });
};

Department.findParents = function(options = {}) {
  return this.findAll({
    where: { parentDepartmentId: null, ...options },
    order: [['name', 'ASC']]
  });
};

Department.findChildren = function(parentId, options = {}) {
  return this.findAll({
    where: { parentDepartmentId: parentId, ...options },
    order: [['name', 'ASC']]
  });
};

Department.getHierarchy = async function() {
  const departments = await this.findAll({
    order: [['level', 'ASC'], ['name', 'ASC']]
  });
  
  const hierarchy = [];
  const departmentMap = new Map();
  
  // Create a map of departments by ID
  departments.forEach(dept => {
    departmentMap.set(dept.id, { ...dept.toJSON(), children: [] });
  });
  
  // Build hierarchy
  departments.forEach(dept => {
    if (dept.parentDepartmentId) {
      const parent = departmentMap.get(dept.parentDepartmentId);
      if (parent) {
        parent.children.push(departmentMap.get(dept.id));
      }
    } else {
      hierarchy.push(departmentMap.get(dept.id));
    }
  });
  
  return hierarchy;
};

Department.getStatistics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'type',
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('headcount')), 'totalHeadcount'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.attendanceRate")')), 'avgAttendanceRate'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.taskCompletionRate")')), 'avgTaskCompletionRate']
    ],
    group: ['type', 'status']
  });
};

// Associations
Department.associate = (models) => {
  // One-to-Many relationships
  Department.belongsTo(models.User, { foreignKey: 'headId', as: 'head' });
  Department.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Department.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  Department.belongsTo(Department, { foreignKey: 'parentDepartmentId', as: 'parentDepartment' });
  Department.hasMany(Department, { foreignKey: 'parentDepartmentId', as: 'childDepartments' });
  
  Department.hasMany(models.Project, { foreignKey: 'departmentId', as: 'projects' });
  Department.hasMany(models.Attendance, { foreignKey: 'departmentId', as: 'attendanceRecords' });
  Department.hasMany(models.Notification, { foreignKey: 'departmentId', as: 'notifications' });
  Department.hasMany(models.Meeting, { foreignKey: 'departmentId', as: 'meetings' });
  Department.hasMany(models.Document, { foreignKey: 'departmentId', as: 'documents' });
  Department.hasMany(models.Comment, { foreignKey: 'departmentId', as: 'comments' });
  
  // Many-to-Many relationships
  Department.belongsToMany(models.User, { 
    through: 'user_departments',
    foreignKey: 'departmentId',
    otherKey: 'userId',
    as: 'users'
  });
  
  Department.belongsToMany(models.Task, { 
    through: 'department_tasks',
    foreignKey: 'departmentId',
    otherKey: 'taskId',
    as: 'tasks'
  });
  
  Department.belongsToMany(models.Technology, { 
    through: 'department_technologies',
    foreignKey: 'departmentId',
    otherKey: 'technologyId',
    as: 'technologies'
  });
  
  Department.belongsToMany(models.Skill, { 
    through: 'department_skills',
    foreignKey: 'departmentId',
    otherKey: 'skillId',
    as: 'skills'
  });
  
  Department.belongsToMany(models.Tag, { 
    through: 'department_tags',
    foreignKey: 'departmentId',
    otherKey: 'tagId',
    as: 'tags'
  });
};

module.exports = { Department }; 