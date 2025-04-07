/**
 * GigGatek Dashboard JavaScript
 * Handles dashboard tab navigation and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the welcome message with the user's name
    if (window.auth && window.auth.user) {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${window.auth.user.first_name}!`;
        }
        
        // Update form fields with user data
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            document.getElementById('first-name').value = window.auth.user.first_name || '';
            document.getElementById('last-name').value = window.auth.user.last_name || '';
            document.getElementById('email').value = window.auth.user.email || '';
            if (document.getElementById('phone')) {
                document.getElementById('phone').value = window.auth.user.phone || '';
            }
        }
    }
    
    // Add sign-out functionality
    const signOutLink = document.getElementById('sign-out-link');
    if (signOutLink) {
        signOutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.auth) {
                window.auth.logout();
            } else {
                window.location.href = 'login.php';
            }
        });
    }
    
    // Load user orders from API
    async function loadUserOrders() {
        if (!window.orders) return;
        
        try {
            // Show loading state
            const ordersList = document.querySelector('.order-list');
            const recentOrders = document.querySelector('.recent-orders');
            
            if (ordersList) {
                ordersList.innerHTML = '<div class="loading">Loading orders...</div>';
            }
            
            if (recentOrders) {
                const recentOrdersContent = recentOrders.querySelector('h4').nextElementSibling;
                if (recentOrdersContent) {
                    recentOrdersContent.innerHTML = '<div class="loading">Loading recent orders...</div>';
                }
            }
            
            // Fetch orders from API
            const result = await window.orders.getUserOrders();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load orders');
            }
            
            // Clear loading indicators
            if (ordersList) {
                ordersList.innerHTML = '';
            }
            
            if (recentOrders) {
                const recentOrdersContent = recentOrders.querySelector('h4').nextElementSibling;
                if (recentOrdersContent) {
                    recentOrdersContent.innerHTML = '';
                }
            }
            
            // Display orders
            if (result.orders && result.orders.length > 0) {
                // Sort orders by date (newest first)
                const sortedOrders = result.orders.sort((a, b) => {
                    return new Date(b.order_date) - new Date(a.order_date);
                });
                
                // Update order counts in dashboard
                const orderCountElement = document.querySelector('.summary-box:first-child .summary-count');
                if (orderCountElement) {
                    const activeOrders = sortedOrders.filter(o => 
                        ['pending', 'processing', 'shipped'].includes(o.status)
                    ).length;
                    orderCountElement.textContent = activeOrders;
                }
                
                // Populate orders list
                sortedOrders.forEach(order => {
                    const orderHtml = createOrderCard(order);
                    
                    if (ordersList) {
                        ordersList.innerHTML += orderHtml;
                    }
                });
                
                // Populate recent orders (max 2)
                const recentOrdersContent = recentOrders ? recentOrders.querySelector('h4').nextElementSibling : null;
                if (recentOrdersContent && sortedOrders.length > 0) {
                    const recentOrdersHtml = sortedOrders.slice(0, 2).map(order => 
                        createOrderCard(order)
                    ).join('');
                    
                    recentOrdersContent.innerHTML = recentOrdersHtml;
                    
                    // Add "View All" link
                    if (recentOrders && !recentOrders.querySelector('.view-all-link')) {
                        const viewAllLink = document.createElement('a');
                        viewAllLink.href = '#';
                        viewAllLink.className = 'view-all-link';
                        viewAllLink.dataset.tab = 'orders';
                        viewAllLink.textContent = 'View All Orders';
                        
                        recentOrders.appendChild(viewAllLink);
                        
                        // Add event listener to the new "View All" link
                        viewAllLink.addEventListener('click', function(e) {
                            e.preventDefault();
                            
                            // Remove active class from all links and tabs
                            navLinks.forEach(l => l.classList.remove('active'));
                            tabContents.forEach(t => t.classList.remove('active'));
                            
                            // Add active class to the corresponding nav link
                            const tabId = this.dataset.tab;
                            const navLink = document.querySelector(`.dashboard-nav a[data-tab="${tabId}"]`);
                            navLink.classList.add('active');
                            
                            // Show the corresponding tab
                            document.getElementById(tabId + '-tab').classList.add('active');
                            
                            // Update URL parameter
                            updateUrlParam('tab', tabId);
                        });
                    }
                } else if (recentOrdersContent) {
                    recentOrdersContent.innerHTML = '<p>No recent orders found.</p>';
                }
                
                // Add event listeners to order action buttons
                document.querySelectorAll('.order-actions a').forEach(link => {
                    // Order details button
                    if (link.classList.contains('btn-outline-primary')) {
                        link.addEventListener('click', async function(e) {
                            e.preventDefault();
                            const orderId = this.dataset.orderId;
                            if (orderId) {
                                // Load and display order details
                                await showOrderDetails(orderId);
                            }
                        });
                    }
                });
            } else {
                // No orders found
                if (ordersList) {
                    ordersList.innerHTML = '<div class="no-data">No orders found.</div>';
                }
                
                const recentOrdersContent = recentOrders ? recentOrders.querySelector('h4').nextElementSibling : null;
                if (recentOrdersContent) {
                    recentOrdersContent.innerHTML = '<div class="no-data">No orders found.</div>';
                }
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            
            const ordersList = document.querySelector('.order-list');
            if (ordersList) {
                ordersList.innerHTML = `<div class="error">Error loading orders: ${error.message}</div>`;
            }
            
            const recentOrders = document.querySelector('.recent-orders');
            const recentOrdersContent = recentOrders ? recentOrders.querySelector('h4').nextElementSibling : null;
            if (recentOrdersContent) {
                recentOrdersContent.innerHTML = `<div class="error">Error loading orders: ${error.message}</div>`;
            }
        }
    }
    
    /**
     * Create HTML for an order card
     * @param {Object} order - Order data
     * @returns {string} HTML string for order card
     */
    function createOrderCard(order) {
        const orderId = order.order_id;
        const orderDate = window.orders.formatDate(order.order_date);
        const totalAmount = window.orders.formatCurrency(order.total_amount);
        const itemCount = order.item_count || 0;
        const statusBadge = window.orders.getStatusBadgeHtml(order.status);
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Order #GG-${orderId}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
                <div class="order-details">
                    <div class="order-row">
                        <span>Items:</span>
                        <span>${itemCount}</span>
                    </div>
                    <div class="order-row">
                        <span>Total:</span>
                        <span>${totalAmount}</span>
                    </div>
                    <div class="order-row">
                        <span>Status:</span>
                        <span class="order-status">${statusBadge}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <a href="#" class="btn btn-sm btn-outline-primary" data-order-id="${orderId}">View Details</a>
                    ${order.status === 'shipped' ? 
                        `<a href="#" class="btn btn-sm btn-outline-secondary">Track Package</a>` : 
                        order.status === 'delivered' ? 
                            `<a href="#" class="btn btn-sm btn-outline-secondary">Write Review</a>` : ''
                    }
                </div>
            </div>
        `;
    }
    
    /**
     * Show order details in a modal
     * @param {number} orderId - Order ID to show details for
     */
    async function showOrderDetails(orderId) {
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
                        <div class="modal-body">
                            <div class="loading">Loading order details...</div>
                        </div>
                    </div>
                `;
                document.body.appendChild(orderModal);
                
                // Close button functionality
                orderModal.querySelector('.close').addEventListener('click', function() {
                    orderModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', function(event) {
                    if (event.target === orderModal) {
                        orderModal.style.display = 'none';
                    }
                });
            }
            
            // Show modal with loading indicator
            orderModal.style.display = 'block';
            orderModal.querySelector('.modal-body').innerHTML = '<div class="loading">Loading order details...</div>';
            
            // Fetch order details
            const result = await window.orders.getOrderDetails(orderId);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load order details');
            }
            
            const order = result.order;
            const items = result.items;
            const statusHistory = result.status_history;
            
            // Format and display order details
            const formattedOrderDate = window.orders.formatDate(order.order_date);
            const formattedTotalAmount = window.orders.formatCurrency(order.total_amount);
            const statusBadge = window.orders.getStatusBadgeHtml(order.status);
            
            // Create items HTML
            let itemsHtml = '';
            if (items && items.length > 0) {
                itemsHtml += '<div class="order-items">';
                itemsHtml += '<h4>Items</h4>';
                itemsHtml += '<table class="items-table">';
                itemsHtml += '<thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>';
                itemsHtml += '<tbody>';
                
                items.forEach(item => {
                    const priceFormatted = window.orders.formatCurrency(item.price_per_unit);
                    const totalFormatted = window.orders.formatCurrency(item.total_price);
                    
                    itemsHtml += `
                        <tr>
                            <td>${item.product_name}</td>
                            <td>${item.quantity}</td>
                            <td>${priceFormatted}</td>
                            <td>${totalFormatted}</td>
                        </tr>
                    `;
                });
                
                itemsHtml += '</tbody></table></div>';
            }
            
            // Create status history HTML
            let historyHtml = '';
            if (statusHistory && statusHistory.length > 0) {
                historyHtml += '<div class="status-history">';
                historyHtml += '<h4>Status History</h4>';
                historyHtml += '<ul class="history-timeline">';
                
                statusHistory.forEach(history => {
                    const historyDate = window.orders.formatDate(history.created_at);
                    const historyTime = new Date(history.created_at).toLocaleTimeString();
                    const statusBadge = window.orders.getStatusBadgeHtml(history.status);
                    
                    historyHtml += `
                        <li>
                            <div class="history-badge">${statusBadge}</div>
                            <div class="history-date">${historyDate} ${historyTime}</div>
                            <div class="history-comment">${history.comment || ''}</div>
                        </li>
                    `;
                });
                
                historyHtml += '</ul></div>';
            }
            
            // Create shipping address HTML
            let shippingAddressHtml = '';
            if (order.shipping_address) {
                try {
                    // Try to parse JSON shipping address
                    const shippingAddress = typeof order.shipping_address === 'string' ? 
                        JSON.parse(order.shipping_address) : order.shipping_address;
                    
                    shippingAddressHtml += '<div class="shipping-address">';
                    shippingAddressHtml += '<h4>Shipping Address</h4>';
                    shippingAddressHtml += '<p>';
                    
                    if (shippingAddress.recipient_name) {
                        shippingAddressHtml += `${shippingAddress.recipient_name}<br>`;
                    }
                    
                    if (shippingAddress.street_address1) {
                        shippingAddressHtml += `${shippingAddress.street_address1}<br>`;
                    }
                    
                    if (shippingAddress.street_address2) {
                        shippingAddressHtml += `${shippingAddress.street_address2}<br>`;
                    }
                    
                    if (shippingAddress.city && shippingAddress.state_province && shippingAddress.postal_code) {
                        shippingAddressHtml += `${shippingAddress.city}, ${shippingAddress.state_province} ${shippingAddress.postal_code}<br>`;
                    }
                    
                    if (shippingAddress.country) {
                        shippingAddressHtml += `${shippingAddress.country}`;
                    }
                    
                    shippingAddressHtml += '</p></div>';
                } catch (e) {
                    // Fallback for non-JSON addresses
                    shippingAddressHtml += '<div class="shipping-address">';
                    shippingAddressHtml += '<h4>Shipping Address</h4>';
                    shippingAddressHtml += `<p>${order.shipping_address}</p>`;
                    shippingAddressHtml += '</div>';
                }
            }
            
            // Update modal content
            orderModal.querySelector('.modal-body').innerHTML = `
                <h3>Order #GG-${order.order_id}</h3>
                <div class="order-details-grid">
                    <div class="order-info">
                        <h4>Order Information</h4>
                        <div class="order-info-row">
                            <span>Order Date:</span>
                            <span>${formattedOrderDate}</span>
                        </div>
                        <div class="order-info-row">
                            <span>Status:</span>
                            <span>${statusBadge}</span>
                        </div>
                        <div class="order-info-row">
                            <span>Total:</span>
                            <span>${formattedTotalAmount}</span>
                        </div>
                        <div class="order-info-row">
                            <span>Shipping Method:</span>
                            <span>${order.shipping_method || 'Standard'}</span>
                        </div>
                        <div class="order-info-row">
                            <span>Payment Method:</span>
                            <span>${order.payment_method}</span>
                        </div>
                    </div>
                    
                    ${shippingAddressHtml}
                </div>
                
                ${itemsHtml}
                
                ${historyHtml}
            `;
        } catch (error) {
            console.error('Error showing order details:', error);
            
            // Show error in modal
            const orderModal = document.getElementById('order-details-modal');
            if (orderModal) {
                orderModal.querySelector('.modal-body').innerHTML = `
                    <div class="error">Error loading order details: ${error.message}</div>
                `;
            }
        }
    }
    
    // Initial order loading
    loadUserOrders();
    
    // Load rental data if rentals module is available
    if (window.rentals) {
        loadUserRentals();
    }
    
    /**
     * Update URL parameter without page reload
     * @param {string} key - Parameter key
     * @param {string} value - Parameter value
     */
    function updateUrlParam(key, value) {
        if (history.pushState) {
            let searchParams = new URLSearchParams(window.location.search);
            searchParams.set(key, value);
            let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
            window.history.pushState({path: newurl}, '', newurl);
        }
    }
    
    // Tab navigation
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    const tabContents = document.querySelectorAll('.dashboard-tab');
    
    navLinks.forEach(link => {
        if (link.id === 'sign-out-link') return; // Skip sign-out link
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and tabs
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show the corresponding tab
            const tabId = this.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');
            
            // Update URL parameter
            updateUrlParam('tab', this.dataset.tab);
        });
    });
    
    // "View All" links
    const viewAllLinks = document.querySelectorAll('.view-all-link');
    
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and tabs
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            // Add active class to the corresponding nav link
            const tabId = this.dataset.tab;
            const navLink = document.querySelector(`.dashboard-nav a[data-tab="${tabId}"]`);
            navLink.classList.add('active');
            
            // Show the corresponding tab
            document.getElementById(tabId + '-tab').classList.add('active');
            
            // Update URL parameter
            updateUrlParam('tab', tabId);
        });
    });
    
    // Remove from wishlist buttons
    const removeWishlistButtons = document.querySelectorAll('.remove-wishlist');
    
    removeWishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the product item and remove it
            const productItem = this.closest('.product-item');
            productItem.style.opacity = '0';
            setTimeout(() => {
                productItem.remove();
            }, 300);
        });
    });
    
    // Form submission handlers
    const profileForm = document.querySelector('.profile-form');
    const passwordForm = document.querySelector('.password-form');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Profile updated successfully!');
        });
    }
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            alert('Password updated successfully!');
            this.reset();
        });
    }
    
    // Load user rentals if available
    async function loadUserRentals() {
        if (!window.rentals) return;
        
        try {
            // Show loading state
            const rentalsSection = document.querySelector('#rentals-tab .rental-section');
            const dashboardRentals = document.querySelector('#dashboard-tab .rental-section');
            
            if (rentalsSection) {
                const activeRentalsSection = rentalsSection.querySelector('h3:first-child').nextElementSibling;
                if (activeRentalsSection) {
                    activeRentalsSection.innerHTML = '<div class="loading-rentals">Loading rentals...</div>';
                }
            }
            
            if (dashboardRentals) {
                const dashboardRentalsContent = dashboardRentals.querySelector('h4').nextElementSibling;
                if (dashboardRentalsContent) {
                    dashboardRentalsContent.innerHTML = '<div class="loading-rentals">Loading rentals...</div>';
                }
            }
            
            // Fetch rentals from API
            const result = await window.rentals.getUserRentals();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load rentals');
            }
            
            // Process rentals data and update UI
            console.log('Rentals loaded successfully:', result.rentals);
            
            // The rental processing code would continue here...
            // (Similar to the orders processing above)
        } catch (error) {
            console.error('Error loading rentals:', error);
        }
    }
});
