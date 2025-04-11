/**
 * GigGatek API Client
 *
 * This module provides a client for interacting with the GigGatek API.
 */

class ApiClient {
  constructor() {
    // Use configuration from config.js
    this.config = window.config || (typeof config !== 'undefined' ? config : { api: { baseUrl: 'http://localhost:3000/api/v1' } });
    this.baseUrl = this.config.api.baseUrl;
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.refreshTimeout = null;

    // Security and performance features
    this.security = window.security || null;
    this.performance = window.performance || null;

    // Set API client reference in performance module
    if (this.performance) {
      this.performance.setApiClient(this);
    }

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
      const storageKey = this.config.api.auth?.storageKey || 'giggatek_auth';
      const authData = JSON.parse(localStorage.getItem(storageKey));
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
      const storageKey = this.config.api.auth?.storageKey || 'giggatek_auth';
      const authData = {
        token: this.token,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry
      };
      localStorage.setItem(storageKey, JSON.stringify(authData));
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
    const storageKey = this.config.api.auth?.storageKey || 'giggatek_auth';
    localStorage.removeItem(storageKey);

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

    // Get refresh before expiry time from config (default to 5 minutes)
    const refreshBeforeExpiryMinutes = this.config.api.auth?.refreshBeforeExpiryMinutes || 5;
    const refreshTime = Math.max(0, timeUntilExpiry - (refreshBeforeExpiryMinutes * 60 * 1000));

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
      const refreshEndpoint = this.config.api.auth?.endpoints?.refresh || '/auth/refresh';
      const response = await this.post(refreshEndpoint, {
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
    // Create request function
    const requestFn = () => {
      return this._makeRequest(method, endpoint, data, requireAuth, options);
    };

    // Apply security features
    let secureRequestFn = requestFn;

    if (this.security && this.security.rateLimiter) {
      const security = this.security;
      secureRequestFn = () => {
        return security.rateLimiter.limitRequest(endpoint, method, requestFn);
      };
    }

    // Apply performance features
    if (this.performance) {
      return this.performance.handleRequest(
        endpoint,
        method,
        data,
        requireAuth,
        options,
        secureRequestFn
      );
    } else {
      return secureRequestFn();
    }
  }

  /**
   * Make actual API request
   *
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {boolean} requireAuth - Whether request requires authentication
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves with response data
   */
  async _makeRequest(method, endpoint, data = null, requireAuth = true, options = {}) {
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
    let requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    };

    // Apply security features if available
    if (this.security) {
      requestOptions = this.security.applyToRequest(requestOptions, method, endpoint);
    }

    // Add authentication header if required
    if (requireAuth && this.token) {
      requestOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add request body if needed
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      // Encrypt data if encryption is enabled
      if (this.security && this.security.encryptionService && this.security.encryptionService.isEnabled()) {
        const encryptedData = await this.security.encryptionService.encrypt(data);
        requestOptions.body = JSON.stringify(encryptedData);

        // Add encryption header
        requestOptions.headers['X-Encryption-Enabled'] = 'true';
      } else {
        requestOptions.body = JSON.stringify(data);
      }
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

      // Process response for security features
      if (this.security) {
        this.security.processResponse(response);
      }

      // Parse response
      let responseData;
      const contentType = response.headers.get('Content-Type');
      const isEncrypted = response.headers.get('X-Encryption-Enabled') === 'true';

      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();

        // Decrypt response if encrypted and encryption is enabled
        if (isEncrypted && this.security && this.security.encryptionService && this.security.encryptionService.isEnabled()) {
          responseData = await this.security.encryptionService.decrypt(jsonData);
        } else {
          responseData = jsonData;
        }
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
    const loginEndpoint = this.config.api.auth?.endpoints?.login || '/auth/login';
    const response = await this.post(loginEndpoint, { email, password }, false);

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
    const registerEndpoint = this.config.api.auth?.endpoints?.register || '/auth/register';
    return this.post(registerEndpoint, userData, false);
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
        const logoutEndpoint = this.config.api.auth?.endpoints?.logout || '/auth/logout';
        await this.post(logoutEndpoint);
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
    const currentUserEndpoint = this.config.api.auth?.endpoints?.currentUser || '/users/me';
    return this.get(currentUserEndpoint);
  }

  /**
   * Get products
   *
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise that resolves with products data
   */
  async getProducts(params = {}) {
    const productsEndpoint = this.config.api.products?.list || '/products';
    return this.get(productsEndpoint, params, false);
  }

  /**
   * Get product by ID
   *
   * @param {string|number} id - Product ID
   * @returns {Promise} Promise that resolves with product data
   */
  async getProduct(id) {
    const productDetailEndpoint = this.config.api.products?.detail ?
      this.config.api.products.detail(id) :
      `/products/${id}`;
    return this.get(productDetailEndpoint, null, false);
  }

  /**
   * Get orders
   *
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise that resolves with orders data
   */
  async getOrders(params = {}) {
    const ordersEndpoint = this.config.api.orders?.list || '/orders';
    return this.get(ordersEndpoint, params);
  }

  /**
   * Get order by ID
   *
   * @param {string|number} id - Order ID
   * @returns {Promise} Promise that resolves with order data
   */
  async getOrder(id) {
    const orderDetailEndpoint = this.config.api.orders?.detail ?
      this.config.api.orders.detail(id) :
      `/orders/${id}`;
    return this.get(orderDetailEndpoint);
  }

  /**
   * Create order
   *
   * @param {Object} orderData - Order data
   * @returns {Promise} Promise that resolves with created order data
   */
  async createOrder(orderData) {
    const createOrderEndpoint = this.config.api.orders?.create || '/orders';
    return this.post(createOrderEndpoint, orderData);
  }

  /**
   * Get rentals
   *
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise that resolves with rentals data
   */
  async getRentals(params = {}) {
    const rentalsEndpoint = this.config.api.rentals?.list || '/rentals';
    return this.get(rentalsEndpoint, params);
  }

  /**
   * Get rental by ID
   *
   * @param {string|number} id - Rental ID
   * @returns {Promise} Promise that resolves with rental data
   */
  async getRental(id) {
    const rentalDetailEndpoint = this.config.api.rentals?.detail ?
      this.config.api.rentals.detail(id) :
      `/rentals/${id}`;
    return this.get(rentalDetailEndpoint);
  }

  /**
   * Create rental
   *
   * @param {Object} rentalData - Rental data
   * @returns {Promise} Promise that resolves with created rental data
   */
  async createRental(rentalData) {
    const createRentalEndpoint = this.config.api.rentals?.create || '/rentals';
    return this.post(createRentalEndpoint, rentalData);
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
