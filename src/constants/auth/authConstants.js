export const AUTH_CONSTANTS = {
  // Login attempts
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15, // minutes
  
  // Session timeout
  DEFAULT_SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  EXTENDED_SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  
  // Token refresh
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
  // Email validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Username requirements
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
  
  // Biometric settings
  BIOMETRIC_TIMEOUT: 60 * 1000, // 1 minute
  BIOMETRIC_RETRY_LIMIT: 3,
  
  // MFA settings
  MFA_TIMEOUT: 30 * 1000, // 30 seconds
  MFA_RETRY_LIMIT: 3,
  
  // Storage keys
  STORAGE_KEYS: {
    TOKEN: 'smart_attendance_token',
    USER: 'smart_attendance_user',
    REFRESH_TOKEN: 'smart_attendance_refresh_token',
    THEME: 'smart_attendance_theme',
    LANGUAGE: 'smart_attendance_language',
    BIOMETRIC_ENABLED: 'smart_attendance_biometric_enabled',
    MFA_ENABLED: 'smart_attendance_mfa_enabled',
    SESSION_TIMEOUT: 'smart_attendance_session_timeout',
    LAST_ACTIVITY: 'smart_attendance_last_activity',
  },
  
  // Error messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account is temporarily locked due to too many failed attempts',
    SESSION_EXPIRED: 'Your session has expired. Please login again',
    TOKEN_EXPIRED: 'Authentication token has expired',
    INVALID_TOKEN: 'Invalid authentication token',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    VALIDATION_ERROR: 'Please check your input and try again',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
    USERNAME_ALREADY_EXISTS: 'This username is already taken',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_USERNAME: 'Username can only contain letters, numbers, underscores, and hyphens',
    PASSWORD_MISMATCH: 'Passwords do not match',
    OLD_PASSWORD_INCORRECT: 'Current password is incorrect',
    BIOMETRIC_NOT_AVAILABLE: 'Biometric authentication is not available on this device',
    BIOMETRIC_NOT_ENROLLED: 'No biometric credentials enrolled on this device',
    MFA_CODE_INVALID: 'Invalid authentication code',
    MFA_CODE_EXPIRED: 'Authentication code has expired',
    MFA_SETUP_REQUIRED: 'Two-factor authentication setup is required',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'Logged out successfully',
    REGISTER_SUCCESS: 'Registration successful! Please check your email to verify your account',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    BIOMETRIC_ENABLED: 'Biometric authentication enabled',
    BIOMETRIC_DISABLED: 'Biometric authentication disabled',
    MFA_ENABLED: 'Two-factor authentication enabled',
    MFA_DISABLED: 'Two-factor authentication disabled',
    EMAIL_VERIFIED: 'Email verified successfully',
    ACCOUNT_ACTIVATED: 'Account activated successfully',
  },
  
  // User roles
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    SUPERVISOR: 'supervisor',
    EMPLOYEE: 'employee',
    GUEST: 'guest',
  },
  
  // Permissions
  PERMISSIONS: {
    // User management
    VIEW_USERS: 'view_users',
    CREATE_USERS: 'create_users',
    EDIT_USERS: 'edit_users',
    DELETE_USERS: 'delete_users',
    ASSIGN_ROLES: 'assign_roles',
    
    // Attendance management
    VIEW_ATTENDANCE: 'view_attendance',
    CREATE_ATTENDANCE: 'create_attendance',
    EDIT_ATTENDANCE: 'edit_attendance',
    DELETE_ATTENDANCE: 'delete_attendance',
    APPROVE_ATTENDANCE: 'approve_attendance',
    EXPORT_ATTENDANCE: 'export_attendance',
    
    // Task management
    VIEW_TASKS: 'view_tasks',
    CREATE_TASKS: 'create_tasks',
    EDIT_TASKS: 'edit_tasks',
    DELETE_TASKS: 'delete_tasks',
    ASSIGN_TASKS: 'assign_tasks',
    APPROVE_TASKS: 'approve_tasks',
    
    // Project management
    VIEW_PROJECTS: 'view_projects',
    CREATE_PROJECTS: 'create_projects',
    EDIT_PROJECTS: 'edit_projects',
    DELETE_PROJECTS: 'delete_projects',
    MANAGE_PROJECTS: 'manage_projects',
    
    // Department management
    VIEW_DEPARTMENTS: 'view_departments',
    CREATE_DEPARTMENTS: 'create_departments',
    EDIT_DEPARTMENTS: 'edit_departments',
    DELETE_DEPARTMENTS: 'delete_departments',
    
    // Analytics and reports
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    GENERATE_REPORTS: 'generate_reports',
    
    // System settings
    VIEW_SETTINGS: 'view_settings',
    EDIT_SETTINGS: 'edit_settings',
    MANAGE_SYSTEM: 'manage_system',
    
    // Notifications
    VIEW_NOTIFICATIONS: 'view_notifications',
    SEND_NOTIFICATIONS: 'send_notifications',
    MANAGE_NOTIFICATIONS: 'manage_notifications',
    
    // Biometric management
    MANAGE_BIOMETRICS: 'manage_biometrics',
    VIEW_BIOMETRIC_DATA: 'view_biometric_data',
    
    // AI and monitoring
    VIEW_AI_INSIGHTS: 'view_ai_insights',
    MANAGE_AI_MODELS: 'manage_ai_models',
    VIEW_MONITORING: 'view_monitoring',
    MANAGE_MONITORING: 'manage_monitoring',
  },
  
  // Route permissions mapping
  ROUTE_PERMISSIONS: {
    '/dashboard': ['view_dashboard'],
    '/attendance': ['view_attendance'],
    '/tasks': ['view_tasks'],
    '/projects': ['view_projects'],
    '/users': ['view_users'],
    '/departments': ['view_departments'],
    '/analytics': ['view_analytics'],
    '/reports': ['view_reports'],
    '/notifications': ['view_notifications'],
    '/settings': ['view_settings'],
    '/profile': ['view_profile'],
  },
  
  // API endpoints
  API_ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY_TOKEN: '/auth/verify',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/profile',
    ENABLE_BIOMETRIC: '/auth/biometric/enable',
    DISABLE_BIOMETRIC: '/auth/biometric/disable',
    ENABLE_MFA: '/auth/mfa/enable',
    DISABLE_MFA: '/auth/mfa/disable',
    VERIFY_MFA: '/auth/mfa/verify',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
  
  // Validation rules
  VALIDATION_RULES: {
    EMAIL: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    PASSWORD: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
    },
    USERNAME: {
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens',
    },
    FIRST_NAME: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'First name must be 2-50 characters long',
    },
    LAST_NAME: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Last name must be 2-50 characters long',
    },
    PHONE: {
      pattern: /^\+?[\d\s\-\(\)]+$/,
      message: 'Please enter a valid phone number',
    },
  },
} 