import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/socket/SocketContext';
import socketService from '../services/socketService';
import PushNotificationService from '../services/pushNotificationService';
import { notificationAPI } from '../services/notificationService';
import toast from 'react-hot-toast';
import { 
  FiTarget, 
  FiMenu, 
  FiBell, 
  FiSettings, 
  FiUser, 
  FiLogOut,
  FiBarChart2,
  FiBook,
  FiFileText,
  FiHelpCircle,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiSettings as FiSettingsIcon,
  FiLock,
  FiMoon,
  FiSun,
  FiVolume2,
  FiVolumeX,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiAward
} from 'react-icons/fi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkModeOn, setDarkModeOn] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [privacyOn, setPrivacyOn] = useState(false);
  const [highContrastOn, setHighContrastOn] = useState(false);
  const [soundEffectsOn, setSoundEffectsOn] = useState(true);
  const [language, setLanguage] = useState('English');
  const [isMobile, setIsMobile] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin, isAdmin } = useAuth(); 

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setShowFab(window.innerHeight < window.innerWidth * 0.5); // Show FAB when height is less than half of width
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
        setSidebarCollapsed(false); // Reset collapse state on mobile
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize theme from saved preference or system setting
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setDarkModeOn(storedTheme === 'dark');
        return;
      }
    } catch {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkModeOn(prefersDark);
  }, []);

  // Apply/remove global dark class and persist preference
  useEffect(() => {
    const rootEl = document.documentElement;
    if (darkModeOn) {
      rootEl.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      rootEl.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  }, [darkModeOn]);

  // Initialize socket connection and notifications
  useEffect(() => {
    if (user) {
      // Connect to socket
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token, user.id, user.role);
      }

      // Fetch initial notifications with delay to avoid immediate errors
      const initializeNotifications = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        fetchNotifications();
        fetchUnreadCount();
      };
      
      initializeNotifications();

      // Set up real-time notification listener
      const handleNotification = (notification) => {
        // Add new notification to the list
        setNotifications(prev => Array.isArray(prev) ? [notification, ...prev] : [notification]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        showToast(notification.title, notification.message, notification.type);
      };

      // Listen for real-time notifications
      if (socketService.socket) {
        socketService.socket.on('notification', handleNotification);
      }

      return () => {
        // Clean up socket listeners
        if (socketService.socket) {
          socketService.socket.off('notification', handleNotification);
        }
      };
    }
  }, [user]);

  // Push Notification Service Integration
  useEffect(() => {
    const pushService = new PushNotificationService();
    
    if (notificationsOn) {
      console.log('🔔 Enabling push notifications...');
      // Update the push service settings and auto-request permission
      pushService.updateSettingsState(true);
      
      // Check if permission was granted
      setTimeout(() => {
        const status = pushService.getStatus();
        console.log('📱 Push notification status:', status);
        
        if (status.canShow) {
          toast.success('Push notifications enabled! You\'ll receive notifications even when the tab is not active.', {
            duration: 5000,
            icon: '🔔',
          });
        } else if (status.permission === 'denied') {
          toast.error('Push notifications blocked. Please enable them in your browser settings.', {
            duration: 8000,
            icon: '⚠️',
          });
        }
      }, 1000);
    } else {
      console.log('🔕 Disabling push notifications...');
      // Disable push notifications
      pushService.updateSettingsState(false);
      toast.info('Push notifications disabled.', {
        duration: 3000,
        icon: '🔕',
      });
    }
  }, [notificationsOn]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await notificationAPI.getNotifications();
      console.log('Notifications API response:', response.data); // Debug log
      
      if (response.data?.success) {
        // Handle nested response structure: response.data.data.notifications
        const notificationsData = response.data.data?.notifications || response.data.data || [];
        console.log('Parsed notifications data:', notificationsData); // Debug log
        // Ensure we have an array
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If API endpoint doesn't exist (404), just set empty array silently
      if (error.response?.status === 404) {
        console.log('Notifications API endpoint not found, using empty array');
      }
      setNotifications([]); // Set empty array on error
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      console.log('Unread count API response:', response.data); // Debug log
      
      if (response.data?.success) {
        // Handle nested response structure: response.data.data.unreadCount
        const unreadCount = response.data.data?.data?.unreadCount || response.data.data?.unreadCount || 0;
        console.log('Parsed unread count:', unreadCount); // Debug log
        setUnreadCount(unreadCount);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // If API endpoint doesn't exist (404), just set 0 silently
      if (error.response?.status === 404) {
        console.log('Notifications stats API endpoint not found, using 0');
      }
      setUnreadCount(0); // Set 0 on error
    }
  };

  // Show toast notification
  const showToast = (title, message, type = 'info') => {
    const toastMessage = title ? `${title}: ${message}` : message;
    
    switch (type) {
      case 'success':
        toast.success(toastMessage);
        break;
      case 'error':
        toast.error(toastMessage);
        break;
      case 'warning':
        toast(toastMessage, { icon: '⚠️' });
        break;
      default:
        toast(toastMessage, { icon: '🔔' });
        break;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        ) : []
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to mark notification as read');
      }
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notification => ({ ...notification, isRead: true })) : []
      );
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to mark notifications as read');
      }
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: FiBarChart2, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { name: 'Categories', path: '/admin/categories', icon: FiBook, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'], disabledFor: ['MODERATOR'] },
    { name: 'Tests', path: '/admin/tests', icon: FiFileText, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'], disabledFor: ['MODERATOR'] },
    { name: 'Questions', path: '/admin/questions', icon: FiHelpCircle, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { name: 'Users', path: '/admin/users', icon: FiUsers, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { name: 'Test Bookings', path: '/admin/bookings', icon: FiCalendar, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { name: 'Certificates', path: '/admin/certificates', icon: FiAward , roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'], disabledFor: ['MODERATOR'] },
    { name: 'Reports', path: '/admin/reports', icon: FiTrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'], disabledFor: ['MODERATOR'] },
    { name: 'Settings', path: '/admin/settings', icon: FiSettingsIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'], disabledFor: ['MODERATOR'] }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.path === location.pathname);
    return currentNav ? currentNav.name : 'Admin Panel';
  };

  return (
    <div className="admin-layout flex h-screen">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Settings Sidebar Backdrop */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSettingsOpen(false)}
        ></div>
      )}
      {/* Settings Sidebar (Drawer) */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${settingsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--secondary-300)', background: 'linear-gradient(to right, var(--secondary-100), var(--secondary-50))', padding: '24px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--secondary-800)' }}>Settings</span>
          <button
            style={{ color: 'var(--secondary-500)', padding: '8px', borderRadius: '9999px', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setSettingsOpen(false)}
            aria-label="Close settings sidebar"
          >
            <svg style={{ height: '24px', width: '24px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ background: 'var(--secondary-100)', height: '100%', overflowY: 'auto', padding: '24px' }}>
          {/* General Settings */}
          <div style={{ color: 'var(--secondary-600)', background: 'var(--secondary-50)', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '24px', padding: '16px' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--secondary-800)', marginBottom: '8px' }}>General Settings</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary-500)' }}>Configure your application preferences here.</p>
          </div>
          {/* Dark Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--secondary-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {darkModeOn ? <FiMoon style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }} /> : <FiSun style={{ color: 'var(--warning-500)', fontSize: '1.25rem' }} />}
              <span style={{ color: 'var(--secondary-800)', fontWeight: 500 }}>Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkModeOn(!darkModeOn)}
              style={{ position: 'relative', width: '64px', height: '32px', borderRadius: '9999px', padding: '4px', display: 'flex', alignItems: 'center', background: darkModeOn ? 'linear-gradient(to right, var(--primary-500), var(--primary-600))' : 'linear-gradient(to right, var(--secondary-300), var(--secondary-200))', border: 'none', boxShadow: darkModeOn ? '0 2px 8px var(--primary-200)' : 'var(--shadow-sm)', transition: 'all 0.3s' }}
            >
              <div style={{ background: 'var(--secondary-50)', width: '24px', height: '24px', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)', transform: darkModeOn ? 'translateX(32px)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                {darkModeOn ? <FiMoon style={{ color: 'var(--primary-600)', fontSize: '1rem' }} /> : <FiSun style={{ color: 'var(--warning-500)', fontSize: '1rem' }} />}
              </div>
            </button>
          </div>
          {/* Notifications Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--secondary-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiBell style={{ color: 'var(--success-600)', fontSize: '1.25rem' }} />
              <span style={{ color: 'var(--secondary-800)', fontWeight: 500 }}>Notifications</span>
            </div>
            <button
              onClick={() => setNotificationsOn(!notificationsOn)}
              style={{ position: 'relative', width: '64px', height: '32px', borderRadius: '9999px', padding: '4px', display: 'flex', alignItems: 'center', background: notificationsOn ? 'linear-gradient(to right, var(--success-500), var(--success-600))' : 'linear-gradient(to right, var(--secondary-300), var(--secondary-200))', border: 'none', boxShadow: notificationsOn ? '0 2px 8px var(--success-200)' : 'var(--shadow-sm)', transition: 'all 0.3s' }}
            >
              <div style={{ background: 'var(--secondary-50)', width: '24px', height: '24px', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)', transform: notificationsOn ? 'translateX(32px)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <FiBell style={{ color: 'var(--success-600)', fontSize: '1rem' }} />
              </div>
            </button>
          </div>
          {/* Language Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--secondary-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiGlobe style={{ color: 'var(--purple-600)', fontSize: '1.25rem' }} />
              <span style={{ color: 'var(--secondary-800)', fontWeight: 500 }}>Language</span>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '4px 12px', border: '1px solid var(--secondary-400)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none', background: 'var(--secondary-50)', color: 'var(--secondary-800)' }}>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          {/* Privacy Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--secondary-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiEyeOff style={{ color: 'var(--danger-600)', fontSize: '1.25rem' }} />
              <span style={{ color: 'var(--secondary-800)', fontWeight: 500 }}>Privacy Mode</span>
            </div>
            <button
              onClick={() => setPrivacyOn(!privacyOn)}
              style={{ position: 'relative', width: '64px', height: '32px', borderRadius: '9999px', padding: '4px', display: 'flex', alignItems: 'center', background: privacyOn ? 'linear-gradient(to right, var(--danger-500), var(--danger-600))' : 'linear-gradient(to right, var(--secondary-300), var(--secondary-200))', border: 'none', boxShadow: privacyOn ? '0 2px 8px var(--danger-200)' : 'var(--shadow-sm)', transition: 'all 0.3s' }}
            >
              <div style={{ background: 'var(--secondary-50)', width: '24px', height: '24px', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)', transform: privacyOn ? 'translateX(32px)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <FiEyeOff style={{ color: 'var(--danger-600)', fontSize: '1rem' }} />
              </div>
            </button>
          </div>
          {/* High Contrast Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--secondary-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiEye style={{ color: 'var(--warning-600)', fontSize: '1.25rem' }} />
              <span style={{ color: 'var(--secondary-800)', fontWeight: 500 }}>High Contrast</span>
            </div>
            <button
              onClick={() => setHighContrastOn(!highContrastOn)}
              style={{ position: 'relative', width: '64px', height: '32px', borderRadius: '9999px', padding: '4px', display: 'flex', alignItems: 'center', background: highContrastOn ? 'linear-gradient(to right, var(--warning-500), var(--warning-600))' : 'linear-gradient(to right, var(--secondary-300), var(--secondary-200))', border: 'none', boxShadow: highContrastOn ? '0 2px 8px var(--warning-200)' : 'var(--shadow-sm)', transition: 'all 0.3s' }}
            >
              <div style={{ background: 'var(--secondary-50)', width: '24px', height: '24px', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)', transform: highContrastOn ? 'translateX(32px)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <FiEye style={{ color: 'var(--warning-600)', fontSize: '1rem' }} />
              </div>
            </button>
          </div>
          {/* Sound Effects Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--secondary-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {soundEffectsOn ? <FiVolume2 style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }} /> : <FiVolumeX style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }} />}
              <span style={{ color: 'var(--secondary-800)', fontWeight: 500 }}>Sound Effects</span>
            </div>
            <button
              onClick={() => setSoundEffectsOn(!soundEffectsOn)}
              style={{ position: 'relative', width: '64px', height: '32px', borderRadius: '9999px', padding: '4px', display: 'flex', alignItems: 'center', background: soundEffectsOn ? 'linear-gradient(to right, var(--primary-500), var(--primary-600))' : 'linear-gradient(to right, var(--secondary-300), var(--secondary-200))', border: 'none', boxShadow: soundEffectsOn ? '0 2px 8px var(--primary-200)' : 'var(--shadow-sm)', transition: 'all 0.3s' }}
            >
              <div style={{ background: 'var(--secondary-50)', width: '24px', height: '24px', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)', transform: soundEffectsOn ? 'translateX(32px)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                {soundEffectsOn ? <FiVolume2 style={{ color: 'var(--primary-600)', fontSize: '1rem' }} /> : <FiVolumeX style={{ color: 'var(--primary-600)', fontSize: '1rem' }} />}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Notifications Sidebar Backdrop */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-50 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setNotificationsOpen(false)}
        ></div>
      )}
      {/* Notifications Sidebar (Drawer) */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${notificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--secondary-300)', background: 'linear-gradient(to right, var(--secondary-100), var(--secondary-50))', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiBell style={{ color: 'var(--success-600)', fontSize: '1.5rem' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--secondary-800)' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{ 
                color: 'var(--secondary-500)', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                background: 'var(--secondary-100)', 
                border: '1px solid var(--secondary-400)', 
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
              onClick={() => {
                fetchNotifications();
                fetchUnreadCount();
              }}
              title="Refresh notifications"
            >
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                style={{ 
                  color: 'var(--success-600)', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  background: 'var(--success-50)', 
                  border: '1px solid var(--success-600)', 
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
            <button
              style={{ color: 'var(--secondary-500)', padding: '8px', borderRadius: '9999px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setNotificationsOpen(false)}
              aria-label="Close notifications sidebar"
            >
              <svg style={{ height: '24px', width: '24px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ background: 'var(--secondary-100)', height: '100%', overflowY: 'auto', padding: '24px' }}>
          {/* Notifications Header */}
          <div style={{ color: 'var(--secondary-600)', background: 'var(--secondary-50)', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--secondary-300)', marginBottom: '24px', padding: '16px' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--secondary-800)', marginBottom: '8px' }}>Recent Notifications</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary-500)' }}>Stay updated with the latest activities and alerts.</p>
          </div>
          
          {/* Loading State */}
          {notificationsLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-500)' }}>Loading notifications...</div>
            </div>
          )}
          
          {/* No Notifications */}
          {!notificationsLoading && notifications.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
              <FiBell style={{ fontSize: '3rem', color: 'var(--secondary-400)', marginBottom: '16px' }} />
              <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--secondary-800)', marginBottom: '8px' }}>No notifications yet</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-500)' }}>You're all caught up! New notifications will appear here.</div>
            </div>
          )}
          
          {/* Dynamic Notifications - Show newest first */}
          {!notificationsLoading && Array.isArray(notifications) && notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((notification) => {
            const getNotificationIcon = (type) => {
              switch (type) {
                case 'USER_REGISTERED':
                case 'success':
                  return { icon: FiUsers, gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' };
                case 'SYSTEM_ALERT':
                case 'error':
                  return { icon: FiFileText, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' };
                case 'EXAM_REMINDER':
                case 'warning':
                  return { icon: FiBarChart2, gradient: 'linear-gradient(135deg, #f59e42, #ea580c)' };
                case 'CERTIFICATE_READY':
                  return { icon: FiFileText, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' };
                case 'PAYMENT_SUCCESS':
                  return { icon: FiUsers, gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' };
                case 'EMAIL_VERIFIED':
                  return { icon: FiBell, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' };
                case 'info':
                default:
                  return { icon: FiBell, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' };
              }
            };

            const getNotificationTitle = (type) => {
              switch (type) {
                case 'USER_REGISTERED':
                  return 'New User Registration';
                case 'SYSTEM_ALERT':
                  return 'System Alert';
                case 'EXAM_REMINDER':
                  return 'Exam Reminder';
                case 'CERTIFICATE_READY':
                  return 'Certificate Ready';
                case 'PAYMENT_SUCCESS':
                  return 'Payment Successful';
                case 'EMAIL_VERIFIED':
                  return 'Email Verified';
                default:
                  return 'Notification';
              }
            };

            const getNotificationMessage = (type) => {
              switch (type) {
                case 'USER_REGISTERED':
                  return 'A new user has registered on the platform.';
                case 'SYSTEM_ALERT':
                  return 'System maintenance or important update.';
                case 'EXAM_REMINDER':
                  return 'You have an upcoming exam scheduled.';
                case 'CERTIFICATE_READY':
                  return 'Your certificate is ready for download.';
                case 'PAYMENT_SUCCESS':
                  return 'Payment has been processed successfully.';
                case 'EMAIL_VERIFIED':
                  return 'Email address has been verified.';
                default:
                  return 'You have a new notification.';
              }
            };

            const getTimeAgo = (timestamp) => {
              const now = new Date();
              const notificationTime = new Date(timestamp);
              const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
              
              if (diffInMinutes < 1) return 'Just now';
              if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
              
              const diffInHours = Math.floor(diffInMinutes / 60);
              if (diffInHours < 24) return `${diffInHours} hours ago`;
              
              const diffInDays = Math.floor(diffInHours / 24);
              return `${diffInDays} days ago`;
            };

            const { icon: IconComponent, gradient } = getNotificationIcon(notification.type);
            
            return (
              <div 
                key={notification.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  borderRadius: '0.75rem', 
                  background: notification.isRead ? 'var(--secondary-50)' : 'var(--primary-50)', 
                  boxShadow: 'var(--shadow-sm)', 
                  border: notification.isRead ? '1px solid var(--secondary-300)' : '1px solid var(--primary-300)', 
                  marginBottom: '20px', // Increased margin bottom
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: gradient, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComponent style={{ color: 'white', fontSize: '1.25rem' }} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: notification.isRead ? '500' : '600', 
                    color: 'var(--secondary-900)', 
                    marginBottom: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {getNotificationTitle(notification.type)}
                  </div>
                  <div style={{ 
                    color: 'var(--secondary-600)', 
                    fontSize: '0.75rem', 
                    lineHeight: '1.4',
                    marginBottom: '8px'
                  }}>
                    {getNotificationMessage(notification.type)}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--secondary-500)' 
                  }}>
                    {getTimeAgo(notification.createdAt)}
                  </div>
                </div>
                
                {!notification.isRead && (
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--primary-500)',
                    flexShrink: 0
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with View All Button */}
        {!notificationsLoading && notifications.length > 0 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid var(--secondary-300)',
            backgroundColor: 'var(--secondary-50)',
            textAlign: 'center'
          }}>
            <button
              onClick={() => {
                setNotificationsOpen(false);
                // Navigate to a dedicated notifications page or show expanded view
                // For now, we'll just close the sidebar
              }}
              style={{
                backgroundColor: 'var(--primary-500)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-600)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary-500)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📋 View All Notifications
            </button>
          </div>
        )}
      </div>
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''} fixed inset-y-0 left-0 z-30 ${sidebarCollapsed && !isMobile ? 'w-20' : 'w-64'} lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo" style={{
            display: 'flex',
            alignItems: 'center',
            gap: sidebarCollapsed ? '0' : '12px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              flexShrink: 0
            }}>
              <FiTarget size={24} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                  MockTest Pro
                </div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-300)', marginTop: '2px' }}>
                  Admin Panel
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navigation
            .filter(item => !item.roles || item.roles.includes(user?.role))
            .map((item) => {
              const isDisabled = item.disabledFor && item.disabledFor.includes(user?.role);
              return (
                <div
                  key={item.name}
                  style={{
                    position: 'relative',
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  title={isDisabled ? 'Access restricted for your role' : (sidebarCollapsed ? item.name : '')}
                >
                  <NavLink
                    to={isDisabled ? '#' : item.path}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        return false;
                      }
                      if (isMobile) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={({ isActive }) => 
                      `admin-nav-item ${isActive ? 'active' : ''}`
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarCollapsed ? '0' : '16px',
                      padding: sidebarCollapsed ? '16px 12px' : '16px 32px',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      color: isDisabled ? 'var(--secondary-500)' : 'var(--secondary-300)',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      borderLeft: '4px solid transparent',
                      fontSize: '16px',
                      fontWeight: '500',
                      position: 'relative',
                      overflow: 'hidden',
                      pointerEvents: isDisabled ? 'none' : 'auto'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {React.createElement(item.icon, { size: 20 })}
                    </span>
                    {!sidebarCollapsed && <span>{item.name}</span>}
                    {isDisabled && !sidebarCollapsed && (
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--secondary-500)',
                        marginLeft: 'auto'
                      }}>
                        <FiLock size={12} />
                      </span>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.5s ease'
                    }}></div>
                  </NavLink>
                </div>
              );
            })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: sidebarCollapsed ? '24px 12px' : '24px 32px',
          borderTop: '1px solid var(--secondary-700)',
          background: 'linear-gradient(180deg, transparent, var(--secondary-800))',
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* User Profile - Clickable */}
          <button
            onClick={() => navigate('/admin/profile')}
            style={{
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? '0' : '12px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: 'white',
              textAlign: 'left',
              boxSizing: 'border-box',
              overflow: 'hidden',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'white',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-300)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.role}
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <div style={{ fontSize: '12px', color: 'var(--secondary-300)', flexShrink: 0 }}>
                <FiUser size={12} />
              </div>
            )}
          </button>
          
          {/* Logout Button - Fixed width */}
          <button
            onClick={handleLogout}
            style={{
              width: sidebarCollapsed ? '40px' : 'auto',
              minWidth: sidebarCollapsed ? '40px' : '120px',
              height: sidebarCollapsed ? '40px' : 'auto',
              padding: sidebarCollapsed ? '12px' : '12px 16px',
              border: 'none',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <FiLogOut size={16} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
        <div className={`admin-main flex flex-1 flex-col overflow-hidden ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
          <header
            className="sticky top-0 z-30 flex items-center shadow-sm"
            style={{ minHeight: '64px', padding: '0 12px', gap: '8px', background: 'var(--secondary-50)', borderBottom: '1px solid var(--secondary-200)' }}
          >
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0 flex-1">
            {/* Mobile Menu Button - Only show on mobile/tablet */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex-shrink-0"
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                  border: '2px solid var(--secondary-300)',
                  background: 'var(--secondary-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '20px'
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
                  <FiMenu size={16} />
              </button>
            )}

            {/* Desktop Collapse Button - Only show on desktop */}
            {!isMobile && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '2px solid var(--secondary-300)',
                background: 'var(--secondary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '20px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary-500)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--secondary-300)';
                e.target.style.transform = 'scale(1)';
              }}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ 
                  transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            )}
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl xl:text-2xl truncate" style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: 'var(--secondary-900)', 
                margin: 0,
                background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-700))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {getPageTitle()}
              </h1>
                <p className="text-xs text-gray-600 sm:text-sm hidden sm:block" style={{ 
                fontSize: '14px', 
                color: 'var(--secondary-600)', 
                margin: '4px 0 0 0',
                fontWeight: '500'
              }}>
                Manage your mock test platform
              </p>
            </div>
          </div>

                        {/* Header icons section: */}
          <div className={`flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0 ${isMobile ? 'hidden' : 'flex'} lg:flex`}>
            {/* Notifications */}
              <button 
                className="relative flex-shrink-0" 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
              border: '2px solid var(--secondary-300)',
              background: 'var(--secondary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '20px',
                  position: 'relative',
                  zIndex: 1
                }}
                onClick={() => setNotificationsOpen(true)}
              >
                <FiBell size={16} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--danger-500)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid var(--secondary-50)',
                    zIndex: 2
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
            </button>

            {/* Settings */}
              <button 
                className="flex-shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
              border: '2px solid var(--secondary-300)',
              background: 'var(--secondary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
                  fontSize: '20px',
                  zIndex: 1
                }}
                onClick={() => setSettingsOpen(true)}
              >
                <FiSettings size={16} />
            </button>
          </div>
            {/* Mobile right-side icon */}
            {isMobile && (
              <div className="flex items-center lg:hidden ml-2" style={{ marginRight: 8 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <FiUser size={20} />
                </div>
              </div>
            )}
        </header>

        {/* Main Content Area */}
          <main className="admin-content flex-1 overflow-auto p-4 lg:p-6 relative" style={{ background: 'var(--secondary-100)' }}>
          <Outlet />
        </main>
      </div>

        {/* Floating Action Button */}
        {isMobile && (
  <div className="fixed bottom-6 left-6 z-50 lg:hidden">
    {/* FAB Menu Backdrop */}
    {fabMenuOpen && (
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={() => setFabMenuOpen(false)}
      />
    )}
    {/* FAB Menu Items (iOS style popout) */}
    <div className={`absolute bottom-20 left-0 flex flex-col items-start gap-4 transition-all duration-300 ${fabMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}
      style={{ zIndex: 50 }}
    >
      {/* Notifications Button */}
      <button 
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-xl border-2 hover:shadow-2xl transition-all duration-200"
        style={{ 
          fontSize: 18,
          background: 'var(--secondary-50)',
          borderColor: 'var(--secondary-300)'
        }}
        onClick={() => {
          setFabMenuOpen(false);
          setNotificationsOpen(true);
        }}
      >
        <div className="relative">
          <FiBell size={20} style={{ color: 'var(--secondary-700)' }} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </button>
      {/* Settings Button */}
      <button 
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-xl border-2 hover:shadow-2xl transition-all duration-200"
        style={{ 
          fontSize: 18,
          background: 'var(--secondary-50)',
          borderColor: 'var(--secondary-300)'
        }}
        onClick={() => {
          setFabMenuOpen(false);
          setSettingsOpen(true);
        }}
      >
        <FiSettings size={20} style={{ color: 'var(--secondary-700)' }} />
      </button>
    </div>
    {/* Main FAB Button */}
    <button 
      className={`flex items-center justify-center w-12 h-12 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${fabMenuOpen ? 'rotate-45' : ''}`}
      style={{ 
        fontSize: 22,
        background: fabMenuOpen ? 'var(--danger-500)' : 'var(--primary-600)'
      }}
      onClick={() => setFabMenuOpen(!fabMenuOpen)}
    >
      <svg 
        className="w-5 h-5 text-white transition-transform duration-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>
  </div>
)}
    </div>
  );
};

export default AdminLayout; 