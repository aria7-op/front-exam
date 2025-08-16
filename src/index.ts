import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Import configurations
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';

// Import database
import { initializeDatabase } from '@/config/database';
import { initializeRedis } from '@/config/redis';

// Import routes
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import attendanceRoutes from '@/routes/attendance.routes';
import biometricRoutes from '@/routes/biometric.routes';
import reportRoutes from '@/routes/report.routes';
import notificationRoutes from '@/routes/notification.routes';
import taskRoutes from '@/routes/task.routes';
import aiRoutes from '@/routes/ai.routes';
import adminRoutes from '@/routes/admin.routes';

// Import services
import { initializeSocketIO } from '@/services/socket.service';
import { initializeCronJobs } from '@/services/cron.service';
import { initializeQueueSystem } from '@/services/queue.service';

// Load environment variables
dotenv.config();

class SmartAttendanceServer {
  private app: express.Application;
  private server: any;
  private io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });
  }

  private async initializeMiddleware(): Promise<void> {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    this.app.use('/public', express.static(path.join(__dirname, '../public')));
  }

  private async initializeRoutes(): Promise<void> {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/attendance', attendanceRoutes);
    this.app.use('/api/v1/biometric', biometricRoutes);
    this.app.use('/api/v1/reports', reportRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/tasks', taskRoutes);
    this.app.use('/api/v1/ai', aiRoutes);
    this.app.use('/api/v1/admin', adminRoutes);

    // API documentation
    this.app.use('/api-docs', (req, res) => {
      res.redirect('/api-docs/index.html');
    });

    // Catch-all for undefined routes
    this.app.use('*', notFoundHandler);
  }

  private async initializeErrorHandling(): Promise<void> {
    // Global error handler
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Socket.IO
      await initializeSocketIO(this.io);

      // Initialize cron jobs
      await initializeCronJobs();

      // Initialize queue system
      await initializeQueueSystem();

      logger.info('✅ All services initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      logger.info('🚀 Starting Smart Attendance System...');

      // Initialize database
      await initializeDatabase();
      logger.info('✅ Database connected');

      // Initialize Redis
      await initializeRedis();
      logger.info('✅ Redis connected');

      // Initialize middleware
      await this.initializeMiddleware();
      logger.info('✅ Middleware initialized');

      // Initialize routes
      await this.initializeRoutes();
      logger.info('✅ Routes initialized');

      // Initialize error handling
      await this.initializeErrorHandling();
      logger.info('✅ Error handling initialized');

      // Initialize services
      await this.initializeServices();
      logger.info('✅ Services initialized');

      // Start server
      this.server.listen(config.port, () => {
        logger.info(`🎉 Smart Attendance System is running on port ${config.port}`);
        logger.info(`📊 Environment: ${config.nodeEnv}`);
            logger.info(`🔗 API Base URL: https://localhost:${config.port}/api/v1`);
    logger.info(`📚 API Documentation: https://localhost:${config.port}/api-docs`);
        logger.info(`🔌 WebSocket: wss://31.97.70.79:${config.port}`);
      });

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public async gracefulShutdown(): Promise<void> {
    logger.info('🛑 Graceful shutdown initiated...');
    
    this.server.close(() => {
      logger.info('✅ HTTP server closed');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  }
}

// Create and start server
const server = new SmartAttendanceServer();

// Handle graceful shutdown
process.on('SIGTERM', () => server.gracefulShutdown());
process.on('SIGINT', () => server.gracefulShutdown());

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
server.start(); 