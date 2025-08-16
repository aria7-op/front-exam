const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Skill = sequelize.define('Skill', {
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
  category: {
    type: DataTypes.ENUM('technical', 'soft', 'management', 'creative', 'analytical', 'communication', 'leadership', 'problem_solving', 'other'),
    defaultValue: 'technical',
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    defaultValue: 'intermediate'
  },
  type: {
    type: DataTypes.ENUM('hard_skill', 'soft_skill', 'certification', 'language', 'tool', 'methodology'),
    defaultValue: 'hard_skill',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deprecated', 'archived'),
    defaultValue: 'active',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'hard', 'very_hard'),
    defaultValue: 'moderate'
  },
  estimatedLearningTime: {
    type: DataTypes.INTEGER, // in hours
    allowNull: true,
    validate: {
      min: 0
    }
  },
  prerequisites: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  relatedSkills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  resources: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      courses: [],
      books: [],
      websites: [],
      videos: [],
      certifications: []
    }
  },
  assessmentCriteria: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      theoretical: 0.3,
      practical: 0.5,
      experience: 0.2
    }
  },
  marketDemand: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium'
  },
  salaryImpact: {
    type: DataTypes.DECIMAL(5, 2), // percentage increase
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  industryRelevance: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      averageRating: 0.00,
      completionRate: 0.00,
      satisfactionScore: 0.00,
      demandScore: 0.00
    }
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about skill'
  },
  automationRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Automation rules for skill management'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom fields for extensibility'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  visibility: {
    type: DataTypes.ENUM('private', 'team', 'department', 'organization', 'public'),
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
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata for extensibility'
  }
}, {
  tableName: 'skills',
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
      fields: ['level']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['marketDemand']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['updatedBy']
    }
  ],
  hooks: {
    beforeCreate: async (skill) => {
      // Auto-generate skill code if not provided
      if (!skill.code) {
        skill.code = await Skill.generateSkillCode(skill.name);
      }
    },
    afterCreate: async (skill) => {
      // Emit skill event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('skill_created', {
        skillId: skill.id,
        name: skill.name,
        category: skill.category,
        type: skill.type,
        timestamp: skill.createdAt
      });
    },
    afterUpdate: async (skill) => {
      // Emit skill update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('skill_updated', {
        skillId: skill.id,
        name: skill.name,
        status: skill.status,
        timestamp: skill.updatedAt
      });
    }
  }
});

// Instance methods
Skill.prototype.isActive = function() {
  return this.status === 'active';
};

Skill.prototype.isTechnical = function() {
  return this.category === 'technical';
};

Skill.prototype.isSoftSkill = function() {
  return this.category === 'soft';
};

Skill.prototype.getDifficultyLevel = function() {
  return this.difficulty;
};

Skill.prototype.calculateDemandScore = function() {
  const demandScores = {
    low: 1,
    medium: 2,
    high: 3,
    very_high: 4
  };
  
  return demandScores[this.marketDemand] || 2;
};

Skill.prototype.addPrerequisite = function(skillId) {
  const prerequisites = this.prerequisites || [];
  if (!prerequisites.includes(skillId)) {
    prerequisites.push(skillId);
    this.prerequisites = prerequisites;
    return this.save();
  }
  return Promise.resolve(this);
};

Skill.prototype.removePrerequisite = function(skillId) {
  const prerequisites = this.prerequisites || [];
  const index = prerequisites.indexOf(skillId);
  if (index > -1) {
    prerequisites.splice(index, 1);
    this.prerequisites = prerequisites;
    return this.save();
  }
  return Promise.resolve(this);
};

Skill.prototype.addRelatedSkill = function(skillId) {
  const relatedSkills = this.relatedSkills || [];
  if (!relatedSkills.includes(skillId)) {
    relatedSkills.push(skillId);
    this.relatedSkills = relatedSkills;
    return this.save();
  }
  return Promise.resolve(this);
};

Skill.prototype.removeRelatedSkill = function(skillId) {
  const relatedSkills = this.relatedSkills || [];
  const index = relatedSkills.indexOf(skillId);
  if (index > -1) {
    relatedSkills.splice(index, 1);
    this.relatedSkills = relatedSkills;
    return this.save();
  }
  return Promise.resolve(this);
};

Skill.prototype.addTag = function(tag) {
  const tags = this.tags || [];
  if (!tags.includes(tag)) {
    tags.push(tag);
    this.tags = tags;
    return this.save();
  }
  return Promise.resolve(this);
};

Skill.prototype.removeTag = function(tag) {
  const tags = this.tags || [];
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
    this.tags = tags;
    return this.save();
  }
  return Promise.resolve(this);
};

// Class methods
Skill.generateSkillCode = async function(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  const code = `SKL-${prefix}${timestamp}`;
  
  // Check if code already exists
  const existing = await this.findOne({ where: { code } });
  if (existing) {
    return Skill.generateSkillCode(name);
  }
  
  return code;
};

Skill.findByCategory = function(category, options = {}) {
  return this.findAll({
    where: { category, ...options },
    order: [['name', 'ASC']]
  });
};

Skill.findByType = function(type, options = {}) {
  return this.findAll({
    where: { type, ...options },
    order: [['name', 'ASC']]
  });
};

Skill.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['name', 'ASC']]
  });
};

Skill.findByLevel = function(level, options = {}) {
  return this.findAll({
    where: { level, ...options },
    order: [['name', 'ASC']]
  });
};

Skill.findByMarketDemand = function(demand, options = {}) {
  return this.findAll({
    where: { marketDemand: demand, ...options },
    order: [['name', 'ASC']]
  });
};

Skill.getStatistics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'category',
      'type',
      'level',
      'marketDemand',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.averageRating")')), 'avgRating'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.completionRate")')), 'avgCompletionRate']
    ],
    group: ['category', 'type', 'level', 'marketDemand']
  });
};

// Associations
Skill.associate = (models) => {
  // One-to-Many relationships
  Skill.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Skill.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  
  // Many-to-Many relationships
  Skill.belongsToMany(models.User, { 
    through: 'user_skills',
    foreignKey: 'skillId',
    otherKey: 'userId',
    as: 'users'
  });
  
  Skill.belongsToMany(models.Task, { 
    through: 'task_skills',
    foreignKey: 'skillId',
    otherKey: 'taskId',
    as: 'tasks'
  });
  
  Skill.belongsToMany(models.Project, { 
    through: 'project_skills',
    foreignKey: 'skillId',
    otherKey: 'projectId',
    as: 'projects'
  });
  
  Skill.belongsToMany(models.Department, { 
    through: 'department_skills',
    foreignKey: 'skillId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  Skill.belongsToMany(models.Technology, { 
    through: 'skill_technologies',
    foreignKey: 'skillId',
    otherKey: 'technologyId',
    as: 'technologies'
  });
};

module.exports = { Skill }; 