/**
 * Shopping Cart Component
 * 
 * This component displays the shopping cart with real data.
 */

class ShoppingCart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    this.options = {
      showCheckoutButton: true,
      showContinueShopping: true,
      ...options
    };
    
    this.init();
  }

  /**
   * Initialize component
   */
  init() {
    // Create component structure
    this.render();
    
    // Add event listeners
    this.addEventListeners();
    
    // Subscribe to cart changes
    this.subscribeToCartChanges();
  }

  /**
   * Render component
   */
  render() {
    // Get cart data
    const cart = dataService.getCart();
    
    // Clear container
    this.container.innerHTML = '';
    
    // Create component structure
    this.container.innerHTML = `
      <div class="shopping-cart-component">
        <h2>Your Shopping Cart</h2>
        
        ${this.renderCartItems(cart)}
        
        <div class="cart-summary">
          <div class="cart-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">${this.formatCurrency(cart.total)}</span>
          </div>
          
          <div class="cart-actions">
            ${this.options.showContinueShopping ? `
              <a href="/products" class="btn btn-secondary">Continue Shopping</a>
            ` : ''}
            
            ${this.options.showCheckoutButton ? `
              <button type="button" class="btn btn-primary btn-checkout" ${cart.items.length === 0 ? 'disabled' : ''}>
                Proceed to Checkout
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.elements = {
      component: this.container.querySelector('.shopping-cart-component'),
      cartItems: this.container.querySelector('.cart-items'),
      cartEmpty: this.container.querySelector('.cart-empty'),
      totalAmount: this.container.querySelector('.total-amount'),
      checkoutButton: this.container.querySelector('.btn-checkout')
    };
  }

  /**
   * Render cart items
   * 
   * @param {Object} cart - Cart data
   * @returns {string} Cart items HTML
   */
  renderCartItems(cart) {
    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      return `
        <div class="cart-empty">
          <p>Your shopping cart is empty.</p>
          <a href="/products" class="btn btn-primary">Browse Products</a>
        </div>
      `;
    }
    
    // Render cart items
    const itemsHtml = cart.items.map((item, index) => this.renderCartItem(item, index)).join('');
    
    return `
      <div class="cart-items">
        <div class="cart-header">
          <div class="cart-header-product">Product</div>
          <div class="cart-header-price">Price</div>
          <div class="cart-header-quantity">Quantity</div>
          <div class="cart-header-subtotal">Subtotal</div>
          <div class="cart-header-actions">Actions</div>
        </div>
        
        ${itemsHtml}
      </div>
    `;
  }

  /**
   * Render cart item
   * 
   * @param {Object} item - Cart item
   * @param {number} index - Item index
   * @returns {string} Cart item HTML
   */
  renderCartItem(item, index) {
    const { product, quantity, isRental, rentalDates, subtotal } = item;
    
    return `
      <div class="cart-item" data-index="${index}">
        <div class="cart-item-product">
          <div class="cart-item-image">
            <img src="${product.image_url}" alt="${product.name}">
          </div>
          
          <div class="cart-item-details">
            <h3 class="cart-item-title">${product.name}</h3>
            
            ${isRental ? `
              <div class="cart-item-rental-dates">
                <span class="rental-label">Rental:</span>
                <span class="rental-dates">${this.formatDate(rentalDates.startDate)} - ${this.formatDate(rentalDates.endDate)}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="cart-item-price">
          ${isRental ? `
            <span class="price-amount">${this.formatCurrency(product.rental_price)}</span>
            <span class="price-unit">/day</span>
          ` : `
            <span class="price-amount">${this.formatCurrency(product.price)}</span>
          `}
        </div>
        
        <div class="cart-item-quantity">
          <div class="quantity-control">
            <button type="button" class="btn-quantity btn-decrease" aria-label="Decrease quantity">-</button>
            <input type="number" class="quantity-input" value="${quantity}" min="1" max="10" aria-label="Quantity">
            <button type="button" class="btn-quantity btn-increase" aria-label="Increase quantity">+</button>
          </div>
        </div>
        
        <div class="cart-item-subtotal">
          ${this.formatCurrency(subtotal)}
        </div>
        
        <div class="cart-item-actions">
          <button type="button" class="btn-remove" aria-label="Remove item">
            <i class="fas fa-trash-alt" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Quantity controls
    this.container.addEventListener('click', event => {
      // Decrease quantity
      if (event.target.closest('.btn-decrease')) {
        const button = event.target.closest('.btn-decrease');
        const item = button.closest('.cart-item');
        const index = parseInt(item.dataset.index, 10);
        const quantityInput = item.querySelector('.quantity-input');
        const currentQuantity = parseInt(quantityInput.value, 10);
        
        if (currentQuantity > 1) {
          quantityInput.value = currentQuantity - 1;
          this.updateCartItemQuantity(index, currentQuantity - 1);
        }
      }
      
      // Increase quantity
      if (event.target.closest('.btn-increase')) {
        const button = event.target.closest('.btn-increase');
        const item = button.closest('.cart-item');
        const index = parseInt(item.dataset.index, 10);
        const quantityInput = item.querySelector('.quantity-input');
        const currentQuantity = parseInt(quantityInput.value, 10);
        
        if (currentQuantity < 10) {
          quantityInput.value = currentQuantity + 1;
          this.updateCartItemQuantity(index, currentQuantity + 1);
        }
      }
      
      // Remove item
      if (event.target.closest('.btn-remove')) {
        const button = event.target.closest('.btn-remove');
        const item = button.closest('.cart-item');
        const index = parseInt(item.dataset.index, 10);
        
        this.removeCartItem(index);
      }
    });
    
    // Quantity input change
    this.container.addEventListener('change', event => {
      if (event.target.classList.contains('quantity-input')) {
        const input = event.target;
        const item = input.closest('.cart-item');
        const index = parseInt(item.dataset.index, 10);
        const quantity = parseInt(input.value, 10);
        
        // Validate quantity
        if (quantity < 1) {
          input.value = 1;
          this.updateCartItemQuantity(index, 1);
        } else if (quantity > 10) {
          input.value = 10;
          this.updateCartItemQuantity(index, 10);
        } else {
          this.updateCartItemQuantity(index, quantity);
        }
      }
    });
    
    // Checkout button
    const checkoutButton = this.container.querySelector('.btn-checkout');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => {
        this.checkout();
      });
    }
  }

  /**
   * Subscribe to cart changes
   */
  subscribeToCartChanges() {
    stateManager.subscribe('cart', () => {
      this.updateCart();
    });
  }

  /**
   * Update cart
   */
  updateCart() {
    // Get cart data
    const cart = dataService.getCart();
    
    // Update total amount
    if (this.elements.totalAmount) {
      this.elements.totalAmount.textContent = this.formatCurrency(cart.total);
    }
    
    // Update checkout button
    if (this.elements.checkoutButton) {
      this.elements.checkoutButton.disabled = cart.items.length === 0;
    }
    
    // Check if cart is empty
    if (cart.items.length === 0) {
      // Show empty cart message
      this.container.querySelector('.shopping-cart-component').innerHTML = `
        <h2>Your Shopping Cart</h2>
        
        <div class="cart-empty">
          <p>Your shopping cart is empty.</p>
          <a href="/products" class="btn btn-primary">Browse Products</a>
        </div>
        
        <div class="cart-summary">
          <div class="cart-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">${this.formatCurrency(0)}</span>
          </div>
          
          <div class="cart-actions">
            ${this.options.showContinueShopping ? `
              <a href="/products" class="btn btn-secondary">Continue Shopping</a>
            ` : ''}
            
            ${this.options.showCheckoutButton ? `
              <button type="button" class="btn btn-primary btn-checkout" disabled>
                Proceed to Checkout
              </button>
            ` : ''}
          </div>
        </div>
      `;
      
      return;
    }
    
    // Update cart items
    if (this.elements.cartItems) {
      const itemsHtml = cart.items.map((item, index) => this.renderCartItem(item, index)).join('');
      this.elements.cartItems.innerHTML = `
        <div class="cart-header">
          <div class="cart-header-product">Product</div>
          <div class="cart-header-price">Price</div>
          <div class="cart-header-quantity">Quantity</div>
          <div class="cart-header-subtotal">Subtotal</div>
          <div class="cart-header-actions">Actions</div>
        </div>
        
        ${itemsHtml}
      `;
    } else {
      // Re-render entire component
      this.render();
      this.addEventListeners();
    }
  }

  /**
   * Update cart item quantity
   * 
   * @param {number} index - Item index
   * @param {number} quantity - New quantity
   */
  updateCartItemQuantity(index, quantity) {
    // Update cart
    dataService.updateCartItem(index, quantity);
  }

  /**
   * Remove cart item
   * 
   * @param {number} index - Item index
   */
  removeCartItem(index) {
    // Get cart data
    const cart = dataService.getCart();
    
    // Get item
    const item = cart.items[index];
    
    // Remove item
    dataService.removeCartItem(index);
    
    // Show notification
    if (typeof notifications !== 'undefined' && item) {
      notifications.info(`${item.product.name} removed from cart`, 'Item Removed');
    }
  }

  /**
   * Checkout
   */
  checkout() {
    // Get cart data
    const cart = dataService.getCart();
    
    // Check if cart is empty
    if (cart.items.length === 0) {
      if (typeof notifications !== 'undefined') {
        notifications.warning('Your shopping cart is empty', 'Empty Cart');
      }
      return;
    }
    
    // Redirect to checkout page
    window.location.href = '/checkout';
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

  /**
   * Format date
   * 
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShoppingCart;
}
