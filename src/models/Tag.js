const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  code: {
    type: DataTypes.STRING(30),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 30]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('project', 'task', 'user', 'department', 'technology', 'skill', 'general', 'priority', 'status', 'other'),
    defaultValue: 'general',
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('label', 'category', 'priority', 'status', 'custom', 'system'),
    defaultValue: 'label',
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7), // Hex color code
    allowNull: true,
    defaultValue: '#007bff',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active',
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  visibility: {
    type: DataTypes.ENUM('private', 'team', 'department', 'organization', 'public'),
    defaultValue: 'organization'
  },
  rules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      autoApply: false,
      conditions: [],
      actions: []
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about tag usage'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom fields for extensibility'
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
  tableName: 'tags',
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
      fields: ['category']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['usageCount']
    },
    {
      fields: ['isSystem']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['updatedBy']
    }
  ],
  hooks: {
    beforeCreate: async (tag) => {
      // Auto-generate tag code if not provided
      if (!tag.code) {
        tag.code = await Tag.generateTagCode(tag.name);
      }
      
      // Set default color based on category if not provided
      if (!tag.color) {
        tag.color = Tag.getDefaultColor(tag.category);
      }
    },
    afterCreate: async (tag) => {
      // Emit tag event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('tag_created', {
        tagId: tag.id,
        name: tag.name,
        category: tag.category,
        type: tag.type,
        timestamp: tag.createdAt
      });
    },
    afterUpdate: async (tag) => {
      // Emit tag update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('tag_updated', {
        tagId: tag.id,
        name: tag.name,
        status: tag.status,
        usageCount: tag.usageCount,
        timestamp: tag.updatedAt
      });
    }
  }
});

// Instance methods
Tag.prototype.isActive = function() {
  return this.status === 'active';
};

Tag.prototype.isSystem = function() {
  return this.isSystem;
};

Tag.prototype.isPublic = function() {
  return this.isPublic;
};

Tag.prototype.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

Tag.prototype.decrementUsage = function() {
  if (this.usageCount > 0) {
    this.usageCount -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

Tag.prototype.getDisplayName = function() {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
};

Tag.prototype.getColorClass = function() {
  return `tag-${this.category}`;
};

Tag.prototype.isHighPriority = function() {
  return this.priority >= 80;
};

Tag.prototype.isLowPriority = function() {
  return this.priority <= 20;
};

Tag.prototype.updateUsageCount = function(count) {
  this.usageCount = Math.max(0, count);
  return this.save();
};

// Class methods
Tag.generateTagCode = async function(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-3);
  const code = `${prefix}${timestamp}`;
  
  // Check if code already exists
  const existing = await this.findOne({ where: { code } });
  if (existing) {
    return Tag.generateTagCode(name);
  }
  
  return code;
};

Tag.getDefaultColor = function(category) {
  const colorMap = {
    project: '#28a745',
    task: '#007bff',
    user: '#6f42c1',
    department: '#fd7e14',
    technology: '#e83e8c',
    skill: '#20c997',
    general: '#6c757d',
    priority: '#dc3545',
    status: '#17a2b8',
    other: '#6c757d'
  };
  
  return colorMap[category] || '#6c757d';
};

Tag.findByCategory = function(category, options = {}) {
  return this.findAll({
    where: { category, ...options },
    order: [['priority', 'DESC'], ['name', 'ASC']]
  });
};

Tag.findByType = function(type, options = {}) {
  return this.findAll({
    where: { type, ...options },
    order: [['priority', 'DESC'], ['name', 'ASC']]
  });
};

Tag.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['priority', 'DESC'], ['name', 'ASC']]
  });
};

Tag.findSystemTags = function(options = {}) {
  return this.findAll({
    where: { isSystem: true, ...options },
    order: [['priority', 'DESC'], ['name', 'ASC']]
  });
};

Tag.findCustomTags = function(options = {}) {
  return this.findAll({
    where: { isSystem: false, ...options },
    order: [['priority', 'DESC'], ['name', 'ASC']]
  });
};

Tag.findMostUsed = function(limit = 10, options = {}) {
  return this.findAll({
    where: { ...options },
    order: [['usageCount', 'DESC']],
    limit
  });
};

Tag.findByPriority = function(priority, options = {}) {
  return this.findAll({
    where: { priority, ...options },
    order: [['name', 'ASC']]
  });
};

Tag.getStatistics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'category',
      'type',
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('usageCount')), 'totalUsage'],
      [sequelize.fn('AVG', sequelize.col('priority')), 'avgPriority']
    ],
    group: ['category', 'type', 'status']
  });
};

// Associations
Tag.associate = (models) => {
  // One-to-Many relationships
  Tag.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Tag.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  
  // Many-to-Many relationships
  Tag.belongsToMany(models.User, { 
    through: 'user_tags',
    foreignKey: 'tagId',
    otherKey: 'userId',
    as: 'users'
  });
  
  Tag.belongsToMany(models.Task, { 
    through: 'task_tags',
    foreignKey: 'tagId',
    otherKey: 'taskId',
    as: 'tasks'
  });
  
  Tag.belongsToMany(models.Project, { 
    through: 'project_tags',
    foreignKey: 'tagId',
    otherKey: 'projectId',
    as: 'projects'
  });
  
  Tag.belongsToMany(models.Department, { 
    through: 'department_tags',
    foreignKey: 'tagId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  Tag.belongsToMany(models.Skill, { 
    through: 'skill_tags',
    foreignKey: 'tagId',
    otherKey: 'skillId',
    as: 'skills'
  });
  
  Tag.belongsToMany(models.Technology, { 
    through: 'technology_tags',
    foreignKey: 'tagId',
    otherKey: 'technologyId',
    as: 'technologies'
  });
};

module.exports = { Tag }; 