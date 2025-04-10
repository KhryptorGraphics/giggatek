/**
 * GigGatek User Dashboard Module
 * Manages the user dashboard interface, tab switching, and component coordination
 */

class Dashboard {
    constructor() {
        this.activeTab = null;
        
        // Initialize module when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the dashboard
     */
    init() {
        // Check if user is authenticated
        if (window.auth && !window.auth.isAuthenticated()) {
            window.location.href = '/login.php?redirect=dashboard.php';
            return;
        }
        
        // Setup tab navigation
        this.setupTabs();
        
        // Load user information
        this.loadUserInfo();
        
        // Initialize dashboard notifications
        this.setupNotifications();
        
        // Setup dashboard summary
        this.setupDashboardSummary();
    }
    
    /**
     * Setup tab navigation
     */
    setupTabs() {
        const tabLinks = document.querySelectorAll('.dashboard-nav a');
        const contentTabs = document.querySelectorAll('.dashboard-tab');
        
        // Use URL hash for active tab if present
        const hash = window.location.hash.substring(1);
        const defaultTab = hash || 'overview';
        
        // Set active tab on load
        this.activateTab(defaultTab);
        
        // Add event listeners to tabs
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('href').substring(1);
                this.activateTab(tabId);
                
                // Update URL hash
                history.pushState(null, null, `#${tabId}`);
            });
        });
        
        // Handle history navigation (back/forward buttons)
        window.addEventListener('popstate', () => {
            const newHash = window.location.hash.substring(1) || 'overview';
            this.activateTab(newHash);
        });
    }
    
    /**
     * Activate a specific tab
     * @param {string} tabId - The ID of the tab to activate
     */
    activateTab(tabId) {
        const tabLinks = document.querySelectorAll('.dashboard-nav a');
        const contentTabs = document.querySelectorAll('.dashboard-tab');
        
        // Deactivate all tabs
        tabLinks.forEach(link => link.classList.remove('active'));
        contentTabs.forEach(tab => tab.classList.remove('active'));
        
        // Activate selected tab
        const selectedLink = document.querySelector(`.dashboard-nav a[href="#${tabId}"]`);
        const selectedTab = document.getElementById(`${tabId}-tab`);
        
        if (selectedLink && selectedTab) {
            selectedLink.classList.add('active');
            selectedTab.classList.add('active');
            this.activeTab = tabId;
            
            // Trigger custom event for tab activation
            const event = new CustomEvent('dashboard:tabChanged', { 
                detail: { tab: tabId }
            });
            document.dispatchEvent(event);
        }
    }
    
    /**
     * Load user information
     */
    loadUserInfo() {
        if (!window.auth) return;
        
        const userInfo = window.auth.getUserInfo();
        if (!userInfo) return;
        
        // Update user name in dashboard header
        const userNameElement = document.querySelector('.dashboard-header .user-name');
        if (userNameElement && userInfo.firstName) {
            userNameElement.textContent = `${userInfo.firstName} ${userInfo.lastName || ''}`;
        }
        
        // Update user profile info
        const profileNameElement = document.querySelector('.user-profile-info .profile-name');
        if (profileNameElement) {
            profileNameElement.textContent = `${userInfo.firstName} ${userInfo.lastName || ''}`;
        }
        
        const profileEmailElement = document.querySelector('.user-profile-info .profile-email');
        if (profileEmailElement && userInfo.email) {
            profileEmailElement.textContent = userInfo.email;
        }
        
        // Update avatar if present
        if (userInfo.avatarUrl) {
            const avatarImages = document.querySelectorAll('.user-avatar img');
            avatarImages.forEach(img => {
                img.src = userInfo.avatarUrl;
                img.alt = `${userInfo.firstName}'s avatar`;
            });
        }
    }
    
    /**
     * Setup notifications
     */
    setupNotifications() {
        // Check for notifications
        this.loadNotifications();
        
        // Setup notification toggle
        const notificationToggle = document.querySelector('.notification-toggle');
        const notificationPanel = document.querySelector('.notification-panel');
        
        if (notificationToggle && notificationPanel) {
            notificationToggle.addEventListener('click', (e) => {
                e.preventDefault();
                notificationPanel.classList.toggle('active');
                
                // Mark notifications as read when opened
                if (notificationPanel.classList.contains('active')) {
                    this.markNotificationsAsRead();
                }
            });
            
            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationToggle.contains(e.target) && 
                    !notificationPanel.contains(e.target) &&
                    notificationPanel.classList.contains('active')) {
                    notificationPanel.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * Load user notifications
     */
    async loadNotifications() {
        try {
            const response = await fetch('/api/user/notifications', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load notifications');
            }
            
            const data = await response.json();
            
            if (data.success && data.notifications) {
                this.renderNotifications(data.notifications);
                this.updateNotificationBadge(data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    /**
     * Render notifications in the notification panel
     * @param {Array} notifications - Array of notification objects
     */
    renderNotifications(notifications) {
        const notificationList = document.querySelector('.notification-list');
        if (!notificationList) return;
        
        // Clear existing notifications
        notificationList.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No new notifications</div>';
            return;
        }
        
        // Add notifications
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            notificationItem.dataset.notificationId = notification.id;
            
            // Format timestamp
            const timestamp = new Date(notification.timestamp);
            const timeAgo = this.formatTimeAgo(timestamp);
            
            // Notification icon based on type
            let iconClass = 'notification-info';
            if (notification.type === 'order') iconClass = 'notification-order';
            if (notification.type === 'payment') iconClass = 'notification-payment';
            if (notification.type === 'alert') iconClass = 'notification-alert';
            
            notificationItem.innerHTML = `
                <div class="notification-icon ${iconClass}"></div>
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            `;
            
            // Add click handler
            notificationItem.addEventListener('click', () => {
                // Mark as read
                this.markNotificationAsRead(notification.id);
                
                // Handle notification click (e.g., navigate to relevant page)
                if (notification.link) {
                    window.location.href = notification.link;
                }
            });
            
            notificationList.appendChild(notificationItem);
        });
        
        // Add "View All" link
        const viewAllLink = document.createElement('a');
        viewAllLink.href = '/notifications.php';
        viewAllLink.className = 'view-all-notifications';
        viewAllLink.textContent = 'View All Notifications';
        notificationList.appendChild(viewAllLink);
    }
    
    /**
     * Update notification badge count
     * @param {Array} notifications - Array of notification objects
     */
    updateNotificationBadge(notifications) {
        const badge = document.querySelector('.notification-badge');
        if (!badge) return;
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    /**
     * Mark a specific notification as read
     * @param {string} notificationId - ID of the notification to mark as read
     */
    async markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`/api/user/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }
            
            // Update UI
            const notificationItem = document.querySelector(`.notification-item[data-notification-id="${notificationId}"]`);
            if (notificationItem) {
                notificationItem.classList.remove('unread');
                notificationItem.classList.add('read');
                
                const unreadIndicator = notificationItem.querySelector('.unread-indicator');
                if (unreadIndicator) {
                    unreadIndicator.remove();
                }
            }
            
            // Reload all notifications to update badge
            this.loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    /**
     * Mark all notifications as read
     */
    async markNotificationsAsRead() {
        try {
            const response = await fetch('/api/user/notifications/read-all', {
                method: 'PUT',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }
            
            // Update UI
            const unreadNotifications = document.querySelectorAll('.notification-item.unread');
            unreadNotifications.forEach(item => {
                item.classList.remove('unread');
                item.classList.add('read');
                
                const unreadIndicator = item.querySelector('.unread-indicator');
                if (unreadIndicator) {
                    unreadIndicator.remove();
                }
            });
            
            // Update badge
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    
    /**
     * Format time ago string
     * @param {Date} timestamp - Timestamp to format
     * @returns {string} Formatted time ago string
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const diffMs = now - timestamp;
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        
        if (diffSec < 60) {
            return 'just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else {
            return timestamp.toLocaleDateString();
        }
    }
    
    /**
     * Setup dashboard summary
     */
    async setupDashboardSummary() {
        // Only setup summary on overview tab
        const overviewTab = document.getElementById('overview-tab');
        if (!overviewTab) return;
        
        try {
            // Load recent orders
            this.loadRecentOrders();
            
            // Load upcoming payments for rentals
            this.loadUpcomingPayments();
            
            // Load account summary
            this.loadAccountSummary();
        } catch (error) {
            console.error('Error setting up dashboard summary:', error);
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-danger';
            errorMsg.textContent = 'Failed to load dashboard summary. Please try again later.';
            
            overviewTab.insertAdjacentElement('afterbegin', errorMsg);
        }
    }
    
    /**
     * Load recent orders for dashboard summary
     */
    async loadRecentOrders() {
        const recentOrdersContainer = document.querySelector('.recent-orders-list');
        if (!recentOrdersContainer) return;
        
        try {
            const response = await fetch('/api/user/orders?limit=5', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load recent orders');
            }
            
            const data = await response.json();
            
            if (data.success && data.orders) {
                if (data.orders.length === 0) {
                    recentOrdersContainer.innerHTML = `
                        <div class="no-data">
                            <p>You don't have any orders yet.</p>
                            <a href="/products.php" class="btn btn-primary">Browse Products</a>
                        </div>
                    `;
                    return;
                }
                
                // Clear container
                recentOrdersContainer.innerHTML = '';
                
                // Add orders
                data.orders.forEach(order => {
                    const orderDate = new Date(order.order_date);
                    const formattedDate = orderDate.toLocaleDateString();
                    
                    const statusClass = this.getOrderStatusClass(order.status);
                    
                    const orderItem = document.createElement('div');
                    orderItem.className = 'order-summary-item';
                    orderItem.innerHTML = `
                        <div class="order-summary-header">
                            <div class="order-number">Order #${order.order_number}</div>
                            <div class="order-date">${formattedDate}</div>
                            <div class="order-status ${statusClass}">${order.status}</div>
                        </div>
                        <div class="order-summary-details">
                            <div class="order-item-count">${order.item_count} item${order.item_count !== 1 ? 's' : ''}</div>
                            <div class="order-total">Total: $${parseFloat(order.total).toFixed(2)}</div>
                        </div>
                        <div class="order-summary-actions">
                            <a href="/dashboard.php#orders" class="view-order" data-order-id="${order.id}">View Details</a>
                        </div>
                    `;
                    
                    recentOrdersContainer.appendChild(orderItem);
                });
                
                // Add view all link
                const viewAllLink = document.createElement('a');
                viewAllLink.href = '/dashboard.php#orders';
                viewAllLink.className = 'view-all-link';
                viewAllLink.textContent = 'View All Orders';
                recentOrdersContainer.appendChild(viewAllLink);
            }
        } catch (error) {
            console.error('Error loading recent orders:', error);
            recentOrdersContainer.innerHTML = `
                <div class="error">
                    <p>Error loading orders. Please try again later.</p>
                </div>
            `;
        }
    }
    
    /**
     * Load upcoming rental payments for dashboard summary
     */
    async loadUpcomingPayments() {
        const upcomingPaymentsContainer = document.querySelector('.upcoming-payments-list');
        if (!upcomingPaymentsContainer) return;
        
        try {
            const response = await fetch('/api/user/rentals', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load rentals');
            }
            
            const data = await response.json();
            
            if (data.success && data.rentals) {
                // Filter for active rentals with upcoming payments
                const upcomingPayments = data.rentals
                    .filter(rental => rental.status === 'active' && rental.next_payment_date)
                    .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date))
                    .slice(0, 3); // Show max 3 upcoming payments
                
                if (upcomingPayments.length === 0) {
                    upcomingPaymentsContainer.innerHTML = `
                        <div class="no-data">
                            <p>You don't have any upcoming payments.</p>
                        </div>
                    `;
                    return;
                }
                
                // Clear container
                upcomingPaymentsContainer.innerHTML = '';
                
                // Add payments
                upcomingPayments.forEach(rental => {
                    const paymentDate = new Date(rental.next_payment_date);
                    const formattedDate = paymentDate.toLocaleDateString();
                    
                    const daysUntilPayment = Math.ceil((paymentDate - new Date()) / (1000 * 60 * 60 * 24));
                    let urgencyClass = '';
                    
                    if (daysUntilPayment <= 3) {
                        urgencyClass = 'payment-urgent';
                    } else if (daysUntilPayment <= 7) {
                        urgencyClass = 'payment-soon';
                    }
                    
                    const paymentItem = document.createElement('div');
                    paymentItem.className = `payment-summary-item ${urgencyClass}`;
                    paymentItem.innerHTML = `
                        <div class="payment-product-info">
                            <img src="${rental.product.image_url}" alt="${rental.product.name}">
                            <div>
                                <h4>${rental.product.name}</h4>
                                <p>Rental #${rental.rental_number}</p>
                            </div>
                        </div>
                        <div class="payment-details">
                            <div class="payment-amount">$${parseFloat(rental.monthly_payment).toFixed(2)}</div>
                            <div class="payment-date">Due: ${formattedDate}</div>
                            <div class="payment-countdown">${daysUntilPayment} day${daysUntilPayment !== 1 ? 's' : ''} left</div>
                        </div>
                        <div class="payment-actions">
                            <a href="/dashboard.php#rentals" class="make-payment" data-rental-id="${rental.id}">Make Payment</a>
                        </div>
                    `;
                    
                    upcomingPaymentsContainer.appendChild(paymentItem);
                });
                
                // Add view all link
                const viewAllLink = document.createElement('a');
                viewAllLink.href = '/dashboard.php#rentals';
                viewAllLink.className = 'view-all-link';
                viewAllLink.textContent = 'View All Rentals';
                upcomingPaymentsContainer.appendChild(viewAllLink);
            }
        } catch (error) {
            console.error('Error loading upcoming payments:', error);
            upcomingPaymentsContainer.innerHTML = `
                <div class="error">
                    <p>Error loading upcoming payments. Please try again later.</p>
                </div>
            `;
        }
    }
    
    /**
     * Load account summary for dashboard
     */
    async loadAccountSummary() {
        const accountSummaryContainer = document.querySelector('.account-summary');
        if (!accountSummaryContainer) return;
        
        try {
            const response = await fetch('/api/user/account-summary', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load account summary');
            }
            
            const data = await response.json();
            
            if (data.success && data.summary) {
                const summary = data.summary;
                
                // Update account stats
                const totalOrdersElement = accountSummaryContainer.querySelector('.total-orders .stat-value');
                if (totalOrdersElement) {
                    totalOrdersElement.textContent = summary.totalOrders || 0;
                }
                
                const activeRentalsElement = accountSummaryContainer.querySelector('.active-rentals .stat-value');
                if (activeRentalsElement) {
                    activeRentalsElement.textContent = summary.activeRentals || 0;
                }
                
                const addressesElement = accountSummaryContainer.querySelector('.saved-addresses .stat-value');
                if (addressesElement) {
                    addressesElement.textContent = summary.savedAddresses || 0;
                }
                
                const paymentMethodsElement = accountSummaryContainer.querySelector('.payment-methods .stat-value');
                if (paymentMethodsElement) {
                    paymentMethodsElement.textContent = summary.paymentMethods || 0;
                }
            }
        } catch (error) {
            console.error('Error loading account summary:', error);
            
            // Show error message
            accountSummaryContainer.innerHTML = `
                <div class="error">
                    <p>Error loading account summary. Please try again later.</p>
                </div>
            `;
        }
    }
    
    /**
     * Get CSS class for order status
     * @param {string} status - Order status
     * @returns {string} CSS class for the status
     */
    getOrderStatusClass(status) {
        if (!status) return '';
        
        switch (status.toLowerCase()) {
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            case 'returned': return 'status-returned';
            case 'pending': return 'status-pending';
            default: return '';
        }
    }
}

// Initialize the Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
