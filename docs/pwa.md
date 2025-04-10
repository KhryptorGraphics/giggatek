# Progressive Web App (PWA) Documentation

## Overview

GigGatek has been enhanced with Progressive Web App (PWA) capabilities, allowing users to install the application on their devices, access content offline, and receive push notifications. This document provides information about the PWA implementation, how it works, and how to maintain it.

## Table of Contents

1. [Features](#features)
2. [Implementation](#implementation)
3. [Service Worker](#service-worker)
4. [Offline Support](#offline-support)
5. [Installation](#installation)
6. [Push Notifications](#push-notifications)
7. [Testing](#testing)
8. [Maintenance](#maintenance)

## Features

- **Installable**: Users can install the app on their home screen
- **Offline Support**: Core functionality works without an internet connection
- **Push Notifications**: Users can receive notifications even when not using the app
- **App-like Experience**: Full-screen mode, splash screen, and native-like navigation
- **Automatic Updates**: Service worker ensures users always have the latest version
- **Improved Performance**: Caching strategies optimize loading times

## Implementation

The PWA implementation consists of several key components:

### Web App Manifest

The `manifest.json` file provides metadata about the application, including its name, icons, colors, and behavior when installed:

```json
{
  "name": "GigGatek",
  "short_name": "GigGatek",
  "description": "Quality refurbished computer hardware with purchase and rent-to-own options",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "icons": [
    {
      "src": "/img/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    // Additional icons...
  ]
}
```

### Service Worker

The `service-worker.js` file handles caching, offline support, and push notifications:

```javascript
// Service worker registration in pwa.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
```

### PWA Manager

The `pwa.js` file provides a JavaScript class that manages PWA functionality:

```javascript
class PWAManager {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.offlineNotificationShown = false;
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  // Additional methods...
}
```

## Service Worker

The service worker is a JavaScript file that runs in the background, separate from the web page. It enables features like offline support, push notifications, and background sync.

### Registration

The service worker is registered when the page loads:

```javascript
navigator.serviceWorker.register('/service-worker.js')
  .then(registration => {
    console.log('Service Worker registered with scope:', registration.scope);
    this.swRegistration = registration;
  })
  .catch(error => {
    console.error('Service Worker registration failed:', error);
  });
```

### Lifecycle

The service worker has a lifecycle with several events:

1. **Install**: Triggered when the service worker is installed
2. **Activate**: Triggered when the service worker is activated
3. **Fetch**: Triggered when the browser makes a network request
4. **Push**: Triggered when a push notification is received
5. **Sync**: Triggered when a background sync is requested

### Caching Strategies

The service worker uses different caching strategies for different types of resources:

- **Network First**: Try the network first, fall back to cache (for API requests)
- **Cache First**: Try the cache first, fall back to network (for images)
- **Stale-While-Revalidate**: Return cached version immediately, then update cache (for CSS/JS)

```javascript
// Example of network first strategy
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const networkResponse = await fetch(request);
    // Cache the response for future use
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If network fails, try to serve from cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || Promise.reject('No network connection and no cached response available');
  }
}
```

## Offline Support

The PWA provides offline support through several mechanisms:

### Precaching

Essential resources are cached during the service worker installation:

```javascript
// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.php',
  '/css/framework.css',
  '/css/style.css',
  '/css/notifications.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/notifications.js',
  '/js/config.js',
  '/img/logo.png',
  '/img/placeholder-product.png',
  '/offline.html'
];

// Install event - precache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
```

### Offline Page

A dedicated offline page is shown when the user is offline and tries to access a page that isn't cached:

```javascript
// If no cached response, serve offline page
return caches.match('/offline.html');
```

### Offline Indicator

An offline indicator is shown when the user loses their internet connection:

```html
<!-- Offline indicator -->
<div class="offline-indicator">
  <span class="icon">📶</span>
  <span>You are currently offline. Some features may be unavailable.</span>
</div>
```

```javascript
// Handle offline status
handleOfflineStatus() {
  // Show notification if not already shown
  if (!this.offlineNotificationShown && window.notifications) {
    window.notifications.warning('You are offline. Some features may be unavailable.');
    this.offlineNotificationShown = true;
  }
  
  // Add offline class to body
  document.body.classList.add('offline');
}
```

### Background Sync

The PWA uses background sync to send data when the user comes back online:

```javascript
// Sync data when coming back online
syncData() {
  // Check if Background Sync is supported
  if ('serviceWorker' in navigator && 'SyncManager' in window && this.swRegistration) {
    // Get pending data from IndexedDB
    this.getPendingData()
      .then(pendingData => {
        if (pendingData && pendingData.length > 0) {
          // Register a sync event
          this.swRegistration.sync.register('sync-data')
            .then(() => {
              console.log('Sync registered');
            })
            .catch(err => {
              console.error('Sync registration failed:', err);
              // Fallback: try to sync manually
              this.manualSync(pendingData);
            });
        }
      });
  } else {
    // Fallback for browsers that don't support Background Sync
    this.getPendingData()
      .then(pendingData => {
        if (pendingData && pendingData.length > 0) {
          this.manualSync(pendingData);
        }
      });
  }
}
```

## Installation

The PWA can be installed on the user's device, providing an app-like experience.

### Install Prompt

The PWA detects when the browser's install criteria are met and shows an install button:

```javascript
// Store the install prompt event
window.addEventListener('beforeinstallprompt', event => {
  // Prevent the default prompt
  event.preventDefault();
  
  // Store the event for later use
  this.deferredPrompt = event;
  
  // Show install button if it exists
  this.showInstallButton();
});
```

### Install Button

An install button is shown to the user when the app is installable:

```javascript
// Show the install button
showInstallButton() {
  // Check if the button already exists
  let installButton = document.getElementById('install-pwa-btn');
  
  if (!installButton) {
    // Create the button
    installButton = document.createElement('button');
    installButton.id = 'install-pwa-btn';
    installButton.className = 'install-pwa-btn';
    installButton.innerHTML = '<span class="icon">📱</span> Install App';
    
    // Add to the header
    const header = document.querySelector('header .container');
    if (header) {
      header.appendChild(installButton);
    }
  }
  
  // Show the button
  installButton.style.display = 'flex';
}
```

### Installation Process

When the user clicks the install button, the browser's install prompt is shown:

```javascript
// Prompt the user to install the PWA
promptInstall() {
  if (!this.deferredPrompt) return;
  
  // Show the prompt
  this.deferredPrompt.prompt();
  
  // Wait for the user to respond
  this.deferredPrompt.userChoice.then(choiceResult => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferred prompt
    this.deferredPrompt = null;
  });
}
```

## Push Notifications

The PWA supports push notifications, allowing the app to send messages to users even when they're not using the app.

### Subscription

Users can subscribe to push notifications:

```javascript
// Subscribe to push notifications
subscribeToPushNotifications() {
  // Check if Push API is supported
  if (!('PushManager' in window)) {
    console.log('Push notifications not supported');
    return Promise.reject(new Error('Push notifications not supported'));
  }
  
  // Check if we have permission
  if (Notification.permission === 'denied') {
    console.log('Push notifications permission denied');
    return Promise.reject(new Error('Push notifications permission denied'));
  }
  
  // Get the service worker registration
  if (!this.swRegistration) {
    console.log('Service Worker not registered');
    return Promise.reject(new Error('Service Worker not registered'));
  }
  
  // Subscribe to push notifications
  return this.swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: this.urlBase64ToUint8Array(
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
    )
  })
    .then(subscription => {
      // Send the subscription to the server
      return this.sendSubscriptionToServer(subscription);
    })
    .catch(error => {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    });
}
```

### Handling Push Events

The service worker handles incoming push notifications:

```javascript
// Handle push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/img/logo-192.png',
      badge: '/img/badge-72.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

## Testing

### Lighthouse

Use Lighthouse in Chrome DevTools to audit the PWA:

1. Open Chrome DevTools (F12)
2. Go to the Lighthouse tab
3. Select "Progressive Web App" category
4. Click "Generate report"

### PWA Checklist

Ensure the PWA meets the following criteria:

- [ ] Uses HTTPS
- [ ] Responsive on tablets & mobile devices
- [ ] All app URLs load while offline
- [ ] Metadata provided for Add to Home screen
- [ ] First load fast even on 3G
- [ ] Site works cross-browser
- [ ] Page transitions don't feel like they block on the network
- [ ] Each page has a URL

### Testing Offline Mode

Test the PWA in offline mode:

1. Open Chrome DevTools (F12)
2. Go to the Network tab
3. Check "Offline"
4. Reload the page and navigate through the app

### Testing Installation

Test the installation process:

1. Visit the site in Chrome
2. Open Chrome menu (three dots)
3. Look for "Install GigGatek..." option
4. Click and follow the installation process

## Maintenance

### Updating the Service Worker

When making changes to the service worker, increment the cache version to ensure users get the latest version:

```javascript
const CACHE_NAME = 'giggatek-cache-v2'; // Increment version number
```

### Generating Icons

Use the provided icon generator script to create all necessary icons:

```bash
cd frontend/tools
npm install sharp
node generate-icons.js
```

### Updating the Manifest

When adding new features or changing the app's appearance, update the manifest.json file:

```json
{
  "name": "GigGatek",
  "short_name": "GigGatek",
  "description": "Updated description",
  // Other properties...
}
```

### Monitoring

Monitor the PWA's performance and usage:

- Use Google Analytics to track installations and usage
- Use Lighthouse to regularly audit the PWA
- Monitor service worker errors in the browser console
