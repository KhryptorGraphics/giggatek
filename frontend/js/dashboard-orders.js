/**
 * GigGatek Dashboard Orders Module
 * Handles order history display and management in the user dashboard
 */

class DashboardOrders {
    constructor() {
        this.orders = [];
        this.currentOrder = null;
        
        // Initialize module when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the orders module
     */
    init() {
        // Check if orders tab exists
        const ordersTab = document.getElementById('orders-tab');
        if (!ordersTab) return;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Listen for dashboard tab changes
        document.addEventListener('dashboard:tabChanged', (e) => {
            if (e.detail.tab === 'orders') {
                this.loadOrders();
            }
        });
        
        // Load orders if tab is active on init
        if (window.dashboard && window.dashboard.activeTab === 'orders') {
            this.loadOrders();
        }
    }
    
    /**
     * Setup event listeners for order-related actions
     */
    setupEventListeners() {
        const ordersTab = document.getElementById('orders-tab');
        if (!ordersTab) return;
        
        // Event delegation for order actions
        ordersTab.addEventListener('click', (e) => {
            // Order card click
            if (e.target.closest('.order-card')) {
                const orderCard = e.target.closest('.order-card');
                const orderId = orderCard.dataset.orderId;
                
                if (orderId) {
                    this.displayOrderDetails(orderId);
                }
            }
            
            // Back to orders list button
            if (e.target.matches('.back-to-orders')) {
                this.showOrdersList();
            }
            
            // Track order button
            if (e.target.matches('.track-order')) {
                const orderId = e.target.dataset.orderId;
                if (orderId) {
                    this.trackOrder(orderId);
                }
            }
            
            // Order action buttons (cancel, return, etc.)
            if (e.target.matches('.cancel-order')) {
                const orderId = e.target.dataset.orderId;
                if (orderId) {
                    this.confirmCancelOrder(orderId);
                }
            }
            
            if (e.target.matches('.return-order')) {
                const orderId = e.target.dataset.orderId;
                if (orderId) {
                    this.initiateReturn(orderId);
                }
            }
            
            if (e.target.matches('.download-invoice')) {
                const orderId = e.target.dataset.orderId;
                if (orderId) {
                    this.downloadInvoice(orderId);
                }
            }
            
            if (e.target.matches('.reorder')) {
                const orderId = e.target.dataset.orderId;
                if (orderId) {
                    this.reorderItems(orderId);
                }
            }
        });
        
        // Order filters
        const orderFilterSelect = document.getElementById('order-filter');
        if (orderFilterSelect) {
            orderFilterSelect.addEventListener('change', () => {
                this.filterOrders(orderFilterSelect.value);
            });
        }
        
        // Order search
        const orderSearchInput = document.getElementById('order-search');
        if (orderSearchInput) {
            orderSearchInput.addEventListener('input', () => {
                this.searchOrders(orderSearchInput.value);
            });
        }
    }
    
    /**
     * Load user orders from API
     */
    async loadOrders() {
        const ordersContainer = document.querySelector('#orders-tab .orders-list');
        if (!ordersContainer) return;
        
        // Show loading state
        ordersContainer.innerHTML = '<div class="loading">Loading orders...</div>';
        
        try {
            const response = await fetch('/api/user/orders', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load orders: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.orders = data.orders || [];
                
                // Render orders
                this.renderOrders();
            } else {
                throw new Error(data.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            
            ordersContainer.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading your orders.</p>
                    <button id="retry-load-orders" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-orders');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.loadOrders());
            }
        }
    }
    
    /**
     * Render orders in the orders list container
     */
    renderOrders() {
        const ordersContainer = document.querySelector('#orders-tab .orders-list');
        if (!ordersContainer) return;
        
        // Clear container
        ordersContainer.innerHTML = '';
        
        // Show empty state if no orders
        if (this.orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-data">
                    <p>You don't have any orders yet.</p>
                    <a href="/products.php" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        // Add filters & search if we have orders
        let filtersHtml = '';
        if (this.orders.length > 0) {
            filtersHtml = `
                <div class="orders-filter-container">
                    <div class="order-search">
                        <input type="text" id="order-search" placeholder="Search orders" class="form-control">
                    </div>
                    <div class="order-filter">
                        <select id="order-filter" class="form-control">
                            <option value="all">All Orders</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            `;
            ordersContainer.innerHTML = filtersHtml;
        }
        
        // Create orders list
        const ordersList = document.createElement('div');
        ordersList.className = 'orders-cards-container';
        
        this.orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = `order-card status-${order.status.toLowerCase()}`;
            orderCard.dataset.orderId = order.id;
            
            // Format date
            const orderDate = new Date(order.order_date);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Calculate item count text
            let itemText = `${order.item_count} item`;
            if (order.item_count > 1) {
                itemText = `${order.item_count} items`;
            }
            
            // Status badge class based on status
            let statusBadgeClass = 'status-badge ';
            switch (order.status.toLowerCase()) {
                case 'processing':
                    statusBadgeClass += 'status-processing';
                    break;
                case 'shipped':
                    statusBadgeClass += 'status-shipped';
                    break;
                case 'delivered':
                    statusBadgeClass += 'status-delivered';
                    break;
                case 'cancelled':
                    statusBadgeClass += 'status-cancelled';
                    break;
                default:
                    statusBadgeClass += 'status-processing';
            }
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-number">Order #${order.order_number}</div>
                    <div class="${statusBadgeClass}">${order.status}</div>
                </div>
                <div class="order-content">
                    <div class="order-date">Placed on ${formattedDate}</div>
                    <div class="order-items">${itemText}</div>
                    <div class="order-total">$${order.total}</div>
                </div>
                <div class="order-actions">
                    <span class="order-details-link">View Details</span>
                </div>
            `;
            
            ordersList.appendChild(orderCard);
        });
        
        ordersContainer.appendChild(ordersList);
    }
    
    /**
     * Display order details
     * @param {string} orderId - Order ID to display
     */
    async displayOrderDetails(orderId) {
        const ordersContainer = document.querySelector('#orders-tab .orders-list');
        if (!ordersContainer) return;
        
        // Show loading state
        ordersContainer.innerHTML = '<div class="loading">Loading order details...</div>';
        
        try {
            const response = await fetch(`/api/user/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load order details: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.order) {
                this.currentOrder = data.order;
                
                // Render order details
                this.renderOrderDetails();
            } else {
                throw new Error(data.message || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            
            ordersContainer.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading the order details.</p>
                    <button class="back-to-orders btn btn-secondary">Back to Orders</button>
                    <button id="retry-load-order-details" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-order-details');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.displayOrderDetails(orderId));
            }
        }
    }
    
    /**
     * Render order details
     */
    renderOrderDetails() {
        const ordersContainer = document.querySelector('#orders-tab .orders-list');
        if (!ordersContainer || !this.currentOrder) return;
        
        // Format date
        const orderDate = new Date(this.currentOrder.order_date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status badge class based on status
        let statusBadgeClass = 'status-badge ';
        switch (this.currentOrder.status.toLowerCase()) {
            case 'processing':
                statusBadgeClass += 'status-processing';
                break;
            case 'shipped':
                statusBadgeClass += 'status-shipped';
                break;
            case 'delivered':
                statusBadgeClass += 'status-delivered';
                break;
            case 'cancelled':
                statusBadgeClass += 'status-cancelled';
                break;
            default:
                statusBadgeClass += 'status-processing';
        }
        
        // Build HTML for order items
        let orderItemsHtml = '';
        const items = this.currentOrder.items || [];
        
        items.forEach(item => {
            orderItemsHtml += `
                <div class="order-item">
                    <div class="item-image">
                        <img src="${item.image_url}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">Qty: ${item.quantity}</div>
                        <div class="item-price">$${item.price}</div>
                    </div>
                </div>
            `;
        });
        
        // Calculate order actions based on status
        let orderActionsHtml = '';
        
        switch (this.currentOrder.status.toLowerCase()) {
            case 'processing':
                orderActionsHtml = `
                    <button class="btn btn-outline-secondary cancel-order" data-order-id="${this.currentOrder.id}">Cancel Order</button>
                `;
                break;
            case 'shipped':
                orderActionsHtml = `
                    <button class="btn btn-primary track-order" data-order-id="${this.currentOrder.id}">Track Order</button>
                `;
                break;
            case 'delivered':
                orderActionsHtml = `
                    <button class="btn btn-outline-secondary return-order" data-order-id="${this.currentOrder.id}">Return Items</button>
                    <button class="btn btn-secondary reorder" data-order-id="${this.currentOrder.id}">Buy Again</button>
                `;
                break;
        }
        
        // Add download invoice for all except cancelled orders
        if (this.currentOrder.status.toLowerCase() !== 'cancelled') {
            orderActionsHtml += `
                <button class="btn btn-link download-invoice" data-order-id="${this.currentOrder.id}">Download Invoice</button>
            `;
        }
        
        // Build tracking info HTML if available
        let trackingHtml = '';
        if (this.currentOrder.tracking_number && this.currentOrder.shipping_carrier) {
            trackingHtml = `
                <div class="order-tracking-info">
                    <div class="tracking-carrier">${this.currentOrder.shipping_carrier}</div>
                    <div class="tracking-number">Tracking #: ${this.currentOrder.tracking_number}</div>
                    <button class="btn btn-primary track-order" data-order-id="${this.currentOrder.id}">Track Package</button>
                </div>
            `;
        }
        
        // Shipping address
        let shippingAddressHtml = '';
        const shippingAddress = this.currentOrder.shipping_address;
        
        if (shippingAddress) {
            shippingAddressHtml = `
                <div class="shipping-address-card">
                    <h4>Shipping Address</h4>
                    <div class="address-name">${shippingAddress.first_name} ${shippingAddress.last_name}</div>
                    <div class="address-line">${shippingAddress.street_address}</div>
                    ${shippingAddress.street_address2 ? `<div class="address-line">${shippingAddress.street_address2}</div>` : ''}
                    <div class="address-line">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip_code}</div>
                    <div class="address-line">${shippingAddress.country}</div>
                </div>
            `;
        }
        
        // Payment method
        let paymentMethodHtml = '';
        const paymentMethod = this.currentOrder.payment_method;
        
        if (paymentMethod) {
            paymentMethodHtml = `
                <div class="payment-method-card">
                    <h4>Payment Method</h4>
                    <div class="payment-card-info">
                        <div class="card-icon ${paymentMethod.card_type.toLowerCase()}"></div>
                        <div class="card-info">
                            <div class="card-type">${paymentMethod.card_type}</div>
                            <div class="card-number">•••• ${paymentMethod.last4}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Build the final HTML
        ordersContainer.innerHTML = `
            <div class="order-details-container">
                <div class="order-details-header">
                    <button class="back-to-orders btn btn-link"><i class="icon-chevron-left"></i> Back to Orders</button>
                    <h2>Order #${this.currentOrder.order_number}</h2>
                    <div class="order-details-meta">
                        <div class="order-date">Placed on ${formattedDate}</div>
                        <div class="${statusBadgeClass}">${this.currentOrder.status}</div>
                    </div>
                </div>
                
                <div class="order-items-container">
                    <h3>Items in Order</h3>
                    <div class="order-items-list">
                        ${orderItemsHtml}
                    </div>
                </div>
                
                ${trackingHtml}
                
                <div class="order-information-grid">
                    ${shippingAddressHtml}
                    ${paymentMethodHtml}
                    
                    <div class="order-summary-card">
                        <h4>Order Summary</h4>
                        <div class="order-summary-line">
                            <span>Subtotal:</span>
                            <span>$${this.currentOrder.subtotal}</span>
                        </div>
                        <div class="order-summary-line">
                            <span>Tax:</span>
                            <span>$${this.currentOrder.tax}</span>
                        </div>
                        <div class="order-summary-line">
                            <span>Shipping:</span>
                            <span>$${this.currentOrder.shipping_cost}</span>
                        </div>
                        <div class="order-summary-line total">
                            <span>Total:</span>
                            <span>$${this.currentOrder.total}</span>
                        </div>
                    </div>
                </div>
                
                <div class="order-actions-container">
                    ${orderActionsHtml}
                </div>
            </div>
        `;
    }
    
    /**
     * Show orders list (go back from order details)
     */
    showOrdersList() {
        this.currentOrder = null;
        this.renderOrders();
    }
    
    /**
     * Filter orders by status
     * @param {string} status - Status to filter by
     */
    filterOrders(status) {
        const orderCards = document.querySelectorAll('.order-card');
        
        if (status === 'all') {
            orderCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        orderCards.forEach(card => {
            if (card.classList.contains(`status-${status}`)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Search orders by text
     * @param {string} searchText - Text to search for
     */
    searchOrders(searchText) {
        const orderCards = document.querySelectorAll('.order-card');
        const lowerSearchText = searchText.toLowerCase();
        
        if (!searchText.trim()) {
            orderCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        orderCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(lowerSearchText)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Track an order
     * @param {string} orderId - Order ID to track
     */
    trackOrder(orderId) {
        // Find order with tracking info
        const order = this.orders.find(o => o.id === orderId) || this.currentOrder;
        
        if (!order || !order.tracking_number || !order.shipping_carrier) {
            alert('Tracking information is not available for this order.');
            return;
        }
        
        // Simple implementation - in reality would open carrier's tracking page
        // This is just a placeholder
        let trackingUrl = '#';
        
        switch (order.shipping_carrier.toLowerCase()) {
            case 'fedex':
                trackingUrl = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${order.tracking_number}`;
                break;
            case 'ups':
                trackingUrl = `https://www.ups.com/track?tracknum=${order.tracking_number}`;
                break;
            case 'usps':
                trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`;
                break;
            case 'dhl':
                trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${order.tracking_number}`;
                break;
            default:
                trackingUrl = `https://www.google.com/search?q=${encodeURIComponent(order.shipping_carrier + ' tracking ' + order.tracking_number)}`;
        }
        
        // Open tracking page in a new tab
        window.open(trackingUrl, '_blank');
    }
    
    /**
     * Confirm order cancellation
     * @param {string} orderId - Order ID to cancel
     */
    confirmCancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            this.cancelOrder(orderId);
        }
    }
    
    /**
     * Cancel an order
     * @param {string} orderId - Order ID to cancel
     */
    async cancelOrder(orderId) {
        try {
            const response = await fetch(`/api/user/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to cancel order: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh order and update UI
                if (this.currentOrder && this.currentOrder.id === orderId) {
                    this.currentOrder.status = 'Cancelled';
                    this.renderOrderDetails();
                }
                
                // Update orders list
                this.loadOrders();
                
                alert('Order cancelled successfully.');
            } else {
                throw new Error(data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('There was a problem cancelling your order. Please try again or contact customer service.');
        }
    }
    
    /**
     * Initiate return process
     * @param {string} orderId - Order ID to return
     */
    initiateReturn(orderId) {
        // In a real app, this would open the return flow
        // For this demo, we'll just redirect to a return page
        window.location.href = `/returns.php?order_id=${orderId}`;
    }
    
    /**
     * Download order invoice
     * @param {string} orderId - Order ID to download invoice for
     */
    async downloadInvoice(orderId) {
        try {
            const response = await fetch(`/api/user/orders/${orderId}/invoice`, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders()
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to download invoice: ${response.status}`);
            }
            
            // Get the blob from the response
            const blob = await response.blob();
            
            // Create object URL for the blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link and click it to download
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('There was a problem downloading the invoice. Please try again later.');
        }
    }
    
    /**
     * Reorder items from a previous order
     * @param {string} orderId - Order ID to reorder
     */
    async reorderItems(orderId) {
        try {
            const response = await fetch(`/api/user/orders/${orderId}/reorder`, {
                method: 'POST',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to reorder items: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to cart
                window.location.href = '/cart.php';
            } else {
                throw new Error(data.message || 'Failed to reorder items');
            }
        } catch (error) {
            console.error('Error reordering items:', error);
            alert('There was a problem adding these items to your cart. Please try again later.');
        }
    }
}

// Initialize the DashboardOrders module
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardOrders = new DashboardOrders();
});
