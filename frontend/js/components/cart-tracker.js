/**
 * Cart Tracker Component
 * 
 * This component tracks shopping cart activity for abandoned cart recovery.
 */

class CartTracker {
  constructor(options = {}) {
    this.options = {
      trackingEndpoint: '/api/abandoned-carts/track',
      trackingInterval: 60000, // 1 minute
      ...options
    };
    
    this.state = {
      sessionId: this.getSessionId(),
      lastTracked: null,
      trackingTimer: null
    };
    
    this.init();
  }
  
  /**
   * Initialize component
   */
  init() {
    // Start tracking timer
    this.startTrackingTimer();
    
    // Track cart on page unload
    window.addEventListener('beforeunload', () => {
      this.trackCart();
    });
    
    // Subscribe to cart changes
    if (window.stateManager) {
      window.stateManager.subscribe('cart', () => {
        this.trackCart();
      });
    }
  }
  
  /**
   * Start tracking timer
   */
  startTrackingTimer() {
    // Clear existing timer
    if (this.state.trackingTimer) {
      clearInterval(this.state.trackingTimer);
    }
    
    // Set new timer
    this.state.trackingTimer = setInterval(() => {
      this.trackCart();
    }, this.options.trackingInterval);
    
    // Track immediately
    this.trackCart();
  }
  
  /**
   * Track cart
   */
  trackCart() {
    // Get cart data
    const cart = this.getCart();
    
    // Skip if cart is empty
    if (!cart || !cart.items || cart.items.length === 0) {
      return;
    }
    
    // Skip if tracked recently (within 10 seconds)
    const now = Date.now();
    if (this.state.lastTracked && (now - this.state.lastTracked) < 10000) {
      return;
    }
    
    // Update last tracked time
    this.state.lastTracked = now;
    
    // Get user email if available
    let email = null;
    const user = this.getCurrentUser();
    if (user && user.email) {
      email = user.email;
    }
    
    // Send tracking request
    fetch(this.options.trackingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthToken() ? `Bearer ${this.getAuthToken()}` : ''
      },
      body: JSON.stringify({
        session_id: this.state.sessionId,
        email: email,
        cart_data: cart
      })
    }).catch(error => {
      console.error('Error tracking cart:', error);
    });
  }
  
  /**
   * Get cart data
   * 
   * @returns {Object} Cart data
   */
  getCart() {
    // Try to get cart from state manager
    if (window.stateManager) {
      const cart = window.stateManager.get('cart');
      if (cart) {
        return cart;
      }
    }
    
    // Try to get cart from local storage
    try {
      const cartData = localStorage.getItem('giggatek_cart');
      if (cartData) {
        return JSON.parse(cartData);
      }
    } catch (error) {
      console.error('Error parsing cart data:', error);
    }
    
    return { items: [] };
  }
  
  /**
   * Get current user
   * 
   * @returns {Object|null} Current user
   */
  getCurrentUser() {
    // Try to get user from state manager
    if (window.stateManager) {
      const user = window.stateManager.get('user');
      if (user) {
        return user;
      }
    }
    
    return null;
  }
  
  /**
   * Get auth token
   * 
   * @returns {string|null} Auth token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * Get session ID
   * 
   * @returns {string} Session ID
   */
  getSessionId() {
    // Try to get session ID from cookie
    let sessionId = this.getCookie('session_id');
    
    // Create new session ID if not found
    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.setCookie('session_id', sessionId, 30); // 30 days
    }
    
    return sessionId;
  }
  
  /**
   * Generate session ID
   * 
   * @returns {string} Session ID
   */
  generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Set cookie
   * 
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Cookie expiration in days
   */
  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }
  
  /**
   * Get cookie
   * 
   * @param {string} name - Cookie name
   * @returns {string} Cookie value
   */
  getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartTracker;
}
