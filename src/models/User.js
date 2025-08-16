const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee', 'hr', 'supervisor'),
    defaultValue: 'employee',
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  workSchedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null }
    }
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      office: 'Main Office',
      floor: 1,
      desk: 'A1'
    }
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      canMarkAttendance: true,
      canViewReports: false,
      canManageUsers: false,
      canManageTasks: false,
      canViewAnalytics: false
    }
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      timezone: 'UTC',
      language: 'en',
      theme: 'light'
    }
  },
  biometricEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.JSON,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  performanceScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 1
    }
  },
  aiRiskScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
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
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      fields: ['employeeId'],
      unique: true
    },
    {
      fields: ['email'],
      unique: true
    },
    {
      fields: ['role']
    },
    {
      fields: ['department']
    },
    {
      fields: ['managerId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['updatedBy']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    afterCreate: async (user) => {
      // Emit user event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('user_created', {
        userId: user.id,
        role: user.role,
        department: user.department,
        timestamp: user.createdAt
      });
    },
    afterUpdate: async (user) => {
      // Emit user update event for monitoring
      const { monitoringEvents } = require('../services/monitoring.service');
      monitoringEvents.emit('user_updated', {
        userId: user.id,
        role: user.role,
        isActive: user.isActive,
        timestamp: user.updatedAt
      });
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.isManager = function() {
  return ['admin', 'manager', 'hr', 'supervisor'].includes(this.role);
};

User.prototype.canManageUsers = function() {
  return this.permissions?.canManageUsers || this.isManager();
};

User.prototype.canViewReports = function() {
  return this.permissions?.canViewReports || this.isManager();
};

User.prototype.canManageTasks = function() {
  return this.permissions?.canManageTasks || this.isManager();
};

User.prototype.canViewAnalytics = function() {
  return this.permissions?.canViewAnalytics || this.isManager();
};

User.prototype.isCurrentlyWorking = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5);
  
  const schedule = this.workSchedule?.[dayOfWeek];
  if (!schedule || !schedule.start || !schedule.end) return false;
  
  return currentTime >= schedule.start && currentTime <= schedule.end;
};

User.prototype.getWorkingHours = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  return this.workSchedule?.[dayOfWeek] || null;
};

// Class methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findByEmployeeId = function(employeeId) {
  return this.findOne({ where: { employeeId } });
};

User.findActiveUsers = function() {
  return this.findAll({ where: { isActive: true } });
};

User.findByDepartment = function(department) {
  return this.findAll({ where: { department, isActive: true } });
};

User.findManagers = function() {
  return this.findAll({ 
    where: { 
      role: ['admin', 'manager', 'hr', 'supervisor'],
      isActive: true 
    } 
  });
};

// Associations
User.associate = (models) => {
  // One-to-Many relationships
  User.hasMany(models.Attendance, { foreignKey: 'userId', as: 'attendances' });
  User.hasMany(models.Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
  User.hasMany(models.Task, { foreignKey: 'createdBy', as: 'createdTasks' });
  User.hasMany(models.BiometricData, { foreignKey: 'userId', as: 'biometricData' });
  User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
  User.hasMany(models.Leave, { foreignKey: 'userId', as: 'leaves' });
  User.hasMany(models.Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
  User.hasMany(models.Project, { foreignKey: 'managerId', as: 'managedProjects' });
  User.hasMany(models.Department, { foreignKey: 'headId', as: 'headedDepartments' });
  User.hasMany(models.Meeting, { foreignKey: 'organizerId', as: 'organizedMeetings' });
  User.hasMany(models.Document, { foreignKey: 'createdBy', as: 'createdDocuments' });
  User.hasMany(models.Document, { foreignKey: 'updatedBy', as: 'updatedDocuments' });
  
  // Self-referencing relationships
  User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
  User.hasMany(User, { foreignKey: 'managerId', as: 'subordinates' });
  User.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  User.hasMany(User, { foreignKey: 'createdBy', as: 'createdUsers' });
  User.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
  User.hasMany(User, { foreignKey: 'updatedBy', as: 'updatedUsers' });
  
  // Many-to-Many relationships
  User.belongsToMany(models.Department, { 
    through: 'user_departments',
    foreignKey: 'userId',
    otherKey: 'departmentId',
    as: 'departments'
  });
  
  User.belongsToMany(models.Project, { 
    through: 'project_members',
    foreignKey: 'userId',
    otherKey: 'projectId',
    as: 'memberProjects'
  });
  
  User.belongsToMany(models.Task, { 
    through: 'task_assignees',
    foreignKey: 'userId',
    otherKey: 'taskId',
    as: 'assignedTasksMany'
  });
  
  User.belongsToMany(models.Skill, { 
    through: 'user_skills',
    foreignKey: 'userId',
    otherKey: 'skillId',
    as: 'skills'
  });
  
  User.belongsToMany(models.Technology, { 
    through: 'user_technologies',
    foreignKey: 'userId',
    otherKey: 'technologyId',
    as: 'technologies'
  });
  
  User.belongsToMany(models.Meeting, { 
    through: 'meeting_participants',
    foreignKey: 'userId',
    otherKey: 'meetingId',
    as: 'meetings'
  });
  
  User.belongsToMany(models.Notification, { 
    through: 'user_notifications',
    foreignKey: 'userId',
    otherKey: 'notificationId',
    as: 'userNotifications'
  });
};

module.exports = { User }; 