const cron = require('node-cron');
const { logSecurity } = require('../utils/logger');
const { Attendance, User, Notification } = require('../models');
const { Op } = require('sequelize');

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  initialize() {
    this.setupAttendanceJobs();
    this.setupCleanupJobs();
    this.setupReportJobs();
    
    logSecurity('Cron Service Initialized', { jobsCount: this.jobs.size });
  }

  setupAttendanceJobs() {
    // Daily attendance reminder at 8:00 AM
    const attendanceReminder = cron.schedule('0 8 * * *', async () => {
      try {
        await this.sendAttendanceReminders();
        logSecurity('Attendance Reminders Sent', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Attendance Reminder Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('attendance_reminder', attendanceReminder);

    // Check for late arrivals at 9:30 AM
    const lateArrivalCheck = cron.schedule('30 9 * * *', async () => {
      try {
        await this.checkLateArrivals();
        logSecurity('Late Arrival Check Completed', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Late Arrival Check Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('late_arrival_check', lateArrivalCheck);

    // End of day attendance summary at 6:00 PM
    const dailySummary = cron.schedule('0 18 * * *', async () => {
      try {
        await this.generateDailyAttendanceSummary();
        logSecurity('Daily Attendance Summary Generated', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Daily Summary Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('daily_summary', dailySummary);
  }

  setupCleanupJobs() {
    // Clean up old logs weekly on Sunday at 2:00 AM
    const logCleanup = cron.schedule('0 2 * * 0', async () => {
      try {
        await this.cleanupOldLogs();
        logSecurity('Log Cleanup Completed', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Log Cleanup Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('log_cleanup', logCleanup);

    // Clean up old notifications monthly
    const notificationCleanup = cron.schedule('0 3 1 * *', async () => {
      try {
        await this.cleanupOldNotifications();
        logSecurity('Notification Cleanup Completed', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Notification Cleanup Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('notification_cleanup', notificationCleanup);
  }

  setupReportJobs() {
    // Weekly report generation on Monday at 6:00 AM
    const weeklyReport = cron.schedule('0 6 * * 1', async () => {
      try {
        await this.generateWeeklyReport();
        logSecurity('Weekly Report Generated', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Weekly Report Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('weekly_report', weeklyReport);

    // Monthly report generation on 1st of month at 7:00 AM
    const monthlyReport = cron.schedule('0 7 1 * *', async () => {
      try {
        await this.generateMonthlyReport();
        logSecurity('Monthly Report Generated', { timestamp: new Date().toISOString() });
      } catch (error) {
        logSecurity('Monthly Report Error', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('monthly_report', monthlyReport);
  }

  async sendAttendanceReminders() {
    try {
      const today = new Date();
      const activeUsers = await User.findAll({
        where: { isActive: true }
      });

      for (const user of activeUsers) {
        // Check if user hasn't marked attendance today
        const existingAttendance = await Attendance.findOne({
          where: {
            userId: user.id,
            date: {
              [Op.between]: [
                new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
              ]
            }
          }
        });

        if (!existingAttendance) {
          // Create reminder notification
          await Notification.create({
            userId: user.id,
            title: 'Attendance Reminder',
            message: 'Please mark your attendance for today.',
            type: 'reminder',
            priority: 'medium'
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to send attendance reminders: ${error.message}`);
    }
  }

  async checkLateArrivals() {
    try {
      const today = new Date();
      const lateThreshold = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);

      const lateArrivals = await Attendance.findAll({
        where: {
          checkInTime: {
            [Op.gt]: lateThreshold
          },
          date: {
            [Op.between]: [
              new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            ]
          }
        },
        include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      });

      // Notify managers about late arrivals
      const managers = await User.findAll({
        where: { role: { [Op.in]: ['manager', 'admin'] }, isActive: true }
      });

      for (const manager of managers) {
        await Notification.create({
          userId: manager.id,
          title: 'Late Arrivals Report',
          message: `${lateArrivals.length} employees arrived late today.`,
          type: 'report',
          priority: 'low'
        });
      }
    } catch (error) {
      throw new Error(`Failed to check late arrivals: ${error.message}`);
    }
  }

  async generateDailyAttendanceSummary() {
    try {
      const today = new Date();
      const totalUsers = await User.count({ where: { isActive: true } });
      const presentUsers = await Attendance.count({
        where: {
          date: {
            [Op.between]: [
              new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            ]
          }
        }
      });

      const attendanceRate = totalUsers > 0 ? (presentUsers / totalUsers * 100).toFixed(2) : 0;

      // Send summary to managers
      const managers = await User.findAll({
        where: { role: { [Op.in]: ['manager', 'admin'] }, isActive: true }
      });

      for (const manager of managers) {
        await Notification.create({
          userId: manager.id,
          title: 'Daily Attendance Summary',
          message: `Attendance Rate: ${attendanceRate}% (${presentUsers}/${totalUsers} present)`,
          type: 'summary',
          priority: 'low'
        });
      }
    } catch (error) {
      throw new Error(`Failed to generate daily summary: ${error.message}`);
    }
  }

  async cleanupOldLogs() {
    try {
      // TODO: Implement log cleanup logic
      // This would clean up old log files and database log entries
      logSecurity('Log Cleanup Job Executed', { timestamp: new Date().toISOString() });
    } catch (error) {
      throw new Error(`Failed to cleanup logs: ${error.message}`);
    }
  }

  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Notification.destroy({
        where: {
          createdAt: {
            [Op.lt]: thirtyDaysAgo
          },
          isRead: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to cleanup notifications: ${error.message}`);
    }
  }

  async generateWeeklyReport() {
    try {
      // TODO: Implement weekly report generation
      logSecurity('Weekly Report Job Executed', { timestamp: new Date().toISOString() });
    } catch (error) {
      throw new Error(`Failed to generate weekly report: ${error.message}`);
    }
  }

  async generateMonthlyReport() {
    try {
      // TODO: Implement monthly report generation
      logSecurity('Monthly Report Job Executed', { timestamp: new Date().toISOString() });
    } catch (error) {
      throw new Error(`Failed to generate monthly report: ${error.message}`);
    }
  }

  // Stop all cron jobs
  stopAll() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logSecurity('Cron Job Stopped', { jobName: name });
    });
    this.jobs.clear();
  }

  // Get job status
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate()
      };
    });
    return status;
  }
}

module.exports = { CronService }; 