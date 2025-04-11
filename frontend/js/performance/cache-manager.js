/**
 * Cache Manager
 * 
 * This module provides advanced caching strategies for API requests.
 */

class CacheManager {
  constructor(options = {}) {
    this.options = {
      // Default cache time in milliseconds
      defaultCacheTime: options.defaultCacheTime || 5 * 60 * 1000, // 5 minutes
      
      // Maximum cache size
      maxCacheSize: options.maxCacheSize || 100,
      
      // Whether to enable debug logging
      debug: options.debug !== undefined ? options.debug : false,
      
      // Cache storage type (memory, localStorage, indexedDB)
      storageType: options.storageType || 'memory',
      
      // Cache prefix for localStorage and indexedDB
      cachePrefix: options.cachePrefix || 'api_cache_',
      
      // Whether to use stale-while-revalidate strategy
      staleWhileRevalidate: options.staleWhileRevalidate !== undefined ? options.staleWhileRevalidate : true,
      
      // Whether to preload related data
      preloadRelatedData: options.preloadRelatedData !== undefined ? options.preloadRelatedData : true,
      
      // Cache rules
      cacheRules: options.cacheRules || [
        // No caching
        {
          test: (endpoint, method) => {
            return (
              // Non-GET requests
              method !== 'GET' ||
              // Authentication endpoints
              endpoint.includes('/auth/') ||
              // User-specific data that changes frequently
              endpoint.includes('/cart') ||
              endpoint.includes('/notifications/unread')
            );
          },
          cacheTime: 0
        },
        
        // Short cache (1 minute)
        {
          test: (endpoint, method) => {
            return (
              // User profile
              endpoint === '/users/me' ||
              // Current orders
              endpoint.includes('/orders?') ||
              // Current rentals
              endpoint.includes('/rentals?')
            );
          },
          cacheTime: 60 * 1000
        },
        
        // Medium cache (10 minutes)
        {
          test: (endpoint, method) => {
            return (
              // Product details
              endpoint.match(/\/products\/\d+$/) ||
              // Order details
              endpoint.match(/\/orders\/\d+$/) ||
              // Rental details
              endpoint.match(/\/rentals\/\d+$/) ||
              // Search results
              endpoint.includes('/search')
            );
          },
          cacheTime: 10 * 60 * 1000
        },
        
        // Long cache (1 hour)
        {
          test: (endpoint, method) => {
            return (
              // Categories
              endpoint.includes('/categories') ||
              // Static content
              endpoint.includes('/content/') ||
              // Settings
              endpoint.includes('/settings')
            );
          },
          cacheTime: 60 * 60 * 1000
        }
      ]
    };
    
    // Initialize cache
    this.initializeCache();
    
    // Cache hit counter
    this.cacheHits = 0;
    
    // Cache miss counter
    this.cacheMisses = 0;
    
    // Pending requests
    this.pendingRequests = {};
  }
  
  /**
   * Initialize cache
   */
  async initializeCache() {
    // Initialize memory cache
    this.memoryCache = new Map();
    
    // Initialize localStorage cache if available
    if (this.options.storageType === 'localStorage' && typeof localStorage !== 'undefined') {
      try {
        // Clear expired items
        this.clearExpiredLocalStorageItems();
      } catch (error) {
        console.error('Error initializing localStorage cache:', error);
        this.options.storageType = 'memory';
      }
    }
    
    // Initialize indexedDB cache if available
    if (this.options.storageType === 'indexedDB' && typeof indexedDB !== 'undefined') {
      try {
        await this.initializeIndexedDB();
      } catch (error) {
        console.error('Error initializing indexedDB cache:', error);
        this.options.storageType = 'memory';
      }
    }
    
    // Log cache initialization
    if (this.options.debug) {
      console.debug(`Cache initialized with storage type: ${this.options.storageType}`);
    }
  }
  
  /**
   * Initialize indexedDB
   * 
   * @returns {Promise} Promise that resolves when indexedDB is initialized
   */
  initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      // Open database
      const request = indexedDB.open('apiCache', 1);
      
      // Handle error
      request.onerror = event => {
        reject(new Error('Error opening indexedDB'));
      };
      
      // Handle success
      request.onsuccess = event => {
        this.db = event.target.result;
        resolve();
      };
      
      // Handle upgrade needed
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // Create object store
        const objectStore = db.createObjectStore('cache', { keyPath: 'key' });
        
        // Create indexes
        objectStore.createIndex('expires', 'expires', { unique: false });
      };
    });
  }
  
  /**
   * Clear expired localStorage items
   */
  clearExpiredLocalStorageItems() {
    // Get all keys
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.options.cachePrefix)) {
        keys.push(key);
      }
    }
    
    // Check each item
    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item.expires && item.expires < Date.now()) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    });
  }
  
  /**
   * Get cache time for endpoint
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {number} Cache time in milliseconds
   */
  getCacheTime(endpoint, method) {
    // Check cache rules
    for (const rule of this.options.cacheRules) {
      if (rule.test(endpoint, method)) {
        return rule.cacheTime;
      }
    }
    
    // Return default cache time
    return this.options.defaultCacheTime;
  }
  
  /**
   * Get cache key
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @returns {string} Cache key
   */
  getCacheKey(endpoint, method, data) {
    // Create key components
    const components = [method, endpoint];
    
    // Add data to key if present
    if (data) {
      components.push(JSON.stringify(data));
    }
    
    // Join components
    return components.join(':');
  }
  
  /**
   * Get item from cache
   * 
   * @param {string} key - Cache key
   * @returns {Promise} Promise that resolves with cached item or null
   */
  async getFromCache(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      
      // Check if item is expired
      if (item.expires && item.expires < Date.now()) {
        // Remove expired item
        this.memoryCache.delete(key);
        return null;
      }
      
      // Increment cache hit counter
      this.cacheHits++;
      
      // Return cached value
      return item.value;
    }
    
    // Check localStorage if enabled
    if (this.options.storageType === 'localStorage') {
      const storageKey = this.options.cachePrefix + key;
      const json = localStorage.getItem(storageKey);
      
      if (json) {
        try {
          const item = JSON.parse(json);
          
          // Check if item is expired
          if (item.expires && item.expires < Date.now()) {
            // Remove expired item
            localStorage.removeItem(storageKey);
            return null;
          }
          
          // Add to memory cache
          this.memoryCache.set(key, item);
          
          // Increment cache hit counter
          this.cacheHits++;
          
          // Return cached value
          return item.value;
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }
    
    // Check indexedDB if enabled
    if (this.options.storageType === 'indexedDB' && this.db) {
      return new Promise((resolve, reject) => {
        // Start transaction
        const transaction = this.db.transaction(['cache'], 'readonly');
        const objectStore = transaction.objectStore('cache');
        
        // Get item
        const request = objectStore.get(key);
        
        // Handle error
        request.onerror = event => {
          resolve(null);
        };
        
        // Handle success
        request.onsuccess = event => {
          const item = event.target.result;
          
          if (item) {
            // Check if item is expired
            if (item.expires && item.expires < Date.now()) {
              // Remove expired item
              this.removeFromCache(key);
              resolve(null);
              return;
            }
            
            // Add to memory cache
            this.memoryCache.set(key, item);
            
            // Increment cache hit counter
            this.cacheHits++;
            
            // Return cached value
            resolve(item.value);
          } else {
            resolve(null);
          }
        };
      });
    }
    
    // Increment cache miss counter
    this.cacheMisses++;
    
    // No cached item found
    return null;
  }
  
  /**
   * Set item in cache
   * 
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} cacheTime - Cache time in milliseconds
   */
  async setInCache(key, value, cacheTime) {
    // Skip if cache time is 0
    if (cacheTime <= 0) {
      return;
    }
    
    // Calculate expiration time
    const expires = Date.now() + cacheTime;
    
    // Create cache item
    const item = {
      key,
      value,
      expires,
      timestamp: Date.now()
    };
    
    // Set in memory cache
    this.memoryCache.set(key, item);
    
    // Enforce maximum cache size
    if (this.memoryCache.size > this.options.maxCacheSize) {
      this.evictOldestItems();
    }
    
    // Set in localStorage if enabled
    if (this.options.storageType === 'localStorage') {
      try {
        const storageKey = this.options.cachePrefix + key;
        localStorage.setItem(storageKey, JSON.stringify(item));
      } catch (error) {
        // Ignore storage errors
        console.warn('Error storing item in localStorage:', error);
      }
    }
    
    // Set in indexedDB if enabled
    if (this.options.storageType === 'indexedDB' && this.db) {
      try {
        // Start transaction
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const objectStore = transaction.objectStore('cache');
        
        // Put item
        objectStore.put(item);
      } catch (error) {
        // Ignore storage errors
        console.warn('Error storing item in indexedDB:', error);
      }
    }
  }
  
  /**
   * Remove item from cache
   * 
   * @param {string} key - Cache key
   */
  async removeFromCache(key) {
    // Remove from memory cache
    this.memoryCache.delete(key);
    
    // Remove from localStorage if enabled
    if (this.options.storageType === 'localStorage') {
      try {
        const storageKey = this.options.cachePrefix + key;
        localStorage.removeItem(storageKey);
      } catch (error) {
        // Ignore storage errors
      }
    }
    
    // Remove from indexedDB if enabled
    if (this.options.storageType === 'indexedDB' && this.db) {
      try {
        // Start transaction
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const objectStore = transaction.objectStore('cache');
        
        // Delete item
        objectStore.delete(key);
      } catch (error) {
        // Ignore storage errors
      }
    }
  }
  
  /**
   * Clear cache
   * 
   * @param {string} keyPrefix - Key prefix to clear (optional)
   */
  async clearCache(keyPrefix = '') {
    // Clear memory cache
    if (keyPrefix) {
      // Clear keys with prefix
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      // Clear all
      this.memoryCache.clear();
    }
    
    // Clear localStorage if enabled
    if (this.options.storageType === 'localStorage') {
      try {
        if (keyPrefix) {
          // Clear keys with prefix
          const storagePrefix = this.options.cachePrefix + keyPrefix;
          const keys = [];
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(storagePrefix)) {
              keys.push(key);
            }
          }
          
          keys.forEach(key => {
            localStorage.removeItem(key);
          });
        } else {
          // Clear all cache items
          const keys = [];
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.options.cachePrefix)) {
              keys.push(key);
            }
          }
          
          keys.forEach(key => {
            localStorage.removeItem(key);
          });
        }
      } catch (error) {
        // Ignore storage errors
      }
    }
    
    // Clear indexedDB if enabled
    if (this.options.storageType === 'indexedDB' && this.db) {
      try {
        // Start transaction
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const objectStore = transaction.objectStore('cache');
        
        if (keyPrefix) {
          // Get all keys
          const request = objectStore.openCursor();
          
          request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
              if (cursor.key.startsWith(keyPrefix)) {
                objectStore.delete(cursor.key);
              }
              cursor.continue();
            }
          };
        } else {
          // Clear all
          objectStore.clear();
        }
      } catch (error) {
        // Ignore storage errors
      }
    }
    
    // Log cache clear
    if (this.options.debug) {
      console.debug(`Cache cleared${keyPrefix ? ` with prefix: ${keyPrefix}` : ''}`);
    }
  }
  
  /**
   * Evict oldest items from cache
   */
  evictOldestItems() {
    // Get all items with timestamps
    const items = Array.from(this.memoryCache.entries())
      .map(([key, item]) => ({ key, timestamp: item.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate number of items to evict
    const evictCount = Math.ceil(this.options.maxCacheSize * 0.2); // Evict 20%
    
    // Evict oldest items
    items.slice(0, evictCount).forEach(item => {
      this.memoryCache.delete(item.key);
    });
    
    // Log cache eviction
    if (this.options.debug) {
      console.debug(`Evicted ${evictCount} items from cache`);
    }
  }
  
  /**
   * Cache request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {Function} requestFn - Request function
   * @param {Object} options - Cache options
   * @returns {Promise} Promise that resolves with response data
   */
  async cacheRequest(endpoint, method, data, requestFn, options = {}) {
    // Get cache time
    const cacheTime = options.cacheTime !== undefined ? 
      options.cacheTime : 
      this.getCacheTime(endpoint, method);
    
    // Skip caching if cache time is 0
    if (cacheTime <= 0) {
      return requestFn();
    }
    
    // Get cache key
    const cacheKey = this.getCacheKey(endpoint, method, data);
    
    // Check if request is already pending
    if (this.pendingRequests[cacheKey]) {
      return this.pendingRequests[cacheKey];
    }
    
    // Check cache
    const cachedData = await this.getFromCache(cacheKey);
    
    // Use stale-while-revalidate strategy if enabled
    if (cachedData && this.options.staleWhileRevalidate) {
      // Start background refresh
      this.refreshCacheInBackground(cacheKey, endpoint, method, data, requestFn, cacheTime);
      
      // Return cached data immediately
      return cachedData;
    }
    
    // Return cached data if available
    if (cachedData) {
      return cachedData;
    }
    
    // Create promise
    const promise = (async () => {
      try {
        // Execute request
        const response = await requestFn();
        
        // Cache response
        await this.setInCache(cacheKey, response, cacheTime);
        
        // Preload related data if enabled
        if (this.options.preloadRelatedData) {
          this.preloadRelatedData(endpoint, method, response);
        }
        
        return response;
      } finally {
        // Remove pending request
        delete this.pendingRequests[cacheKey];
      }
    })();
    
    // Store pending request
    this.pendingRequests[cacheKey] = promise;
    
    return promise;
  }
  
  /**
   * Refresh cache in background
   * 
   * @param {string} cacheKey - Cache key
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {Function} requestFn - Request function
   * @param {number} cacheTime - Cache time in milliseconds
   */
  async refreshCacheInBackground(cacheKey, endpoint, method, data, requestFn, cacheTime) {
    // Skip if already refreshing
    if (this.pendingRequests[cacheKey]) {
      return;
    }
    
    // Create promise
    const promise = (async () => {
      try {
        // Execute request
        const response = await requestFn();
        
        // Cache response
        await this.setInCache(cacheKey, response, cacheTime);
        
        return response;
      } catch (error) {
        // Log error
        console.error('Error refreshing cache in background:', error);
      } finally {
        // Remove pending request
        delete this.pendingRequests[cacheKey];
      }
    })();
    
    // Store pending request
    this.pendingRequests[cacheKey] = promise;
  }
  
  /**
   * Preload related data
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} response - Response data
   */
  preloadRelatedData(endpoint, method, response) {
    // Skip if no response
    if (!response) {
      return;
    }
    
    // Product detail
    if (endpoint.match(/\/products\/\d+$/) && response.id) {
      // Preload related products
      if (response.related_products && Array.isArray(response.related_products)) {
        response.related_products.forEach(productId => {
          this.preloadData(`/products/${productId}`, 'GET');
        });
      }
      
      // Preload category
      if (response.category_id) {
        this.preloadData(`/categories/${response.category_id}`, 'GET');
      }
    }
    
    // Order detail
    if (endpoint.match(/\/orders\/\d+$/) && response.id) {
      // Preload products in order
      if (response.items && Array.isArray(response.items)) {
        response.items.forEach(item => {
          if (item.product_id) {
            this.preloadData(`/products/${item.product_id}`, 'GET');
          }
        });
      }
    }
    
    // Product list
    if (endpoint.includes('/products') && response.products && Array.isArray(response.products)) {
      // Preload first few products
      response.products.slice(0, 3).forEach(product => {
        if (product.id) {
          this.preloadData(`/products/${product.id}`, 'GET');
        }
      });
    }
  }
  
  /**
   * Preload data
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   */
  async preloadData(endpoint, method) {
    // Skip if already in cache
    const cacheKey = this.getCacheKey(endpoint, method, null);
    const cachedData = await this.getFromCache(cacheKey);
    
    if (cachedData) {
      return;
    }
    
    // Skip if already pending
    if (this.pendingRequests[cacheKey]) {
      return;
    }
    
    // Log preloading
    if (this.options.debug) {
      console.debug(`Preloading data: ${method} ${endpoint}`);
    }
    
    // Create request function
    const requestFn = async () => {
      // Delay preloading to avoid blocking main requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Execute request
      return window.api.request(method, endpoint, null, true);
    };
    
    // Get cache time
    const cacheTime = this.getCacheTime(endpoint, method);
    
    // Create promise
    const promise = (async () => {
      try {
        // Execute request
        const response = await requestFn();
        
        // Cache response
        await this.setInCache(cacheKey, response, cacheTime);
        
        return response;
      } catch (error) {
        // Ignore preloading errors
      } finally {
        // Remove pending request
        delete this.pendingRequests[cacheKey];
      }
    })();
    
    // Store pending request
    this.pendingRequests[cacheKey] = promise;
  }
  
  /**
   * Get cache statistics
   * 
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      ratio: this.cacheHits + this.cacheMisses > 0 ? 
        this.cacheHits / (this.cacheHits + this.cacheMisses) : 0,
      size: this.memoryCache.size,
      storageType: this.options.storageType
    };
  }
}

// Create global cache manager instance
const cacheManager = new CacheManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cacheManager;
}
