/**
 * Data Service
 *
 * This module provides data services for the application.
 */

// Import data models if available
const dataModels = typeof module !== 'undefined' && module.exports ?
  require('./data-models') :
  (window.dataModels || {
    normalizeProduct: (p) => p,
    normalizeOrder: (o) => o,
    normalizeRental: (r) => r,
    normalizeUser: (u) => u,
    prepareOrderData: (o) => o,
    prepareRentalData: (r) => r
  });

class DataService {
  constructor(api, stateManager) {
    this.api = api;
    this.stateManager = stateManager;
    this.config = window.config || (typeof config !== 'undefined' ? config : {});
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
      const userData = await this.api.getCurrentUser();
      return dataModels.normalizeUser(userData);
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
      const response = await this.api.getProducts(params);

      // Handle different API response formats
      if (response.products && Array.isArray(response.products)) {
        // Mock API format
        return {
          ...response,
          products: response.products.map(dataModels.normalizeProduct)
        };
      } else if (Array.isArray(response)) {
        // Simple array format
        return {
          products: response.map(dataModels.normalizeProduct),
          page: params.page || 1,
          per_page: params.per_page || 10,
          total: response.length,
          total_pages: Math.ceil(response.length / (params.per_page || 10))
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Standard API format with data property
        return {
          products: response.data.map(dataModels.normalizeProduct),
          page: response.page || params.page || 1,
          per_page: response.per_page || params.per_page || 10,
          total: response.total || response.data.length,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.per_page || params.per_page || 10))
        };
      }

      // Unknown format, return as is
      return response;
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
      const productData = await this.api.getProduct(id);

      // Handle different API response formats
      if (productData.data) {
        // Standard API format with data property
        return dataModels.normalizeProduct(productData.data);
      } else {
        // Direct product data
        return dataModels.normalizeProduct(productData);
      }
    }, options);
  }

  /**
   * Get search suggestions
   *
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of suggestions to return
   * @returns {Promise} Promise that resolves with suggestions data
   */
  async getSearchSuggestions(query, limit = 5) {
    // Don't cache suggestions as they change frequently
    const options = {
      cache: false,
      dedupe: true
    };

    const cacheKey = `search_suggestions_${query}_${limit}`;

    return this.stateManager.fetch(cacheKey, async () => {
      return await this.api.getSearchSuggestions(query, limit);
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
      const response = await this.api.getOrders(params);

      // Handle different API response formats
      if (response.orders && Array.isArray(response.orders)) {
        // Mock API format
        return {
          ...response,
          orders: response.orders.map(dataModels.normalizeOrder)
        };
      } else if (Array.isArray(response)) {
        // Simple array format
        return {
          orders: response.map(dataModels.normalizeOrder),
          page: params.page || 1,
          per_page: params.per_page || 10,
          total: response.length,
          total_pages: Math.ceil(response.length / (params.per_page || 10))
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Standard API format with data property
        return {
          orders: response.data.map(dataModels.normalizeOrder),
          page: response.page || params.page || 1,
          per_page: response.per_page || params.per_page || 10,
          total: response.total || response.data.length,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.per_page || params.per_page || 10))
        };
      }

      // Unknown format, return as is
      return response;
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
      const orderData = await this.api.getOrder(id);

      // Handle different API response formats
      if (orderData.data) {
        // Standard API format with data property
        return dataModels.normalizeOrder(orderData.data);
      } else {
        // Direct order data
        return dataModels.normalizeOrder(orderData);
      }
    }, options);
  }

  /**
   * Create order
   *
   * @param {Object} orderData - Order data
   * @returns {Promise} Promise that resolves with created order data
   */
  async createOrder(orderData) {
    // Prepare order data for API
    const preparedData = dataModels.prepareOrderData(orderData);

    // Create order
    const result = await this.api.createOrder(preparedData);

    // Clear orders cache
    this.stateManager.clear('orders');

    // Normalize response
    if (result.data) {
      return dataModels.normalizeOrder(result.data);
    } else {
      return dataModels.normalizeOrder(result);
    }
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
      const response = await this.api.getRentals(params);

      // Handle different API response formats
      if (response.rentals && Array.isArray(response.rentals)) {
        // Mock API format
        return {
          ...response,
          rentals: response.rentals.map(dataModels.normalizeRental)
        };
      } else if (Array.isArray(response)) {
        // Simple array format
        return {
          rentals: response.map(dataModels.normalizeRental),
          page: params.page || 1,
          per_page: params.per_page || 10,
          total: response.length,
          total_pages: Math.ceil(response.length / (params.per_page || 10))
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Standard API format with data property
        return {
          rentals: response.data.map(dataModels.normalizeRental),
          page: response.page || params.page || 1,
          per_page: response.per_page || params.per_page || 10,
          total: response.total || response.data.length,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.per_page || params.per_page || 10))
        };
      }

      // Unknown format, return as is
      return response;
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
      const rentalData = await this.api.getRental(id);

      // Handle different API response formats
      if (rentalData.data) {
        // Standard API format with data property
        return dataModels.normalizeRental(rentalData.data);
      } else {
        // Direct rental data
        return dataModels.normalizeRental(rentalData);
      }
    }, options);
  }

  /**
   * Create rental
   *
   * @param {Object} rentalData - Rental data
   * @returns {Promise} Promise that resolves with created rental data
   */
  async createRental(rentalData) {
    // Prepare rental data for API
    const preparedData = dataModels.prepareRentalData(rentalData);

    // Create rental
    const result = await this.api.createRental(preparedData);

    // Clear rentals cache
    this.stateManager.clear('rentals');

    // Normalize response
    if (result.data) {
      return dataModels.normalizeRental(result.data);
    } else {
      return dataModels.normalizeRental(result);
    }
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
