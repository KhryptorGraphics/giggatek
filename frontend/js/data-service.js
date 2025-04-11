/**
 * Data Service
 * 
 * This module provides data services for the application.
 */

class DataService {
  constructor(api, stateManager) {
    this.api = api;
    this.stateManager = stateManager;
  }

  /**
   * Get current user
   * 
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with user data
   */
  async getCurrentUser(forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    return this.stateManager.fetch('currentUser', async () => {
      return this.api.getCurrentUser();
    }, options);
  }

  /**
   * Get products
   * 
   * @param {Object} params - Query parameters
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with products data
   */
  async getProducts(params = {}, forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    // Create cache key based on params
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `products${queryString ? `_${queryString}` : ''}`;
    
    return this.stateManager.fetch(cacheKey, async () => {
      return this.api.getProducts(params);
    }, options);
  }

  /**
   * Get product by ID
   * 
   * @param {string|number} id - Product ID
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with product data
   */
  async getProduct(id, forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    return this.stateManager.fetch(`product_${id}`, async () => {
      return this.api.getProduct(id);
    }, options);
  }

  /**
   * Get orders
   * 
   * @param {Object} params - Query parameters
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with orders data
   */
  async getOrders(params = {}, forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    // Create cache key based on params
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `orders${queryString ? `_${queryString}` : ''}`;
    
    return this.stateManager.fetch(cacheKey, async () => {
      return this.api.getOrders(params);
    }, options);
  }

  /**
   * Get order by ID
   * 
   * @param {string|number} id - Order ID
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with order data
   */
  async getOrder(id, forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    return this.stateManager.fetch(`order_${id}`, async () => {
      return this.api.getOrder(id);
    }, options);
  }

  /**
   * Create order
   * 
   * @param {Object} orderData - Order data
   * @returns {Promise} Promise that resolves with created order data
   */
  async createOrder(orderData) {
    const result = await this.api.createOrder(orderData);
    
    // Clear orders cache
    this.stateManager.clear('orders');
    
    return result;
  }

  /**
   * Get rentals
   * 
   * @param {Object} params - Query parameters
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with rentals data
   */
  async getRentals(params = {}, forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    // Create cache key based on params
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `rentals${queryString ? `_${queryString}` : ''}`;
    
    return this.stateManager.fetch(cacheKey, async () => {
      return this.api.getRentals(params);
    }, options);
  }

  /**
   * Get rental by ID
   * 
   * @param {string|number} id - Rental ID
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise} Promise that resolves with rental data
   */
  async getRental(id, forceRefresh = false) {
    const options = {
      cache: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
      dedupe: true
    };
    
    if (forceRefresh) {
      options.cache = false;
    }
    
    return this.stateManager.fetch(`rental_${id}`, async () => {
      return this.api.getRental(id);
    }, options);
  }

  /**
   * Create rental
   * 
   * @param {Object} rentalData - Rental data
   * @returns {Promise} Promise that resolves with created rental data
   */
  async createRental(rentalData) {
    const result = await this.api.createRental(rentalData);
    
    // Clear rentals cache
    this.stateManager.clear('rentals');
    
    return result;
  }

  /**
   * Get cart
   * 
   * @returns {Object} Cart data
   */
  getCart() {
    // Get cart from state
    let cart = this.stateManager.get('cart');
    
    // Initialize cart if not exists
    if (!cart) {
      cart = {
        items: [],
        total: 0
      };
      
      this.stateManager.set('cart', cart);
    }
    
    return cart;
  }

  /**
   * Add item to cart
   * 
   * @param {Object} product - Product data
   * @param {number} quantity - Quantity
   * @param {boolean} isRental - Whether item is a rental
   * @param {Object} rentalDates - Rental dates (for rental items)
   * @returns {Object} Updated cart
   */
  addToCart(product, quantity = 1, isRental = false, rentalDates = null) {
    const cart = this.getCart();
    
    // Check if product already exists in cart
    const existingItem = cart.items.find(item => 
      item.product.id === product.id && item.isRental === isRental
    );
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      
      // Update rental dates if provided
      if (isRental && rentalDates) {
        existingItem.rentalDates = rentalDates;
      }
    } else {
      // Add new item
      cart.items.push({
        product,
        quantity,
        isRental,
        rentalDates: isRental ? rentalDates : null
      });
    }
    
    // Recalculate total
    this.recalculateCart(cart);
    
    // Update state
    this.stateManager.set('cart', cart);
    
    return cart;
  }

  /**
   * Update cart item
   * 
   * @param {number} index - Item index
   * @param {number} quantity - New quantity
   * @param {Object} rentalDates - New rental dates (for rental items)
   * @returns {Object} Updated cart
   */
  updateCartItem(index, quantity, rentalDates = null) {
    const cart = this.getCart();
    
    // Check if item exists
    if (index >= 0 && index < cart.items.length) {
      // Update quantity
      cart.items[index].quantity = quantity;
      
      // Update rental dates if provided and item is rental
      if (rentalDates && cart.items[index].isRental) {
        cart.items[index].rentalDates = rentalDates;
      }
      
      // Recalculate total
      this.recalculateCart(cart);
      
      // Update state
      this.stateManager.set('cart', cart);
    }
    
    return cart;
  }

  /**
   * Remove item from cart
   * 
   * @param {number} index - Item index
   * @returns {Object} Updated cart
   */
  removeCartItem(index) {
    const cart = this.getCart();
    
    // Check if item exists
    if (index >= 0 && index < cart.items.length) {
      // Remove item
      cart.items.splice(index, 1);
      
      // Recalculate total
      this.recalculateCart(cart);
      
      // Update state
      this.stateManager.set('cart', cart);
    }
    
    return cart;
  }

  /**
   * Clear cart
   * 
   * @returns {Object} Empty cart
   */
  clearCart() {
    const cart = {
      items: [],
      total: 0
    };
    
    // Update state
    this.stateManager.set('cart', cart);
    
    return cart;
  }

  /**
   * Recalculate cart total
   * 
   * @param {Object} cart - Cart data
   */
  recalculateCart(cart) {
    let total = 0;
    
    cart.items.forEach(item => {
      const { product, quantity, isRental, rentalDates } = item;
      
      if (isRental && rentalDates) {
        // Calculate rental price
        const startDate = new Date(rentalDates.startDate);
        const endDate = new Date(rentalDates.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Minimum 1 day
        const rentalDays = Math.max(1, days);
        
        // Calculate subtotal
        item.subtotal = product.rental_price * quantity * rentalDays;
      } else {
        // Calculate purchase price
        item.subtotal = product.price * quantity;
      }
      
      total += item.subtotal;
    });
    
    cart.total = total;
  }
}

// Create global data service instance
const dataService = new DataService(api, stateManager);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dataService;
}
