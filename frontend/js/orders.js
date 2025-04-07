/**
 * GigGatek Order Management Module
 * Handles order creation, retrieval, and management functions
 */

class Orders {
    constructor() {
        this.apiBaseUrl = '/api/orders';
        
        // Verify auth module is available
        if (!window.auth) {
            console.error('Auth module required for Orders module');
        }
    }
    
    /**
     * Get authentication headers for API requests
     * @returns {Object} Headers object with Authorization header
     */
    getAuthHeaders() {
        return window.auth ? window.auth.getAuthHeaders() : {};
    }
    
    /**
     * Get all orders for the current user
     * @param {Object} options - Options for filtering and pagination
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.per_page - Items per page (default: 10)
     * @param {string} options.status - Filter by order status
     * @returns {Promise<Object>} Orders data with pagination
     */
    async getUserOrders(options = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (options.page) queryParams.append('page', options.page);
            if (options.per_page) queryParams.append('per_page', options.per_page);
            if (options.status) queryParams.append('status', options.status);
            
            const queryString = queryParams.toString();
            const url = `${this.apiBaseUrl}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }
            
            return {
                success: true,
                ...data
            };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch orders'
            };
        }
    }
    
    /**
     * Get details for a specific order
     * @param {number} orderId - ID of the order to retrieve
     * @returns {Promise<Object>} Order details
     */
    async getOrderDetails(orderId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${orderId}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order details');
            }
            
            return {
                success: true,
                ...data
            };
        } catch (error) {
            console.error(`Error fetching order details for order ${orderId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to fetch order details'
            };
        }
    }
    
    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @param {Array} orderData.items - Order items
     * @param {Object} orderData.shipping_address - Shipping address
     * @param {Object} orderData.billing_address - Billing address (optional)
     * @param {string} orderData.payment_method - Payment method
     * @param {string} orderData.shipping_method - Shipping method (optional)
     * @param {number} orderData.shipping_cost - Shipping cost (optional)
     * @param {number} orderData.tax_amount - Tax amount (optional)
     * @param {string} orderData.notes - Order notes (optional)
     * @returns {Promise<Object>} Created order data
     */
    async createOrder(orderData) {
        try {
            // Validate required fields
            if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                throw new Error('Order items are required');
            }
            
            if (!orderData.shipping_address) {
                throw new Error('Shipping address is required');
            }
            
            if (!orderData.payment_method) {
                throw new Error('Payment method is required');
            }
            
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }
            
            return {
                success: true,
                ...data
            };
        } catch (error) {
            console.error('Error creating order:', error);
            return {
                success: false,
                error: error.message || 'Failed to create order'
            };
        }
    }
    
    /**
     * Update order status (Admin/Manager only)
     * @param {number} orderId - ID of the order to update
     * @param {string} status - New status
     * @param {string} comment - Comment about the status change (optional)
     * @returns {Promise<Object>} Update result
     */
    async updateOrderStatus(orderId, status, comment = '') {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, comment })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update order status');
            }
            
            return {
                success: true,
                ...data
            };
        } catch (error) {
            console.error(`Error updating status for order ${orderId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to update order status'
            };
        }
    }
    
    /**
     * Get all orders in the system (Admin/Manager only)
     * @param {Object} options - Options for filtering and pagination
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.per_page - Items per page (default: 20)
     * @param {string} options.status - Filter by order status
     * @param {number} options.user_id - Filter by user ID
     * @returns {Promise<Object>} Orders data with pagination
     */
    async getAllOrders(options = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (options.page) queryParams.append('page', options.page);
            if (options.per_page) queryParams.append('per_page', options.per_page);
            if (options.status) queryParams.append('status', options.status);
            if (options.user_id) queryParams.append('user_id', options.user_id);
            
            const queryString = queryParams.toString();
            const url = `${this.apiBaseUrl}/admin/all${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch all orders');
            }
            
            return {
                success: true,
                ...data
            };
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch all orders'
            };
        }
    }
    
    /**
     * Format currency for display
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Get styled badge HTML for order status
     * @param {string} status - Order status
     * @returns {string} HTML for status badge
     */
    getStatusBadgeHtml(status) {
        const statusClasses = {
            'pending': 'badge-warning',
            'processing': 'badge-primary',
            'shipped': 'badge-info',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger',
            'refunded': 'badge-secondary',
            'on_hold': 'badge-dark'
        };
        
        const statusClass = statusClasses[status] || 'badge-secondary';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        
        return `<span class="badge ${statusClass}">${statusLabel}</span>`;
    }
}

// Initialize the orders singleton
window.orders = new Orders();
