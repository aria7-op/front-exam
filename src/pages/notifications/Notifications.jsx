import React, { useState } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Attendance Reminder',
      message: 'Please check in for today\'s work session.',
      type: 'info',
      timestamp: '2024-01-15T10:30:00Z',
      read: false
    },
    {
      id: 2,
      title: 'Task Completed',
      message: 'Project documentation has been completed successfully.',
      type: 'success',
      timestamp: '2024-01-15T09:15:00Z',
      read: true
    },
    {
      id: 3,
      title: 'System Alert',
      message: 'High CPU usage detected on server.',
      type: 'warning',
      timestamp: '2024-01-15T08:45:00Z',
      read: false
    },
    {
      id: 4,
      title: 'New User Added',
      message: 'Jane Smith has been added to the Engineering department.',
      type: 'info',
      timestamp: '2024-01-14T16:20:00Z',
      read: true
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id) => {
    // Remove notification from state
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Notifications</h1>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              All Notifications ({notifications.length})
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No notifications found.
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 