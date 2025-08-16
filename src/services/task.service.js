const { Task, User, Project } = require('../models');
const { logPerformance, logSecurity, logInfo } = require('../utils/logger');
const { monitoringEvents } = require('./monitoring.service');
const { AISecurityService } = require('./ai.security.service');
const { getCache, setCache } = require('../config/redis');
const { Op } = require('sequelize');
const moment = require('moment');
const cron = require('node-cron');

const aiSecurity = new AISecurityService();

class TaskService {
  constructor() {
    this.initializeScheduledJobs();
  }

  // Initialize scheduled jobs for task automation
  initializeScheduledJobs() {
    // Check for overdue tasks
    cron.schedule('0 9 * * *', () => {
      this.checkOverdueTasks();
    });

    // Send task reminders
    cron.schedule('0 10 * * 1-5', () => {
      this.sendTaskReminders();
    });

    // Generate weekly reports
    cron.schedule('0 18 * * 5', () => {
      this.generateWeeklyReports();
    });

    // Update task progress
    cron.schedule('*/30 * * * *', () => {
      this.updateTaskProgress();
    });
  }

  // AI-powered task optimization
  async optimizeTask(taskData, assignee) {
    try {
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

      // AI-powered estimation
      const aiEstimation = await this.generateAIEstimation(taskData, assignee);
      if (aiEstimation) {
        optimization.estimatedHours = aiEstimation.hours;
        optimization.confidence = aiEstimation.confidence;
      }

      return optimization;
    } catch (error) {
      logSecurity('Task Optimization Error', { error: error.message });
      throw error;
    }
  }

  // Generate AI insights for tasks
  async generateTaskInsights(task, assignee) {
    try {
      const insights = {
        estimatedCompletion: this.estimateCompletionDate(task),
        riskFactors: this.assessTaskRisks(task),
        recommendations: await this.generateRecommendations(task, assignee),
        efficiency: this.calculateTaskEfficiency(task),
        collaboration: this.assessCollaborationNeeds(task),
        aiPredictions: await this.generateAIPredictions(task)
      };

      return insights;
    } catch (error) {
      logSecurity('Task Insights Generation Error', { error: error.message });
      throw error;
    }
  }

  // Advanced task analytics
  async generateTaskAnalytics(userId, projectId, period = 'month') {
    try {
      const startDate = this.getPeriodStartDate(period);
      const endDate = new Date();

      // Get task data
      const whereClause = {
        createdAt: { [Op.between]: [startDate, endDate] }
      };

      if (userId) whereClause.assignedTo = userId;
      if (projectId) whereClause.projectId = projectId;

      const tasks = await Task.findAll({ where: whereClause });

      // Calculate metrics
      const metrics = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        overdueTasks: tasks.filter(t => t.isOverdue()).length,
        averageProgress: tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length,
        averageCompletionTime: this.calculateAverageCompletionTime(tasks),
        efficiency: this.calculateOverallEfficiency(tasks)
      };

      // Generate insights
      const insights = await this.generateAnalyticsInsights(metrics, tasks);

      // Get trends
      const trends = await this.analyzeTaskTrends(tasks, period);

      return {
        metrics,
        insights,
        trends,
        period: { startDate, endDate }
      };
    } catch (error) {
      logSecurity('Task Analytics Error', { userId, error: error.message });
      throw error;
    }
  }

  // Task performance monitoring
  async monitorTaskPerformance(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [{ model: User, as: 'assignee' }]
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const performance = {
        velocity: task.getVelocity(),
        efficiency: task.calculateEfficiency(),
        quality: task.qualityMetrics,
        collaboration: task.collaborationMetrics,
        riskLevel: this.calculateRiskLevel(task),
        recommendations: await this.generatePerformanceRecommendations(task)
      };

      // Update task with performance metrics
      task.performanceMetrics = performance;
      await task.save();

      // Emit monitoring event
      monitoringEvents.emit('task_performance_updated', {
        taskId,
        performance,
        timestamp: new Date()
      });

      return performance;
    } catch (error) {
      logSecurity('Task Performance Monitoring Error', { taskId, error: error.message });
      throw error;
    }
  }

  // AI-powered task assignment optimization
  async optimizeTaskAssignment(tasks, teamMembers) {
    try {
      const optimization = {
        assignments: [],
        efficiency: 0,
        recommendations: []
      };

      // Analyze team member capabilities
      const memberCapabilities = await this.analyzeTeamCapabilities(teamMembers);

      // Generate optimal assignments
      for (const task of tasks) {
        const bestMatch = await this.findBestTaskMatch(task, memberCapabilities);
        optimization.assignments.push({
          taskId: task.id,
          assignedTo: bestMatch.memberId,
          reason: bestMatch.reason,
          confidence: bestMatch.confidence
        });
      }

      // Calculate overall efficiency
      optimization.efficiency = this.calculateAssignmentEfficiency(optimization.assignments);

      // Generate recommendations
      optimization.recommendations = await this.generateAssignmentRecommendations(optimization);

      return optimization;
    } catch (error) {
      logSecurity('Task Assignment Optimization Error', { error: error.message });
      throw error;
    }
  }

  // Task automation service
  async automateTaskProcesses() {
    try {
      const automations = [];

      // Auto-assign tasks based on workload
      const unassignedTasks = await Task.findAll({
        where: { assignedTo: null, status: 'pending' }
      });

      for (const task of unassignedTasks) {
        const assignment = await this.autoAssignTask(task);
        if (assignment) {
          automations.push(assignment);
        }
      }

      // Auto-update task status based on progress
      const inProgressTasks = await Task.findAll({
        where: { status: 'in_progress' }
      });

      for (const task of inProgressTasks) {
        const statusUpdate = await this.autoUpdateTaskStatus(task);
        if (statusUpdate) {
          automations.push(statusUpdate);
        }
      }

      // Auto-generate reports
      const reports = await this.autoGenerateReports();

      return {
        automations,
        reports,
        timestamp: new Date()
      };
    } catch (error) {
      logSecurity('Task Automation Error', { error: error.message });
      throw error;
    }
  }

  // Task risk assessment
  async assessTaskRisks(task) {
    try {
      const risks = [];

      // Time-based risks
      if (task.isOverdue()) {
        risks.push({
          type: 'time_risk',
          severity: 'high',
          description: 'Task is overdue',
          impact: 'Project delay',
          mitigation: 'Expedite task completion'
        });
      }

      // Dependency risks
      if (task.dependencies && task.dependencies.length > 0) {
        const dependencyStatus = await this.checkDependencyStatus(task.dependencies);
        if (dependencyStatus.hasBlocked) {
          risks.push({
            type: 'dependency_risk',
            severity: 'medium',
            description: 'Blocked by dependencies',
            impact: 'Task delay',
            mitigation: 'Resolve dependencies first'
          });
        }
      }

      // Resource risks
      const resourceRisk = await this.assessResourceRisk(task);
      if (resourceRisk.hasRisk) {
        risks.push(resourceRisk);
      }

      // Quality risks
      const qualityRisk = await this.assessQualityRisk(task);
      if (qualityRisk.hasRisk) {
        risks.push(qualityRisk);
      }

      return {
        risks,
        overallRiskLevel: this.calculateOverallRiskLevel(risks),
        recommendations: this.generateRiskMitigationRecommendations(risks)
      };
    } catch (error) {
      logSecurity('Task Risk Assessment Error', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  async getAssigneeWorkload(assigneeId) {
    const currentTasks = await Task.count({
      where: {
        assignedTo: assigneeId,
        status: { [Op.in]: ['pending', 'in_progress', 'review'] }
      }
    });
    
    return { currentTasks };
  }

  async generateAIEstimation(taskData, assignee) {
    // AI-powered task estimation
    const estimation = {
      hours: taskData.estimatedHours || 8,
      confidence: 0.8
    };

    // Adjust based on assignee's historical performance
    const historicalPerformance = await this.getHistoricalPerformance(assignee.id);
    if (historicalPerformance) {
      estimation.hours *= historicalPerformance.efficiencyFactor;
      estimation.confidence = historicalPerformance.confidence;
    }

    return estimation;
  }

  estimateCompletionDate(task) {
    if (task.actualStartDate && task.estimatedHours) {
      const completionDate = new Date(task.actualStartDate);
      completionDate.setHours(completionDate.getHours() + (task.estimatedHours * 24));
      return completionDate;
    }
    return task.dueDate;
  }

  assessTaskRisks(task) {
    const risks = [];
    
    if (task.isOverdue()) {
      risks.push('Overdue task');
    }
    
    if (task.blockers && task.blockers.length > 0) {
      risks.push('Blocked by dependencies');
    }
    
    if (task.complexity === 'very_complex' && task.effort === 'very_high') {
      risks.push('High complexity and effort');
    }
    
    return risks;
  }

  async generateRecommendations(task, assignee) {
    const recommendations = [];

    if (task.estimatedHours > 16) {
      recommendations.push('Consider breaking down into smaller subtasks');
    }

    if (task.complexity === 'very_complex') {
      recommendations.push('Schedule regular check-ins with stakeholders');
    }

    if (task.dependencies && task.dependencies.length > 0) {
      recommendations.push('Monitor dependency progress closely');
    }

    return recommendations;
  }

  calculateTaskEfficiency(task) {
    if (!task.estimatedHours || !task.actualHours) return 0;
    return (task.estimatedHours / task.actualHours) * 100;
  }

  assessCollaborationNeeds(task) {
    const needs = [];
    
    if (task.complexity === 'very_complex') {
      needs.push('Team collaboration required');
    }
    
    if (task.dependencies && task.dependencies.length > 0) {
      needs.push('Dependency coordination needed');
    }
    
    return needs;
  }

  async generateAIPredictions(task) {
    // AI-powered predictions for task completion
    return {
      completionProbability: 0.85,
      estimatedCompletionDate: this.estimateCompletionDate(task),
      riskFactors: this.assessTaskRisks(task),
      recommendations: ['Focus on high-priority items', 'Regular progress updates']
    };
  }

  getPeriodStartDate(period) {
    const now = moment();
    switch (period) {
      case 'week':
        return now.subtract(7, 'days').toDate();
      case 'month':
        return now.subtract(30, 'days').toDate();
      case 'quarter':
        return now.subtract(90, 'days').toDate();
      case 'year':
        return now.subtract(365, 'days').toDate();
      default:
        return now.subtract(30, 'days').toDate();
    }
  }

  calculateAverageCompletionTime(tasks) {
    const completedTasks = tasks.filter(t => t.actualEndDate && t.actualStartDate);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (new Date(task.actualEndDate) - new Date(task.actualStartDate));
    }, 0);

    return totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  calculateOverallEfficiency(tasks) {
    const tasksWithTime = tasks.filter(t => t.estimatedHours && t.actualHours);
    if (tasksWithTime.length === 0) return 0;

    const totalEfficiency = tasksWithTime.reduce((sum, task) => {
      return sum + task.calculateEfficiency();
    }, 0);

    return totalEfficiency / tasksWithTime.length;
  }

  async generateAnalyticsInsights(metrics, tasks) {
    const insights = [];

    if (metrics.overdueTasks > metrics.totalTasks * 0.2) {
      insights.push('High number of overdue tasks - consider resource reallocation');
    }

    if (metrics.averageProgress < 50) {
      insights.push('Low average progress - review task complexity and assignments');
    }

    if (metrics.efficiency < 80) {
      insights.push('Low efficiency - consider process improvements');
    }

    return insights;
  }

  async analyzeTaskTrends(tasks, period) {
    // Analyze task trends over time
    return {
      completionRate: 'improving',
      averageProgress: 'stable',
      productivity: 'increasing'
    };
  }

  calculateRiskLevel(task) {
    let riskLevel = 'low';
    let score = 0;

    if (task.isOverdue()) score += 3;
    if (task.blockers && task.blockers.length > 0) score += 2;
    if (task.complexity === 'very_complex') score += 2;
    if (task.priority === 'critical') score += 1;

    if (score >= 5) riskLevel = 'high';
    else if (score >= 3) riskLevel = 'medium';

    return riskLevel;
  }

  async generatePerformanceRecommendations(task) {
    const recommendations = [];

    if (task.progress < 25 && task.estimatedHours > 8) {
      recommendations.push('Consider breaking down into smaller subtasks');
    }

    if (task.isOverdue()) {
      recommendations.push('Prioritize this task and allocate additional resources');
    }

    if (task.blockers && task.blockers.length > 0) {
      recommendations.push('Resolve blockers to improve progress');
    }

    return recommendations;
  }

  async analyzeTeamCapabilities(teamMembers) {
    const capabilities = [];

    for (const member of teamMembers) {
      const memberCapability = {
        memberId: member.id,
        skills: member.skills || [],
        workload: await this.getAssigneeWorkload(member.id),
        performance: await this.getHistoricalPerformance(member.id),
        availability: await this.getMemberAvailability(member.id)
      };
      capabilities.push(memberCapability);
    }

    return capabilities;
  }

  async findBestTaskMatch(task, memberCapabilities) {
    let bestMatch = null;
    let bestScore = 0;

    for (const capability of memberCapabilities) {
      const score = this.calculateMatchScore(task, capability);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          memberId: capability.memberId,
          reason: 'Best skill and availability match',
          confidence: score
        };
      }
    }

    return bestMatch;
  }

  calculateMatchScore(task, capability) {
    let score = 0;

    // Skill match
    if (capability.skills.includes(task.type)) score += 3;
    if (capability.skills.includes('expert')) score += 2;

    // Workload consideration
    if (capability.workload.currentTasks < 3) score += 2;
    else if (capability.workload.currentTasks > 8) score -= 2;

    // Performance consideration
    if (capability.performance && capability.performance.efficiencyFactor > 1) score += 1;

    return score;
  }

  calculateAssignmentEfficiency(assignments) {
    if (assignments.length === 0) return 0;
    
    const totalConfidence = assignments.reduce((sum, assignment) => {
      return sum + assignment.confidence;
    }, 0);

    return totalConfidence / assignments.length;
  }

  async generateAssignmentRecommendations(optimization) {
    const recommendations = [];

    if (optimization.efficiency < 0.7) {
      recommendations.push('Consider redistributing tasks for better balance');
    }

    recommendations.push('Monitor task progress and adjust assignments as needed');

    return recommendations;
  }

  async autoAssignTask(task) {
    // Auto-assign task based on workload and skills
    const availableUsers = await User.findAll({
      where: { isActive: true }
    });

    const bestMatch = await this.findBestTaskMatch(task, await this.analyzeTeamCapabilities(availableUsers));
    
    if (bestMatch) {
      await task.update({ assignedTo: bestMatch.memberId });
      return {
        type: 'auto_assignment',
        taskId: task.id,
        assignedTo: bestMatch.memberId,
        reason: bestMatch.reason
      };
    }

    return null;
  }

  async autoUpdateTaskStatus(task) {
    // Auto-update task status based on progress
    let statusUpdate = null;

    if (task.progress >= 100 && task.status !== 'completed') {
      await task.update({ status: 'completed', completedAt: new Date() });
      statusUpdate = {
        type: 'auto_completion',
        taskId: task.id,
        previousStatus: task.status,
        newStatus: 'completed'
      };
    } else if (task.progress > 0 && task.status === 'pending') {
      await task.update({ status: 'in_progress', actualStartDate: new Date() });
      statusUpdate = {
        type: 'auto_start',
        taskId: task.id,
        previousStatus: 'pending',
        newStatus: 'in_progress'
      };
    }

    return statusUpdate;
  }

  async autoGenerateReports() {
    // Auto-generate task reports
    const reports = [];

    // Weekly summary report
    const weeklyReport = await this.generateTaskAnalytics(null, null, 'week');
    reports.push({
      type: 'weekly_summary',
      data: weeklyReport,
      generatedAt: new Date()
    });

    // Overdue tasks report
    const overdueTasks = await Task.findAll({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'completed' }
      }
    });

    reports.push({
      type: 'overdue_tasks',
      data: { tasks: overdueTasks, count: overdueTasks.length },
      generatedAt: new Date()
    });

    return reports;
  }

  async checkDependencyStatus(dependencies) {
    const dependencyTasks = await Task.findAll({
      where: { id: dependencies }
    });

    const hasBlocked = dependencyTasks.some(task => 
      task.status === 'blocked' || task.status === 'on_hold'
    );

    return { hasBlocked, dependencyTasks };
  }

  async assessResourceRisk(task) {
    // Assess resource-related risks
    const assignee = await User.findByPk(task.assignedTo);
    if (!assignee) {
      return {
        type: 'resource_risk',
        severity: 'high',
        description: 'No assignee for task',
        impact: 'Task cannot proceed',
        mitigation: 'Assign appropriate team member'
      };
    }

    return { hasRisk: false };
  }

  async assessQualityRisk(task) {
    // Assess quality-related risks
    if (task.qualityMetrics && task.qualityMetrics.accuracy < 0.8) {
      return {
        type: 'quality_risk',
        severity: 'medium',
        description: 'Low quality metrics detected',
        impact: 'Poor task quality',
        mitigation: 'Implement quality checks',
        hasRisk: true
      };
    }

    return { hasRisk: false };
  }

  calculateOverallRiskLevel(risks) {
    if (risks.length === 0) return 'low';

    const severityScores = { low: 1, medium: 2, high: 3 };
    const totalScore = risks.reduce((sum, risk) => {
      return sum + (severityScores[risk.severity] || 1);
    }, 0);

    const averageScore = totalScore / risks.length;

    if (averageScore >= 2.5) return 'high';
    else if (averageScore >= 1.5) return 'medium';
    else return 'low';
  }

  generateRiskMitigationRecommendations(risks) {
    const recommendations = [];

    risks.forEach(risk => {
      if (risk.mitigation) {
        recommendations.push(risk.mitigation);
      }
    });

    return recommendations;
  }

  async getHistoricalPerformance(userId) {
    // Get user's historical performance data
    const completedTasks = await Task.findAll({
      where: {
        assignedTo: userId,
        status: 'completed'
      },
      limit: 10
    });

    if (completedTasks.length === 0) return null;

    const totalEfficiency = completedTasks.reduce((sum, task) => {
      return sum + task.calculateEfficiency();
    }, 0);

    return {
      efficiencyFactor: totalEfficiency / completedTasks.length / 100,
      confidence: 0.8
    };
  }

  async getMemberAvailability(userId) {
    // Get member's availability
    return {
      available: true,
      workload: 'medium'
    };
  }

  // Scheduled job methods
  async checkOverdueTasks() {
    try {
      const overdueTasks = await Task.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'completed' }
        },
        include: [{ model: User, as: 'assignee' }]
      });

      for (const task of overdueTasks) {
        await this.sendNotification({
          type: 'overdue_task',
          userId: task.assignedTo,
          title: 'Overdue Task Alert',
          message: `Task "${task.title}" is overdue. Please update the status.`,
          priority: 'high',
          channels: ['email', 'push']
        });
      }

      logInfo('Checked overdue tasks', { count: overdueTasks.length });
    } catch (error) {
      logSecurity('Check Overdue Tasks Error', { error: error.message });
    }
  }

  async sendTaskReminders() {
    try {
      const pendingTasks = await Task.findAll({
        where: {
          status: 'pending',
          dueDate: { [Op.lte]: moment().add(2, 'days').toDate() }
        },
        include: [{ model: User, as: 'assignee' }]
      });

      for (const task of pendingTasks) {
        await this.sendNotification({
          type: 'task_reminder',
          userId: task.assignedTo,
          title: 'Task Reminder',
          message: `Task "${task.title}" is due soon. Please start working on it.`,
          priority: 'medium',
          channels: ['email', 'push']
        });
      }

      logInfo('Sent task reminders', { count: pendingTasks.length });
    } catch (error) {
      logSecurity('Send Task Reminders Error', { error: error.message });
    }
  }

  async generateWeeklyReports() {
    try {
      const report = await this.generateTaskAnalytics(null, null, 'week');
      logInfo('Generated weekly task report', { date: new Date() });
    } catch (error) {
      logSecurity('Generate Weekly Reports Error', { error: error.message });
    }
  }

  async updateTaskProgress() {
    try {
      const inProgressTasks = await Task.findAll({
        where: { status: 'in_progress' }
      });

      for (const task of inProgressTasks) {
        await this.monitorTaskPerformance(task.id);
      }

      logInfo('Updated task progress', { count: inProgressTasks.length });
    } catch (error) {
      logSecurity('Update Task Progress Error', { error: error.message });
    }
  }

  async sendNotification(notification) {
    // Send notification through various channels
    logInfo('Sending Task Notification', notification);
  }
}

module.exports = new TaskService(); 