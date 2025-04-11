/**
 * Abandoned Cart Recovery Component
 * 
 * This component handles the recovery of abandoned shopping carts.
 */

class AbandonedCartRecovery {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    this.options = {
      onRecovery: null,
      ...options
    };
    
    this.state = {
      loading: false,
      error: null,
      cart: null,
      token: null
    };
    
    this.init();
  }
  
  /**
   * Initialize component
   */
  init() {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      this.state.token = token;
      this.loadCart(token);
    } else {
      this.state.error = 'No recovery token provided';
      this.render();
    }
  }
  
  /**
   * Load cart from API
   * 
   * @param {string} token - Recovery token
   */
  async loadCart(token) {
    this.state.loading = true;
    this.render();
    
    try {
      const response = await fetch(`/api/abandoned-carts/recover/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load cart');
      }
      
      this.state.cart = data.cart;
      this.state.loading = false;
      this.render();
    } catch (error) {
      this.state.error = error.message;
      this.state.loading = false;
      this.render();
    }
  }
  
  /**
   * Recover cart
   */
  async recoverCart() {
    if (!this.state.token) {
      return;
    }
    
    this.state.loading = true;
    this.render();
    
    try {
      const response = await fetch(`/api/abandoned-carts/recover/${this.state.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to recover cart');
      }
      
      // Restore cart to local storage
      if (this.state.cart && this.state.cart.data) {
        localStorage.setItem('giggatek_cart', JSON.stringify(this.state.cart.data));
        
        // Notify cart component to update
        if (window.stateManager) {
          window.stateManager.set('cart', this.state.cart.data);
        }
        
        // Call onRecovery callback
        if (typeof this.options.onRecovery === 'function') {
          this.options.onRecovery(this.state.cart.data);
        }
        
        // Redirect to cart page
        window.location.href = '/cart.php';
      }
    } catch (error) {
      this.state.error = error.message;
      this.state.loading = false;
      this.render();
    }
  }
  
  /**
   * Render component
   */
  render() {
    this.container.innerHTML = '';
    
    if (this.state.loading) {
      this.renderLoading();
    } else if (this.state.error) {
      this.renderError();
    } else if (this.state.cart) {
      this.renderCart();
    } else {
      this.renderEmpty();
    }
  }
  
  /**
   * Render loading state
   */
  renderLoading() {
    this.container.innerHTML = `
      <div class="abandoned-cart-recovery loading">
        <div class="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    `;
  }
  
  /**
   * Render error state
   */
  renderError() {
    this.container.innerHTML = `
      <div class="abandoned-cart-recovery error">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2>Unable to Recover Cart</h2>
        <p>${this.state.error}</p>
        <p>The recovery link may have expired or been used already.</p>
        <div class="recovery-actions">
          <a href="/products.php" class="btn btn-primary">Browse Products</a>
        </div>
      </div>
    `;
  }
  
  /**
   * Render empty state
   */
  renderEmpty() {
    this.container.innerHTML = `
      <div class="abandoned-cart-recovery empty">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h2>No Cart to Recover</h2>
        <p>No recovery token was provided.</p>
        <div class="recovery-actions">
          <a href="/products.php" class="btn btn-primary">Browse Products</a>
        </div>
      </div>
    `;
  }
  
  /**
   * Render cart
   */
  renderCart() {
    const cart = this.state.cart;
    const cartData = cart.data || {};
    const items = cartData.items || [];
    
    this.container.innerHTML = `
      <div class="abandoned-cart-recovery">
        <div class="recovery-header">
          <h2>Your Saved Cart</h2>
          <p>We've saved your shopping cart for you. Would you like to restore it?</p>
        </div>
        
        <div class="recovery-items">
          ${items.length > 0 ? this.renderItems(items) : '<p>No items in cart</p>'}
        </div>
        
        <div class="recovery-summary">
          <div class="summary-row">
            <span>Total Items:</span>
            <span>${items.length}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>${this.formatCurrency(cartData.total || 0)}</span>
          </div>
        </div>
        
        <div class="recovery-actions">
          <button type="button" class="btn btn-primary btn-recover">Restore My Cart</button>
          <a href="/products.php" class="btn btn-secondary">Start Fresh</a>
        </div>
      </div>
    `;
    
    // Add event listeners
    const recoverButton = this.container.querySelector('.btn-recover');
    if (recoverButton) {
      recoverButton.addEventListener('click', () => this.recoverCart());
    }
  }
  
  /**
   * Render cart items
   * 
   * @param {Array} items - Cart items
   * @returns {string} Items HTML
   */
  renderItems(items) {
    return `
      <div class="items-list">
        ${items.map(item => this.renderItem(item)).join('')}
      </div>
    `;
  }
  
  /**
   * Render cart item
   * 
   * @param {Object} item - Cart item
   * @returns {string} Item HTML
   */
  renderItem(item) {
    const product = item.product || {};
    const isRental = item.isRental || false;
    const quantity = item.quantity || 1;
    
    return `
      <div class="recovery-item">
        <div class="item-image">
          ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}">` : ''}
        </div>
        <div class="item-details">
          <div class="item-name">${product.name || 'Unknown Product'}</div>
          <div class="item-meta">
            <span class="item-quantity">Qty: ${quantity}</span>
            ${isRental ? `<span class="item-type">Rental</span>` : ''}
          </div>
        </div>
        <div class="item-price">
          ${isRental ? 
            `${this.formatCurrency(product.rental_price || 0)}/mo` : 
            this.formatCurrency(product.price || 0)
          }
        </div>
      </div>
    `;
  }
  
  /**
   * Format currency
   * 
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbandonedCartRecovery;
}
