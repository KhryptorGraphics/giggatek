/**
 * Performance Module
 * 
 * This module combines all performance features for the application.
 */

// Import performance modules
const requestBatcher = window.requestBatcher || (typeof require !== 'undefined' ? require('./request-batcher') : null);
const requestPrioritizer = window.requestPrioritizer || (typeof require !== 'undefined' ? require('./request-prioritizer') : null);
const cacheManager = window.cacheManager || (typeof require !== 'undefined' ? require('./cache-manager') : null);
const offlineManager = window.offlineManager || (typeof require !== 'undefined' ? require('./offline-manager') : null);

class Performance {
  constructor() {
    this.requestBatcher = requestBatcher;
    this.requestPrioritizer = requestPrioritizer;
    this.cacheManager = cacheManager;
    this.offlineManager = offlineManager;
    
    // Initialize performance features
    this.initialize();
  }
  
  /**
   * Initialize performance features
   */
  initialize() {
    // Log performance features status
    console.info('Performance features:');
    console.info('- Request Batching:', this.requestBatcher ? 'Enabled' : 'Disabled');
    console.info('- Request Prioritization:', this.requestPrioritizer ? 'Enabled' : 'Disabled');
    console.info('- Advanced Caching:', this.cacheManager ? 'Enabled' : 'Disabled');
    console.info('- Offline Support:', this.offlineManager ? 'Enabled' : 'Disabled');
    
    // Add event listener for performance events
    window.addEventListener('performance:update', this.handlePerformanceUpdate.bind(this));
  }
  
  /**
   * Set API client
   * 
   * @param {Object} apiClient - API client
   */
  setApiClient(apiClient) {
    if (this.requestBatcher) {
      this.requestBatcher.setApiClient(apiClient);
    }
    
    if (this.offlineManager) {
      this.offlineManager.options.apiClient = apiClient;
    }
  }
  
  /**
   * Handle performance update event
   * 
   * @param {CustomEvent} event - Performance update event
   */
  handlePerformanceUpdate(event) {
    if (event.detail) {
      // Update request batching
      if (event.detail.batchingEnabled !== undefined && this.requestBatcher) {
        this.requestBatcher.options.enabled = event.detail.batchingEnabled;
      }
      
      // Update request prioritization
      if (event.detail.prioritizationEnabled !== undefined && this.requestPrioritizer) {
        this.requestPrioritizer.options.enabled = event.detail.prioritizationEnabled;
      }
      
      // Update caching
      if (event.detail.cachingEnabled !== undefined && this.cacheManager) {
        this.cacheManager.options.enabled = event.detail.cachingEnabled;
      }
      
      // Update offline support
      if (event.detail.offlineEnabled !== undefined && this.offlineManager) {
        this.offlineManager.options.enabled = event.detail.offlineEnabled;
      }
    }
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
    // Create request function chain
    let currentRequestFn = requestFn;
    
    // Apply offline support
    if (this.offlineManager) {
      const offlineManager = this.offlineManager;
      const previousRequestFn = currentRequestFn;
      
      currentRequestFn = async () => {
        return offlineManager.handleRequest(
          endpoint, 
          method, 
          data, 
          requireAuth, 
          options, 
          previousRequestFn
        );
      };
    }
    
    // Apply caching
    if (this.cacheManager && method === 'GET') {
      const cacheManager = this.cacheManager;
      const previousRequestFn = currentRequestFn;
      
      currentRequestFn = async () => {
        return cacheManager.cacheRequest(
          endpoint,
          method,
          data,
          previousRequestFn,
          options
        );
      };
    }
    
    // Apply request batching
    if (this.requestBatcher && method === 'GET') {
      const requestBatcher = this.requestBatcher;
      const previousRequestFn = currentRequestFn;
      
      currentRequestFn = async () => {
        return requestBatcher.batchRequest(
          endpoint,
          method,
          data,
          requireAuth,
          options,
          previousRequestFn
        );
      };
    }
    
    // Apply request prioritization
    if (this.requestPrioritizer) {
      const requestPrioritizer = this.requestPrioritizer;
      const previousRequestFn = currentRequestFn;
      
      currentRequestFn = async () => {
        return requestPrioritizer.prioritizeRequest(
          endpoint,
          method,
          previousRequestFn,
          options
        );
      };
    }
    
    // Execute request chain
    return currentRequestFn();
  }
  
  /**
   * Get performance statistics
   * 
   * @returns {Object} Performance statistics
   */
  getStats() {
    const stats = {
      cache: this.cacheManager ? this.cacheManager.getStats() : null,
      offline: this.offlineManager ? {
        isOnline: this.offlineManager.isOnline,
        queueSize: this.offlineManager.offlineQueue.length
      } : null
    };
    
    return stats;
  }
}

// Create global performance instance
const performance = new Performance();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = performance;
}
