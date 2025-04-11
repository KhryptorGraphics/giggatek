/**
 * Security Module
 * 
 * This module combines all security features for the application.
 */

// Import security modules
const csrfProtection = window.csrfProtection || (typeof require !== 'undefined' ? require('./csrf-protection') : null);
const encryptionService = window.encryptionService || (typeof require !== 'undefined' ? require('./encryption') : null);
const rateLimiter = window.rateLimiter || (typeof require !== 'undefined' ? require('./rate-limiter') : null);
const securityHeaders = window.securityHeaders || (typeof require !== 'undefined' ? require('./security-headers') : null);

class Security {
  constructor() {
    this.csrfProtection = csrfProtection;
    this.encryptionService = encryptionService;
    this.rateLimiter = rateLimiter;
    this.securityHeaders = securityHeaders;
    
    // Initialize security features
    this.initialize();
  }
  
  /**
   * Initialize security features
   */
  initialize() {
    // Log security features status
    console.info('Security features:');
    console.info('- CSRF Protection:', this.csrfProtection ? 'Enabled' : 'Disabled');
    console.info('- Encryption:', this.encryptionService && this.encryptionService.isEnabled() ? 'Enabled' : 'Disabled');
    console.info('- Rate Limiting:', this.rateLimiter ? 'Enabled' : 'Disabled');
    console.info('- Security Headers:', this.securityHeaders ? 'Enabled' : 'Disabled');
    
    // Add event listener for security events
    window.addEventListener('security:update', this.handleSecurityUpdate.bind(this));
  }
  
  /**
   * Handle security update event
   * 
   * @param {CustomEvent} event - Security update event
   */
  handleSecurityUpdate(event) {
    if (event.detail) {
      // Update CSRF token
      if (event.detail.csrfToken && this.csrfProtection) {
        this.csrfProtection.refreshToken(event.detail.csrfToken);
      }
      
      // Update server public key
      if (event.detail.serverPublicKey && this.encryptionService) {
        this.encryptionService.setServerPublicKey(event.detail.serverPublicKey);
      }
      
      // Update rate limits
      if (event.detail.rateLimits && this.rateLimiter) {
        Object.entries(event.detail.rateLimits).forEach(([category, limit]) => {
          this.rateLimiter.options.limits[category] = limit;
        });
      }
    }
  }
  
  /**
   * Apply security to request options
   * 
   * @param {Object} options - Request options
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @returns {Object} Request options with security features
   */
  applyToRequest(options, method, endpoint) {
    let secureOptions = { ...options };
    
    // Add security headers
    if (this.securityHeaders) {
      secureOptions = this.securityHeaders.addHeaders(secureOptions);
    }
    
    // Add CSRF token
    if (this.csrfProtection && method !== 'GET') {
      if (!secureOptions.headers) {
        secureOptions.headers = {};
      }
      
      secureOptions.headers[this.csrfProtection.headerName] = this.csrfProtection.getToken();
    }
    
    return secureOptions;
  }
  
  /**
   * Process response for security features
   * 
   * @param {Response} response - Fetch API response
   */
  processResponse(response) {
    // Check for CSRF token
    if (this.csrfProtection) {
      const csrfToken = response.headers.get(this.csrfProtection.headerName);
      if (csrfToken) {
        this.csrfProtection.refreshToken(csrfToken);
      }
    }
    
    // Check for server public key
    if (this.encryptionService) {
      const serverPublicKey = response.headers.get('X-Public-Key');
      if (serverPublicKey) {
        this.encryptionService.setServerPublicKey(serverPublicKey);
      }
    }
    
    // Check for rate limit headers
    if (this.rateLimiter) {
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      
      if (rateLimit && rateLimitRemaining && rateLimitReset) {
        // Update rate limit information
        console.debug(`Rate limit: ${rateLimitRemaining}/${rateLimit}, reset in ${rateLimitReset}s`);
      }
    }
  }
}

// Create global security instance
const security = new Security();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = security;
}
