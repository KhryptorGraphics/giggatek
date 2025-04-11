/**
 * Order History Component
 * 
 * This component displays the user's order history with real data.
 */

class OrderHistory {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    this.options = {
      perPage: 10,
      showPagination: true,
      ...options
    };
    
    this.state = {
      orders: [],
      loading: false,
      error: null,
      page: 1,
      totalPages: 1,
      totalOrders: 0
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
    
    // Load orders
    this.loadOrders();
  }

  /**
   * Render component
   */
  render() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create component structure
    this.container.innerHTML = `
      <div class="order-history-component">
        <h2>Your Order History</h2>
        
        <div class="order-history-content">
          <div class="order-history-loading">
            <div class="loader-spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
        
        ${this.options.showPagination ? this.renderPagination() : ''}
      </div>
    `;
    
    // Store references to elements
    this.elements = {
      component: this.container.querySelector('.order-history-component'),
      content: this.container.querySelector('.order-history-content'),
      loading: this.container.querySelector('.order-history-loading'),
      pagination: this.container.querySelector('.order-history-pagination')
    };
  }

  /**
   * Render pagination
   * 
   * @returns {string} Pagination HTML
   */
  renderPagination() {
    return `
      <div class="order-history-pagination">
        <button type="button" class="btn btn-pagination btn-prev" aria-label="Previous page" ${this.state.page <= 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left" aria-hidden="true"></i> Previous
        </button>
        
        <div class="pagination-info">
          Page <span class="current-page">${this.state.page}</span> of <span class="total-pages">${this.state.totalPages}</span>
        </div>
        
        <button type="button" class="btn btn-pagination btn-next" aria-label="Next page" ${this.state.page >= this.state.totalPages ? 'disabled' : ''}>
          Next <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    `;
  }

  /**
   * Render orders
   */
  renderOrders() {
    if (this.state.loading) {
      // Show loading indicator
      this.elements.loading.style.display = 'flex';
      return;
    }
    
    // Hide loading indicator
    this.elements.loading.style.display = 'none';
    
    // Check if orders exist
    if (!this.state.orders || this.state.orders.length === 0) {
      this.elements.content.innerHTML = `
        <div class="order-history-empty">
          <p>You don't have any orders yet.</p>
          <a href="/products" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }
    
    // Render orders table
    this.elements.content.innerHTML = `
      <div class="table-responsive">
        <table class="table order-history-table">
          <caption>Your order history</caption>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.orders.map(order => this.renderOrderRow(order)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render order row
   * 
   * @param {Object} order - Order data
   * @returns {string} Order row HTML
   */
  renderOrderRow(order) {
    return `
      <tr>
        <td data-label="Order ID">${order.id}</td>
        <td data-label="Date">${this.formatDate(order.created_at)}</td>
        <td data-label="Total">${this.formatCurrency(order.total)}</td>
        <td data-label="Status">
          <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
        </td>
        <td class="order-actions">
          <button type="button" class="btn btn-sm btn-view-order" data-order-id="${order.id}">View</button>
          ${order.status === 'PENDING' ? `
            <button type="button" class="btn btn-sm btn-secondary btn-cancel-order" data-order-id="${order.id}">Cancel</button>
          ` : ''}
          ${order.status === 'DELIVERED' ? `
            <button type="button" class="btn btn-sm btn-secondary btn-review-order" data-order-id="${order.id}">Review</button>
          ` : ''}
        </td>
      </tr>
    `;
  }

  /**
   * Update pagination
   */
  updatePagination() {
    if (!this.options.showPagination || !this.elements.pagination) {
      return;
    }
    
    // Update pagination HTML
    this.elements.pagination.innerHTML = `
      <button type="button" class="btn btn-pagination btn-prev" aria-label="Previous page" ${this.state.page <= 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left" aria-hidden="true"></i> Previous
      </button>
      
      <div class="pagination-info">
        Page <span class="current-page">${this.state.page}</span> of <span class="total-pages">${this.state.totalPages}</span>
      </div>
      
      <button type="button" class="btn btn-pagination btn-next" aria-label="Next page" ${this.state.page >= this.state.totalPages ? 'disabled' : ''}>
        Next <i class="fas fa-chevron-right" aria-hidden="true"></i>
      </button>
    `;
    
    // Add event listeners
    const prevButton = this.elements.pagination.querySelector('.btn-prev');
    const nextButton = this.elements.pagination.querySelector('.btn-next');
    
    prevButton.addEventListener('click', () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.loadOrders();
      }
    });
    
    nextButton.addEventListener('click', () => {
      if (this.state.page < this.state.totalPages) {
        this.state.page++;
        this.loadOrders();
      }
    });
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Order actions
    this.container.addEventListener('click', event => {
      // View order
      if (event.target.closest('.btn-view-order')) {
        const button = event.target.closest('.btn-view-order');
        const orderId = button.dataset.orderId;
        
        this.viewOrder(orderId);
      }
      
      // Cancel order
      if (event.target.closest('.btn-cancel-order')) {
        const button = event.target.closest('.btn-cancel-order');
        const orderId = button.dataset.orderId;
        
        this.cancelOrder(orderId);
      }
      
      // Review order
      if (event.target.closest('.btn-review-order')) {
        const button = event.target.closest('.btn-review-order');
        const orderId = button.dataset.orderId;
        
        this.reviewOrder(orderId);
      }
    });
  }

  /**
   * Load orders
   */
  async loadOrders() {
    try {
      // Update loading state
      this.state.loading = true;
      this.renderOrders();
      
      // Build query parameters
      const params = {
        page: this.state.page,
        per_page: this.options.perPage
      };
      
      // Fetch orders
      const response = await dataService.getOrders(params);
      
      // Update state
      this.state.orders = response.orders;
      this.state.totalOrders = response.total;
      this.state.totalPages = response.total_pages;
      this.state.loading = false;
      
      // Render orders
      this.renderOrders();
      
      // Update pagination
      this.updatePagination();
    } catch (error) {
      // Update error state
      this.state.error = error;
      this.state.loading = false;
      
      // Show error message
      this.elements.content.innerHTML = `
        <div class="order-history-error">
          <p>Error loading orders: ${error.message}</p>
          <button type="button" class="btn btn-primary" id="retry-load">Retry</button>
        </div>
      `;
      
      // Add retry button event listener
      const retryButton = this.container.querySelector('#retry-load');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadOrders();
        });
      }
      
      // Log error
      console.error('Error loading orders:', error);
    }
  }

  /**
   * View order
   * 
   * @param {string|number} orderId - Order ID
   */
  async viewOrder(orderId) {
    try {
      // Show loading notification
      if (typeof notifications !== 'undefined') {
        notifications.info('Loading order details...', 'Please Wait');
      }
      
      // Fetch order details
      const order = await dataService.getOrder(orderId);
      
      // Show order details modal
      this.showOrderDetailsModal(order);
    } catch (error) {
      // Show error notification
      if (typeof notifications !== 'undefined') {
        notifications.error(`Error loading order details: ${error.message}`, 'Error');
      }
      
      // Log error
      console.error('Error loading order details:', error);
    }
  }

  /**
   * Cancel order
   * 
   * @param {string|number} orderId - Order ID
   */
  cancelOrder(orderId) {
    // Show confirmation modal
    this.showConfirmationModal({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Yes, Cancel Order',
      cancelText: 'No, Keep Order',
      onConfirm: async () => {
        try {
          // Show loading notification
          if (typeof notifications !== 'undefined') {
            notifications.info('Cancelling order...', 'Please Wait');
          }
          
          // Cancel order
          await api.post(`/orders/${orderId}/cancel`);
          
          // Show success notification
          if (typeof notifications !== 'undefined') {
            notifications.success('Order cancelled successfully', 'Order Cancelled');
          }
          
          // Reload orders
          this.loadOrders();
        } catch (error) {
          // Show error notification
          if (typeof notifications !== 'undefined') {
            notifications.error(`Error cancelling order: ${error.message}`, 'Error');
          }
          
          // Log error
          console.error('Error cancelling order:', error);
        }
      }
    });
  }

  /**
   * Review order
   * 
   * @param {string|number} orderId - Order ID
   */
  async reviewOrder(orderId) {
    try {
      // Show loading notification
      if (typeof notifications !== 'undefined') {
        notifications.info('Loading order details...', 'Please Wait');
      }
      
      // Fetch order details
      const order = await dataService.getOrder(orderId);
      
      // Show review modal
      this.showReviewModal(order);
    } catch (error) {
      // Show error notification
      if (typeof notifications !== 'undefined') {
        notifications.error(`Error loading order details: ${error.message}`, 'Error');
      }
      
      // Log error
      console.error('Error loading order details:', error);
    }
  }

  /**
   * Show order details modal
   * 
   * @param {Object} order - Order data
   */
  showOrderDetailsModal(order) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'order-details-title');
    
    // Set modal content
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="order-details-title">Order #${order.id}</h2>
            <button type="button" class="close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="order-details">
              <div class="order-info">
                <p><strong>Date:</strong> ${this.formatDate(order.created_at)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
                <p><strong>Total:</strong> ${this.formatCurrency(order.total)}</p>
              </div>
              
              <h3>Items</h3>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${this.formatCurrency(item.price)}</td>
                        <td>${item.quantity}</td>
                        <td>${this.formatCurrency(item.subtotal)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <h3>Shipping Address</h3>
              <div class="shipping-address">
                <p>${order.shipping_address.street}</p>
                <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}</p>
                <p>${order.shipping_address.country}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            ${order.status === 'PENDING' ? `
              <button type="button" class="btn btn-danger" id="cancel-order-btn" data-order-id="${order.id}">Cancel Order</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Create focus trap
    let focusTrap = null;
    if (typeof accessibility !== 'undefined') {
      focusTrap = accessibility.createFocusTrap(modal);
    }
    
    // Add event listeners
    const closeButton = modal.querySelector('.close');
    const cancelButton = modal.querySelector('[data-dismiss="modal"]');
    const cancelOrderButton = modal.querySelector('#cancel-order-btn');
    
    // Close modal
    const closeModal = () => {
      modal.classList.remove('show');
      
      // Remove modal after animation
      setTimeout(() => {
        document.body.removeChild(modal);
        
        // Release focus trap
        if (focusTrap) {
          focusTrap.release();
        }
      }, 300);
    };
    
    // Close on button click
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    
    // Close on escape key
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
    
    // Close on outside click
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });
    
    // Cancel order
    if (cancelOrderButton) {
      cancelOrderButton.addEventListener('click', () => {
        closeModal();
        this.cancelOrder(order.id);
      });
    }
  }

  /**
   * Show review modal
   * 
   * @param {Object} order - Order data
   */
  showReviewModal(order) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'review-order-title');
    
    // Set modal content
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="review-order-title">Review Order #${order.id}</h2>
            <button type="button" class="close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div class="modal-body">
            <form id="review-form">
              <div class="form-group">
                <label for="review-rating">Rating</label>
                <div class="rating-input">
                  <input type="radio" id="rating-5" name="rating" value="5" required>
                  <label for="rating-5" aria-label="5 stars">★</label>
                  
                  <input type="radio" id="rating-4" name="rating" value="4">
                  <label for="rating-4" aria-label="4 stars">★</label>
                  
                  <input type="radio" id="rating-3" name="rating" value="3">
                  <label for="rating-3" aria-label="3 stars">★</label>
                  
                  <input type="radio" id="rating-2" name="rating" value="2">
                  <label for="rating-2" aria-label="2 stars">★</label>
                  
                  <input type="radio" id="rating-1" name="rating" value="1">
                  <label for="rating-1" aria-label="1 star">★</label>
                </div>
              </div>
              
              <div class="form-group">
                <label for="review-comment">Comment</label>
                <textarea id="review-comment" name="comment" class="form-control" rows="4" required></textarea>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="submit-review-btn">Submit Review</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Create focus trap
    let focusTrap = null;
    if (typeof accessibility !== 'undefined') {
      focusTrap = accessibility.createFocusTrap(modal);
    }
    
    // Add event listeners
    const closeButton = modal.querySelector('.close');
    const cancelButton = modal.querySelector('[data-dismiss="modal"]');
    const submitButton = modal.querySelector('#submit-review-btn');
    const form = modal.querySelector('#review-form');
    
    // Close modal
    const closeModal = () => {
      modal.classList.remove('show');
      
      // Remove modal after animation
      setTimeout(() => {
        document.body.removeChild(modal);
        
        // Release focus trap
        if (focusTrap) {
          focusTrap.release();
        }
      }, 300);
    };
    
    // Close on button click
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    
    // Close on escape key
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
    
    // Close on outside click
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });
    
    // Submit review
    submitButton.addEventListener('click', async () => {
      // Validate form
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Get form values
      const rating = form.querySelector('input[name="rating"]:checked').value;
      const comment = form.querySelector('#review-comment').value;
      
      try {
        // Show loading notification
        if (typeof notifications !== 'undefined') {
          notifications.info('Submitting review...', 'Please Wait');
        }
        
        // Submit review
        await api.post(`/orders/${order.id}/review`, {
          rating: parseInt(rating, 10),
          comment
        });
        
        // Show success notification
        if (typeof notifications !== 'undefined') {
          notifications.success('Review submitted successfully', 'Review Submitted');
        }
        
        // Close modal
        closeModal();
      } catch (error) {
        // Show error notification
        if (typeof notifications !== 'undefined') {
          notifications.error(`Error submitting review: ${error.message}`, 'Error');
        }
        
        // Log error
        console.error('Error submitting review:', error);
      }
    });
  }

  /**
   * Show confirmation modal
   * 
   * @param {Object} options - Modal options
   * @param {string} options.title - Modal title
   * @param {string} options.message - Modal message
   * @param {string} options.confirmText - Confirm button text
   * @param {string} options.cancelText - Cancel button text
   * @param {Function} options.onConfirm - Confirm callback
   * @param {Function} options.onCancel - Cancel callback
   */
  showConfirmationModal(options) {
    const {
      title = 'Confirmation',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm = () => {},
      onCancel = () => {}
    } = options;
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'confirmation-title');
    
    // Set modal content
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="confirmation-title">${title}</h2>
            <button type="button" class="close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div class="modal-body">
            <p>${message}</p>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">${cancelText}</button>
            <button type="button" class="btn btn-primary" id="confirm-btn">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Create focus trap
    let focusTrap = null;
    if (typeof accessibility !== 'undefined') {
      focusTrap = accessibility.createFocusTrap(modal);
    }
    
    // Add event listeners
    const closeButton = modal.querySelector('.close');
    const cancelButton = modal.querySelector('[data-dismiss="modal"]');
    const confirmButton = modal.querySelector('#confirm-btn');
    
    // Close modal
    const closeModal = () => {
      modal.classList.remove('show');
      
      // Remove modal after animation
      setTimeout(() => {
        document.body.removeChild(modal);
        
        // Release focus trap
        if (focusTrap) {
          focusTrap.release();
        }
      }, 300);
    };
    
    // Close on button click
    closeButton.addEventListener('click', () => {
      closeModal();
      onCancel();
    });
    
    cancelButton.addEventListener('click', () => {
      closeModal();
      onCancel();
    });
    
    // Close on escape key
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        onCancel();
      }
    });
    
    // Close on outside click
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
        onCancel();
      }
    });
    
    // Confirm action
    confirmButton.addEventListener('click', () => {
      closeModal();
      onConfirm();
    });
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
  module.exports = OrderHistory;
}
