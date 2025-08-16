const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
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
      len: [2, 255]
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
  type: {
    type: DataTypes.ENUM('individual', 'corporate', 'government', 'non_profit', 'startup', 'enterprise'),
    defaultValue: 'corporate',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'prospect', 'lead', 'archived'),
    defaultValue: 'prospect',
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  size: {
    type: DataTypes.ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
    defaultValue: 'medium'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      street: null,
      city: null,
      state: null,
      country: null,
      zipCode: null,
      coordinates: null
    }
  },
  contactPerson: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      name: null,
      title: null,
      email: null,
      phone: null,
      linkedin: null
    }
  },
  billingInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      address: null,
      taxId: null,
      paymentTerms: 'net_30',
      currency: 'USD',
      billingEmail: null
    }
  },
  contractInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      startDate: null,
      endDate: null,
      value: null,
      terms: null,
      status: 'draft'
    }
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      communication: {
        email: true,
        phone: false,
        sms: false,
        preferredTime: 'business_hours'
      },
      reporting: {
        frequency: 'monthly',
        format: 'pdf',
        includeMetrics: true
      },
      notifications: {
        projectUpdates: true,
        milestoneCompletion: true,
        issueAlerts: true
      }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom fields for extensibility'
  },
  aiInsights: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'AI-generated insights about client'
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
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      satisfaction: 0.00,
      retention: 0.00,
      revenue: 0.00,
      projectSuccess: 0.00,
      responseTime: 0.00
    }
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  source: {
    type: DataTypes.ENUM('referral', 'website', 'social_media', 'cold_outreach', 'event', 'partnership', 'other'),
    defaultValue: 'other'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  visibility: {
    type: DataTypes.ENUM('private', 'team', 'organization', 'public'),
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
  }
}, {
  tableName: 'clients',
  timestamps: true,
  indexes: [
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['name']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['industry']
    },
    {
      fields: ['assignedTo']
    },
    {
      fields: ['source']
    },
    {
      fields: ['priority']
    }
  ],
  hooks: {
    beforeCreate: async (client) => {
      // Auto-generate client code if not provided
      if (!client.code) {
        client.code = await Client.generateClientCode(client.name);
      }
    },
    afterCreate: async (client) => {
      // Emit client event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('client_created', {
        clientId: client.id,
        name: client.name,
        type: client.type,
        status: client.status,
        timestamp: client.createdAt
      });
    },
    afterUpdate: async (client) => {
      // Emit client update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('client_updated', {
        clientId: client.id,
        name: client.name,
        status: client.status,
        timestamp: client.updatedAt
      });
    }
  }
});

// Instance methods
Client.prototype.isActive = function() {
  return this.status === 'active';
};

Client.prototype.isProspect = function() {
  return this.status === 'prospect';
};

Client.prototype.isLead = function() {
  return this.status === 'lead';
};

Client.prototype.getFullAddress = function() {
  const address = this.address || {};
  return [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipCode
  ].filter(Boolean).join(', ');
};

Client.prototype.calculateSatisfaction = function() {
  const metrics = this.performanceMetrics || {};
  return metrics.satisfaction || 0;
};

Client.prototype.calculateRetention = function() {
  const metrics = this.performanceMetrics || {};
  return metrics.retention || 0;
};

Client.prototype.getRiskLevel = function() {
  const assessment = this.riskAssessment || {};
  return assessment.riskLevel || 'low';
};

Client.prototype.addRequirement = function(requirement) {
  const requirements = this.requirements || [];
  requirements.push({
    id: Date.now().toString(),
    description: requirement,
    status: 'active',
    createdAt: new Date().toISOString()
  });
  
  this.requirements = requirements;
  return this.save();
};

Client.prototype.updateRequirement = function(requirementId, updates) {
  const requirements = this.requirements || [];
  const requirement = requirements.find(r => r.id === requirementId);
  
  if (requirement) {
    Object.assign(requirement, updates);
    this.requirements = requirements;
    return this.save();
  }
  
  return Promise.reject(new Error('Requirement not found'));
};

Client.prototype.addTag = function(tag) {
  const tags = this.tags || [];
  if (!tags.includes(tag)) {
    tags.push(tag);
    this.tags = tags;
    return this.save();
  }
  return Promise.resolve(this);
};

Client.prototype.removeTag = function(tag) {
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
Client.generateClientCode = async function(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const code = `CLI-${prefix}${timestamp}`;
  
  // Check if code already exists
  const existing = await this.findOne({ where: { code } });
  if (existing) {
    return Client.generateClientCode(name);
  }
  
  return code;
};

Client.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Client.findByType = function(type, options = {}) {
  return this.findAll({
    where: { type, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Client.findByIndustry = function(industry, options = {}) {
  return this.findAll({
    where: { industry, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Client.findByAssignedTo = function(userId, options = {}) {
  return this.findAll({
    where: { assignedTo: userId, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Client.findByPriority = function(priority, options = {}) {
  return this.findAll({
    where: { priority, ...options },
    order: [['createdAt', 'DESC']]
  });
};

Client.getStatistics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'status',
      'type',
      'industry',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.satisfaction")')), 'avgSatisfaction'],
      [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(performanceMetrics, "$.retention")')), 'avgRetention']
    ],
    group: ['status', 'type', 'industry']
  });
};

// Associations
Client.associate = (models) => {
  Client.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'assignedUser' });
  
  Client.belongsToMany(models.Project, { 
    through: 'client_projects',
    foreignKey: 'clientId',
    otherKey: 'projectId',
    as: 'projects'
  });
  
  Client.belongsToMany(models.User, { 
    through: 'client_contacts',
    foreignKey: 'clientId',
    otherKey: 'userId',
    as: 'contacts'
  });
  
  Client.belongsToMany(models.Department, { 
    through: 'client_departments',
    foreignKey: 'clientId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  Client.hasMany(models.Notification, { foreignKey: 'clientId', as: 'notifications' });
  Client.hasMany(models.Meeting, { foreignKey: 'clientId', as: 'meetings' });
  Client.hasMany(models.Document, { foreignKey: 'clientId', as: 'documents' });
};

module.exports = { Client }; 