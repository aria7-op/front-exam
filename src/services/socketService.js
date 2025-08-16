import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import PushNotificationService from './pushNotificationService';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // Initialize push notification service
    this.pushNotificationService = new PushNotificationService();
  }

  connect(token, userId, userRole) {
    if (this.socket && this.isConnected) {
      console.log('🔌 WebSocket already connected, skipping connection');
      return;
    }

    // Prevent multiple connections
    if (this.connecting) {
      console.log('🔌 WebSocket connection already in progress, skipping');
      return;
    }

    this.connecting = true;
    console.log('🔌 Initiating WebSocket connection...');

    this.socket = io('https://31.97.70.79:5050', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.connecting = false;
      this.reconnectAttempts = 0;

      // Join appropriate rooms based on user role
      if (['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(userRole)) {
        console.log('🔌 Joining admin room');
        this.socket.emit('join-admin', { userId, userRole });
      } else {
        console.log('🔌 Joining user room:', `user-${userId}`);
        this.socket.emit('join-user', { userId });
        // Students only join user room for personalized notifications
        // Removed join-student to prevent duplicate room issues
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('WebSocket connection failed. Real-time updates disabled.');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      toast.success('Real-time connection restored');
    });

    // Real-time event handlers
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Admin events
    this.socket.on('exam-attempt-started', (data) => {
      console.log('📝 Exam attempt started:', data);
      
      // Show toast
      toast.success(`New exam attempt started by ${data.userName}`);
      
      // Show push notification for admins
      this.pushNotificationService.showBackgroundNotification('📝 New Exam Attempt', {
        body: `${data.userName} started an exam`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'exam-attempt',
        data: data
      });
    });

    this.socket.on('exam-attempt-completed', (data) => {
      console.log('✅ Exam attempt completed:', data);
      
      // Show toast
      toast.success(`Exam completed by ${data.userName}`);
      
      // Show push notification for admins
      this.pushNotificationService.showBackgroundNotification('✅ Exam Completed', {
        body: `${data.userName} completed an exam`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'exam-completed',
        data: data
      });
    });

    this.socket.on('booking-created', (data) => {
      console.log('📅 New booking created:', data);
      
      // Show toast
      toast.success(`New booking created by ${data.userName}`);
      
      // Show push notification for admins
      this.pushNotificationService.showBackgroundNotification('📅 New Booking', {
        body: `${data.userName} created a new booking`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'booking-created',
        data: data
      });
    });

    this.socket.on('payment-processed', (data) => {
      console.log('💰 Payment processed:', data);
      
      // Show toast
      toast.success(`Payment processed for ${data.userName}`);
      
      // Show push notification for admins
      this.pushNotificationService.showBackgroundNotification('💰 Payment Processed', {
        body: `Payment processed for ${data.userName}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'payment-processed',
        data: data
      });
    });

    this.socket.on('user-login', (data) => {
      console.log('👤 User logged in:', data);
      toast.success(`${data.userName} logged in`);
    });

    this.socket.on('user-logout', (data) => {
      console.log('👤 User logged out:', data);
      toast.info(`${data.userName} logged out`);
    });

    // User events
    this.socket.on('exam-result-ready', (data) => {
      console.log('📊 Exam result ready:', data);
      toast.success('Your exam result is ready!');
    });

    this.socket.on('payment-confirmed', (data) => {
      console.log('✅ Payment confirmed:', data);
      toast.success('Payment confirmed successfully!');
    });

    this.socket.on('notification-received', (data) => {
      console.log('🔔 Notification received:', data);
      
      // Show toast
      toast(data.message, {
        icon: data.type === 'success' ? '✅' : data.type === 'error' ? '❌' : 'ℹ️',
        duration: 5000,
      });
      
      // Show push notification
      this.pushNotificationService.showBackgroundNotification(data.message, {
        body: data.data?.description || 'New notification received',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'notification',
        data: data
      });
    });

    // New exam available notification (GENERAL - for all students)
    this.socket.on('new-exam-available', (data) => {
      console.log('📚 New exam available (general):', data);
      console.log('🔔 WebSocket event received: new-exam-available');
      
      // Show toast
      toast.success(data.message, {
        duration: 8000,
        icon: '📚',
      });
      
      // Show push notification
      this.pushNotificationService.showBackgroundNotification('📚 New Exam Available', {
        body: data.message,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'new-exam',
        data: data,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    });

    // Personal notifications (for specific user)
    this.socket.on('notification', (data) => {
      console.log('🔔 Personal notification received:', data);
      console.log('🔔 WebSocket event received: notification (personal)');
      
      // Show toast based on notification type
      let toastIcon = '🔔';
      let pushTitle = 'New Notification';
      
      switch (data.type) {
        case 'EXAM_REMINDER':
          if (data.data?.reminderType === '5m') {
            toast.error(data.message, { duration: 10000, icon: '⏰' }); // Urgent for 5-min reminder
            pushTitle = '⏰ URGENT: Exam Reminder';
          } else if (data.data?.reminderType === '15m') {
            toast.error(data.message, { duration: 10000, icon: '⏰' }); // Urgent for 15-min reminder
            pushTitle = '⏰ Exam Reminder';
          } else {
            toast.success(data.message, { duration: 8000, icon: '⏰' });
            pushTitle = '⏰ Exam Reminder';
          }
          toastIcon = '⏰';
          break;
        case 'BOOKING_CONFIRMED':
          toast.success(data.message, { duration: 8000, icon: '📅' });
          pushTitle = '📅 Booking Confirmed';
          toastIcon = '📅';
          break;
        case 'BOOKING_CANCELLED':
          toast.error(data.message, { duration: 8000, icon: '❌' });
          pushTitle = '❌ Booking Cancelled';
          toastIcon = '❌';
          break;
        case 'EXAM_STARTED':
          toast.success(data.message, { duration: 8000, icon: '📝' });
          pushTitle = '📝 Exam Started';
          toastIcon = '📝';
          break;
        case 'EXAM_COMPLETED':
          toast.success(data.message, { duration: 10000, icon: '🎉' });
          pushTitle = '🎉 Exam Completed';
          toastIcon = '🎉';
          break;
        default:
          toast(data.message, { duration: 6000, icon: '🔔' });
          pushTitle = '🔔 New Notification';
      }
      
      // Show push notification
      this.pushNotificationService.showBackgroundNotification(pushTitle, {
        body: data.message,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `notification-${data.type}`,
        data: data,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    });

    // Test notification response
    this.socket.on('test-notification-response', (data) => {
      console.log('🧪 Test notification response received:', data);
      toast.success('WebSocket test successful! Connection is working.', {
        duration: 5000,
        icon: '✅'
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Clean up all event listeners
  cleanup() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit events
  emitExamAttemptStarted(data) {
    if (this.isConnected) {
      this.socket.emit('exam-attempt-started', data);
    }
  }

  emitExamAttemptCompleted(data) {
    if (this.isConnected) {
      this.socket.emit('exam-attempt-completed', data);
    }
  }

  emitBookingCreated(data) {
    if (this.isConnected) {
      this.socket.emit('booking-created', data);
    }
  }

  emitPaymentProcessed(data) {
    if (this.isConnected) {
      this.socket.emit('payment-processed', data);
    }
  }

  emitUserLogin(data) {
    if (this.isConnected) {
      this.socket.emit('user-login', data);
    }
  }

  emitUserLogout(data) {
    if (this.isConnected) {
      this.socket.emit('user-logout', data);
    }
  }

  sendNotification(userId, message, type = 'info') {
    if (this.isConnected) {
      this.socket.emit('send-notification', {
        userId,
        message,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Listen to events
  onExamAttemptStarted(callback) {
    if (this.socket) {
      this.socket.on('exam-attempt-started', callback);
    }
  }

  onExamAttemptCompleted(callback) {
    if (this.socket) {
      this.socket.on('exam-attempt-completed', callback);
    }
  }

  onBookingCreated(callback) {
    if (this.socket) {
      this.socket.on('booking-created', callback);
    }
  }

  onPaymentProcessed(callback) {
    if (this.socket) {
      this.socket.on('payment-processed', callback);
    }
  }

  onUserLogin(callback) {
    if (this.socket) {
      this.socket.on('user-login', callback);
    }
  }

  onUserLogout(callback) {
    if (this.socket) {
      this.socket.on('user-logout', callback);
    }
  }

  onNotificationReceived(callback) {
    if (this.socket) {
      this.socket.on('notification-received', callback);
    }
  }

  onNewExamAvailable(callback) {
    if (this.socket) {
      this.socket.on('new-exam-available', callback);
    }
  }

  // Remove event listeners
  offExamAttemptStarted(callback) {
    if (this.socket) {
      this.socket.off('exam-attempt-started', callback);
    }
  }

  offExamAttemptCompleted(callback) {
    if (this.socket) {
      this.socket.off('exam-attempt-completed', callback);
    }
  }

  offBookingCreated(callback) {
    if (this.socket) {
      this.socket.off('booking-created', callback);
    }
  }

  offPaymentProcessed(callback) {
    if (this.socket) {
      this.socket.off('payment-processed', callback);
    }
  }

  offUserLogin(callback) {
    if (this.socket) {
      this.socket.off('user-login', callback);
    }
  }

  offUserLogout(callback) {
    if (this.socket) {
      this.socket.off('user-logout', callback);
    }
  }

  offNotificationReceived(callback) {
    if (this.socket) {
      this.socket.off('notification-received', callback);
    }
  }

  offNewExamAvailable(callback) {
    if (this.socket) {
      this.socket.off('new-exam-available', callback);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Check if already connected to avoid duplicate connections
   */
  isAlreadyConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  /**
   * Test notification method for debugging
   */
  testNotification() {
    if (this.isConnected) {
      console.log('🧪 Testing notification via WebSocket');
      
      // Send test notification
      this.socket.emit('test-notification', {
        message: 'Test notification from frontend',
        timestamp: Date.now()
      });
      
      // Also test push notification directly
      this.pushNotificationService.showBackgroundNotification('🧪 Test Push Notification', {
        body: 'This is a test push notification from the frontend',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'test-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
      
    } else {
      console.log('🧪 Cannot test notification - WebSocket not connected');
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 