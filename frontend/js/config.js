/**
 * Configuration
 *
 * This file contains configuration settings for the application.
 * It uses environment-specific settings from env.js if available.
 */

// Get environment configuration
const ENV = window.ENV || (typeof ENV !== 'undefined' ? ENV : {
  current: 'development',
  get: function(key) {
    return {
      apiBaseUrl: 'http://localhost:3000/api/v1',
      enableMocks: true,
      debug: true,
      analyticsEnabled: false
    }[key];
  }
});

const config = {
  // API configuration
  api: {
    // Base URL for API requests
    baseUrl: ENV.get('apiBaseUrl'),

    // Authentication settings
    auth: {
      // Token expiration time in minutes
      tokenExpiryMinutes: 45,

      // Refresh token before expiration (minutes)
      refreshBeforeExpiryMinutes: 5,

      // Storage key for authentication data
      storageKey: 'giggatek_auth',

      // Endpoints
      endpoints: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
        currentUser: '/users/me'
      }
    },

    // Product endpoints
    products: {
      list: '/products',
      detail: (id) => `/products/${id}`
    },

    // Search endpoints
    search: {
      suggestions: '/search/suggestions'
    },

    // Order endpoints
    orders: {
      list: '/orders',
      detail: (id) => `/orders/${id}`,
      create: '/orders',
      cancel: (id) => `/orders/${id}/cancel`,
      review: (id) => `/orders/${id}/review`
    },

    // Rental endpoints
    rentals: {
      list: '/rentals',
      detail: (id) => `/rentals/${id}`,
      create: '/rentals',
      cancel: (id) => `/rentals/${id}/cancel`,
      extend: (id) => `/rentals/${id}/extend`
    }
  },

  // Feature flags
  features: {
    enableOfflineMode: false,
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorReporting: process.env.NODE_ENV === 'production'
  },

  // UI configuration
  ui: {
    // Default pagination settings
    pagination: {
      defaultPageSize: 12,
      pageSizeOptions: [12, 24, 48, 96]
    },

    // Default currency format
    currency: {
      code: 'USD',
      locale: 'en-US'
    },

    // Date format
    dateFormat: {
      short: 'MM/DD/YYYY',
      long: 'MMMM D, YYYY'
    },

    // Notification settings
    notifications: {
      defaultDuration: 5000, // milliseconds
      position: 'top-right'
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
