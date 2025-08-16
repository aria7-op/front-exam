import axios from 'axios'
import { AUTH_CONSTANTS } from '../../constants/auth/authConstants'
import { storageUtils } from '../../utils/storage/storageUtils'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://31.97.70.79:5050/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = storageUtils.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = storageUtils.getRefreshToken()
        if (refreshToken) {
          const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken,
          })

          if (response.data.success) {
            storageUtils.setToken(response.data.token)
            storageUtils.setRefreshToken(response.data.refreshToken)
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh token failed, clear auth and redirect to login
        storageUtils.clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

class AuthService {
  // Login
  async login(credentials, options = {}) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.LOGIN, {
        ...credentials,
        ...options,
      })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Login failed')
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.REGISTER, userData)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Registration failed')
    }
  }

  // Logout
  async logout(token) {
    try {
      await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.LOGOUT, { token })
      
      return {
        success: true,
        message: 'Logged out successfully',
      }
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.error('Logout error:', error)
      return {
        success: true,
        message: 'Logged out successfully',
      }
    }
  }

  // Verify token
  async verifyToken(token) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.VERIFY_TOKEN, { token })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Token verification failed')
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken,
      })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Token refresh failed')
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.FORGOT_PASSWORD, { email })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Password reset request failed')
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.RESET_PASSWORD, {
        token,
        password,
      })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Password reset failed')
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.CHANGE_PASSWORD, passwordData)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Password change failed')
    }
  }

  // Update profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put(AUTH_CONSTANTS.API_ENDPOINTS.UPDATE_PROFILE, userData)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Profile update failed')
    }
  }

  // Enable biometric
  async enableBiometric() {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.ENABLE_BIOMETRIC)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to enable biometric authentication')
    }
  }

  // Disable biometric
  async disableBiometric() {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.DISABLE_BIOMETRIC)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to disable biometric authentication')
    }
  }

  // Enable MFA
  async enableMFA() {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.ENABLE_MFA)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to enable two-factor authentication')
    }
  }

  // Disable MFA
  async disableMFA() {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.DISABLE_MFA)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to disable two-factor authentication')
    }
  }

  // Verify MFA
  async verifyMFA(code) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.VERIFY_MFA, { code })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'MFA verification failed')
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.VERIFY_EMAIL, { token })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Email verification failed')
    }
  }

  // Resend verification email
  async resendVerification(email) {
    try {
      const response = await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.RESEND_VERIFICATION, { email })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to resend verification email')
    }
  }

  // Biometric authentication
  async authenticateBiometric(biometricData) {
    try {
      const response = await apiClient.post('/auth/biometric/authenticate', biometricData)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Biometric authentication failed')
    }
  }

  // Get user permissions
  async getUserPermissions() {
    try {
      const response = await apiClient.get('/auth/permissions')

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get user permissions')
    }
  }

  // Get user roles
  async getUserRoles() {
    try {
      const response = await apiClient.get('/auth/roles')

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get user roles')
    }
  }

  // Get session info
  async getSessionInfo() {
    try {
      const response = await apiClient.get('/auth/session')

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get session information')
    }
  }

  // Extend session
  async extendSession() {
    try {
      const response = await apiClient.post('/auth/session/extend')

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to extend session')
    }
  }

  // Get login history
  async getLoginHistory(page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/auth/login-history', {
        params: { page, limit },
      })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get login history')
    }
  }

  // Get security settings
  async getSecuritySettings() {
    try {
      const response = await apiClient.get('/auth/security-settings')

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get security settings')
    }
  }

  // Update security settings
  async updateSecuritySettings(settings) {
    try {
      const response = await apiClient.put('/auth/security-settings', settings)

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to update security settings')
    }
  }

  // Get account activity
  async getAccountActivity(page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/auth/account-activity', {
        params: { page, limit },
      })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get account activity')
    }
  }

  // Revoke all sessions
  async revokeAllSessions() {
    try {
      const response = await apiClient.post('/auth/revoke-all-sessions')

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      return this.handleError(error, 'Failed to revoke all sessions')
    }
  }

  // Handle API errors
  handleError(error, defaultMessage) {
    console.error('API Error:', error)

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          return {
            success: false,
            message: data.message || 'Bad request',
            errors: data.errors,
          }
        case 401:
          return {
            success: false,
            message: AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
          }
        case 403:
          return {
            success: false,
            message: 'Access denied',
          }
        case 404:
          return {
            success: false,
            message: 'Resource not found',
          }
        case 409:
          return {
            success: false,
            message: data.message || 'Conflict occurred',
          }
        case 422:
          return {
            success: false,
            message: AUTH_CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
            errors: data.errors,
          }
        case 429:
          return {
            success: false,
            message: 'Too many requests. Please try again later.',
          }
        case 500:
          return {
            success: false,
            message: AUTH_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
          }
        default:
          return {
            success: false,
            message: data.message || defaultMessage,
          }
      }
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: AUTH_CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR,
      }
    } else {
      // Other error
      return {
        success: false,
        message: error.message || defaultMessage,
      }
    }
  }

  // Utility methods
  isAuthenticated() {
    const token = storageUtils.getToken()
    return !!token
  }

  getToken() {
    return storageUtils.getToken()
  }

  getUser() {
    return storageUtils.getUser()
  }

  clearAuth() {
    storageUtils.clearAuth()
  }
}

// Create and export singleton instance
export const authService = new AuthService() 