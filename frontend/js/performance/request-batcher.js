/**
 * Request Batcher
 * 
 * This module provides request batching functionality for API requests.
 */

class RequestBatcher {
  constructor(options = {}) {
    this.options = {
      // Maximum batch size
      maxBatchSize: options.maxBatchSize || 10,
      
      // Batch delay in milliseconds
      batchDelay: options.batchDelay || 50,
      
      // Whether to enable debug logging
      debug: options.debug !== undefined ? options.debug : false,
      
      // Endpoints that support batching
      batchableEndpoints: options.batchableEndpoints || [
        '/products',
        '/orders',
        '/rentals',
        '/users'
      ],
      
      // Batch endpoint
      batchEndpoint: options.batchEndpoint || '/batch',
      
      // API client
      apiClient: options.apiClient || null
    };
    
    // Pending batches by endpoint
    this.pendingBatches = {};
    
    // Batch timeouts
    this.batchTimeouts = {};
  }
  
  /**
   * Set API client
   * 
   * @param {Object} apiClient - API client
   */
  setApiClient(apiClient) {
    this.options.apiClient = apiClient;
  }
  
  /**
   * Check if endpoint is batchable
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {boolean} True if endpoint is batchable
   */
  isBatchable(endpoint, method) {
    // Only GET requests can be batched
    if (method !== 'GET') {
      return false;
    }
    
    // Check if endpoint is in batchable endpoints
    return this.options.batchableEndpoints.some(batchableEndpoint => {
      return endpoint.startsWith(batchableEndpoint);
    });
  }
  
  /**
   * Add request to batch
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  addToBatch(endpoint, method, data, requireAuth, options) {
    return new Promise((resolve, reject) => {
      // Get batch key
      const batchKey = this.getBatchKey(endpoint, requireAuth);
      
      // Initialize batch if not exists
      if (!this.pendingBatches[batchKey]) {
        this.pendingBatches[batchKey] = {
          requests: [],
          requireAuth
        };
      }
      
      // Add request to batch
      this.pendingBatches[batchKey].requests.push({
        endpoint,
        method,
        data,
        options,
        resolve,
        reject
      });
      
      // Log if debug is enabled
      if (this.options.debug) {
        console.debug(`Added request to batch ${batchKey}. Batch size: ${this.pendingBatches[batchKey].requests.length}`);
      }
      
      // Process batch if it reaches maximum size
      if (this.pendingBatches[batchKey].requests.length >= this.options.maxBatchSize) {
        this.processBatch(batchKey);
      } else {
        // Schedule batch processing
        this.scheduleBatchProcessing(batchKey);
      }
    });
  }
  
  /**
   * Schedule batch processing
   * 
   * @param {string} batchKey - Batch key
   */
  scheduleBatchProcessing(batchKey) {
    // Clear existing timeout
    if (this.batchTimeouts[batchKey]) {
      clearTimeout(this.batchTimeouts[batchKey]);
    }
    
    // Schedule batch processing
    this.batchTimeouts[batchKey] = setTimeout(() => {
      this.processBatch(batchKey);
    }, this.options.batchDelay);
  }
  
  /**
   * Process batch
   * 
   * @param {string} batchKey - Batch key
   */
  async processBatch(batchKey) {
    // Get batch
    const batch = this.pendingBatches[batchKey];
    
    // Clear batch
    delete this.pendingBatches[batchKey];
    
    // Clear timeout
    if (this.batchTimeouts[batchKey]) {
      clearTimeout(this.batchTimeouts[batchKey]);
      delete this.batchTimeouts[batchKey];
    }
    
    // Check if batch is empty
    if (!batch || !batch.requests || batch.requests.length === 0) {
      return;
    }
    
    // Log if debug is enabled
    if (this.options.debug) {
      console.debug(`Processing batch ${batchKey} with ${batch.requests.length} requests`);
    }
    
    try {
      // Check if API client is available
      if (!this.options.apiClient) {
        throw new Error('API client not available');
      }
      
      // Create batch request
      const batchRequest = {
        requests: batch.requests.map(request => ({
          method: request.method,
          url: request.endpoint,
          data: request.data
        }))
      };
      
      // Send batch request
      const batchResponse = await this.options.apiClient.post(
        this.options.batchEndpoint,
        batchRequest,
        batch.requireAuth
      );
      
      // Process batch response
      if (Array.isArray(batchResponse) && batchResponse.length === batch.requests.length) {
        // Resolve/reject individual requests
        batchResponse.forEach((response, index) => {
          const request = batch.requests[index];
          
          if (response.status >= 200 && response.status < 300) {
            // Resolve request
            request.resolve(response.data);
          } else {
            // Reject request
            request.reject(new Error(response.error || 'Batch request failed'));
          }
        });
      } else {
        // Invalid batch response
        throw new Error('Invalid batch response');
      }
    } catch (error) {
      // Log error
      console.error('Error processing batch:', error);
      
      // Reject all requests
      batch.requests.forEach(request => {
        request.reject(error);
      });
      
      // Fall back to individual requests
      this.fallbackToIndividualRequests(batch);
    }
  }
  
  /**
   * Fall back to individual requests
   * 
   * @param {Object} batch - Batch
   */
  async fallbackToIndividualRequests(batch) {
    // Log if debug is enabled
    if (this.options.debug) {
      console.debug(`Falling back to individual requests for ${batch.requests.length} requests`);
    }
    
    // Process each request individually
    for (const request of batch.requests) {
      try {
        // Send individual request
        const response = await this.options.apiClient.request(
          request.method,
          request.endpoint,
          request.data,
          batch.requireAuth,
          request.options
        );
        
        // Resolve request
        request.resolve(response);
      } catch (error) {
        // Reject request
        request.reject(error);
      }
    }
  }
  
  /**
   * Get batch key
   * 
   * @param {string} endpoint - API endpoint
   * @param {boolean} requireAuth - Whether request requires authentication
   * @returns {string} Batch key
   */
  getBatchKey(endpoint, requireAuth) {
    // Get endpoint base
    const endpointBase = endpoint.split('?')[0].split('/').slice(0, 2).join('/');
    
    // Create batch key
    return `${endpointBase}:${requireAuth ? 'auth' : 'noauth'}`;
  }
  
  /**
   * Batch request
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  batchRequest(endpoint, method, data, requireAuth, options) {
    // Check if request can be batched
    if (this.isBatchable(endpoint, method)) {
      // Add request to batch
      return this.addToBatch(endpoint, method, data, requireAuth, options);
    } else {
      // Send individual request
      return this.options.apiClient.request(method, endpoint, data, requireAuth, options);
    }
  }
}

// Create global request batcher instance
const requestBatcher = new RequestBatcher();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = requestBatcher;
}
