/**
 * GigGatek Orders Module
 * Handles order history, details, and related functionality for the user dashboard
 */

class OrdersManager {
    constructor() {
        this.ordersApiUrl = '/api/orders';
        this.ordersPerPage = 5;
        this.currentPage = 1;
        
        // Initialize module when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the module
     */
    init() {
        // Get orders container
        const ordersContainer = document.getElementById('orders-tab');
        if (!ordersContainer) return;
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Load orders
        this.loadOrders();
    }
    
    /**
     * Setup all event handlers for the orders panel
     */
    setupEventHandlers() {
        // Handle pagination buttons
        document.addEventListener('click', (e) => {
            // Next page
            if (e.target.classList.contains('pagination-next') || e.target.closest('.pagination-next')) {
                e.preventDefault();
                this.nextPage();
            }
            
            // Previous page
            if (e.target.classList.contains('pagination-prev') || e.target.closest('.pagination-prev')) {
                e.preventDefault();
                this.prevPage();
            }
            
            // Order details
            if (e.target.classList.contains('view-order') || e.target.closest('.view-order')) {
                e.preventDefault();
                const orderCard = e.target.closest('.order-card');
                const orderId = orderCard ? orderCard.dataset.orderId : null;
                if (orderId) {
                    this.viewOrderDetails(orderId);
                }
            }
            
            // Track order
            if (e.target.classList.contains('track-order') || e.target.closest('.track-order')) {
                e.preventDefault();
                const orderCard = e.target.closest('.order-card');
                const orderId = orderCard ? orderCard.dataset.orderId : null;
                if (orderId) {
                    this.trackOrder(orderId);
                }
            }
            
            // Write review
            if (e.target.classList.contains('write-review') || e.target.closest('.write-review')) {
                e.preventDefault();
                const orderCard = e.target.closest('.order-card');
                const orderId = orderCard ? orderCard.dataset.orderId : null;
                if (orderId) {
                    this.writeReview(orderId);
                }
            }
        });
        
        // Filter by status
        const statusFilter = document.getElementById('order-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.loadOrders();
            });
        }
        
        // Search orders
        const searchForm = document.getElementById('order-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.currentPage = 1;
                this.loadOrders();
            });
        }
    }
    
    /**
     * Get authentication headers for API requests (from auth module)
     * @returns {Object} Headers object with Authorization header
     */
    getAuthHeaders() {
        return window.auth ? window.auth.getAuthHeaders() : {};
    }
    
    /**
     * Load orders from API
     */
    async loadOrders() {
        const ordersContainer = document.querySelector('#orders-tab .orders-list');
        if (!ordersContainer) return;
        
        try {
            // Show loading state
            ordersContainer.innerHTML = '<div class="loading">Loading orders...</div>';
            
            // Get filter and search values
            const statusFilter = document.getElementById('order-status-filter');
            const status = statusFilter ? statusFilter.value : '';
            
            const searchInput = document.getElementById('order-search');
            const search = searchInput ? searchInput.value : '';
            
            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.ordersPerPage
            });
            
            if (status && status !== 'all') {
                params.append('status', status);
            }
            
            if (search) {
                params.append('search', search);
            }
            
            // Make API request
            const response = await fetch(`${this.ordersApiUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load orders');
            }
            
            // Clear container
            ordersContainer.innerHTML = '';
            
            // Render orders
            if (data.orders && data.orders.length > 0) {
                data.orders.forEach(order => {
                    const orderHtml = this.renderOrderCard(order);
                    ordersContainer.insertAdjacentHTML('beforeend', orderHtml);
                });
                
                // Update pagination
                this.updatePagination(data.pagination);
            } else {
                ordersContainer.innerHTML = `
                    <div class="no-data">
                        <p>No orders found.</p>
                        ${search || (status && status !== 'all') ? 
                            '<p>Try adjusting your search criteria or view all orders.</p>' : ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            // Show error message
            const ordersContainer = document.querySelector('#orders-tab .orders-list');
            if (ordersContainer) {
                ordersContainer.innerHTML = `
                    <div class="error">
                        <p>Error loading orders. Please try again later.</p>
                        <button class="btn btn-primary retry-btn">Retry</button>
                    </div>
                `;
                
                // Add retry button handler
                const retryBtn = ordersContainer.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => this.loadOrders());
                }
            }
        }
    }
    
    /**
     * Render an order card
     * @param {Object} order - Order data
     * @returns {string} HTML for the order card
     */
    renderOrderCard(order) {
        // Format date
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Format price
        const formattedTotal = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(order.total);
        
        // Get status badge class
        const statusClass = this.getStatusBadgeClass(order.status);
        
        // Get action buttons based on order status
        const actionButtons = this.getOrderActionButtons(order);
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-id">Order #${order.order_number}</div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${order.status_label}</span>
                    </div>
                </div>
                <div class="order-body">
                    <div class="order-details">
                        <div class="order-date">Placed on ${formattedDate}</div>
                        <div class="order-items">${order.items_count} item${order.items_count !== 1 ? 's' : ''}</div>
                        <div class="order-total">Total: ${formattedTotal}</div>
                    </div>
                </div>
                <div class="order-footer">
                    <button class="btn btn-sm btn-outline-primary view-order">View Details</button>
                    ${actionButtons}
                </div>
            </div>
        `;
    }
    
    /**
     * Get the CSS class for the status badge
     * @param {string} status - Order status
     * @returns {string} CSS class name
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled',
            'refunded': 'status-refunded'
        };
        
        return statusClasses[status] || 'status-default';
    }
    
    /**
     * Get action buttons based on order status
     * @param {Object} order - Order data
     * @returns {string} HTML for action buttons
     */
    getOrderActionButtons(order) {
        const buttons = [];
        
        // Track package button - show for shipped orders
        if (order.status === 'shipped') {
            buttons.push('<button class="btn btn-sm btn-outline-info track-order">Track Package</button>');
        }
        
        // Write review button - show for delivered orders
        if (order.status === 'delivered') {
            buttons.push('<button class="btn btn-sm btn-outline-secondary write-review">Write Review</button>');
        }
        
        // Cancel order button - show for pending/processing orders
        if (order.status === 'pending' || order.status === 'processing') {
            buttons.push('<button class="btn btn-sm btn-outline-danger cancel-order">Cancel Order</button>');
        }
        
        return buttons.join('');
    }
    
    /**
     * Update pagination controls
     * @param {Object} pagination - Pagination data from API
     */
    updatePagination(pagination) {
        const paginationContainer = document.querySelector('#orders-tab .pagination');
        if (!paginationContainer) return;
        
        // Set total pages
        this.totalPages = pagination.total_pages || 1;
        
        // Update pagination text
        const paginationText = paginationContainer.querySelector('.pagination-text');
        if (paginationText) {
            paginationText.textContent = `Page ${pagination.page} of ${pagination.total_pages}`;
        }
        
        // Update previous button
        const prevButton = paginationContainer.querySelector('.pagination-prev');
        if (prevButton) {
            prevButton.disabled = pagination.page <= 1;
        }
        
        // Update next button
        const nextButton = paginationContainer.querySelector('.pagination-next');
        if (nextButton) {
            nextButton.disabled = pagination.page >= pagination.total_pages;
        }
    }
    
    /**
     * Go to next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadOrders();
            
            // Scroll to top of orders container
            const ordersContainer = document.querySelector('#orders-tab .orders-list');
            if (ordersContainer) {
                ordersContainer.scrollTop = 0;
            }
        }
    }
    
    /**
     * Go to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadOrders();
            
            // Scroll to top of orders container
            const ordersContainer = document.querySelector('#orders-tab .orders-list');
            if (ordersContainer) {
                ordersContainer.scrollTop = 0;
            }
        }
    }
    
    /**
     * View order details
     * @param {string} orderId - The order ID to view
     */
    async viewOrderDetails(orderId) {
        try {
            // Create modal if it doesn't exist
            let orderModal = document.getElementById('order-details-modal');
            if (!orderModal) {
                orderModal = document.createElement('div');
                orderModal.id = 'order-details-modal';
                orderModal.className = 'modal';
                orderModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="order-details-container">
                            <div class="loading">Loading order details...</div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(orderModal);
                
                // Close button functionality
                const closeBtn = orderModal.querySelector('.close');
                closeBtn.addEventListener('click', () => {
                    orderModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', (event) => {
                    if (event.target === orderModal) {
                        orderModal.style.display = 'none';
                    }
                });
            }
            
            // Show modal
            orderModal.style.display = 'block';
            
            // Get order details container
            const orderDetailsContainer = orderModal.querySelector('.order-details-container');
            
            // Show loading
            orderDetailsContainer.innerHTML = '<div class="loading">Loading order details...</div>';
            
            // Fetch order details
            const response = await fetch(`${this.ordersApiUrl}/${orderId}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load order details');
            }
            
            // Format date
            const orderDate = new Date(data.order.created_at);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Get status badge class
            const statusClass = this.getStatusBadgeClass(data.order.status);
            
            // Calculate order totals
            const subtotal = data.order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            const tax = data.order.tax || 0;
            const shipping = data.order.shipping_fee || 0;
            const discount = data.order.discount || 0;
            const total = data.order.total;
            
            // Format prices
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Render order details
            orderDetailsContainer.innerHTML = `
                <h2>Order Details</h2>
                <div class="order-meta">
                    <div class="order-number">
                        <strong>Order #:</strong> ${data.order.order_number}
                    </div>
                    <div class="order-date">
                        <strong>Date:</strong> ${formattedDate}
                    </div>
                    <div class="order-status">
                        <strong>Status:</strong> <span class="status-badge ${statusClass}">${data.order.status_label}</span>
                    </div>
                </div>
                
                <h3>Items</h3>
                <div class="order-items-list">
                    ${data.order.items.map(item => `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${item.image_url || '/img/product-placeholder.jpg'}" alt="${item.name}">
                            </div>
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-sku">SKU: ${item.sku}</div>
                                ${item.options ? `<div class="item-options">${item.options}</div>` : ''}
                            </div>
                            <div class="item-price">${formatter.format(item.price)}</div>
                            <div class="item-quantity">x${item.quantity}</div>
                            <div class="item-total">${formatter.format(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-summary">
                    <div class="summary-row">
                        <div class="summary-label">Subtotal</div>
                        <div class="summary-value">${formatter.format(subtotal)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Shipping</div>
                        <div class="summary-value">${formatter.format(shipping)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Tax</div>
                        <div class="summary-value">${formatter.format(tax)}</div>
                    </div>
                    ${discount > 0 ? `
                        <div class="summary-row discount">
                            <div class="summary-label">Discount</div>
                            <div class="summary-value">-${formatter.format(discount)}</div>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <div class="summary-label">Total</div>
                        <div class="summary-value">${formatter.format(total)}</div>
                    </div>
                </div>
                
                <div class="order-addresses">
                    <div class="shipping-address">
                        <h4>Shipping Address</h4>
                        <p>${data.order.shipping_address.first_name} ${data.order.shipping_address.last_name}</p>
                        <p>${data.order.shipping_address.street_address}</p>
                        ${data.order.shipping_address.street_address2 ? `<p>${data.order.shipping_address.street_address2}</p>` : ''}
                        <p>${data.order.shipping_address.city}, ${data.order.shipping_address.state} ${data.order.shipping_address.zip_code}</p>
                        <p>${data.order.shipping_address.country}</p>
                        ${data.order.shipping_address.phone ? `<p>Phone: ${data.order.shipping_address.phone}</p>` : ''}
                    </div>
                    
                    <div class="billing-address">
                        <h4>Billing Address</h4>
                        <p>${data.order.billing_address.first_name} ${data.order.billing_address.last_name}</p>
                        <p>${data.order.billing_address.street_address}</p>
                        ${data.order.billing_address.street_address2 ? `<p>${data.order.billing_address.street_address2}</p>` : ''}
                        <p>${data.order.billing_address.city}, ${data.order.billing_address.state} ${data.order.billing_address.zip_code}</p>
                        <p>${data.order.billing_address.country}</p>
                        ${data.order.billing_address.phone ? `<p>Phone: ${data.order.billing_address.phone}</p>` : ''}
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-secondary close-modal">Close</button>
                    ${data.order.status === 'shipped' ? `<button class="btn btn-primary track-order">Track Package</button>` : ''}
                    ${data.order.status === 'delivered' ? `<button class="btn btn-primary write-review">Write Review</button>` : ''}
                    ${(data.order.status === 'pending' || data.order.status === 'processing') ? `<button class="btn btn-danger cancel-order">Cancel Order</button>` : ''}
                </div>
            `;
            
            // Add close button functionality
            const closeModalBtn = orderDetailsContainer.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    orderModal.style.display = 'none';
                });
            }
            
            // Track package button
            const trackBtn = orderDetailsContainer.querySelector('.track-order');
            if (trackBtn) {
                trackBtn.addEventListener('click', () => {
                    this.trackOrder(data.order.id);
                });
            }
            
            // Write review button
            const reviewBtn = orderDetailsContainer.querySelector('.write-review');
            if (reviewBtn) {
                reviewBtn.addEventListener('click', () => {
                    this.writeReview(data.order.id);
                });
            }
            
            // Cancel order button
            const cancelBtn = orderDetailsContainer.querySelector('.cancel-order');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.cancelOrder(data.order.id);
                    orderModal.style.display = 'none';
                });
            }
            
        } catch (error) {
            console.error('Error viewing order details:', error);
            
            // Show error message in modal
            const orderModal = document.getElementById('order-details-modal');
            if (orderModal) {
                const orderDetailsContainer = orderModal.querySelector('.order-details-container');
                if (orderDetailsContainer) {
                    orderDetailsContainer.innerHTML = `
                        <div class="error">
                            <p>Error loading order details. Please try again later.</p>
                            <button class="btn btn-primary retry-btn">Retry</button>
                            <button class="btn btn-secondary close-modal">Close</button>
                        </div>
                    `;
                    
                    // Add retry button handler
                    const retryBtn = orderDetailsContainer.querySelector('.retry-btn');
                    if (retryBtn) {
                        retryBtn.addEventListener('click', () => this.viewOrderDetails(orderId));
                    }
                    
                    // Add close button handler
                    const closeModalBtn = orderDetailsContainer.querySelector('.close-modal');
                    if (closeModalBtn) {
                        closeModalBtn.addEventListener('click', () => {
                            orderModal.style.display = 'none';
                        });
                    }
                }
            }
        }
    }
    
    /**
     * Track an order
     * @param {string} orderId - The order ID to track
     */
    async trackOrder(orderId) {
        try {
            // Make API request to get tracking info
            const response = await fetch(`${this.ordersApiUrl}/${orderId}/tracking`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get tracking information');
            }
            
            // If external tracking URL is provided, open in new window
            if (data.tracking_url) {
                window.open(data.tracking_url, '_blank');
                return;
            }
            
            // Otherwise, show tracking info in a modal
            let trackingModal = document.getElementById('tracking-modal');
            if (!trackingModal) {
                trackingModal = document.createElement('div');
                trackingModal.id = 'tracking-modal';
                trackingModal.className = 'modal';
                trackingModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="tracking-container"></div>
                    </div>
                `;
                
                document.body.appendChild(trackingModal);
                
                // Close button functionality
                const closeBtn = trackingModal.querySelector('.close');
                closeBtn.addEventListener('click', () => {
                    trackingModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', (event) => {
                    if (event.target === trackingModal) {
                        trackingModal.style.display = 'none';
                    }
                });
            }
            
            // Update tracking container
            const trackingContainer = trackingModal.querySelector('.tracking-container');
            if (!trackingContainer) return;
            
            // Render tracking information
            trackingContainer.innerHTML = `
                <h2>Tracking Information</h2>
                <div class="tracking-meta">
                    <div><strong>Order:</strong> #${data.order_number}</div>
                    <div><strong>Carrier:</strong> ${data.carrier}</div>
                    <div><strong>Tracking Number:</strong> ${data.tracking_number}</div>
                    <div><strong>Status:</strong> ${data.status}</div>
                    ${data.estimated_delivery ? `<div><strong>Estimated Delivery:</strong> ${new Date(data.estimated_delivery).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
                </div>
                
                <h3>Tracking History</h3>
                <div class="tracking-timeline">
                    ${data.events ? data.events.map(event => `
                        <div class="tracking-event">
                            <div class="event-date">${new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div class="event-time">${new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div class="event-location">${event.location}</div>
                            <div class="event-description">${event.description}</div>
                        </div>
                    `).join('') : '<div class="no-data">No tracking events available.</div>'}
                </div>
                
                <div class="tracking-actions">
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            `;
            
            // Add close button functionality
            const closeModalBtn = trackingContainer.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    trackingModal.style.display = 'none';
                });
            }
            
            // Show the modal
            trackingModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error tracking order:', error);
            alert('Failed to get tracking information. Please try again later.');
        }
    }
    
    /**
     * Write a review for an order
     * @param {string} orderId - The order ID to review
     */
    writeReview(orderId) {
        console.log(`Write review for order ${orderId}`);
        alert('Review functionality will be implemented in a future update.');
    }
    
    /**
     * Cancel an order
     * @param {string} orderId - The order ID to cancel
     */
    async cancelOrder(orderId) {
        // Confirm cancellation
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }
        
        try {
            // Make API request to cancel order
            const response = await fetch(`${this.ordersApiUrl}/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel order');
            }
            
            // Show success message
            alert(data.message || 'Order cancelled successfully.');
            
            // Reload orders
            this.loadOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(`Failed to cancel order: ${error.message || 'Please try again later.'}`);
        }
    }
}

// Initialize OrdersManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create an instance of the OrdersManager class
    window.ordersManager = new OrdersManager();
});
