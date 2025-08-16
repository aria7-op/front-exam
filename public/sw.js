// Service Worker for Push Notifications
const CACHE_NAME = 'mock-exam-v1';
const NOTIFICATION_TAG = 'mock-exam-notification';

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker cache opened');
        // Only cache files that actually exist
        return cache.addAll([
          '/',
          '/index.html',
          '/vite.svg' // Use vite.svg instead of favicon.ico
        ]);
      })
      .then(() => {
        console.log('✅ Service Worker installed and cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
        // Continue installation even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
    .catch((error) => {
      console.error('❌ Service Worker activation failed:', error);
      // Continue activation even if cleanup fails
      return self.clients.claim();
    })
  );
});

// Message event - handle notifications from main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      showNotification(event.data.title, event.data.options)
    );
  }
  
  // Test message handler
  if (event.data && event.data.type === 'TEST') {
    console.log('🧪 Test message received in service worker');
    event.ports[0].postMessage({
      type: 'TEST_RESPONSE',
      message: 'Service Worker is working!',
      timestamp: Date.now()
    });
  }
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push event received:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(
        showNotification(data.title, {
          body: data.body || data.message,
          icon: data.icon || '/vite.svg',
          badge: data.badge || '/vite.svg',
          tag: data.tag || NOTIFICATION_TAG,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200],
          data: data,
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/vite.svg'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/vite.svg'
            }
          ]
        })
      );
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
      // Fallback notification
      event.waitUntil(
        showNotification('New Notification', {
          body: 'You have a new notification',
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: NOTIFICATION_TAG,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200]
        })
      );
    }
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Focus existing window or open new one
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          // Focus existing window
          clientList[0].focus();
          return clientList[0].navigate('/');
        } else {
          // Open new window
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default click behavior - focus window
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          clients.openWindow('/');
        }
      })
    );
  }
});

// Show notification function
async function showNotification(title, options) {
  try {
    // Check if we have permission
    if (Notification.permission !== 'granted') {
      console.log('❌ No notification permission');
      return;
    }
    
    // Show the notification
    const notification = await self.registration.showNotification(title, options);
    console.log('✅ Notification shown:', notification);
    
    // Auto close after 10 seconds
    setTimeout(() => {
      if (notification) {
        notification.close();
      }
    }, 10000);
    
    return notification;
  } catch (error) {
    console.error('❌ Failed to show notification:', error);
  }
}

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync event:', event);
  
  if (event.tag === 'background-notification') {
    event.waitUntil(
      // Handle background sync for notifications
      console.log('🔄 Processing background notifications...')
    );
  }
});

// Fetch event - cache API responses
self.addEventListener('fetch', (event) => {
  // Only cache API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          
          return response;
        })
        .catch(() => {
          // Return cached response if fetch fails
          return caches.match(event.request);
        })
    );
  }
});

console.log('🔧 Service Worker loaded and ready'); 