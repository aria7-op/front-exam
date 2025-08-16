import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// Services
import { authService } from '../../services/api/authService'

// Utils
import { storageUtils } from '../../utils/storage/storageUtils'

// Constants
import { AUTH_CONSTANTS } from '../../constants/auth/authConstants'

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  roles: [],
  lastActivity: null,
  sessionTimeout: null,
  biometricEnabled: false,
  mfaEnabled: false,
  loginAttempts: 0,
  lockoutUntil: null,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  SET_SESSION_TIMEOUT: 'SET_SESSION_TIMEOUT',
  ENABLE_BIOMETRIC: 'ENABLE_BIOMETRIC',
  DISABLE_BIOMETRIC: 'DISABLE_BIOMETRIC',
  ENABLE_MFA: 'ENABLE_MFA',
  DISABLE_MFA: 'DISABLE_MFA',
  INCREMENT_LOGIN_ATTEMPTS: 'INCREMENT_LOGIN_ATTEMPTS',
  RESET_LOGIN_ATTEMPTS: 'RESET_LOGIN_ATTEMPTS',
  SET_LOCKOUT: 'SET_LOCKOUT',
  CLEAR_LOCKOUT: 'CLEAR_LOCKOUT',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.permissions || [],
        roles: action.payload.roles || [],
        lastActivity: new Date().toISOString(),
        loginAttempts: 0,
        lockoutUntil: null,
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        loginAttempts: state.loginAttempts + 1,
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    
    case AUTH_ACTIONS.UPDATE_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      }
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    
    case AUTH_ACTIONS.UPDATE_LAST_ACTIVITY:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      }
    
    case AUTH_ACTIONS.SET_SESSION_TIMEOUT:
      return {
        ...state,
        sessionTimeout: action.payload,
      }
    
    case AUTH_ACTIONS.ENABLE_BIOMETRIC:
      return {
        ...state,
        biometricEnabled: true,
      }
    
    case AUTH_ACTIONS.DISABLE_BIOMETRIC:
      return {
        ...state,
        biometricEnabled: false,
      }
    
    case AUTH_ACTIONS.ENABLE_MFA:
      return {
        ...state,
        mfaEnabled: true,
      }
    
    case AUTH_ACTIONS.DISABLE_MFA:
      return {
        ...state,
        mfaEnabled: false,
      }
    
    case AUTH_ACTIONS.INCREMENT_LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: state.loginAttempts + 1,
      }
    
    case AUTH_ACTIONS.RESET_LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: 0,
        lockoutUntil: null,
      }
    
    case AUTH_ACTIONS.SET_LOCKOUT:
      return {
        ...state,
        lockoutUntil: action.payload,
      }
    
    case AUTH_ACTIONS.CLEAR_LOCKOUT:
      return {
        ...state,
        lockoutUntil: null,
        loginAttempts: 0,
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Check if user is locked out
  const isLockedOut = () => {
    if (!state.lockoutUntil) return false
    return new Date() < new Date(state.lockoutUntil)
  }

  // Check session timeout
  const checkSessionTimeout = () => {
    if (!state.lastActivity || !state.sessionTimeout) return false
    
    const lastActivity = new Date(state.lastActivity)
    const timeout = new Date(lastActivity.getTime() + state.sessionTimeout)
    const now = new Date()
    
    return now > timeout
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storageUtils.getToken()
        const user = storageUtils.getUser()
        
        if (token && user) {
          // Verify token with backend
          const response = await authService.verifyToken(token)
          
          if (response.success) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.user,
                token,
                permissions: response.permissions,
                roles: response.roles,
              },
            })
          } else {
            // Token is invalid, clear storage
            storageUtils.clearAuth()
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        storageUtils.clearAuth()
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    initializeAuth()
  }, [])

  // Session timeout check
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(() => {
      if (checkSessionTimeout()) {
        toast.error('Session expired. Please login again.')
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [state.lastActivity, state.sessionTimeout, state.isAuthenticated])

  // Activity tracker
  useEffect(() => {
    if (!state.isAuthenticated) return

    const updateActivity = () => {
      dispatch({ type: AUTH_ACTIONS.UPDATE_LAST_ACTIVITY })
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [state.isAuthenticated])

  // Login function
  const login = async (credentials, options = {}) => {
    try {
      // Check lockout
      if (isLockedOut()) {
        const lockoutTime = new Date(state.lockoutUntil).toLocaleTimeString()
        throw new Error(`Account is locked until ${lockoutTime}`)
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await authService.login(credentials, options)
      
      if (response.success) {
        // Store auth data
        storageUtils.setToken(response.token)
        storageUtils.setUser(response.user)
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
            permissions: response.permissions,
            roles: response.roles,
          },
        })

        // Reset login attempts
        dispatch({ type: AUTH_ACTIONS.RESET_LOGIN_ATTEMPTS })

        // Set session timeout
        if (response.sessionTimeout) {
          dispatch({
            type: AUTH_ACTIONS.SET_SESSION_TIMEOUT,
            payload: response.sessionTimeout,
          })
        }

        toast.success('Welcome back!')
        navigate('/dashboard')
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      })

      // Handle lockout
      if (state.loginAttempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS - 1) {
        const lockoutTime = new Date()
        lockoutTime.setMinutes(lockoutTime.getMinutes() + AUTH_CONSTANTS.LOCKOUT_DURATION)
        
        dispatch({
          type: AUTH_ACTIONS.SET_LOCKOUT,
          payload: lockoutTime.toISOString(),
        })

        toast.error(`Too many failed attempts. Account locked for ${AUTH_CONSTANTS.LOCKOUT_DURATION} minutes.`)
      } else {
        toast.error(error.message)
      }

      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      if (state.token) {
        await authService.logout(state.token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      storageUtils.clearAuth()
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })

      const response = await authService.register(userData)
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS })
        toast.success('Registration successful! Please check your email to verify your account.')
        navigate('/login')
        return { success: true }
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message,
      })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData)
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.user,
        })
        storageUtils.setUser(response.user)
        toast.success('Profile updated successfully')
        return { success: true }
      } else {
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData)
      
      if (response.success) {
        toast.success('Password changed successfully')
        return { success: true }
      } else {
        throw new Error(response.message || 'Password change failed')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email)
      
      if (response.success) {
        toast.success('Password reset instructions sent to your email')
        return { success: true }
      } else {
        throw new Error(response.message || 'Password reset failed')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password)
      
      if (response.success) {
        toast.success('Password reset successfully')
        navigate('/login')
        return { success: true }
      } else {
        throw new Error(response.message || 'Password reset failed')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Check permissions
  const hasPermission = (permission) => {
    return state.permissions.includes(permission)
  }

  // Check roles
  const hasRole = (role) => {
    return state.roles.includes(role)
  }

  // Enable biometric
  const enableBiometric = async () => {
    try {
      const response = await authService.enableBiometric()
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.ENABLE_BIOMETRIC })
        toast.success('Biometric authentication enabled')
        return { success: true }
      } else {
        throw new Error(response.message || 'Failed to enable biometric')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Disable biometric
  const disableBiometric = async () => {
    try {
      const response = await authService.disableBiometric()
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.DISABLE_BIOMETRIC })
        toast.success('Biometric authentication disabled')
        return { success: true }
      } else {
        throw new Error(response.message || 'Failed to disable biometric')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Enable MFA
  const enableMFA = async () => {
    try {
      const response = await authService.enableMFA()
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.ENABLE_MFA })
        toast.success('Two-factor authentication enabled')
        return { success: true, qrCode: response.qrCode }
      } else {
        throw new Error(response.message || 'Failed to enable MFA')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Disable MFA
  const disableMFA = async () => {
    try {
      const response = await authService.disableMFA()
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.DISABLE_MFA })
        toast.success('Two-factor authentication disabled')
        return { success: true }
      } else {
        throw new Error(response.message || 'Failed to disable MFA')
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    // State
    ...state,
    
    // Computed values
    isLockedOut: isLockedOut(),
    remainingLoginAttempts: AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS - state.loginAttempts,
    
    // Actions
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    hasPermission,
    hasRole,
    enableBiometric,
    disableBiometric,
    enableMFA,
    disableMFA,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 