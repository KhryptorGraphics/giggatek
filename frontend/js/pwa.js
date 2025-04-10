/**
 * GigGatek PWA Functionality
 * Handles service worker registration and PWA features
 */

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
  
  /**
   * Initialize PWA functionality
   */
  init() {
    // Register service worker
    this.registerServiceWorker();
    
    // Set up online/offline event listeners
    this.setupNetworkListeners();
    
    // Set up install prompt
    this.setupInstallPrompt();
    
    // Check for updates
    this.checkForUpdates();
  }
  
  /**
   * Register the service worker
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          this.swRegistration = registration;
          
          // Check if there's an update available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
        
      // Listen for controller change to refresh the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this.refreshing) return;
        this.refreshing = true;
        window.location.reload();
      });
    }
  }
  
  /**
   * Set up network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
    });
    
    // Initial check
    if (!this.isOnline) {
      this.handleOfflineStatus();
    }
  }
  
  /**
   * Handle online status
   */
  handleOnlineStatus() {
    // Show notification if we were previously offline
    if (this.offlineNotificationShown && window.notifications) {
      window.notifications.success('You are back online!');
      this.offlineNotificationShown = false;
    }
    
    // Remove offline class from body if present
    document.body.classList.remove('offline');
    
    // Sync any pending data
    this.syncData();
  }
  
  /**
   * Handle offline status
   */
  handleOfflineStatus() {
    // Show notification if not already shown
    if (!this.offlineNotificationShown && window.notifications) {
      window.notifications.warning('You are offline. Some features may be unavailable.');
      this.offlineNotificationShown = true;
    }
    
    // Add offline class to body
    document.body.classList.add('offline');
  }
  
  /**
   * Sync data when coming back online
   */
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
  
  /**
   * Get pending data from IndexedDB
   */
  getPendingData() {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!('indexedDB' in window)) {
        resolve([]);
        return;
      }
      
      // Open the database
      const request = indexedDB.open('giggatek-offline', 1);
      
      request.onerror = event => {
        console.error('IndexedDB error:', event.target.error);
        resolve([]);
      };
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // Create object store for pending data if it doesn't exist
        if (!db.objectStoreNames.contains('pending')) {
          db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = event => {
        const db = event.target.result;
        
        try {
          const transaction = db.transaction(['pending'], 'readonly');
          const store = transaction.objectStore('pending');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };
          
          getAllRequest.onerror = event => {
            console.error('Error getting pending data:', event.target.error);
            resolve([]);
          };
        } catch (error) {
          console.error('Error in IndexedDB transaction:', error);
          resolve([]);
        }
      };
    });
  }
  
  /**
   * Manual sync for browsers that don't support Background Sync
   */
  manualSync(pendingData) {
    if (!pendingData || pendingData.length === 0) return;
    
    // Process each pending item
    pendingData.forEach(item => {
      fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      })
        .then(response => {
          if (response.ok) {
            // Remove from pending data
            this.removePendingData(item.id);
          }
        })
        .catch(error => {
          console.error('Manual sync failed:', error);
        });
    });
  }
  
  /**
   * Remove pending data from IndexedDB
   */
  removePendingData(id) {
    // Open the database
    const request = indexedDB.open('giggatek-offline', 1);
    
    request.onsuccess = event => {
      const db = event.target.result;
      
      try {
        const transaction = db.transaction(['pending'], 'readwrite');
        const store = transaction.objectStore('pending');
        store.delete(id);
      } catch (error) {
        console.error('Error removing pending data:', error);
      }
    };
  }
  
  /**
   * Set up install prompt
   */
  setupInstallPrompt() {
    // Store the install prompt event
    window.addEventListener('beforeinstallprompt', event => {
      // Prevent the default prompt
      event.preventDefault();
      
      // Store the event for later use
      this.deferredPrompt = event;
      
      // Show install button if it exists
      this.showInstallButton();
    });
    
    // Listen for install button click
    document.addEventListener('click', event => {
      if (event.target.matches('#install-pwa-btn')) {
        this.promptInstall();
      }
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      // Hide the install button
      this.hideInstallButton();
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      // Show notification
      if (window.notifications) {
        window.notifications.success('GigGatek has been installed!');
      }
      
      // Log the installation
      this.logInstallation();
    });
  }
  
  /**
   * Show the install button
   */
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
  
  /**
   * Hide the install button
   */
  hideInstallButton() {
    const installButton = document.getElementById('install-pwa-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
  
  /**
   * Prompt the user to install the PWA
   */
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
  
  /**
   * Log the installation
   */
  logInstallation() {
    // Send installation data to analytics
    if (window.gtag) {
      gtag('event', 'pwa_install', {
        'event_category': 'engagement',
        'event_label': 'PWA Installation'
      });
    }
  }
  
  /**
   * Check for updates
   */
  checkForUpdates() {
    // Check for updates every hour
    setInterval(() => {
      if (this.swRegistration) {
        this.swRegistration.update()
          .then(() => {
            console.log('Service Worker update check completed');
          })
          .catch(error => {
            console.error('Service Worker update check failed:', error);
          });
      }
    }, 60 * 60 * 1000); // 1 hour
  }
  
  /**
   * Show update notification
   */
  showUpdateNotification() {
    // Create update notification container if it doesn't exist
    let updateNotification = document.getElementById('update-notification');
    
    if (!updateNotification) {
      updateNotification = document.createElement('div');
      updateNotification.id = 'update-notification';
      updateNotification.className = 'update-notification';
      updateNotification.innerHTML = `
        <div class="update-notification-content">
          <p>A new version is available!</p>
          <div class="update-notification-actions">
            <button id="update-now-btn" class="btn btn-primary">Update Now</button>
            <button id="update-later-btn" class="btn btn-outline">Later</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(updateNotification);
      
      // Add event listeners
      document.getElementById('update-now-btn').addEventListener('click', () => {
        // Refresh the page to activate the new service worker
        window.location.reload();
      });
      
      document.getElementById('update-later-btn').addEventListener('click', () => {
        // Hide the notification
        updateNotification.classList.remove('show');
      });
    }
    
    // Show the notification
    updateNotification.classList.add('show');
  }
  
  /**
   * Subscribe to push notifications
   */
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
  
  /**
   * Send push subscription to server
   */
  sendSubscriptionToServer(subscription) {
    // Check if user is authenticated
    if (!window.auth || !window.auth.isAuthenticated()) {
      console.log('User not authenticated');
      return Promise.reject(new Error('User not authenticated'));
    }
    
    // Send subscription to server
    return fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.auth.getToken()}`
      },
      body: JSON.stringify({
        subscription: subscription
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send subscription to server');
        }
        return response.json();
      });
  }
  
  /**
   * Convert base64 to Uint8Array for applicationServerKey
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// Initialize PWA manager
document.addEventListener('DOMContentLoaded', function() {
  window.pwa = new PWAManager();
});
