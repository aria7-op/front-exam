import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useSocket } from '../../contexts/socket/SocketContext';
import { API_BASE_URL } from '../../config/api.config';

export const useNotifications = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch all notifications with pagination
      let allNotifications = [];
      let page = 1;
      const limit = 50; // Fetch 50 at a time
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const pageNotifications = data.data.notifications || [];
          
          if (pageNotifications.length > 0) {
            allNotifications = [...allNotifications, ...pageNotifications];
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      // Sort notifications by creation date (newest first)
      const sortedNotifications = allNotifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch notification stats
  const fetchNotificationStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unread || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, status: 'READ' } 
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, status: 'READ' }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification && notification.status === 'UNREAD' ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

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
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, user?.id]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchNotificationStats();
    }
  }, [user?.id, fetchNotifications, fetchNotificationStats]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchNotificationStats,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}; 