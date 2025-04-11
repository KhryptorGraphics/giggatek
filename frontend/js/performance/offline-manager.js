/**
 * Offline Manager
 * 
 * This module provides offline support for the application.
 */

class OfflineManager {
  constructor(options = {}) {
    this.options = {
      // Whether to enable offline mode
      enabled: options.enabled !== undefined ? options.enabled : true,
      
      // Whether to enable debug logging
      debug: options.debug !== undefined ? options.debug : false,
      
      // Whether to sync data when online
      syncWhenOnline: options.syncWhenOnline !== undefined ? options.syncWhenOnline : true,
      
      // Maximum queue size
      maxQueueSize: options.maxQueueSize || 100,
      
      // Storage key for offline queue
      storageKey: options.storageKey || 'offline_queue',
      
      // API client
      apiClient: options.apiClient || null,
      
      // Cache manager
      cacheManager: options.cacheManager || null,
      
      // Endpoints that can be used offline
      offlineEndpoints: options.offlineEndpoints || [
        // GET requests
        { method: 'GET', pattern: /^\/products(\?.*)?$/ },
        { method: 'GET', pattern: /^\/products\/\d+$/ },
        { method: 'GET', pattern: /^\/categories(\?.*)?$/ },
        { method: 'GET', pattern: /^\/categories\/\d+$/ },
        
        // POST requests that can be queued
        { method: 'POST', pattern: /^\/cart\/items$/ },
        { method: 'POST', pattern: /^\/wishlist\/items$/ },
        { method: 'POST', pattern: /^\/recently-viewed$/ }
      ]
    };
    
    // Initialize offline manager
    this.initialize();
  }
  
  /**
   * Initialize offline manager
   */
  async initialize() {
    // Set online status
    this.isOnline = navigator.onLine;
    
    // Initialize offline queue
    this.offlineQueue = [];
    
    // Load offline queue from storage
    await this.loadOfflineQueue();
    
    // Add event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Log initialization
    if (this.options.debug) {
      console.debug(`Offline manager initialized. Online: ${this.isOnline}, Queue size: ${this.offlineQueue.length}`);
    }
    
    // Process offline queue if online
    if (this.isOnline && this.options.syncWhenOnline) {
      this.processOfflineQueue();
    }
  }
  
  /**
   * Handle online event
   */
  handleOnline() {
    // Update online status
    this.isOnline = true;
    
    // Log online status
    if (this.options.debug) {
      console.debug('Device is online');
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('app:online'));
    
    // Process offline queue if sync is enabled
    if (this.options.syncWhenOnline) {
      this.processOfflineQueue();
    }
  }
  
  /**
   * Handle offline event
   */
  handleOffline() {
    // Update online status
    this.isOnline = false;
    
    // Log offline status
    if (this.options.debug) {
      console.debug('Device is offline');
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('app:offline'));
  }
  
  /**
   * Load offline queue from storage
   */
  async loadOfflineQueue() {
    try {
      // Get queue from localStorage
      const queueJson = localStorage.getItem(this.options.storageKey);
      
      if (queueJson) {
        this.offlineQueue = JSON.parse(queueJson);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }
  
  /**
   * Save offline queue to storage
   */
  async saveOfflineQueue() {
    try {
      // Save queue to localStorage
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }
  
  /**
   * Add request to offline queue
   * 
   * @param {Object} request - Request object
   */
  async addToOfflineQueue(request) {
    // Check if queue is full
    if (this.offlineQueue.length >= this.options.maxQueueSize) {
      throw new Error('Offline queue is full');
    }
    
    // Add request to queue
    this.offlineQueue.push({
      ...request,
      timestamp: Date.now()
    });
    
    // Save queue
    await this.saveOfflineQueue();
    
    // Log queue addition
    if (this.options.debug) {
      console.debug(`Added request to offline queue: ${request.method} ${request.endpoint}. Queue size: ${this.offlineQueue.length}`);
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('offline:queued', {
      detail: { request }
    }));
  }
  
  /**
   * Process offline queue
   */
  async processOfflineQueue() {
    // Skip if offline
    if (!this.isOnline) {
      return;
    }
    
    // Skip if queue is empty
    if (this.offlineQueue.length === 0) {
      return;
    }
    
    // Log queue processing
    if (this.options.debug) {
      console.debug(`Processing offline queue. Queue size: ${this.offlineQueue.length}`);
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('offline:sync-start', {
      detail: { queueSize: this.offlineQueue.length }
    }));
    
    // Process queue
    const successfulRequests = [];
    const failedRequests = [];
    
    for (const request of this.offlineQueue) {
      try {
        // Execute request
        await this.options.apiClient.request(
          request.method,
          request.endpoint,
          request.data,
          request.requireAuth,
          request.options
        );
        
        // Add to successful requests
        successfulRequests.push(request);
      } catch (error) {
        // Add to failed requests
        failedRequests.push({
          request,
          error: error.message
        });
        
        // Log error
        console.error(`Error processing offline request: ${request.method} ${request.endpoint}`, error);
      }
    }
    
    // Remove successful requests from queue
    this.offlineQueue = this.offlineQueue.filter(request => {
      return !successfulRequests.some(r => 
        r.method === request.method && 
        r.endpoint === request.endpoint && 
        r.timestamp === request.timestamp
      );
    });
    
    // Save queue
    await this.saveOfflineQueue();
    
    // Log queue processing results
    if (this.options.debug) {
      console.debug(`Offline queue processed. Successful: ${successfulRequests.length}, Failed: ${failedRequests.length}, Remaining: ${this.offlineQueue.length}`);
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('offline:sync-complete', {
      detail: {
        successful: successfulRequests.length,
        failed: failedRequests.length,
        remaining: this.offlineQueue.length
      }
    }));
  }
  
  /**
   * Check if endpoint can be used offline
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {boolean} True if endpoint can be used offline
   */
  canUseOffline(endpoint, method) {
    // Check if endpoint is in offline endpoints
    return this.options.offlineEndpoints.some(offlineEndpoint => {
      return offlineEndpoint.method === method && offlineEndpoint.pattern.test(endpoint);
    });
  }
  
  /**
   * Handle offline request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  async handleOfflineRequest(endpoint, method, data, requireAuth, options) {
    // Check if GET request
    if (method === 'GET') {
      // Try to get from cache
      if (this.options.cacheManager) {
        const cacheKey = this.options.cacheManager.getCacheKey(endpoint, method, data);
        const cachedData = await this.options.cacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
          // Return cached data
          return cachedData;
        }
      }
      
      // No cached data available
      throw new Error('No cached data available for offline request');
    } else {
      // Queue non-GET request
      await this.addToOfflineQueue({
        endpoint,
        method,
        data,
        requireAuth,
        options
      });
      
      // Return mock response
      return this.getMockResponse(endpoint, method, data);
    }
  }
  
  /**
   * Get mock response for offline request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @returns {Object} Mock response
   */
  getMockResponse(endpoint, method, data) {
    // Cart endpoints
    if (endpoint.includes('/cart')) {
      if (method === 'POST' && endpoint.includes('/items')) {
        // Add to cart
        return {
          success: true,
          message: 'Item will be added to cart when online',
          offline: true,
          data: {
            ...data,
            id: `offline_${Date.now()}`
          }
        };
      }
    }
    
    // Wishlist endpoints
    if (endpoint.includes('/wishlist')) {
      if (method === 'POST' && endpoint.includes('/items')) {
        // Add to wishlist
        return {
          success: true,
          message: 'Item will be added to wishlist when online',
          offline: true,
          data: {
            ...data,
            id: `offline_${Date.now()}`
          }
        };
      }
    }
    
    // Recently viewed endpoints
    if (endpoint.includes('/recently-viewed')) {
      if (method === 'POST') {
        // Add to recently viewed
        return {
          success: true,
          message: 'Item will be added to recently viewed when online',
          offline: true
        };
      }
    }
    
    // Default response
    return {
      success: true,
      message: 'Request will be processed when online',
      offline: true
    };
  }
  
  /**
   * Handle request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Request options
   * @param {Function} requestFn - Request function
   * @returns {Promise} Promise that resolves with response data
   */
  async handleRequest(endpoint, method, data, requireAuth, options, requestFn) {
    // Skip if offline mode is disabled
    if (!this.options.enabled) {
      return requestFn();
    }
    
    // Check if online
    if (this.isOnline) {
      try {
        // Execute request
        return await requestFn();
      } catch (error) {
        // Check if network error
        if (error.message.includes('network') || error.message.includes('fetch')) {
          // Update online status
          this.isOnline = false;
          
          // Dispatch event
          window.dispatchEvent(new CustomEvent('app:offline'));
          
          // Check if endpoint can be used offline
          if (this.canUseOffline(endpoint, method)) {
            // Handle offline request
            return this.handleOfflineRequest(endpoint, method, data, requireAuth, options);
          }
        }
        
        // Rethrow error
        throw error;
      }
    } else {
      // Check if endpoint can be used offline
      if (this.canUseOffline(endpoint, method)) {
        // Handle offline request
        return this.handleOfflineRequest(endpoint, method, data, requireAuth, options);
      } else {
        // Throw offline error
        throw new Error('Cannot perform this action while offline');
      }
    }
  }
}

// Create global offline manager instance
const offlineManager = new OfflineManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = offlineManager;
}
