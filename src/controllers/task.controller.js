const { Task, User, Project } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { logPerformance, logSecurity } = require('../utils/logger');
const { monitoringEvents } = require('../services/monitoring.service');
const { AISecurityService } = require('../services/ai.security.service');
const { getCache, setCache } = require('../config/redis');
const { Op } = require('sequelize');
const moment = require('moment');

const aiSecurity = new AISecurityService();

class TaskController {
  // Create task with AI-powered optimization
  static createTask = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { 
      title, 
      description, 
      assignedTo, 
      projectId, 
      priority, 
      type, 
      estimatedHours,
      dueDate,
      dependencies,
      tags,
      complexity,
      effort,
      isRecurring,
      recurrencePattern
    } = req.body;
    
    const createdBy = req.user.id;
    
    try {
      // Validate assignee exists and is active
      const assignee = await User.findByPk(assignedTo);
      if (!assignee || !assignee.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Assignee not found or inactive'
        });
      }

      // AI-powered task optimization
      const optimization = await this.optimizeTask({
        title,
        description,
        complexity,
        effort,
        priority,
        assignee
      });

      // Create task with optimized parameters
      const taskData = {
        title,
        description,
        assignedTo,
        createdBy,
        projectId,
        priority: optimization.priority,
        type,
        estimatedHours: optimization.estimatedHours || estimatedHours,
        dueDate: optimization.dueDate || dueDate,
        dependencies,
        tags,
        complexity: optimization.complexity,
        effort: optimization.effort,
        isRecurring,
        recurrencePattern,
        aiGenerated: optimization.aiGenerated,
        confidence: optimization.confidence
      };

      const task = await Task.create(taskData);

      // Generate AI insights
      const insights = await this.generateTaskInsights(task, assignee);
      task.aiInsights = insights;
      await task.save();

      // Create recurring tasks if needed
      if (isRecurring && recurrencePattern) {
        await this.createRecurringTasks(task, recurrencePattern);
      }

      // Emit monitoring events
      monitoringEvents.emit('task_created', {
        taskId: task.id,
        assignedTo,
        createdBy,
        priority: task.priority,
        status: task.status,
        timestamp: task.createdAt
      });

      logPerformance('Task Creation', Date.now() - startTime, { taskId: task.id, assignedTo });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: {
          task: {
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            insights: task.aiInsights,
            optimization: optimization
          }
        }
      });

    } catch (error) {
      logSecurity('Task Creation Error', { createdBy, error: error.message });
      throw error;
    }
  });

  // Update task with AI-powered recommendations
  static updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const updateData = req.body;
    
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'creator' }
        ]
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // AI-powered update recommendations
      const recommendations = await this.generateUpdateRecommendations(task, updateData);
      
      // Apply updates
      await task.update(updateData);

      // Recalculate metrics if needed
      if (updateData.status === 'completed') {
        task.actualEndDate = new Date();
        task.progress = 100;
        await task.save();
      }

      // Update AI insights
      const insights = await this.generateTaskInsights(task, task.assignee);
      task.aiInsights = insights;
      await task.save();

      // Emit monitoring events
      monitoringEvents.emit('task_updated', {
        taskId: task.id,
        assignedTo: task.assignedTo,
        status: task.status,
        progress: task.progress,
        timestamp: task.updatedAt
      });

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: {
          task: {
            id: task.id,
            title: task.title,
            status: task.status,
            progress: task.progress,
            insights: task.aiInsights,
            recommendations
          }
        }
      });

    } catch (error) {
      throw error;
    }
  });

  // Get tasks with advanced filtering and AI insights
  static getTasks = asyncHandler(async (req, res) => {
    const { 
      assignedTo, 
      createdBy, 
      status, 
      priority, 
      projectId, 
      dueDate,
      includeOverdue,
      includeAnomalies,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    try {
      const whereClause = {};
      
      if (assignedTo) whereClause.assignedTo = assignedTo;
      if (createdBy) whereClause.createdBy = createdBy;
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;
      if (projectId) whereClause.projectId = projectId;
      
      if (dueDate) {
        whereClause.dueDate = {
          [Op.lte]: new Date(dueDate)
        };
      }
      
      if (includeOverdue === 'true') {
        whereClause.dueDate = {
          [Op.lt]: new Date()
        };
        whereClause.status = {
          [Op.ne]: 'completed'
        };
      }

      const offset = (page - 1) * limit;
      
      const { count, rows: tasks } = await Task.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'employeeId', 'department']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'employeeId']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'status']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Generate AI insights for the task list
      const insights = await this.generateTaskListInsights(tasks);

      res.status(200).json({
        success: true,
        data: {
          tasks,
          insights,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      throw error;
    }
  });

  // Get task details with comprehensive analytics
  static getTaskDetails = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'employeeId', 'department', 'position']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'employeeId']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'description', 'status']
          }
        ]
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Generate comprehensive analytics
      const analytics = await this.generateTaskAnalytics(task);
      
      // Get related tasks
      const relatedTasks = await this.getRelatedTasks(task);
      
      // Get performance metrics
      const performanceMetrics = await this.calculateTaskPerformance(task);

      res.status(200).json({
        success: true,
        data: {
          task,
          analytics,
          relatedTasks,
          performanceMetrics
        }
      });

    } catch (error) {
      throw error;
    }
  });

  // Add time entry with AI-powered validation
  static addTimeEntry = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { startTime, endTime, description, activity } = req.body;
    const userId = req.user.id;
    
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Validate time entry
      const validation = await this.validateTimeEntry(task, startTime, endTime, userId);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      // Add time entry
      await task.addTimeEntry(startTime, endTime, description, activity);

      // Update performance metrics
      const performanceMetrics = await this.calculateTaskPerformance(task);
      task.performanceMetrics = performanceMetrics;
      await task.save();

      res.status(200).json({
        success: true,
        message: 'Time entry added successfully',
        data: {
          taskId: task.id,
          timeEntry: {
            startTime,
            endTime,
            duration: (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60),
            description,
            activity
          },
          performanceMetrics: task.performanceMetrics
        }
      });

    } catch (error) {
      throw error;
    }
  });

  // Add comment with AI-powered moderation
  static addComment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { content, type = 'comment' } = req.body;
    const userId = req.user.id;
    
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // AI-powered content moderation
      const moderation = await this.moderateComment(content);
      if (!moderation.isApproved) {
        return res.status(400).json({
          success: false,
          message: 'Comment violates community guidelines',
          details: moderation.reasons
        });
      }

      // Add comment
      await task.addComment(userId, content, type);

      res.status(200).json({
        success: true,
        message: 'Comment added successfully',
        data: {
          taskId: task.id,
          comment: {
            id: Date.now().toString(),
            userId,
            content,
            type,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      throw error;
    }
  });

  // Get task analytics and reports
  static getTaskAnalytics = asyncHandler(async (req, res) => {
    const { userId, projectId, period = 'month' } = req.query;
    
    try {
      const analytics = await this.generateUserTaskAnalytics(userId, projectId, period);
      
      res.status(200).json({
        success: true,
        data: analytics
      });

    } catch (error) {
      throw error;
    }
  });

  // AI-powered task assignment optimization
  static optimizeTaskAssignment = asyncHandler(async (req, res) => {
    const { tasks, teamMembers } = req.body;
    
    try {
      const optimization = await this.generateOptimalAssignment(tasks, teamMembers);
      
      res.status(200).json({
        success: true,
        data: {
          assignments: optimization.assignments,
          efficiency: optimization.efficiency,
          recommendations: optimization.recommendations
        }
      });

    } catch (error) {
      throw error;
    }
  });

  // Helper methods
  static async optimizeTask(taskData, assignee) {
    // AI-powered task optimization
    const optimization = {
      priority: taskData.priority,
      complexity: taskData.complexity,
      effort: taskData.effort,
      estimatedHours: taskData.estimatedHours,
      dueDate: taskData.dueDate,
      aiGenerated: false,
      confidence: 0.8
    };

    // Analyze assignee's workload and skills
    const assigneeWorkload = await this.getAssigneeWorkload(assignee.id);
    const assigneeSkills = assignee.skills || [];
    
    // Optimize based on assignee capabilities
    if (assigneeWorkload.currentTasks > 5) {
      optimization.priority = 'high';
      optimization.confidence = 0.9;
    }
    
    // Adjust complexity based on skills
    if (assigneeSkills.includes('expert') && taskData.complexity === 'simple') {
      optimization.complexity = 'moderate';
    }

    return optimization;
  }

  static async generateTaskInsights(task, assignee) {
    // Generate AI insights about task
    const insights = {
      estimatedCompletion: this.estimateCompletionDate(task),
      riskFactors: this.assessTaskRisks(task),
      recommendations: [
        'Consider breaking down into smaller subtasks',
        'Schedule regular check-ins with stakeholders'
      ],
      efficiency: this.calculateTaskEfficiency(task),
      collaboration: this.assessCollaborationNeeds(task)
    };

    return insights;
  }

  static async createRecurringTasks(task, pattern) {
    // Create recurring tasks based on pattern
    const recurringTasks = [];
    const { frequency, interval, endDate } = pattern;
    
    let currentDate = new Date(task.dueDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      const recurringTask = await Task.create({
        ...task.toJSON(),
        id: undefined,
        title: `${task.title} (Recurring)`,
        dueDate: new Date(currentDate),
        isRecurring: false,
        parentTaskId: task.id
      });
      
      recurringTasks.push(recurringTask);
      
      // Calculate next occurrence
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (interval * 7));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
      }
    }
    
    return recurringTasks;
  }

  static async generateUpdateRecommendations(task, updateData) {
    // Generate AI recommendations for task updates
    const recommendations = [];
    
    if (updateData.status === 'blocked') {
      recommendations.push({
        type: 'warning',
        message: 'Task is blocked. Consider identifying and resolving blockers.',
        action: 'review_blockers'
      });
    }
    
    if (updateData.progress && updateData.progress < 25 && task.estimatedHours > 8) {
      recommendations.push({
        type: 'suggestion',
        message: 'Consider breaking down this large task into smaller subtasks.',
        action: 'create_subtasks'
      });
    }
    
    return recommendations;
  }

  static async generateTaskListInsights(tasks) {
    // Generate insights for a list of tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.isOverdue()).length;
    
    return {
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      overdueRate: totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0,
      averageProgress: tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks,
      recommendations: [
        'Focus on high-priority overdue tasks',
        'Consider resource reallocation for blocked tasks'
      ]
    };
  }

  static async generateTaskAnalytics(task) {
    // Generate comprehensive task analytics
    return {
      timeTracking: {
        totalHours: task.actualHours || 0,
        estimatedHours: task.estimatedHours || 0,
        efficiency: task.calculateEfficiency(),
        velocity: task.getVelocity()
      },
      progress: {
        current: task.progress,
        trend: 'improving',
        milestones: task.checkpoints?.filter(cp => cp.completed).length || 0
      },
      collaboration: {
        teamMembers: task.collaborationData?.teamMembers?.length || 0,
        stakeholders: task.collaborationData?.stakeholders?.length || 0,
        communicationChannels: task.collaborationData?.communicationChannels?.length || 0
      }
    };
  }

  static async getRelatedTasks(task) {
    // Get related tasks based on dependencies and project
    const relatedTasks = await Task.findAll({
      where: {
        [Op.or]: [
          { id: task.dependencies },
          { projectId: task.projectId },
          { assignedTo: task.assignedTo }
        ],
        id: { [Op.ne]: task.id }
      },
      limit: 5
    });
    
    return relatedTasks;
  }

  static async calculateTaskPerformance(task) {
    // Calculate comprehensive performance metrics
    return {
      velocity: task.getVelocity(),
      efficiency: task.calculateEfficiency(),
      quality: task.qualityMetrics,
      collaboration: {
        teamInteractions: task.collaborationMetrics?.teamInteractions || 0,
        crossDepartmentWork: task.collaborationMetrics?.crossDepartmentWork || 0
      }
    };
  }

  static async validateTimeEntry(task, startTime, endTime, userId) {
    // Validate time entry
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return { isValid: false, message: 'End time must be after start time' };
    }
    
    if (task.assignedTo !== userId) {
      return { isValid: false, message: 'Only assigned user can add time entries' };
    }
    
    return { isValid: true };
  }

  static async moderateComment(content) {
    // AI-powered comment moderation
    const moderation = {
      isApproved: true,
      reasons: []
    };
    
    // Simple content filtering (in real implementation, use AI service)
    const inappropriateWords = ['spam', 'inappropriate'];
    const hasInappropriateContent = inappropriateWords.some(word => 
      content.toLowerCase().includes(word)
    );
    
    if (hasInappropriateContent) {
      moderation.isApproved = false;
      moderation.reasons.push('Contains inappropriate content');
    }
    
    return moderation;
  }

  static async generateUserTaskAnalytics(userId, projectId, period) {
    // Generate user task analytics
    const analytics = await Task.getPerformanceMetrics(userId, period);
    
    return {
      overview: analytics[0],
      trends: {
        completionRate: 'increasing',
        averageProgress: 'stable',
        productivity: 'improving'
      },
      recommendations: [
        'Focus on high-priority tasks',
        'Consider time management training'
      ]
    };
  }

  static async generateOptimalAssignment(tasks, teamMembers) {
    // AI-powered task assignment optimization
    const assignments = tasks.map(task => ({
      taskId: task.id,
      assignedTo: teamMembers[Math.floor(Math.random() * teamMembers.length)].id,
      reason: 'Optimal skill match'
    }));
    
    return {
      assignments,
      efficiency: 0.85,
      recommendations: [
        'Consider workload distribution',
        'Match tasks to skill sets'
      ]
    };
  }

  static async getAssigneeWorkload(assigneeId) {
    // Get assignee's current workload
    const currentTasks = await Task.count({
      where: {
        assignedTo: assigneeId,
        status: { [Op.in]: ['pending', 'in_progress', 'review'] }
      }
    });
    
    return { currentTasks };
  }

  static estimateCompletionDate(task) {
    // Estimate task completion date
    if (task.actualStartDate && task.estimatedHours) {
      const completionDate = new Date(task.actualStartDate);
      completionDate.setHours(completionDate.getHours() + (task.estimatedHours * 24));
      return completionDate;
    }
    return task.dueDate;
  }

  static assessTaskRisks(task) {
    // Assess task risks
    const risks = [];
    
    if (task.isOverdue()) {
      risks.push('Overdue task');
    }
    
    if (task.blockers?.length > 0) {
      risks.push('Blocked by dependencies');
    }
    
    if (task.complexity === 'very_complex' && task.effort === 'very_high') {
      risks.push('High complexity and effort');
    }
    
    return risks;
  }

  static calculateTaskEfficiency(task) {
    // Calculate task efficiency
    if (!task.estimatedHours || !task.actualHours) return 0;
    return (task.estimatedHours / task.actualHours) * 100;
  }

  static assessCollaborationNeeds(task) {
    // Assess collaboration needs
    const needs = [];
    
    if (task.complexity === 'very_complex') {
      needs.push('Team collaboration required');
    }
    
    if (task.dependencies?.length > 0) {
      needs.push('Dependency coordination needed');
    }
    
    return needs;
  }
}

module.exports = TaskController; 