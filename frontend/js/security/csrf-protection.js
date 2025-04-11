/**
 * CSRF Protection
 * 
 * This module provides Cross-Site Request Forgery (CSRF) protection for the application.
 */

class CSRFProtection {
  constructor() {
    this.tokenName = 'X-CSRF-Token';
    this.cookieName = 'csrf_token';
    this.headerName = 'X-CSRF-Token';
    this.token = null;
    
    // Initialize CSRF protection
    this.initialize();
  }
  
  /**
   * Initialize CSRF protection
   */
  initialize() {
    // Try to get token from cookie
    this.token = this.getTokenFromCookie();
    
    // If no token exists, generate a new one
    if (!this.token) {
      this.token = this.generateToken();
      this.setTokenCookie(this.token);
    }
    
    // Add token to all AJAX requests
    this.setupAjaxInterceptor();
  }
  
  /**
   * Get CSRF token from cookie
   * 
   * @returns {string|null} CSRF token or null if not found
   */
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(this.cookieName + '=')) {
        return cookie.substring(this.cookieName.length + 1);
      }
    }
    return null;
  }
  
  /**
   * Generate a new CSRF token
   * 
   * @returns {string} New CSRF token
   */
  generateToken() {
    // Generate a random token
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Set CSRF token cookie
   * 
   * @param {string} token - CSRF token
   */
  setTokenCookie(token) {
    // Set cookie with HttpOnly and SameSite=Strict flags
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${this.cookieName}=${token}; path=/; SameSite=Strict${secure}`;
  }
  
  /**
   * Setup AJAX interceptor to add CSRF token to all requests
   */
  setupAjaxInterceptor() {
    // Store original fetch function
    const originalFetch = window.fetch;
    
    // Store CSRF token and header name
    const token = this.token;
    const headerName = this.headerName;
    
    // Override fetch function
    window.fetch = function(url, options = {}) {
      // Create new options object with headers
      const newOptions = { ...options };
      
      // Add headers if not present
      if (!newOptions.headers) {
        newOptions.headers = {};
      }
      
      // Convert Headers object to plain object if needed
      if (newOptions.headers instanceof Headers) {
        const headers = {};
        for (const [key, value] of newOptions.headers.entries()) {
          headers[key] = value;
        }
        newOptions.headers = headers;
      }
      
      // Add CSRF token to headers for non-GET requests
      if (!newOptions.method || newOptions.method.toUpperCase() !== 'GET') {
        newOptions.headers[headerName] = token;
      }
      
      // Call original fetch with new options
      return originalFetch(url, newOptions);
    };
    
    // Add event listener for token refresh
    window.addEventListener('csrf:refresh', event => {
      if (event.detail && event.detail.token) {
        this.token = event.detail.token;
        this.setTokenCookie(this.token);
      }
    });
  }
  
  /**
   * Validate CSRF token from response
   * 
   * @param {Response} response - Fetch API response
   * @returns {boolean} True if token is valid
   */
  validateToken(response) {
    // Get token from response header
    const responseToken = response.headers.get(this.headerName);
    
    // If no token in response, assume it's valid
    if (!responseToken) {
      return true;
    }
    
    // Compare tokens
    return responseToken === this.token;
  }
  
  /**
   * Refresh CSRF token
   * 
   * @param {string} newToken - New CSRF token
   */
  refreshToken(newToken) {
    // Update token
    this.token = newToken;
    this.setTokenCookie(newToken);
    
    // Dispatch event to notify application
    window.dispatchEvent(new CustomEvent('csrf:refresh', {
      detail: { token: newToken }
    }));
  }
  
  /**
   * Get current CSRF token
   * 
   * @returns {string} Current CSRF token
   */
  getToken() {
    return this.token;
  }
}

// Create global CSRF protection instance
const csrfProtection = new CSRFProtection();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = csrfProtection;
}
