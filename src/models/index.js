const { sequelize } = require('../config/database');

// Import all models
const { User } = require('./User');
const { Attendance } = require('./Attendance');
const { Task } = require('./Task');
const { Project } = require('./Project');
const { Department } = require('./Department');
const { Skill } = require('./Skill');
const { Technology } = require('./Technology');
const { Tag } = require('./Tag');

// Import additional models (these will be created next)
const { Notification } = require('./Notification');
const { Meeting } = require('./Meeting');
const { Document } = require('./Document');
const { Comment } = require('./Comment');
const { BiometricData } = require('./BiometricData');
const { Leave } = require('./Leave');

// Create models object
const models = {
  User,
  Attendance,
  Task,
  Project,
  Department,
  Skill,
  Technology,
  Tag,
  Notification,
  Meeting,
  Document,
  Comment,
  BiometricData,
  Leave
};

// Establish associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  ...models
}; 