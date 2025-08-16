const { logSecurity } = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  
  // Advanced logging with context
  logSecurity('Route Not Found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString()
  });

  // Enhanced error response with suggestions
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested resource was not found on this server',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestions: [
      'Check the URL for typos',
      'Verify the HTTP method (GET, POST, PUT, DELETE)',
      'Ensure you have the correct API version',
      'Check the API documentation for available endpoints'
    ],
    availableEndpoints: [
      '/api/v1/auth/*',
      '/api/v1/users/*',
      '/api/v1/attendance/*',
      '/api/v1/tasks/*',
      '/api/v1/monitoring/*'
    ]
  });
};

module.exports = { notFoundHandler }; 