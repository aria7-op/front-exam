const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Technology = sequelize.define('Technology', {
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
    type: DataTypes.ENUM('programming_language', 'framework', 'database', 'cloud', 'devops', 'ai_ml', 'mobile', 'web', 'desktop', 'hardware', 'other'),
    defaultValue: 'programming_language',
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('language', 'framework', 'library', 'tool', 'platform', 'service', 'database', 'protocol', 'standard', 'other'),
    defaultValue: 'language',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deprecated', 'archived', 'beta', 'experimental'),
    defaultValue: 'active',
    allowNull: false
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endOfLife: {
    type: DataTypes.DATE,
    allowNull: true
  },
  license: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  documentation: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  repository: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  complexity: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    defaultValue: 'intermediate'
  },
  learningCurve: {
    type: DataTypes.ENUM('easy', 'moderate', 'steep', 'very_steep'),
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
  relatedTechnologies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  useCases: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  pros: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  cons: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  marketShare: {
    type: DataTypes.DECIMAL(5, 2), // percentage
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  popularity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium'
  },
  demand: {
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
      adoptionRate: 0.00,
      satisfactionScore: 0.00,
      demandScore: 0.00,
      communitySize: 0
    }
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about technology'
  },
  automationRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Automation rules for technology management'
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
  tableName: 'technologies',
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
      fields: ['complexity']
    },
    {
      fields: ['popularity']
    },
    {
      fields: ['demand']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['updatedBy']
    }
  ],
  hooks: {
    beforeCreate: async (technology) => {
      // Auto-generate technology code if not provided
      if (!technology.code) {
        technology.code = await Technology.generateTechnologyCode(technology.name);
      }
    },
    afterCreate: async (technology) => {
      // Emit technology event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('technology_created', {
        technologyId: technology.id,
        name: technology.name,
        category: technology.category,
        type: technology.type,
        timestamp: technology.createdAt
      });
    },
    afterUpdate: async (technology) => {
      // Emit technology update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('technology_updated', {
        technologyId: technology.id,
        name: technology.name,
        status: technology.status,
        timestamp: technology.updatedAt
      });
    }
  }
});

// Instance methods
Technology.prototype.isActive = function() {
  return this.status === 'active';
};

Technology.prototype.isDeprecated = function() {
  return this.status === 'deprecated';
};

Technology.prototype.isExperimental = function() {
  return this.status === 'experimental';
};

Technology.prototype.isEndOfLife = function() {
  if (!this.endOfLife) return false;
  return new Date() > new Date(this.endOfLife);
};

Technology.prototype.getDifficultyLevel = function() {
  return this.complexity;
};

Technology.prototype.calculateDemandScore = function() {
  const demandScores = {
    low: 1,
    medium: 2,
    high: 3,
    very_high: 4
  };
  
  return demandScores[this.demand] || 2;
};

Technology.prototype.calculatePopularityScore = function() {
  const popularityScores = {
    low: 1,
    medium: 2,
    high: 3,
    very_high: 4
  };
  
  return popularityScores[this.popularity] || 2;
};

Technology.prototype.addPrerequisite = function(technologyId) {
  const prerequisites = this.prerequisites || [];
  if (!prerequisites.includes(technologyId)) {
    prerequisites.push(technologyId);
    this.prerequisites = prerequisites;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.removePrerequisite = function(technologyId) {
  const prerequisites = this.prerequisites || [];
  const index = prerequisites.indexOf(technologyId);
  if (index > -1) {
    prerequisites.splice(index, 1);
    this.prerequisites = prerequisites;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.addRelatedTechnology = function(technologyId) {
  const relatedTechnologies = this.relatedTechnologies || [];
  if (!relatedTechnologies.includes(technologyId)) {
    relatedTechnologies.push(technologyId);
    this.relatedTechnologies = relatedTechnologies;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.removeRelatedTechnology = function(technologyId) {
  const relatedTechnologies = this.relatedTechnologies || [];
  const index = relatedTechnologies.indexOf(technologyId);
  if (index > -1) {
    relatedTechnologies.splice(index, 1);
    this.relatedTechnologies = relatedTechnologies;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.addTag = function(tag) {
  const tags = this.tags || [];
  if (!tags.includes(tag)) {
    tags.push(tag);
    this.tags = tags;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.removeTag = function(tag) {
  const tags = this.tags || [];
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
    this.tags = tags;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.addFeature = function(feature) {
  const features = this.features || [];
  if (!features.includes(feature)) {
    features.push(feature);
    this.features = features;
    return this.save();
  }
  return Promise.resolve(this);
};

Technology.prototype.addUseCase = function(useCase) {
  const useCases = this.useCases || [];
  if (!useCases.includes(useCase)) {
    useCases.push(useCase);
    this.useCases = useCases;
    return this.save();
  }
  return Promise.resolve(this);
};

// Class methods
Technology.generateTechnologyCode = async function(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  const code = `TEC-${prefix}${timestamp}`;
  
  // Check if code already exists
  const existing = await this.findOne({ where: { code } });
  if (existing) {
    return Technology.generateTechnologyCode(name);
  }
  
  return code;
};

Technology.findByCategory = function(category, options = {}) {
  return this.findAll({
    where: { category, ...options },
    order: [['name', 'ASC']]
  });
};

Technology.findByType = function(type, options = {}) {
  return this.findAll({
    where: { type, ...options },
    order: [['name', 'ASC']]
  });
};

Technology.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['name', 'ASC']]
  });
};

Technology.findByComplexity = function(complexity, options = {}) {
  return this.findAll({
    where: { complexity, ...options },
    order: [['name', 'ASC']]
  });
};

Technology.findByDemand = function(demand, options = {}) {
  return this.findAll({
    where: { demand, ...options },
    order: [['name', 'ASC']]
  });
};

Technology.findByPopularity = function(popularity, options = {}) {
  return this.findAll({
    where: { popularity, ...options },
    order: [['name', 'ASC']]
  });
};

Technology.getStatistics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'category',
      'type',
      'complexity',
      'demand',
      'popularity',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.averageRating")')), 'avgRating'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.adoptionRate")')), 'avgAdoptionRate']
    ],
    group: ['category', 'type', 'complexity', 'demand', 'popularity']
  });
};

// Associations
Technology.associate = (models) => {
  // One-to-Many relationships
  Technology.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Technology.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
  
  // Many-to-Many relationships
  Technology.belongsToMany(models.User, { 
    through: 'user_technologies',
    foreignKey: 'technologyId',
    otherKey: 'userId',
    as: 'users'
  });
  
  Technology.belongsToMany(models.Task, { 
    through: 'task_technologies',
    foreignKey: 'technologyId',
    otherKey: 'taskId',
    as: 'tasks'
  });
  
  Technology.belongsToMany(models.Project, { 
    through: 'project_technologies',
    foreignKey: 'technologyId',
    otherKey: 'projectId',
    as: 'projects'
  });
  
  Technology.belongsToMany(models.Department, { 
    through: 'department_technologies',
    foreignKey: 'technologyId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  Technology.belongsToMany(models.Skill, { 
    through: 'skill_technologies',
    foreignKey: 'technologyId',
    otherKey: 'skillId',
    as: 'skills'
  });
};

module.exports = { Technology }; 