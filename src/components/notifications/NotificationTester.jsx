import React, { useState } from 'react';
import { useNotifications } from '../../hooks/notifications/useNotifications';

const NotificationTester = () => {
  const { sendTestNotification } = useNotifications();
  const [loading, setLoading] = useState(false);

  const testNotifications = [
    {
      title: '🎉 Welcome Test',
      message: 'Testing user registration notification',
      type: 'USER_REGISTERED',
      priority: 'normal'
    },
    {
      title: '📅 Booking Confirmed',
      message: 'Your exam booking has been confirmed for tomorrow',
      type: 'BOOKING_CONFIRMED',
      priority: 'normal'
    },
    {
      title: '💳 Payment Success',
      message: 'Payment of $29.99 has been processed successfully',
      type: 'PAYMENT_SUCCESS',
      priority: 'normal'
    },
    {
      title: '🎯 Exam Completed',
      message: 'You scored 85% on JavaScript Fundamentals. Congratulations!',
      type: 'EXAM_COMPLETED',
      priority: 'high'
    },
    {
      title: '🚨 System Alert',
      message: 'System maintenance scheduled for tonight at 2 AM UTC',
      type: 'SYSTEM_ALERT',
      priority: 'urgent'
    },
    {
      title: '🏆 Certificate Ready',
      message: 'Your certificate for React Fundamentals is now available',
      type: 'CERTIFICATE_READY',
      priority: 'high'
    }
  ];

  const sendTest = async (testNotification) => {
    try {
      setLoading(true);
      const result = await sendTestNotification(testNotification);
      if (result) {
        console.log('✅ Test notification sent:', result);
      } else {
        console.error('❌ Failed to send test notification');
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid var(--secondary-200)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--secondary-900)',
        margin: '0 0 16px 0'
      }}>
        🧪 Notification System Tester
      </h2>
      
      <p style={{
        fontSize: '14px',
        color: 'var(--secondary-600)',
        margin: '0 0 24px 0',
        lineHeight: '1.5'
      }}>
        Test the notification system by sending different types of notifications. 
        These will appear in real-time via WebSocket and be stored in the database.
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {testNotifications.map((notification, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid var(--secondary-200)',
              borderRadius: '8px',
              background: 'var(--secondary-50)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '500',
                color: 'var(--secondary-900)',
                marginBottom: '4px'
              }}>
                {notification.title}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--secondary-600)',
                marginBottom: '4px'
              }}>
                {notification.message}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--secondary-500)',
                display: 'flex',
                gap: '12px'
              }}>
                <span>Type: {notification.type}</span>
                <span>Priority: {notification.priority}</span>
              </div>
            </div>
            
            <button
              onClick={() => sendTest(notification)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid var(--primary-500)',
                background: 'var(--primary-500)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginLeft: '16px'
              }}
            >
              {loading ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'var(--info-50)',
        border: '1px solid var(--info-200)',
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--info-700)',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          💡 How it works:
        </div>
        <ul style={{
          fontSize: '13px',
          color: 'var(--info-600)',
          margin: 0,
          paddingLeft: '20px',
          lineHeight: '1.4'
        }}>
          <li>Click "Send Test" to trigger a notification</li>
          <li>Notification appears instantly via WebSocket</li>
          <li>Check the notification icon in the header for updates</li>
          <li>Notification is stored in database for history</li>
          <li>Browser notification may appear if permission granted</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationTester;