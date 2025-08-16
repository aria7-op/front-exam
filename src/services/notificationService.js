import api from './api';

// Notification API service
export const notificationAPI = {
  // Get user notifications (all notifications without pagination)
  getNotifications: (params = {}) => {
    const { read } = params;
    const queryParams = {};
    if (read !== undefined) queryParams.read = read;
    
    return api.get('/notifications', { params: queryParams });
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  // Get notification statistics
  getStats: () => {
    return api.get('/notifications/stats');
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get('/notifications/stats');
  }
};

export default notificationAPI;
