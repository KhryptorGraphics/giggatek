/**
 * Request Prioritizer
 * 
 * This module provides request prioritization functionality for API requests.
 */

class RequestPrioritizer {
  constructor(options = {}) {
    this.options = {
      // Default priority
      defaultPriority: options.defaultPriority || 3,
      
      // Priority levels (1 = highest, 5 = lowest)
      priorityLevels: options.priorityLevels || 5,
      
      // Whether to enable debug logging
      debug: options.debug !== undefined ? options.debug : false,
      
      // Maximum concurrent requests per priority level
      maxConcurrentRequests: options.maxConcurrentRequests || {
        1: 6, // Critical requests
        2: 4, // High priority
        3: 3, // Normal priority
        4: 2, // Low priority
        5: 1  // Background
      },
      
      // Request timeout in milliseconds per priority level
      requestTimeout: options.requestTimeout || {
        1: 30000,  // 30 seconds for critical
        2: 20000,  // 20 seconds for high
        3: 15000,  // 15 seconds for normal
        4: 10000,  // 10 seconds for low
        5: 5000    // 5 seconds for background
      }
    };
    
    // Request queues by priority
    this.queues = {};
    
    // Active requests by priority
    this.activeRequests = {};
    
    // Initialize queues and active requests
    for (let i = 1; i <= this.options.priorityLevels; i++) {
      this.queues[i] = [];
      this.activeRequests[i] = 0;
    }
    
    // Priority rules
    this.priorityRules = [
      // Critical priority (1)
      {
        test: (endpoint, method) => {
          return (
            // Authentication requests
            endpoint.includes('/auth/') ||
            // User profile
            endpoint === '/users/me' ||
            // Checkout
            endpoint.includes('/checkout') ||
            // Payment
            endpoint.includes('/payment')
          );
        },
        priority: 1
      },
      
      // High priority (2)
      {
        test: (endpoint, method) => {
          return (
            // Current cart
            endpoint.includes('/cart') ||
            // Product details
            endpoint.match(/\/products\/\d+$/) ||
            // Order details
            endpoint.match(/\/orders\/\d+$/) ||
            // Rental details
            endpoint.match(/\/rentals\/\d+$/)
          );
        },
        priority: 2
      },
      
      // Low priority (4)
      {
        test: (endpoint, method) => {
          return (
            // Search requests
            endpoint.includes('/search') ||
            // List requests with pagination
            endpoint.includes('?page=') ||
            // Background data
            endpoint.includes('/stats') ||
            endpoint.includes('/analytics')
          );
        },
        priority: 4
      },
      
      // Background priority (5)
      {
        test: (endpoint, method) => {
          return (
            // Recommendations
            endpoint.includes('/recommendations') ||
            // Recently viewed
            endpoint.includes('/recently-viewed') ||
            // Notifications
            endpoint.includes('/notifications')
          );
        },
        priority: 5
      }
    ];
  }
  
  /**
   * Get priority for request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} options - Request options
   * @returns {number} Priority level
   */
  getPriority(endpoint, method, options = {}) {
    // Check if priority is specified in options
    if (options.priority && options.priority >= 1 && options.priority <= this.options.priorityLevels) {
      return options.priority;
    }
    
    // Check priority rules
    for (const rule of this.priorityRules) {
      if (rule.test(endpoint, method)) {
        return rule.priority;
      }
    }
    
    // Return default priority
    return this.options.defaultPriority;
  }
  
  /**
   * Add request to queue
   * 
   * @param {number} priority - Priority level
   * @param {Function} requestFn - Request function
   * @returns {Promise} Promise that resolves with request result
   */
  addToQueue(priority, requestFn) {
    return new Promise((resolve, reject) => {
      // Add request to queue
      this.queues[priority].push({
        requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // Log if debug is enabled
      if (this.options.debug) {
        console.debug(`Added request to priority ${priority} queue. Queue size: ${this.queues[priority].length}`);
      }
      
      // Process queue
      this.processQueue(priority);
    });
  }
  
  /**
   * Process queue
   * 
   * @param {number} priority - Priority level
   */
  async processQueue(priority) {
    // Check if queue is empty
    if (this.queues[priority].length === 0) {
      return;
    }
    
    // Check if we can process more requests
    if (this.activeRequests[priority] >= this.options.maxConcurrentRequests[priority]) {
      return;
    }
    
    // Get next request from queue
    const request = this.queues[priority].shift();
    
    // Increment active requests
    this.activeRequests[priority]++;
    
    // Log if debug is enabled
    if (this.options.debug) {
      console.debug(`Processing request from priority ${priority} queue. Active requests: ${this.activeRequests[priority]}`);
    }
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout (priority ${priority})`));
        }, this.options.requestTimeout[priority]);
      });
      
      // Execute request with timeout
      const result = await Promise.race([
        request.requestFn(),
        timeoutPromise
      ]);
      
      // Resolve promise
      request.resolve(result);
    } catch (error) {
      // Reject promise
      request.reject(error);
    } finally {
      // Decrement active requests
      this.activeRequests[priority]--;
      
      // Process next request in queue
      this.processQueue(priority);
      
      // Process higher priority queues
      for (let p = 1; p < priority; p++) {
        this.processQueue(p);
      }
    }
  }
  
  /**
   * Prioritize request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Function} requestFn - Request function
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with request result
   */
  prioritizeRequest(endpoint, method, requestFn, options = {}) {
    // Get priority for request
    const priority = this.getPriority(endpoint, method, options);
    
    // Add request to queue
    return this.addToQueue(priority, requestFn);
  }
}

// Create global request prioritizer instance
const requestPrioritizer = new RequestPrioritizer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = requestPrioritizer;
}
