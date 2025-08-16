import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/socket/SocketContext';
import { API_BASE_URL } from '../config/api.config';
import socketService from '../services/socketService';
import PushNotificationService from '../services/pushNotificationService';
import { 
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiBookOpen, 
  FiBarChart, 
  FiUser, 
  FiTrendingUp, 
  FiAward,
  FiBell,
  FiSettings,
  FiSun,
  FiMoon,
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiVolume2,
  FiVolumeX,
  FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkModeOn, setDarkModeOn] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [privacyOn, setPrivacyOn] = useState(false);
  const [highContrastOn, setHighContrastOn] = useState(false);
  const [soundEffectsOn, setSoundEffectsOn] = useState(true);
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle responsive behavior - same as Admin121.jsx
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

  // WebSocket notifications integration
  useEffect(() => {
    if (user?.id && user?.role === 'STUDENT') {
      console.log('🔌 StudentLayout: Initializing socket service for user:', user.id);
      
      // Only connect if not already connected
      if (!socketService.isAlreadyConnected()) {
        socketService.connect(localStorage.getItem('token'), user.id, user.role);
      }

      // Fetch existing notifications from API
      const fetchNotifications = async () => {
        try {
          console.log('📡 Fetching existing notifications from API...');
          
          // Fetch all notifications with pagination
          let allNotifications = [];
          let page = 1;
          const limit = 100; // Fetch 100 at a time
          let hasMore = true;
          
          while (hasMore) {
            const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data.notifications) {
                const pageNotifications = data.data.notifications;
                allNotifications = [...allNotifications, ...pageNotifications];
                
                // Check if there are more pages
                hasMore = pageNotifications.length === limit;
                page++;
                
                console.log(`📄 Fetched page ${page-1}: ${pageNotifications.length} notifications`);
              } else {
                hasMore = false;
              }
            } else {
              console.log('❌ Failed to fetch notifications page:', response.status);
              hasMore = false;
            }
          }
          
          console.log(`✅ Loaded ${allNotifications.length} total notifications from API`);
          
          // Transform API notifications to match local format
          const apiNotifications = allNotifications.map(notification => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            createdAt: notification.createdAt,
            isRead: notification.status === 'READ',
            isGeneral: notification.type === 'SYSTEM_ANNOUNCEMENT' || notification.type === 'EXAM_REMINDER',
            isPersonal: notification.type === 'BOOKING_CONFIRMED' || notification.type === 'EXAM_COMPLETED' || notification.type === 'EXAM_STARTED' || notification.type === 'CERTIFICATE_READY' || notification.type === 'PAYMENT_SUCCESS',
            notificationType: notification.type,
            notificationData: notification.data || {}
          }));
          
          // Sort by creation date (newest first)
          apiNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setNotifications(apiNotifications);
          
          // Calculate unread count
          const unreadCount = apiNotifications.filter(n => !n.isRead).length;
          setUnreadCount(unreadCount);
          
          console.log(`📊 Unread notifications: ${unreadCount}`);
          
        } catch (error) {
          console.log('❌ Error fetching notifications:', error);
        }
      };

      // Fetch notifications immediately
      fetchNotifications();

      // Listen for new exam notifications (GENERAL - for all students)
      socketService.onNewExamAvailable((data) => {
        console.log('📚 New exam notification received in layout (general):', data);
        
        // Add to notifications list
        const newNotification = {
          id: Date.now() + Math.random(), // Ensure unique ID
          title: data.title || 'New Exam Available',
          message: data.message || 'A new exam has been made available for you.',
          type: 'info',
          isRead: false,
          createdAt: new Date(),
          examData: data.data,
          isGeneral: true, // Mark as general notification
          notificationType: data.type || 'NEW_EXAM_AVAILABLE'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.success(data.message || 'New exam available!', {
          duration: 8000,
          icon: '📚',
        });
      });

      // Add a connection status notification
      const connectionNotification = {
        id: Date.now(),
        title: '🔌 WebSocket Connected',
        message: 'Real-time notifications are now active. You will receive updates for new exams and personal notifications.',
        type: 'success',
        isRead: false,
        createdAt: new Date(),
        isGeneral: true
      };
      
      setNotifications(prev => [connectionNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Listen for personal notifications (for specific user)
      socketService.onNotificationReceived((data) => {
        console.log('🔔 Personal notification received in layout:', data);
        
        const newNotification = {
          id: Date.now(),
          title: data.title || 'Notification',
          message: data.message,
          type: data.type || 'info',
          isRead: false,
          createdAt: new Date(),
          isPersonal: true, // Mark as personal notification
          notificationData: data.data
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show push notification even when tab is not focused
        if (pushService && pushService.shouldShowNotifications()) {
          pushService.showBackgroundNotification(data.title, {
            body: data.message,
            icon: '/favicon.ico',
            tag: `notification-${data.id || Date.now()}`,
            data: data
          });
        }
      });

      return () => {
        console.log('🔌 StudentLayout: Cleaning up socket service');
        socketService.offNewExamAvailable();
        socketService.offNotificationReceived();
        // Don't cleanup here - let the service manage its own connection
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
      
      // Request permission immediately
      pushService.requestPermission().then((granted) => {
        if (granted) {
          console.log('✅ Push notification permission granted');
        } else {
          console.log('❌ Push notification permission denied');
        }
      });
      
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
        } else if (status.permission === 'default') {
          toast.info('Please allow push notifications when prompted to receive notifications in background.', {
            duration: 8000,
            icon: '🔔',
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


  const navigation = [
    { name: 'Dashboard', path: '/student', icon: <FiBarChart size={20} /> },
    { name: 'Available Tests', path: '/student/tests', icon: <FiFileText size={20} /> },
    { name: 'Test History', path: '/student/history', icon: <FiTrendingUp size={20} /> },
    { name: 'Certificates', path: '/student/certificates', icon: <FiAward size={20} /> },
    { name: 'Profile', path: '/student/profile', icon: <FiUser size={20} /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.path === location.pathname);
    return currentNav ? currentNav.name : 'Student Portal';
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
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile Sidebar Overlay - same pattern as Admin121.jsx */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiSettings style={{ color: 'var(--secondary-600)', fontSize: '1.5rem' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--secondary-800)' }}>Settings</span>
          </div>
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
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary-500)' }}>Configure your student portal preferences here.</p>
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

          {/* Push Notification Permission */}
          {notificationsOn && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.75rem', background: 'var(--success-50)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--success-300)', marginBottom: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiBell style={{ color: 'var(--success-600)', fontSize: '1.25rem' }} />
                <div>
                  <span style={{ color: 'var(--success-800)', fontWeight: 500, display: 'block' }}>Push Notifications</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-600)' }}>
                    Receive notifications even when tab is minimized
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const pushService = new PushNotificationService();
                  const granted = await pushService.requestPermission();
                  if (granted) {
                    toast.success('Push notifications enabled! You\'ll receive notifications in background.', {
                      duration: 5000,
                      icon: '🔔',
                    });
                  } else {
                    toast.error('Push notifications blocked. Please enable in browser settings.', {
                      duration: 8000,
                      icon: '⚠️',
                    });
                  }
                }}
                style={{
                  padding: '8px 16px',
                  background: 'var(--success-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--success-600)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--success-500)'}
              >
                Enable
              </button>
            </div>
          )}

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
        style={{ 
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto'
        }}
      >
        {/* Notifications Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--secondary-800)', 
              margin: 0 
            }}>
              Notifications {unreadCount > 0 && (
                <span style={{ 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  borderRadius: '9999px', 
                  padding: '4px 8px', 
                  fontSize: '0.75rem', 
                  marginLeft: '8px' 
                }}>
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={markAllNotificationsAsRead}
              style={{
                backgroundColor: 'var(--primary-500)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-600)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-500)'}
            >
              Mark All Read
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--secondary-600)' }}>
              {notifications.length} total notifications
            </span>
            <button
              onClick={() => setNotificationsOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--secondary-500)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-100)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              aria-label="Close notifications sidebar"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Notifications Content */}
        <div style={{ padding: '20px', paddingBottom: '40px' }}>
          {/* No Notifications */}
          {notifications.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: 'var(--secondary-500)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔔</div>
              <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--secondary-800)', marginBottom: '8px' }}>No notifications yet</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-500)' }}>You're all caught up! New notifications will appear here.</div>
            </div>
          )}

          {/* Dynamic Notifications - Show newest first */}
          {notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((notification) => {
            const getNotificationIcon = (notification) => {
              // Handle specific notification types first
              if (notification.isGeneral) {
                return {
                  icon: '📚',
                  label: 'New Exam',
                  color: '#3b82f6'
                };
              }

              if (notification.isPersonal) {
                // Handle personal notification types
                switch (notification.notificationType) {
                  case 'EXAM_REMINDER':
                    if (notification.notificationData?.reminderType === '5m' || notification.notificationData?.reminderType === '15m') {
                      return {
                        icon: '⏰',
                        label: 'Reminder',
                        color: '#f59e0b'
                      };
                    }
                    return {
                      icon: '📅',
                      label: 'Upcoming',
                      color: '#10b981'
                    };
                  case 'BOOKING_CONFIRMED':
                    return {
                      icon: '✅',
                      label: 'Confirmed',
                      color: '#10b981'
                    };
                  case 'EXAM_COMPLETED':
                    return {
                      icon: '🎓',
                      label: 'Completed',
                      color: '#8b5cf6'
                    };
                  case 'EXAM_STARTED':
                    return {
                      icon: '🚀',
                      label: 'Started',
                      color: '#3b82f6'
                    };
                  case 'CERTIFICATE_READY':
                    return {
                      icon: '🏆',
                      label: 'Certificate',
                      color: '#f59e0b'
                    };
                  case 'PAYMENT_SUCCESS':
                    return {
                      icon: '💰',
                      label: 'Payment',
                      color: '#10b981'
                    };
                  default:
                    return {
                      icon: '🔔',
                      label: 'Notification',
                      color: '#6b7280'
                    };
                }
              }

              // Default fallback
              return {
                icon: '🔔',
                label: 'Notification'
              };
            };

            const iconInfo = getNotificationIcon(notification);

            return (
              <div
                key={notification.id}
                onClick={() => markNotificationAsRead(notification.id)}
                className={`notification-item cursor-pointer transition-all duration-200 rounded-lg p-4 mb-3 border-l-4 ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                }`}
                style={{ 
                  borderLeftColor: notification.isRead ? '#d1d5db' : '#3b82f6',
                  marginBottom: '20px', // Increased margin bottom
                  boxShadow: notification.isRead ? '0 1px 3px rgba(0,0,0,0.1)' : '0 2px 8px rgba(59,130,246,0.15)',
                  border: '1px solid',
                  borderColor: notification.isRead ? '#e5e7eb' : '#dbeafe'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {iconInfo.icon}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '4px' 
                    }}>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        color: notification.isRead ? 'var(--secondary-600)' : 'var(--secondary-900)'
                      }}>
                        {notification.title}
                      </span>
                      
                      {!notification.isRead && (
                        <span style={{ 
                          backgroundColor: '#ef4444', 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: notification.isRead ? 'var(--secondary-500)' : 'var(--secondary-700)',
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {notification.message}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--secondary-500)' 
                      }}>
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      
                      {iconInfo.label && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          backgroundColor: iconInfo.color + '20', 
                          color: iconInfo.color, 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {iconInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with View All Button */}
        {notifications.length > 0 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            textAlign: 'center',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
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
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 
        ${sidebarCollapsed && !isMobile ? 'w-20' : 'w-86'} 
        lg:relative lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-all duration-300 ease-in-out
        bg-gradient-to-b from-gray-800 to-gray-700 text-white h-screen overflow-y-auto shadow-2xl border-r border-gray-600
        scrollbar-thin scrollbar-track-white scrollbar-track-opacity-10 scrollbar-thumb-white scrollbar-thumb-opacity-30 hover:scrollbar-thumb-opacity-50
      `}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-600">
          <div className="flex items-center gap-3 sm:gap-4" style={{
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xl sm:text-2xl text-white flex-shrink-0">
              <FiBookOpen size={20} className="sm:w-6 sm:h-6" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  MockTest Pro
                </div>
                <div className="text-xs sm:text-sm text-gray-200 mt-0.5">
                  Student Portal
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-4 sm:py-6">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (isMobile) {
                  setSidebarOpen(false);
                }
              }}
              className={({ isActive }) => 
                `block px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-300 no-underline transition-all duration-300 ease-in-out border-l-4 border-l-transparent text-sm sm:text-base font-medium relative overflow-hidden hover:bg-gray-600 hover:text-white hover:border-l-gray-400
                ${isActive ? 'bg-gray-600 text-white border-l-gray-400' : ''}`
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarCollapsed ? '0' : '16px',
                padding: sidebarCollapsed ? '16px 12px' : '16px 32px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              }}
              title={sidebarCollapsed ? item.name : ''}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.name}</span>}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-10 to-transparent transform -translate-x-full transition-transform duration-500 ease-in-out group-hover:translate-x-full"></div>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-600 bg-gradient-to-t from-gray-800 to-transparent" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* User Profile - Clickable */}
          <button
            onClick={() => navigate('/student/profile')}
            className="w-full flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm border-none cursor-pointer transition-all duration-300 ease-in-out text-white text-left hover:bg-white hover:bg-opacity-20"
            style={{
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '8px' : '12px 16px'
            }}
          >
            <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0" style={{
              width: sidebarCollapsed ? '24px' : '32px',
              height: sidebarCollapsed ? '24px' : '32px',
              fontSize: sidebarCollapsed ? '12px' : '14px'
            }}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'S'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.email || 'Student User')}
                </div>
                <div className="text-xs text-gray-800 truncate">
                  Student
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="text-xs text-gray-300 flex-shrink-0">
                <FiUser size={12} />
              </div>
            )}
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="border-none rounded-xl bg-red-500 bg-opacity-20 text-white text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 mx-auto hover:bg-red-500 hover:bg-opacity-30"
            style={{
              width: sidebarCollapsed ? '32px' : 'auto',
              minWidth: sidebarCollapsed ? '32px' : '120px',
              height: sidebarCollapsed ? '32px' : 'auto',
              padding: sidebarCollapsed ? '8px' : '12px 16px'
            }}
          >
            <FiLogOut size={sidebarCollapsed ? 16 : 14} className="sm:w-4 sm:h-4" />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-200 px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-6 lg:py-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 shadow-md backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
            {/* Mobile Menu Button - Only show on mobile/tablet - same as Admin121.jsx */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out text-base sm:text-lg hover:border-green-500 hover:scale-105 hover:bg-gray-50"
              >
                <FiMenu size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}

            {/* Desktop Collapse Button - Only show on desktop - same as Admin121.jsx */}
            {!isMobile && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out text-lg hover:border-green-500 hover:scale-105 hover:bg-gray-50"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="transition-transform duration-300"
                  style={{ 
                    transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 bg-gradient-to-r from-green-600 to-gray-700 bg-clip-text text-transparent m-0 truncate">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 font-medium">
                Your learning journey continues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            {/* Notifications */}
            <button 
              onClick={() => setNotificationsOpen(true)}
              className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border-2 border-gray-300 bg-white items-center justify-center cursor-pointer transition-all duration-300 ease-in-out text-base sm:text-lg lg:text-xl relative hover:border-green-500 hover:scale-105"
            >
              <FiBell size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-0.5 sm:top-1 lg:top-2 right-0.5 sm:right-1 lg:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 rounded-full bg-red-500 border-2 border-white"></div>
              )}
            </button>

            {/* Settings */}
            <button 
              onClick={() => setSettingsOpen(true)}
              className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border-2 border-gray-300 bg-white items-center justify-center cursor-pointer transition-all duration-300 ease-in-out text-base sm:text-lg lg:text-xl hover:border-green-500 hover:scale-105"
            >
              <FiSettings size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button - same pattern as Admin121.jsx */}
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
                // Add notifications functionality here
              }}
            >
              <div className="relative">
                <FiBell size={20} style={{ color: 'var(--secondary-700)' }} />
                <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold px-1">3</span>
                </div>
              </div>
            </button>
            {/* Profile Button */}
            <button 
              className="flex items-center justify-center w-12 h-12 rounded-full shadow-xl border-2 hover:shadow-2xl transition-all duration-200"
              style={{ 
                fontSize: 18,
                background: 'var(--secondary-50)',
                borderColor: 'var(--secondary-300)'
              }}
              onClick={() => {
                setFabMenuOpen(false);
                navigate('/student/profile');
              }}
            >
              <FiUser size={20} style={{ color: 'var(--secondary-700)' }} />
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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-track-white::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .scrollbar-thumb-white::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thumb-opacity-30::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
        }
        .scrollbar-thumb-opacity-50:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
        }
        .scrollbar-track-gray-200::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .scrollbar-thumb-gray-500:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default StudentLayout; 