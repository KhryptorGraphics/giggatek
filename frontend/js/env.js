/**
 * Environment Configuration
 * 
 * This file contains environment-specific configuration settings.
 * It should be loaded before config.js.
 */

// Define environment
const ENV = {
  // Current environment (development, staging, production)
  current: 'development',
  
  // Environment-specific configuration
  development: {
    apiBaseUrl: 'http://localhost:3000/api/v1',
    enableMocks: true,
    debug: true,
    analyticsEnabled: false
  },
  
  staging: {
    apiBaseUrl: 'https://staging-api.giggatek.com/api/v1',
    enableMocks: false,
    debug: true,
    analyticsEnabled: true
  },
  
  production: {
    apiBaseUrl: 'https://api.giggatek.com/api/v1',
    enableMocks: false,
    debug: false,
    analyticsEnabled: true
  },
  
  // Get current environment configuration
  get: function(key) {
    return this[this.current][key];
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ENV;
} else {
  window.ENV = ENV;
}
