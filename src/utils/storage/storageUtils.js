import { AUTH_CONSTANTS } from '../../constants/auth/authConstants'

class StorageUtils {
  constructor() {
    this.storageKeys = AUTH_CONSTANTS.STORAGE_KEYS
  }

  // Local Storage Methods
  setItem(key, value) {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value
      localStorage.setItem(key, serializedValue)
      return true
    } catch (error) {
      console.error('Error setting localStorage item:', error)
      return false
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      
      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item)
      } catch {
        return item
      }
    } catch (error) {
      console.error('Error getting localStorage item:', error)
      return defaultValue
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing localStorage item:', error)
      return false
    }
  }

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  // Session Storage Methods
  setSessionItem(key, value) {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value
      sessionStorage.setItem(key, serializedValue)
      return true
    } catch (error) {
      console.error('Error setting sessionStorage item:', error)
      return false
    }
  }

  getSessionItem(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) return defaultValue
      
      try {
        return JSON.parse(item)
      } catch {
        return item
      }
    } catch (error) {
      console.error('Error getting sessionStorage item:', error)
      return defaultValue
    }
  }

  removeSessionItem(key) {
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing sessionStorage item:', error)
      return false
    }
  }

  clearSession() {
    try {
      sessionStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
      return false
    }
  }

  // Authentication Storage Methods
  setToken(token) {
    return this.setItem(this.storageKeys.TOKEN, token)
  }

  getToken() {
    return this.getItem(this.storageKeys.TOKEN)
  }

  removeToken() {
    return this.removeItem(this.storageKeys.TOKEN)
  }

  setRefreshToken(token) {
    return this.setItem(this.storageKeys.REFRESH_TOKEN, token)
  }

  getRefreshToken() {
    return this.getItem(this.storageKeys.REFRESH_TOKEN)
  }

  removeRefreshToken() {
    return this.removeItem(this.storageKeys.REFRESH_TOKEN)
  }

  setUser(user) {
    return this.setItem(this.storageKeys.USER, user)
  }

  getUser() {
    return this.getItem(this.storageKeys.USER)
  }

  removeUser() {
    return this.removeItem(this.storageKeys.USER)
  }

  // Theme Storage Methods
  setTheme(theme) {
    return this.setItem(this.storageKeys.THEME, theme)
  }

  getTheme() {
    return this.getItem(this.storageKeys.THEME, 'light')
  }

  removeTheme() {
    return this.removeItem(this.storageKeys.THEME)
  }

  // Language Storage Methods
  setLanguage(language) {
    return this.setItem(this.storageKeys.LANGUAGE, language)
  }

  getLanguage() {
    return this.getItem(this.storageKeys.LANGUAGE, 'en')
  }

  removeLanguage() {
    return this.removeItem(this.storageKeys.LANGUAGE)
  }

  // Biometric Storage Methods
  setBiometricEnabled(enabled) {
    return this.setItem(this.storageKeys.BIOMETRIC_ENABLED, enabled)
  }

  getBiometricEnabled() {
    return this.getItem(this.storageKeys.BIOMETRIC_ENABLED, false)
  }

  removeBiometricEnabled() {
    return this.removeItem(this.storageKeys.BIOMETRIC_ENABLED)
  }

  // MFA Storage Methods
  setMFAEnabled(enabled) {
    return this.setItem(this.storageKeys.MFA_ENABLED, enabled)
  }

  getMFAEnabled() {
    return this.getItem(this.storageKeys.MFA_ENABLED, false)
  }

  removeMFAEnabled() {
    return this.removeItem(this.storageKeys.MFA_ENABLED)
  }

  // Session Timeout Storage Methods
  setSessionTimeout(timeout) {
    return this.setItem(this.storageKeys.SESSION_TIMEOUT, timeout)
  }

  getSessionTimeout() {
    return this.getItem(this.storageKeys.SESSION_TIMEOUT, AUTH_CONSTANTS.DEFAULT_SESSION_TIMEOUT)
  }

  removeSessionTimeout() {
    return this.removeItem(this.storageKeys.SESSION_TIMEOUT)
  }

  // Last Activity Storage Methods
  setLastActivity(timestamp) {
    return this.setItem(this.storageKeys.LAST_ACTIVITY, timestamp)
  }

  getLastActivity() {
    return this.getItem(this.storageKeys.LAST_ACTIVITY)
  }

  removeLastActivity() {
    return this.removeItem(this.storageKeys.LAST_ACTIVITY)
  }

  // Clear all authentication data
  clearAuth() {
    const keys = Object.values(this.storageKeys)
    keys.forEach(key => this.removeItem(key))
    return true
  }

  // Clear all application data
  clearAll() {
    this.clear()
    this.clearSession()
    return true
  }

  // Check if storage is available
  isStorageAvailable(type = 'localStorage') {
    try {
      const storage = window[type]
      const testKey = '__storage_test__'
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  // Get storage usage information
  getStorageUsage() {
    try {
      const localStorage = window.localStorage
      let totalSize = 0
      let itemCount = 0

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length
          itemCount++
        }
      }

      return {
        totalSize,
        itemCount,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(4),
      }
    } catch (error) {
      console.error('Error getting storage usage:', error)
      return null
    }
  }

  // Check if storage is full
  isStorageFull() {
    try {
      const testKey = '__storage_full_test__'
      const testValue = 'x'.repeat(1024 * 1024) // 1MB test
      
      localStorage.setItem(testKey, testValue)
      localStorage.removeItem(testKey)
      return false
    } catch (error) {
      return true
    }
  }

  // Clean up old or invalid data
  cleanup() {
    try {
      const keys = Object.keys(localStorage)
      const validKeys = Object.values(this.storageKeys)
      
      keys.forEach(key => {
        if (!validKeys.includes(key)) {
          this.removeItem(key)
        }
      })
      
      return true
    } catch (error) {
      console.error('Error cleaning up storage:', error)
      return false
    }
  }

  // Export storage data
  exportData() {
    try {
      const data = {}
      const keys = Object.values(this.storageKeys)
      
      keys.forEach(key => {
        const value = this.getItem(key)
        if (value !== null) {
          data[key] = value
        }
      })
      
      return data
    } catch (error) {
      console.error('Error exporting storage data:', error)
      return null
    }
  }

  // Import storage data
  importData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format')
      }
      
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key])
      })
      
      return true
    } catch (error) {
      console.error('Error importing storage data:', error)
      return false
    }
  }

  // Secure storage methods (for sensitive data)
  setSecureItem(key, value, password) {
    try {
      // Simple encryption (in production, use a proper encryption library)
      const encrypted = btoa(JSON.stringify({ value, timestamp: Date.now() }))
      return this.setItem(`secure_${key}`, encrypted)
    } catch (error) {
      console.error('Error setting secure item:', error)
      return false
    }
  }

  getSecureItem(key, password) {
    try {
      const encrypted = this.getItem(`secure_${key}`)
      if (!encrypted) return null
      
      const decrypted = JSON.parse(atob(encrypted))
      return decrypted.value
    } catch (error) {
      console.error('Error getting secure item:', error)
      return null
    }
  }

  // Cache methods
  setCache(key, value, ttl = 3600000) { // Default 1 hour
    try {
      const cacheData = {
        value,
        timestamp: Date.now(),
        ttl,
      }
      return this.setItem(`cache_${key}`, cacheData)
    } catch (error) {
      console.error('Error setting cache:', error)
      return false
    }
  }

  getCache(key) {
    try {
      const cacheData = this.getItem(`cache_${key}`)
      if (!cacheData) return null
      
      const now = Date.now()
      const isExpired = now - cacheData.timestamp > cacheData.ttl
      
      if (isExpired) {
        this.removeItem(`cache_${key}`)
        return null
      }
      
      return cacheData.value
    } catch (error) {
      console.error('Error getting cache:', error)
      return null
    }
  }

  clearCache() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          this.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Error clearing cache:', error)
      return false
    }
  }

  // Utility methods
  hasItem(key) {
    return this.getItem(key) !== null
  }

  getKeys() {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('Error getting storage keys:', error)
      return []
    }
  }

  getSize(key) {
    try {
      const item = this.getItem(key)
      if (item === null) return 0
      
      const serialized = typeof item === 'object' ? JSON.stringify(item) : String(item)
      return serialized.length
    } catch (error) {
      console.error('Error getting item size:', error)
      return 0
    }
  }
}

// Create and export singleton instance
export const storageUtils = new StorageUtils() 