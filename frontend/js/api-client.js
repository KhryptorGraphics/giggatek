/**
 * GigGatek API Client
 *
 * This module provides a client for interacting with the GigGatek API.
 */

class ApiClient {
  constructor() {
    // Use mock API server in development
    this.baseUrl = 'http://localhost:3000/api/v1';
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.refreshTimeout = null;

    // Load token from storage if available
    this.loadTokenFromStorage();

    // Set up token refresh if token exists
    if (this.token && this.tokenExpiry) {
      this.setupTokenRefresh();
    }
  }

  /**
   * Load authentication token from storage
   */
  loadTokenFromStorage() {
    try {
      const authData = JSON.parse(localStorage.getItem('giggatek_auth'));
      if (authData) {
        this.token = authData.token;
        this.refreshToken = authData.refreshToken;
        this.tokenExpiry = authData.tokenExpiry;
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
      this.clearTokens();
    }
  }

  /**
   * Save authentication token to storage
   */
  saveTokenToStorage() {
    try {
      const authData = {
        token: this.token,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry
      };
      localStorage.setItem('giggatek_auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    // Clear from storage
    localStorage.removeItem('giggatek_auth');

    // Clear refresh timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Set up token refresh
   */
  setupTokenRefresh() {
    // Clear existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // Calculate time until token expires
    const now = Date.now();
    const expiryTime = new Date(this.tokenExpiry).getTime();
    const timeUntilExpiry = expiryTime - now;

    // Refresh token 5 minutes before it expires
    const refreshTime = Math.max(0, timeUntilExpiry - (5 * 60 * 1000));

    // Set timeout to refresh token
    this.refreshTimeout = setTimeout(() => {
      this.refreshAuthToken();
    }, refreshTime);
  }

  /**
   * Set authentication token
   *
   * @param {Object} authData - Authentication data
   * @param {string} authData.token - JWT token
   * @param {string} authData.refreshToken - Refresh token
   * @param {number} authData.expiresIn - Token expiry time in seconds
   */
  setAuthToken(authData) {
    this.token = authData.token;
    this.refreshToken = authData.refreshToken;

    // Calculate expiry time
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + authData.expiresIn);
    this.tokenExpiry = expiryDate.toISOString();

    // Save to storage
    this.saveTokenToStorage();

    // Set up token refresh
    this.setupTokenRefresh();
  }

  /**
   * Check if user is authenticated
   *
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }

    // Check if token has expired
    const now = new Date();
    const expiryDate = new Date(this.tokenExpiry);

    return now < expiryDate;
  }

  /**
   * Refresh authentication token
   *
   * @returns {Promise} Promise that resolves when token is refreshed
   */
  async refreshAuthToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.post('/auth/refresh', {
        refreshToken: this.refreshToken
      }, false);

      this.setAuthToken({
        token: response.token,
        refreshToken: response.refreshToken || this.refreshToken,
        expiresIn: response.expiresIn
      });

      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);

      // Clear tokens if refresh fails
      this.clearTokens();

      // Dispatch event to notify app of authentication failure
      window.dispatchEvent(new CustomEvent('auth:expired'));

      throw error;
    }
  }

  /**
   * Make API request
   *
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async request(method, endpoint, data = null, requireAuth = true, options = {}) {
    // Check if authentication is required
    if (requireAuth && !this.isAuthenticated()) {
      // Try to refresh token if available
      if (this.refreshToken) {
        await this.refreshAuthToken();
      } else {
        throw new Error('Authentication required');
      }
    }

    // Build request URL
    const url = `${this.baseUrl}${endpoint}`;

    // Build request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    };

    // Add authentication header if required
    if (requireAuth && this.token) {
      requestOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add request body if needed
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    // Make request
    try {
      const response = await fetch(url, requestOptions);

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError('Rate limit exceeded', response.status, {
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : 60
        });
      }

      // Parse response
      let responseData;
      const contentType = response.headers.get('Content-Type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Check for error response
      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'API request failed',
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      // Handle network errors
      if (!(error instanceof ApiError)) {
        error = new ApiError(
          error.message || 'Network error',
          0,
          { originalError: error }
        );
      }

      // Handle authentication errors
      if (error.status === 401 && requireAuth) {
        // Clear tokens
        this.clearTokens();

        // Dispatch event to notify app of authentication failure
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      throw error;
    }
  }

  /**
   * Make GET request
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async get(endpoint, params = null, requireAuth = true, options = {}) {
    // Add query parameters to endpoint
    let url = endpoint;
    if (params) {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
    }

    return this.request('GET', url, null, requireAuth, options);
  }

  /**
   * Make POST request
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async post(endpoint, data = null, requireAuth = true, options = {}) {
    return this.request('POST', endpoint, data, requireAuth, options);
  }

  /**
   * Make PUT request
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async put(endpoint, data = null, requireAuth = true, options = {}) {
    return this.request('PUT', endpoint, data, requireAuth, options);
  }

  /**
   * Make PATCH request
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async patch(endpoint, data = null, requireAuth = true, options = {}) {
    return this.request('PATCH', endpoint, data, requireAuth, options);
  }

  /**
   * Make DELETE request
   *
   * @param {string} endpoint - API endpoint
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async delete(endpoint, requireAuth = true, options = {}) {
    return this.request('DELETE', endpoint, null, requireAuth, options);
  }

  /**
   * Login user
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise that resolves with user data
   */
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password }, false);

    this.setAuthToken({
      token: response.token,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    });

    return response;
  }

  /**
   * Register user
   *
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise that resolves with user data
   */
  async register(userData) {
    return this.post('/auth/register', userData, false);
  }

  /**
   * Logout user
   *
   * @returns {Promise} Promise that resolves when logout is complete
   */
  async logout() {
    try {
      // Call logout endpoint if authenticated
      if (this.isAuthenticated()) {
        await this.post('/auth/logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear tokens
      this.clearTokens();

      // Dispatch event to notify app of logout
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  /**
   * Get current user
   *
   * @returns {Promise} Promise that resolves with user data
   */
  async getCurrentUser() {
    return this.get('/users/me');
  }

  /**
   * Get products
   *
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise that resolves with products data
   */
  async getProducts(params = {}) {
    return this.get('/products', params, false);
  }

  /**
   * Get product by ID
   *
   * @param {string|number} id - Product ID
   * @returns {Promise} Promise that resolves with product data
   */
  async getProduct(id) {
    return this.get(`/products/${id}`, null, false);
  }

  /**
   * Get orders
   *
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise that resolves with orders data
   */
  async getOrders(params = {}) {
    return this.get('/orders', params);
  }

  /**
   * Get order by ID
   *
   * @param {string|number} id - Order ID
   * @returns {Promise} Promise that resolves with order data
   */
  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  /**
   * Create order
   *
   * @param {Object} orderData - Order data
   * @returns {Promise} Promise that resolves with created order data
   */
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  /**
   * Get rentals
   *
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise that resolves with rentals data
   */
  async getRentals(params = {}) {
    return this.get('/rentals', params);
  }

  /**
   * Get rental by ID
   *
   * @param {string|number} id - Rental ID
   * @returns {Promise} Promise that resolves with rental data
   */
  async getRental(id) {
    return this.get(`/rentals/${id}`);
  }

  /**
   * Create rental
   *
   * @param {Object} rentalData - Rental data
   * @returns {Promise} Promise that resolves with created rental data
   */
  async createRental(rentalData) {
    return this.post('/rentals', rentalData);
  }
}

/**
 * API Error class
 */
class ApiError extends Error {
  /**
   * Constructor
   *
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {Object} data - Additional error data
   */
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create global API client instance
const api = new ApiClient();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { api, ApiError };
}
