/**
 * Abandoned Carts Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const totalCartsEl = document.getElementById('total-carts');
    const recoveredCartsEl = document.getElementById('recovered-carts');
    const recoveryRateEl = document.getElementById('recovery-rate');
    const avgCartValueEl = document.getElementById('avg-cart-value');
    const cartsTableBody = document.getElementById('carts-table-body');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfoEl = document.getElementById('page-info');
    const statusFilter = document.getElementById('status-filter');
    const dateRangeFilter = document.getElementById('date-range');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sendNotificationsBtn = document.getElementById('send-notifications-btn');
    const sendNotificationsModal = document.getElementById('send-notifications-modal');
    const sendNotificationsForm = document.getElementById('send-notifications-form');
    const cartDetailsModal = document.getElementById('cart-details-modal');
    const cartDetailsContent = document.getElementById('cart-details-content');
    
    // State
    const state = {
        carts: [],
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        filters: {
            status: 'all',
            dateRange: 30,
            search: ''
        },
        stats: {
            total: 0,
            recovered: 0,
            recoveryRate: 0,
            avgValue: 0
        }
    };
    
    // Initialize
    init();
    
    /**
     * Initialize the dashboard
     */
    function init() {
        // Load initial data
        loadStats();
        loadCarts();
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Pagination
        prevPageBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                loadCarts();
            }
        });
        
        nextPageBtn.addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                loadCarts();
            }
        });
        
        // Filters
        statusFilter.addEventListener('change', () => {
            state.filters.status = statusFilter.value;
            state.currentPage = 1;
            loadCarts();
        });
        
        dateRangeFilter.addEventListener('change', () => {
            state.filters.dateRange = dateRangeFilter.value;
            state.currentPage = 1;
            loadStats();
            loadCarts();
        });
        
        // Search
        searchBtn.addEventListener('click', () => {
            state.filters.search = searchInput.value.trim();
            state.currentPage = 1;
            loadCarts();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                state.filters.search = searchInput.value.trim();
                state.currentPage = 1;
                loadCarts();
            }
        });
        
        // Send notifications
        sendNotificationsBtn.addEventListener('click', () => {
            openModal(sendNotificationsModal);
        });
        
        sendNotificationsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendNotifications();
        });
        
        // Close modals
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(el => {
            el.addEventListener('click', () => {
                closeAllModals();
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
    }
    
    /**
     * Load abandoned cart statistics
     */
    function loadStats() {
        // Show loading state
        totalCartsEl.textContent = 'Loading...';
        recoveredCartsEl.textContent = 'Loading...';
        recoveryRateEl.textContent = 'Loading...';
        avgCartValueEl.textContent = 'Loading...';
        
        // Fetch stats from API
        fetch('/api/abandoned-carts/admin/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load statistics');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.stats) {
                // Update state
                state.stats = {
                    total: data.stats.total_carts,
                    recovered: data.stats.recovered_carts,
                    recoveryRate: data.stats.recovery_rate,
                    avgValue: data.stats.avg_cart_value || 0
                };
                
                // Update UI
                totalCartsEl.textContent = state.stats.total;
                recoveredCartsEl.textContent = state.stats.recovered;
                recoveryRateEl.textContent = `${state.stats.recoveryRate}%`;
                avgCartValueEl.textContent = formatCurrency(state.stats.avgValue);
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
            
            // Show error state
            totalCartsEl.textContent = 'Error';
            recoveredCartsEl.textContent = 'Error';
            recoveryRateEl.textContent = 'Error';
            avgCartValueEl.textContent = 'Error';
        });
    }
    
    /**
     * Load abandoned carts
     */
    function loadCarts() {
        // Show loading state
        cartsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-message">Loading abandoned carts...</td>
            </tr>
        `;
        
        // Build query parameters
        const params = new URLSearchParams({
            page: state.currentPage,
            per_page: state.perPage
        });
        
        if (state.filters.status !== 'all') {
            params.append('recovered', state.filters.status === 'recovered' ? 'true' : 'false');
        }
        
        if (state.filters.search) {
            params.append('search', state.filters.search);
        }
        
        if (state.filters.dateRange !== 'all') {
            params.append('days', state.filters.dateRange);
        }
        
        // Fetch carts from API
        fetch(`/api/abandoned-carts/admin/list?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load carts');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.carts) {
                // Update state
                state.carts = data.carts;
                state.currentPage = data.pagination.page;
                state.totalPages = data.pagination.total_pages;
                
                // Update UI
                renderCarts();
                updatePagination();
            }
        })
        .catch(error => {
            console.error('Error loading carts:', error);
            
            // Show error state
            cartsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-message">Error loading carts. Please try again.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Render carts table
     */
    function renderCarts() {
        if (state.carts.length === 0) {
            cartsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-message">No abandoned carts found.</td>
                </tr>
            `;
            return;
        }
        
        cartsTableBody.innerHTML = state.carts.map(cart => `
            <tr>
                <td>${cart.id}</td>
                <td>
                    ${cart.email ? `<a href="mailto:${cart.email}">${cart.email}</a>` : 'Guest User'}
                    ${cart.user_id ? `<br><small>User ID: ${cart.user_id}</small>` : ''}
                </td>
                <td>${cart.item_count}</td>
                <td>${formatCurrency(cart.total)}</td>
                <td>${formatDate(cart.created_at)}</td>
                <td>${cart.last_notification_sent ? formatDate(cart.last_notification_sent) : 'Never'}</td>
                <td>
                    ${cart.recovered 
                        ? `<span class="badge badge-success">Recovered</span>` 
                        : `<span class="badge badge-warning">Abandoned</span>`
                    }
                </td>
                <td>
                    <button class="btn btn-sm btn-primary view-cart-btn" data-id="${cart.id}">View</button>
                    ${!cart.recovered && cart.email ? `
                        <button class="btn btn-sm btn-secondary send-email-btn" data-id="${cart.id}" data-email="${cart.email}">
                            Send Email
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartId = btn.getAttribute('data-id');
                viewCartDetails(cartId);
            });
        });
        
        document.querySelectorAll('.send-email-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartId = btn.getAttribute('data-id');
                const email = btn.getAttribute('data-email');
                sendSingleNotification(cartId, email);
            });
        });
    }
    
    /**
     * Update pagination controls
     */
    function updatePagination() {
        pageInfoEl.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
        prevPageBtn.disabled = state.currentPage <= 1;
        nextPageBtn.disabled = state.currentPage >= state.totalPages;
    }
    
    /**
     * View cart details
     * 
     * @param {string} cartId - Cart ID
     */
    function viewCartDetails(cartId) {
        // Show loading state
        cartDetailsContent.innerHTML = `<div class="loading-message">Loading cart details...</div>`;
        
        // Open modal
        openModal(cartDetailsModal);
        
        // Fetch cart details from API
        fetch(`/api/abandoned-carts/admin/cart/${cartId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load cart details');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.cart) {
                renderCartDetails(data.cart);
            }
        })
        .catch(error => {
            console.error('Error loading cart details:', error);
            
            // Show error state
            cartDetailsContent.innerHTML = `
                <div class="error-message">
                    <p>Error loading cart details. Please try again.</p>
                </div>
            `;
        });
    }
    
    /**
     * Render cart details
     * 
     * @param {Object} cart - Cart data
     */
    function renderCartDetails(cart) {
        const cartData = cart.data || {};
        const items = cartData.items || [];
        
        cartDetailsContent.innerHTML = `
            <div class="cart-details-section">
                <h3>Customer Information</h3>
                <p><strong>Email:</strong> ${cart.email || 'Not provided'}</p>
                <p><strong>User ID:</strong> ${cart.user_id || 'Guest User'}</p>
                <p><strong>Created:</strong> ${formatDate(cart.created_at)}</p>
                <p><strong>Last Updated:</strong> ${formatDate(cart.updated_at)}</p>
                <p><strong>Status:</strong> ${cart.recovered ? 'Recovered' : 'Abandoned'}</p>
                ${cart.recovered ? `<p><strong>Recovery Date:</strong> ${formatDate(cart.recovery_date)}</p>` : ''}
                <p><strong>Notifications Sent:</strong> ${cart.notification_count}</p>
                ${cart.last_notification_sent ? `<p><strong>Last Notification:</strong> ${formatDate(cart.last_notification_sent)}</p>` : ''}
            </div>
            
            <div class="cart-details-section">
                <h3>Cart Items (${items.length})</h3>
                ${items.length > 0 ? `
                    <div class="cart-items">
                        ${items.map(item => `
                            <div class="cart-item">
                                ${item.product.image_url ? `
                                    <img src="${item.product.image_url}" alt="${item.product.name}" class="cart-item-image">
                                ` : ''}
                                <div class="cart-item-details">
                                    <div class="cart-item-name">${item.product.name}</div>
                                    <div class="cart-item-meta">
                                        <span>Quantity: ${item.quantity}</span>
                                        ${item.isRental ? '<span class="badge badge-info">Rental</span>' : ''}
                                    </div>
                                </div>
                                <div class="cart-item-price">
                                    ${item.isRental ? 
                                        `${formatCurrency(item.product.rental_price || 0)}/mo` : 
                                        formatCurrency(item.product.price || 0)
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="cart-summary">
                        <div class="cart-summary-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(cartData.subtotal || 0)}</span>
                        </div>
                        ${cartData.tax ? `
                            <div class="cart-summary-row">
                                <span>Tax:</span>
                                <span>${formatCurrency(cartData.tax)}</span>
                            </div>
                        ` : ''}
                        ${cartData.shipping ? `
                            <div class="cart-summary-row">
                                <span>Shipping:</span>
                                <span>${formatCurrency(cartData.shipping)}</span>
                            </div>
                        ` : ''}
                        <div class="cart-summary-row total">
                            <span>Total:</span>
                            <span>${formatCurrency(cartData.total || 0)}</span>
                        </div>
                    </div>
                ` : '<p>No items in cart</p>'}
            </div>
            
            ${!cart.recovered && cart.email ? `
                <div class="form-actions">
                    <button class="btn btn-primary send-email-btn" data-id="${cart.id}" data-email="${cart.email}">
                        Send Recovery Email
                    </button>
                </div>
            ` : ''}
        `;
        
        // Add event listeners to buttons
        const sendEmailBtn = cartDetailsContent.querySelector('.send-email-btn');
        if (sendEmailBtn) {
            sendEmailBtn.addEventListener('click', () => {
                const cartId = sendEmailBtn.getAttribute('data-id');
                const email = sendEmailBtn.getAttribute('data-email');
                sendSingleNotification(cartId, email);
            });
        }
    }
    
    /**
     * Send a single notification
     * 
     * @param {string} cartId - Cart ID
     * @param {string} email - Email address
     */
    function sendSingleNotification(cartId, email) {
        // Show loading state
        const btn = document.querySelector(`.send-email-btn[data-id="${cartId}"]`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Sending...';
        }
        
        // Send notification
        fetch('/api/abandoned-carts/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                cart_id: cartId,
                email: email,
                include_discount: true
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send notification');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Recovery email sent successfully!');
                
                // Reload carts to update notification count
                loadCarts();
                
                // Close modal
                closeAllModals();
            }
        })
        .catch(error => {
            console.error('Error sending notification:', error);
            alert('Failed to send recovery email. Please try again.');
        })
        .finally(() => {
            // Reset button state
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Send Recovery Email';
            }
        });
    }
    
    /**
     * Send batch notifications
     */
    function sendNotifications() {
        // Get form values
        const hoursThreshold = document.getElementById('hours-threshold').value;
        const includeDiscount = document.getElementById('include-discount').checked;
        
        // Show loading state
        const submitBtn = sendNotificationsForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        // Send notifications
        fetch('/api/abandoned-carts/admin/send-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                hours_threshold: parseInt(hoursThreshold),
                include_discount: includeDiscount
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send notifications');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert(`Recovery emails sent: ${data.details.success_count} successful, ${data.details.failed_count} failed`);
                
                // Reload carts to update notification count
                loadCarts();
                
                // Close modal
                closeAllModals();
            }
        })
        .catch(error => {
            console.error('Error sending notifications:', error);
            alert('Failed to send recovery emails. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Emails';
        });
    }
    
    /**
     * Open modal
     * 
     * @param {HTMLElement} modal - Modal element
     */
    function openModal(modal) {
        closeAllModals();
        modal.style.display = 'block';
    }
    
    /**
     * Close all modals
     */
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    /**
     * Format currency
     * 
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    /**
     * Format date
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    /**
     * Get auth token
     * 
     * @returns {string} Auth token
     */
    function getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }
});
