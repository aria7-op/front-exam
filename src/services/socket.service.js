const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config');
const { logSecurity } = require('../utils/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logSecurity('Socket.IO Initialized', { port: config.port });
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;
        
        next();
      } catch (error) {
        logSecurity('Socket Authentication Error', { error: error.message });
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logSecurity('User Connected', { userId: socket.userId, email: socket.userEmail });
      
      // Store connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        role: socket.userRole,
        email: socket.userEmail,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Join admin room if user is admin
      if (socket.userRole === 'admin') {
        socket.join('admin');
      }

      // Join manager room if user is manager or admin
      if (socket.userRole === 'manager' || socket.userRole === 'admin') {
        socket.join('managers');
      }

      // Handle attendance marking
      socket.on('mark_attendance', async (data) => {
        try {
          // TODO: Implement attendance marking logic
          const attendanceData = {
            userId: socket.userId,
            timestamp: new Date(),
            type: data.type || 'check_in',
            location: data.location,
            method: 'socket'
          };

          // Emit to user
          socket.emit('attendance_marked', {
            success: true,
            data: attendanceData
          });

          // Emit to managers
          this.io.to('managers').emit('attendance_update', {
            userId: socket.userId,
            attendance: attendanceData
          });

          logSecurity('Attendance Marked via Socket', { userId: socket.userId, type: data.type });
        } catch (error) {
          socket.emit('attendance_error', {
            success: false,
            message: 'Failed to mark attendance',
            error: error.message
          });
          logSecurity('Socket Attendance Error', { error: error.message, userId: socket.userId });
        }
      });

      // Handle real-time notifications
      socket.on('send_notification', async (data) => {
        try {
          // TODO: Implement notification sending logic
          const notification = {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            timestamp: new Date()
          };

          // Send to specific user
          this.io.to(`user:${data.userId}`).emit('notification', notification);

          logSecurity('Notification Sent via Socket', { 
            fromUserId: socket.userId, 
            toUserId: data.userId 
          });
        } catch (error) {
          logSecurity('Socket Notification Error', { error: error.message, userId: socket.userId });
        }
      });

      // Handle task updates
      socket.on('task_update', async (data) => {
        try {
          // TODO: Implement task update logic
          const taskUpdate = {
            taskId: data.taskId,
            status: data.status,
            updatedBy: socket.userId,
            timestamp: new Date()
          };

          // Emit to relevant users
          this.io.to('managers').emit('task_updated', taskUpdate);

          logSecurity('Task Updated via Socket', { 
            userId: socket.userId, 
            taskId: data.taskId 
          });
        } catch (error) {
          logSecurity('Socket Task Update Error', { error: error.message, userId: socket.userId });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.userId);
        logSecurity('User Disconnected', { userId: socket.userId });
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Send notification to all users
  broadcastNotification(notification) {
    this.io.emit('notification', notification);
  }

  // Send notification to admins
  sendAdminNotification(notification) {
    this.io.to('admin').emit('admin_notification', notification);
  }

  // Send notification to managers
  sendManagerNotification(notification) {
    this.io.to('managers').emit('manager_notification', notification);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  // Force disconnect user
  disconnectUser(userId) {
    const userData = this.connectedUsers.get(userId);
    if (userData) {
      this.io.sockets.sockets.get(userData.socketId)?.disconnect();
      this.connectedUsers.delete(userId);
      logSecurity('User Force Disconnected', { userId });
    }
  }
}

module.exports = { SocketService }; 