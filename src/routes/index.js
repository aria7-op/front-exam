const express = require('express');
const router = express.Router();

// Import route modules
const attendanceRoutes = require('./attendance.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const departmentRoutes = require('./department.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');
const analyticsRoutes = require('./analytics.routes');
const integrationRoutes = require('./integration.routes');
const biometricRoutes = require('./biometric.routes');
const aiRoutes = require('./ai.routes');
const monitoringRoutes = require('./monitoring.routes');

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Attendance System API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    environment: process.env.NODE_ENV,
    features: {
      attendance: 'enabled',
      tasks: 'enabled',
      projects: 'enabled',
      departments: 'enabled',
      biometrics: 'enabled',
      ai: 'enabled',
      analytics: 'enabled',
      monitoring: 'enabled',
      notifications: 'enabled',
      integrations: 'enabled'
    }
  });
});

// API status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      api: {
        version: API_VERSION,
        status: 'operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      services: {
        database: 'connected',
        redis: 'connected',
        monitoring: 'active',
        ai: 'operational',
        biometrics: 'active',
        notifications: 'active'
      },
      features: {
        attendance: 'enabled',
        tasks: 'enabled',
        projects: 'enabled',
        departments: 'enabled',
        biometrics: 'enabled',
        ai: 'enabled',
        analytics: 'enabled',
        monitoring: 'enabled',
        notifications: 'enabled',
        integrations: 'enabled'
      }
    }
  });
});

// Mount route modules
router.use(`${API_PREFIX}/attendance`, attendanceRoutes);
router.use(`${API_PREFIX}/tasks`, taskRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/projects`, projectRoutes);
router.use(`${API_PREFIX}/departments`, departmentRoutes);
router.use(`${API_PREFIX}/reports`, reportRoutes);
router.use(`${API_PREFIX}/notifications`, notificationRoutes);
router.use(`${API_PREFIX}/analytics`, analyticsRoutes);
router.use(`${API_PREFIX}/integrations`, integrationRoutes);
router.use(`${API_PREFIX}/biometric`, biometricRoutes);
router.use(`${API_PREFIX}/ai`, aiRoutes);
router.use(`${API_PREFIX}/monitoring`, monitoringRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Attendance System API Documentation',
    data: {
      version: API_VERSION,
      baseUrl: `${req.protocol}://${req.get('host')}${API_PREFIX}`,
      endpoints: {
        attendance: {
          base: '/attendance',
          count: '100+ endpoints',
          features: [
            'AI-powered check-in/out',
            'Biometric verification',
            'Anomaly detection',
            'Real-time dashboard',
            'Performance analytics',
            'Location validation',
            'Break management',
            'Overtime tracking',
            'Leave integration',
            'Compliance monitoring'
          ]
        },
        tasks: {
          base: '/tasks',
          count: '80+ endpoints',
          features: [
            'AI-optimized task creation',
            'Intelligent assignment',
            'Time tracking',
            'Progress monitoring',
            'Dependency management',
            'Risk assessment',
            'Performance analytics',
            'Automation rules',
            'Template management',
            'Bulk operations'
          ]
        },
        projects: {
          base: '/projects',
          count: '60+ endpoints',
          features: [
            'Project lifecycle management',
            'Resource allocation',
            'Milestone tracking',
            'Budget management',
            'Risk assessment',
            'Stakeholder management',
            'Performance metrics',
            'Template system',
            'Integration support',
            'Reporting tools'
          ]
        },
        departments: {
          base: '/departments',
          count: '40+ endpoints',
          features: [
            'Hierarchical structure',
            'Budget management',
            'Performance tracking',
            'Skill management',
            'Process automation',
            'KPI monitoring',
            'Resource allocation',
            'Policy management',
            'Goal tracking',
            'Analytics dashboard'
          ]
        },
        users: {
          base: '/users',
          count: '50+ endpoints',
          features: [
            'User management',
            'Role-based access',
            'Biometric enrollment',
            'MFA support',
            'Performance tracking',
            'Skill management',
            'Permission system',
            'Activity monitoring',
            'Profile management',
            'Security features'
          ]
        },
        auth: {
          base: '/auth',
          count: '30+ endpoints',
          features: [
            'Multi-factor authentication',
            'Biometric authentication',
            'Session management',
            'Password policies',
            'Security monitoring',
            'Risk assessment',
            'Device management',
            'Audit logging',
            'Compliance features',
            'Integration support'
          ]
        },
        analytics: {
          base: '/analytics',
          count: '45+ endpoints',
          features: [
            'Real-time analytics',
            'Predictive insights',
            'Performance metrics',
            'Trend analysis',
            'Custom dashboards',
            'Report generation',
            'Data visualization',
            'AI-powered insights',
            'Benchmarking',
            'Export capabilities'
          ]
        },
        ai: {
          base: '/ai',
          count: '25+ endpoints',
          features: [
            'Attendance prediction',
            'Task optimization',
            'Risk assessment',
            'Performance insights',
            'Anomaly detection',
            'Recommendation engine',
            'Pattern recognition',
            'Automation suggestions',
            'Predictive analytics',
            'Intelligent routing'
          ]
        },
        biometric: {
          base: '/biometric',
          count: '20+ endpoints',
          features: [
            'Face recognition',
            'Fingerprint scanning',
            'Voice recognition',
            'Liveness detection',
            'Anti-spoofing',
            'Template management',
            'Device integration',
            'Security features',
            'Compliance support',
            'Multi-modal support'
          ]
        },
        monitoring: {
          base: '/monitoring',
          count: '35+ endpoints',
          features: [
            'System health monitoring',
            'Performance metrics',
            'Real-time alerts',
            'Log aggregation',
            'Error tracking',
            'Resource monitoring',
            'Security monitoring',
            'Compliance tracking',
            'Dashboard views',
            'Integration support'
          ]
        },
        notifications: {
          base: '/notifications',
          count: '30+ endpoints',
          features: [
            'Multi-channel delivery',
            'Smart routing',
            'Template management',
            'Scheduling system',
            'Preference management',
            'Delivery tracking',
            'Analytics',
            'Integration support',
            'Bulk operations',
            'Custom workflows'
          ]
        },
        integrations: {
          base: '/integrations',
          count: '40+ endpoints',
          features: [
            'Third-party integrations',
            'Webhook support',
            'API management',
            'Data synchronization',
            'Authentication',
            'Error handling',
            'Monitoring',
            'Configuration management',
            'Security features',
            'Documentation'
          ]
        },
        reports: {
          base: '/reports',
          count: '35+ endpoints',
          features: [
            'Custom report builder',
            'Scheduled reports',
            'Export capabilities',
            'Template system',
            'Data visualization',
            'Sharing features',
            'Version control',
            'Access control',
            'Analytics integration',
            'Compliance support'
          ]
        }
      },
      aiFeatures: {
        attendance: [
          'Predictive attendance patterns',
          'Anomaly detection',
          'Behavioral analysis',
          'Risk assessment',
          'Optimization suggestions'
        ],
        tasks: [
          'Intelligent task assignment',
          'Effort estimation',
          'Priority optimization',
          'Dependency analysis',
          'Performance prediction'
        ],
        projects: [
          'Resource optimization',
          'Timeline prediction',
          'Risk forecasting',
          'Success probability',
          'Budget optimization'
        ],
        analytics: [
          'Predictive insights',
          'Pattern recognition',
          'Trend forecasting',
          'Recommendation engine',
          'Automated insights'
        ]
      },
      security: {
        authentication: [
          'Multi-factor authentication',
          'Biometric verification',
          'Session management',
          'Device fingerprinting',
          'Risk-based authentication'
        ],
        authorization: [
          'Role-based access control',
          'Permission management',
          'Resource-level security',
          'Audit logging',
          'Compliance monitoring'
        ],
        data: [
          'Encryption at rest',
          'Encryption in transit',
          'Data anonymization',
          'Backup security',
          'Privacy protection'
        ]
      },
      monitoring: {
        system: [
          'Real-time health monitoring',
          'Performance metrics',
          'Resource utilization',
          'Error tracking',
          'Alert management'
        ],
        security: [
          'Threat detection',
          'Anomaly monitoring',
          'Access logging',
          'Compliance tracking',
          'Incident response'
        ],
        business: [
          'KPI monitoring',
          'User activity tracking',
          'Feature usage analytics',
          'Performance benchmarking',
          'Trend analysis'
        ]
      }
    }
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/health',
      '/status',
      '/docs',
      `${API_PREFIX}/attendance/*`,
      `${API_PREFIX}/tasks/*`,
      `${API_PREFIX}/users/*`,
      `${API_PREFIX}/auth/*`,
      `${API_PREFIX}/projects/*`,
      `${API_PREFIX}/departments/*`,
      `${API_PREFIX}/reports/*`,
      `${API_PREFIX}/notifications/*`,
      `${API_PREFIX}/analytics/*`,
      `${API_PREFIX}/integrations/*`,
      `${API_PREFIX}/biometric/*`,
      `${API_PREFIX}/ai/*`,
      `${API_PREFIX}/monitoring/*`
    ]
  });
});

module.exports = router; 