/**
 * State Manager
 * 
 * This module provides a simple state management system for the application.
 */

class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.pendingRequests = {};
  }

  /**
   * Get state value
   * 
   * @param {string} key - State key
   * @returns {*} State value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set state value
   * 
   * @param {string} key - State key
   * @param {*} value - State value
   * @param {boolean} notify - Whether to notify listeners
   */
  set(key, value, notify = true) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    if (notify && this.listeners[key]) {
      this.listeners[key].forEach(listener => {
        try {
          listener(value, oldValue);
        } catch (error) {
          console.error(`Error in state listener for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to state changes
   * 
   * @param {string} key - State key
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, listener) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    
    this.listeners[key].push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(l => l !== listener);
      
      if (this.listeners[key].length === 0) {
        delete this.listeners[key];
      }
    };
  }

  /**
   * Fetch data from API and update state
   * 
   * @param {string} key - State key
   * @param {Function} fetchFn - Function that returns a Promise
   * @param {Object} options - Options
   * @param {boolean} options.cache - Whether to cache the result
   * @param {number} options.cacheTime - Cache time in milliseconds
   * @param {boolean} options.dedupe - Whether to dedupe requests
   * @returns {Promise} Promise that resolves with fetched data
   */
  async fetch(key, fetchFn, options = {}) {
    const defaults = {
      cache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      dedupe: true
    };
    
    const settings = { ...defaults, ...options };
    
    // Check if request is already pending
    if (settings.dedupe && this.pendingRequests[key]) {
      return this.pendingRequests[key];
    }
    
    // Check if data is cached
    const cachedData = this.get(key);
    const cachedTime = this.get(`${key}_time`);
    
    if (settings.cache && cachedData && cachedTime) {
      const now = Date.now();
      const age = now - cachedTime;
      
      if (age < settings.cacheTime) {
        return cachedData;
      }
    }
    
    // Set loading state
    this.set(`${key}_loading`, true);
    this.set(`${key}_error`, null);
    
    // Create promise
    const promise = (async () => {
      try {
        const data = await fetchFn();
        
        // Update state
        this.set(key, data);
        this.set(`${key}_time`, Date.now());
        this.set(`${key}_loading`, false);
        
        return data;
      } catch (error) {
        // Update error state
        this.set(`${key}_error`, error);
        this.set(`${key}_loading`, false);
        
        throw error;
      } finally {
        // Remove pending request
        delete this.pendingRequests[key];
      }
    })();
    
    // Store pending request
    if (settings.dedupe) {
      this.pendingRequests[key] = promise;
    }
    
    return promise;
  }

  /**
   * Clear state
   * 
   * @param {string} keyPrefix - Key prefix to clear (optional)
   */
  clear(keyPrefix = '') {
    if (keyPrefix) {
      // Clear keys with prefix
      Object.keys(this.state).forEach(key => {
        if (key.startsWith(keyPrefix)) {
          delete this.state[key];
        }
      });
    } else {
      // Clear all state
      this.state = {};
    }
  }

  /**
   * Get loading state
   * 
   * @param {string} key - State key
   * @returns {boolean} Loading state
   */
  isLoading(key) {
    return !!this.get(`${key}_loading`);
  }

  /**
   * Get error state
   * 
   * @param {string} key - State key
   * @returns {Error|null} Error state
   */
  getError(key) {
    return this.get(`${key}_error`);
  }
}

// Create global state manager instance
const stateManager = new StateManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stateManager;
}
