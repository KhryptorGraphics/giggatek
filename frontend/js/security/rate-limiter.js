/**
 * Rate Limiter
 * 
 * This module provides client-side rate limiting for API requests.
 */

class RateLimiter {
  constructor(options = {}) {
    this.options = {
      // Default rate limits (requests per time window)
      limits: {
        default: { count: 60, window: 60000 }, // 60 requests per minute
        auth: { count: 5, window: 60000 },     // 5 auth requests per minute
        search: { count: 10, window: 10000 },  // 10 search requests per 10 seconds
        ...options.limits
      },
      
      // Whether to queue requests that exceed the rate limit
      queueExceeded: options.queueExceeded !== undefined ? options.queueExceeded : true,
      
      // Maximum queue size
      maxQueueSize: options.maxQueueSize || 100,
      
      // Whether to enable debug logging
      debug: options.debug !== undefined ? options.debug : false
    };
    
    // Initialize request counters
    this.counters = {};
    
    // Initialize request queues
    this.queues = {};
    
    // Initialize processing flags
    this.processing = {};
  }
  
  /**
   * Check if request is allowed
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {boolean} True if request is allowed
   */
  isAllowed(endpoint, method) {
    // Get rate limit category
    const category = this.getCategory(endpoint, method);
    
    // Get rate limit for category
    const limit = this.options.limits[category] || this.options.limits.default;
    
    // Initialize counter if not exists
    if (!this.counters[category]) {
      this.counters[category] = {
        count: 0,
        resetTime: Date.now() + limit.window
      };
    }
    
    // Check if counter needs to be reset
    if (Date.now() > this.counters[category].resetTime) {
      this.counters[category] = {
        count: 0,
        resetTime: Date.now() + limit.window
      };
    }
    
    // Check if request is allowed
    return this.counters[category].count < limit.count;
  }
  
  /**
   * Increment request counter
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   */
  increment(endpoint, method) {
    // Get rate limit category
    const category = this.getCategory(endpoint, method);
    
    // Get rate limit for category
    const limit = this.options.limits[category] || this.options.limits.default;
    
    // Initialize counter if not exists
    if (!this.counters[category]) {
      this.counters[category] = {
        count: 0,
        resetTime: Date.now() + limit.window
      };
    }
    
    // Increment counter
    this.counters[category].count++;
    
    // Log if debug is enabled
    if (this.options.debug) {
      console.debug(`Rate limit for ${category}: ${this.counters[category].count}/${limit.count}`);
    }
  }
  
  /**
   * Get time until rate limit reset
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {number} Time in milliseconds until rate limit reset
   */
  getTimeUntilReset(endpoint, method) {
    // Get rate limit category
    const category = this.getCategory(endpoint, method);
    
    // Get counter for category
    const counter = this.counters[category];
    
    // Return time until reset
    return counter ? Math.max(0, counter.resetTime - Date.now()) : 0;
  }
  
  /**
   * Get rate limit category for endpoint
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {string} Rate limit category
   */
  getCategory(endpoint, method) {
    // Auth endpoints
    if (endpoint.includes('/auth/')) {
      return 'auth';
    }
    
    // Search endpoints
    if (endpoint.includes('/search') || endpoint.includes('?search=')) {
      return 'search';
    }
    
    // Default category
    return 'default';
  }
  
  /**
   * Queue request for later execution
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Function} requestFn - Request function
   * @returns {Promise} Promise that resolves with request result
   */
  queueRequest(endpoint, method, requestFn) {
    return new Promise((resolve, reject) => {
      // Get rate limit category
      const category = this.getCategory(endpoint, method);
      
      // Initialize queue if not exists
      if (!this.queues[category]) {
        this.queues[category] = [];
      }
      
      // Check if queue is full
      if (this.queues[category].length >= this.options.maxQueueSize) {
        reject(new Error('Rate limit queue is full'));
        return;
      }
      
      // Add request to queue
      this.queues[category].push({
        requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // Log if debug is enabled
      if (this.options.debug) {
        console.debug(`Queued request for ${category}. Queue size: ${this.queues[category].length}`);
      }
      
      // Process queue
      this.processQueue(category);
    });
  }
  
  /**
   * Process request queue
   * 
   * @param {string} category - Rate limit category
   */
  async processQueue(category) {
    // Check if already processing
    if (this.processing[category]) {
      return;
    }
    
    // Set processing flag
    this.processing[category] = true;
    
    try {
      // Process queue until empty
      while (this.queues[category] && this.queues[category].length > 0) {
        // Check if request is allowed
        if (!this.isAllowed(category, 'GET')) {
          // Wait until rate limit reset
          const timeUntilReset = this.getTimeUntilReset(category, 'GET');
          
          // Log if debug is enabled
          if (this.options.debug) {
            console.debug(`Rate limit reached for ${category}. Waiting ${timeUntilReset}ms`);
          }
          
          // Wait for rate limit to reset
          await new Promise(resolve => setTimeout(resolve, timeUntilReset + 100));
          continue;
        }
        
        // Get next request from queue
        const request = this.queues[category].shift();
        
        // Increment counter
        this.increment(category, 'GET');
        
        try {
          // Execute request
          const result = await request.requestFn();
          
          // Resolve promise
          request.resolve(result);
        } catch (error) {
          // Reject promise
          request.reject(error);
        }
      }
    } finally {
      // Clear processing flag
      this.processing[category] = false;
    }
  }
  
  /**
   * Limit request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Function} requestFn - Request function
   * @returns {Promise} Promise that resolves with request result
   */
  limitRequest(endpoint, method, requestFn) {
    // Check if request is allowed
    if (this.isAllowed(endpoint, method)) {
      // Increment counter
      this.increment(endpoint, method);
      
      // Execute request
      return requestFn();
    } else {
      // Check if queueing is enabled
      if (this.options.queueExceeded) {
        // Queue request
        return this.queueRequest(endpoint, method, requestFn);
      } else {
        // Throw rate limit error
        const timeUntilReset = this.getTimeUntilReset(endpoint, method);
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds`);
      }
    }
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = rateLimiter;
}
