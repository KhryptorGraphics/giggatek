/**
 * Security Headers
 * 
 * This module provides security headers for API requests.
 */

class SecurityHeaders {
  constructor() {
    this.headers = {
      // Content Security Policy
      'Content-Security-Policy': this.getContentSecurityPolicy(),
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Restrict referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy
      'Permissions-Policy': this.getPermissionsPolicy(),
      
      // Cache control
      'Cache-Control': 'no-store, max-age=0',
      
      // Strict Transport Security
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Clear site data on logout
      'Clear-Site-Data': '"cache", "cookies", "storage"'
    };
    
    // Client-side headers (for fetch requests)
    this.clientHeaders = {
      // Device information
      'X-Device-Type': this.getDeviceType(),
      
      // Browser information
      'X-Browser-Info': this.getBrowserInfo(),
      
      // Screen information
      'X-Screen-Info': this.getScreenInfo(),
      
      // Timezone information
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Language information
      'X-Language': navigator.language || navigator.userLanguage,
      
      // Client timestamp
      'X-Client-Time': new Date().toISOString()
    };
  }
  
  /**
   * Get Content Security Policy
   * 
   * @returns {string} Content Security Policy
   */
  getContentSecurityPolicy() {
    return [
      "default-src 'self'",
      "script-src 'self' https://cdnjs.cloudflare.com",
      "style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'",
      "img-src 'self' https://images.unsplash.com data:",
      "font-src 'self' https://cdnjs.cloudflare.com",
      "connect-src 'self' https://api.giggatek.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
  
  /**
   * Get Permissions Policy
   * 
   * @returns {string} Permissions Policy
   */
  getPermissionsPolicy() {
    return [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=(self)",
      "usb=()",
      "magnetometer=()",
      "accelerometer=()",
      "gyroscope=()",
      "ambient-light-sensor=()",
      "autoplay=(self)"
    ].join(', ');
  }
  
  /**
   * Get device type
   * 
   * @returns {string} Device type
   */
  getDeviceType() {
    const userAgent = navigator.userAgent;
    
    if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  /**
   * Get browser information
   * 
   * @returns {string} Browser information
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    
    if (userAgent.indexOf('Firefox') > -1) {
      browser = 'firefox';
    } else if (userAgent.indexOf('SamsungBrowser') > -1) {
      browser = 'samsung';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      browser = 'opera';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser = 'edge';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browser = 'chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'safari';
    }
    
    return browser;
  }
  
  /**
   * Get screen information
   * 
   * @returns {string} Screen information
   */
  getScreenInfo() {
    return `${window.screen.width}x${window.screen.height}`;
  }
  
  /**
   * Get all headers
   * 
   * @returns {Object} All headers
   */
  getAllHeaders() {
    return { ...this.headers, ...this.clientHeaders };
  }
  
  /**
   * Get client headers
   * 
   * @returns {Object} Client headers
   */
  getClientHeaders() {
    return { ...this.clientHeaders };
  }
  
  /**
   * Get server headers
   * 
   * @returns {Object} Server headers
   */
  getServerHeaders() {
    return { ...this.headers };
  }
  
  /**
   * Add security headers to request options
   * 
   * @param {Object} options - Request options
   * @returns {Object} Request options with security headers
   */
  addHeaders(options) {
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
    
    // Add client headers
    Object.entries(this.clientHeaders).forEach(([key, value]) => {
      newOptions.headers[key] = value;
    });
    
    return newOptions;
  }
}

// Create global security headers instance
const securityHeaders = new SecurityHeaders();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = securityHeaders;
}
