/**
 * GigGatek Service Worker
 * Provides offline functionality and caching for the GigGatek PWA
 */

const CACHE_NAME = 'giggatek-cache-v1';
const RUNTIME_CACHE = 'giggatek-runtime-v1';

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

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // For API requests, use network first, then cache
    if (event.request.url.includes('/api/')) {
      event.respondWith(networkFirstStrategy(event.request));
    } 
    // For HTML pages, use network first, then cache, then offline page
    else if (event.request.headers.get('accept').includes('text/html')) {
      event.respondWith(htmlNetworkFirstStrategy(event.request));
    }
    // For images, use cache first, then network
    else if (
      event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/) ||
      event.request.url.includes('/img/')
    ) {
      event.respondWith(cacheFirstStrategy(event.request));
    }
    // For CSS and JS, use stale-while-revalidate
    else if (
      event.request.url.match(/\.(css|js)$/) ||
      event.request.url.includes('/css/') ||
      event.request.url.includes('/js/')
    ) {
      event.respondWith(staleWhileRevalidateStrategy(event.request));
    }
    // For everything else, use network first
    else {
      event.respondWith(networkFirstStrategy(event.request));
    }
  }
});

/**
 * Network first strategy - try network, fall back to cache
 * Good for API requests and dynamic content
 */
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

/**
 * HTML network first strategy - try network, fall back to cache, then offline page
 * Specifically for HTML pages
 */
async function htmlNetworkFirstStrategy(request) {
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
    if (cachedResponse) {
      return cachedResponse;
    }
    // If no cached response, serve offline page
    return caches.match('/offline.html');
  }
}

/**
 * Cache first strategy - try cache, fall back to network
 * Good for static assets like images
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, get from network and cache for future
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return a placeholder image for image requests
    if (
      request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/) ||
      request.url.includes('/img/')
    ) {
      return caches.match('/img/placeholder-product.png');
    }
    return Promise.reject('Resource not in cache and network unavailable');
  }
}

/**
 * Stale-while-revalidate strategy - return cached version immediately, then update cache
 * Good for CSS and JS files
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Get from cache
  const cachedResponse = await cache.match(request);
  
  // Update cache in the background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.error('Failed to update cache for', request.url, error);
  });
  
  // Return cached response immediately if available
  return cachedResponse || fetchPromise;
}

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
