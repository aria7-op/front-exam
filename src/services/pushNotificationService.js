// Advanced Push Notification Service with Service Worker Support
class PushNotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.settingsKey = 'push-notifications-enabled';
    this.isEnabled = this.getSettingsState();
    this.serviceWorkerRegistration = null;
    this.notificationQueue = [];
    
    // Initialize service worker
    this.initServiceWorker();
  }

  // Initialize service worker for background notifications
  async initServiceWorker() {
    if (!this.isSupported) return;

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', this.serviceWorkerRegistration);
      
      // Listen for service worker updates
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
      });
      
      // Listen for service worker state changes
      this.serviceWorkerRegistration.addEventListener('statechange', (event) => {
        console.log('🔄 Service Worker state changed:', event.target.state);
      });
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      // Fallback to basic notifications
    }
  }

  // Get current settings state
  getSettingsState() {
    return localStorage.getItem(this.settingsKey) === 'true';
  }

  // Update settings and auto-request permission if enabled
  updateSettingsState(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem(this.settingsKey, enabled.toString());
    
    if (enabled) {
      this.autoRequestPermission();
    }
  }

  // Check if supported
  isNotificationSupported() {
    return this.isSupported;
  }

  // Get permission status
  getPermissionStatus() {
    return this.isSupported ? Notification.permission : 'denied';
  }

  // Auto-request permission when enabled
  async autoRequestPermission() {
    if (!this.isSupported || !this.isEnabled) return false;
    
    if (this.permission === 'granted') {
      console.log('✅ Push notifications already enabled');
      return true;
    }

    if (this.permission === 'denied') {
      console.log('❌ Push notifications blocked - enable in browser settings');
      return false;
    }

    try {
      console.log('📱 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Push notifications enabled!');
        return true;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
    
    return false;
  }

  // Show notification that works in background
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted' || !this.isEnabled) {
      return null;
    }

    try {
      // Enhanced notification options for background visibility
      const enhancedOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true, // Keep notification visible
        silent: false,
        vibrate: [200, 100, 200], // Vibration pattern
        data: {
          timestamp: Date.now(),
          ...options.data
        },
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/favicon.ico'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/favicon.ico'
          }
        ],
        ...options
      };

      const notification = new Notification(title, enhancedOptions);

      // Handle notification actions
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Handle action clicks
        if (event.action === 'view') {
          window.focus();
        } else if (event.action === 'dismiss') {
          notification.close();
        }
      };

      // Auto close after 10 seconds (longer for background)
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show typed notification with enhanced features
  showTypedNotification(notification) {
    if (this.permission !== 'granted' || !this.isEnabled) {
      console.log('❌ Cannot show push notification - permission not granted or disabled');
      return null;
    }

    console.log('📱 Showing push notification:', notification.title);

    try {
      // Enhanced notification for better background visibility
      const notificationObj = new Notification(notification.title, {
        body: notification.message || notification.content || 'You have a new notification',
        icon: `/favicon.ico`,
        badge: `/favicon.ico`,
        tag: notification.id || 'notification',
        requireInteraction: true, // Keep visible in background
        silent: false,
        vibrate: [200, 100, 200], // Vibration for mobile
        data: {
          notificationId: notification.id,
          type: notification.type,
          timestamp: Date.now(),
          ...notification
        },
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/favicon.ico'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/favicon.ico'
          }
        ]
      });

      // Enhanced click handling
      notificationObj.onclick = (event) => {
        event.preventDefault();
        
        // Focus the window
        window.focus();
        
        // Close the notification
        notificationObj.close();
        
        // Handle specific actions
        if (event.action === 'view') {
          // Navigate to relevant page based on notification type
          this.handleNotificationClick(notification);
        }
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        if (notificationObj) {
          notificationObj.close();
        }
      }, 10000);

      console.log('✅ Push notification shown successfully');
      return notificationObj;
    } catch (error) {
      console.error('❌ Failed to show push notification:', error);
      return null;
    }
  }

  // Handle notification clicks intelligently
  handleNotificationClick(notification) {
    // Navigate based on notification type
    switch (notification.type) {
      case 'NEW_EXAM_AVAILABLE':
        // Navigate to available tests
        if (window.location.pathname !== '/student/tests') {
          window.location.href = '/student/tests';
        }
        break;
      case 'EXAM_REMINDER':
        // Navigate to upcoming exams
        if (window.location.pathname !== '/student/tests') {
          window.location.href = '/student/tests';
        }
        break;
      case 'EXAM_COMPLETED':
        // Navigate to results
        if (window.location.pathname !== '/student/history') {
          window.location.href = '/student/history';
        }
        break;
      default:
        // Just focus the window
        window.focus();
    }
  }

  // Show notification even when tab is not focused
  showBackgroundNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted' || !this.isEnabled) {
      return null;
    }

    // Use service worker if available, otherwise fallback
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      // Send message to service worker for background notification
      this.serviceWorkerRegistration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: {
          ...options,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200]
        }
      });
    } else {
      // Fallback to regular notification
      return this.showNotification(title, options);
    }
  }

  // Get status for UI
  getStatus() {
    return {
      isSupported: this.isSupported,
      isEnabled: this.isEnabled,
      permission: this.permission,
      canShow: this.isEnabled && this.permission === 'granted',
      hasServiceWorker: !!this.serviceWorkerRegistration,
      serviceWorkerState: this.serviceWorkerRegistration?.active?.state || 'none'
    };
  }

  // Check if notifications should be shown
  shouldShowNotifications() {
    return this.isEnabled && this.permission === 'granted';
  }

  // Request permission explicitly
  async requestPermission() {
    return await this.autoRequestPermission();
  }
}

export default PushNotificationService;