import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { useNotifications } from '../../hooks/notifications/useNotifications';
import PushNotificationService from '../../services/pushNotificationService';

const NotificationCenter = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [pushService, setPushService] = useState(null);
  const dropdownRef = useRef(null);

  // Initialize Push Notification Service
  useEffect(() => {
    const pushNotificationService = new PushNotificationService();
    setPushService(pushNotificationService);
    
    // Log the current status
    console.log('🔔 NotificationCenter: Push service initialized');
    console.log('🔔 NotificationCenter: Current status:', pushNotificationService.getStatus());
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle real-time notifications via WebSocket
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Listen for real-time notifications
    const handleNotification = (notification) => {
      console.log('🔔 Real-time notification received:', notification);
      
      // Add notification to list
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);

      // Show push notification if service is available and enabled
      if (pushService && pushService.shouldShowNotifications()) {
        console.log('📱 Showing push notification for:', notification.title);
        pushService.showTypedNotification(notification);
      } else {
        console.log('❌ Push notification not shown - service not available or disabled');
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, user?.id, pushService]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (notification) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${getPriorityColor(notification.priority)};
            margin-top: 6px;
            flex-shrink: 0;
          "></div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #1a202c; margin-bottom: 4px;">
              ${notification.title}
            </div>
            <div style="color: #4a5568; font-size: 14px; line-height: 1.4;">
              ${notification.message}
            </div>
          </div>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            background: none;
            border: none;
            color: #a0aec0;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
          ">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#2563eb';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '🔔';
      case 'low': return '💬';
      default: return '🔔';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'USER_REGISTERED': return '🎉';
      case 'EMAIL_VERIFIED': return '✅';
      case 'ACCOUNT_STATUS_CHANGED': return '👤';
      case 'BOOKING_CONFIRMED': return '📅';
      case 'BOOKING_CANCELLED': return '❌';
      case 'PAYMENT_SUCCESS': return '💳';
      case 'PAYMENT_FAILED': return '⚠️';
      case 'EXAM_STARTED': return '📝';
      case 'EXAM_COMPLETED': return '🎯';
      case 'CERTIFICATE_READY': return '🏆';
      case 'EXAM_REMINDER': return '⏰';
      case 'SYSTEM_ALERT': return '🚨';
      default: return '🔔';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="notification-center" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Notification Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          border: '2px solid var(--secondary-300)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '20px',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'var(--primary-500)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'var(--secondary-300)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            backgroundColor: 'var(--danger-500)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          width: '400px',
          maxHeight: '500px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--secondary-200)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--secondary-200)',
            background: 'var(--secondary-50)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--secondary-900)'
              }}>
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (pushService) {
                      console.log('🔔 Test notification button clicked');
                      console.log('Current permission:', pushService.getPermissionStatus());
                      console.log('Service status:', pushService.getStatus());
                      
                      if (pushService.getPermissionStatus() === 'granted') {
                        // Test notification
                        const testNotification = {
                          id: 'test-' + Date.now(),
                          title: '🧪 Test Push Notification',
                          message: 'This is a test push notification to verify the system is working!',
                          type: 'TEST'
                        };
                        
                        const result = pushService.showTypedNotification(testNotification);
                        if (result) {
                          toast.success('Test push notification sent! Check your system notifications.', {
                            duration: 5000,
                            icon: '✅',
                          });
                        } else {
                          toast.error('Failed to send test notification. Check console for details.', {
                            duration: 5000,
                            icon: '❌',
                          });
                        }
                      } else {
                        console.log('📱 Requesting permission...');
                        const result = await pushService.requestPermission();
                        console.log('Permission result:', result);
                        
                        // Force re-render to update button text
                        setIsOpen(false);
                        setTimeout(() => setIsOpen(true), 100);
                      }
                    } else {
                      console.log('❌ Push service not initialized');
                      toast.error('Push notification service not available', {
                        duration: 3000,
                        icon: '❌',
                      });
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--secondary-600)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🧪 {pushService?.getPermissionStatus() === 'granted' ? 'Test Push' : 'Enable Push'}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--secondary-600)'
              }}>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--secondary-600)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                <div style={{ fontWeight: '500', marginBottom: '8px' }}>No notifications yet</div>
                <div style={{ fontSize: '14px' }}>We'll notify you when something important happens</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--secondary-100)',
                    background: notification.status === 'UNREAD' ? 'var(--primary-50)' : 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => {
                    if (notification.status === 'UNREAD') {
                      markAsRead(notification.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--secondary-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = notification.status === 'UNREAD' ? 'var(--primary-50)' : 'white';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      fontSize: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <div style={{
                          fontWeight: notification.status === 'UNREAD' ? '600' : '500',
                          color: 'var(--secondary-900)',
                          fontSize: '14px',
                          flex: 1
                        }}>
                          {notification.title}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: getPriorityColor(notification.priority),
                          fontWeight: '500'
                        }}>
                          {getPriorityIcon(notification.priority)}
                        </div>
                      </div>
                      <div style={{
                        color: 'var(--secondary-600)',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        marginBottom: '8px'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--secondary-500)'
                        }}>
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--secondary-400)',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--danger-500)';
                            e.target.style.backgroundColor = 'var(--danger-50)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = 'var(--secondary-400)';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--secondary-200)',
              background: 'var(--secondary-50)',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if you have one
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;