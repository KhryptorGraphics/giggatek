<?php
/**
 * GigGatek Dashboard Overview Component
 * Contains the dashboard overview tab content
 */
?>
<!-- Dashboard Overview Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'dashboard' ? 'active' : ''; ?>" id="dashboard-tab">
    <div class="dashboard-header">
        <h2>Dashboard</h2>
        <span class="welcome-message">Welcome, John!</span>
    </div>
    
    <div class="dashboard-summary">
        <div class="summary-box">
            <div class="summary-icon">📦</div>
            <div class="summary-count">2</div>
            <div class="summary-label">Active Orders</div>
        </div>
        
        <div class="summary-box">
            <div class="summary-icon">🔄</div>
            <div class="summary-count">1</div>
            <div class="summary-label">Active Rentals</div>
        </div>
        
        <div class="summary-box">
            <div class="summary-icon">❤️</div>
            <div class="summary-count">4</div>
            <div class="summary-label">Wishlist Items</div>
        </div>
        
        <div class="summary-box">
            <div class="summary-icon">💰</div>
            <div class="summary-count">$0</div>
            <div class="summary-label">Store Credit</div>
        </div>
    </div>
    
    <h3>Recent Activity</h3>
    
    <!-- Recent Orders -->
    <div class="recent-orders">
        <h4>Recent Orders</h4>
        
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Order #GG-29384</div>
                <div class="order-date">April 2, 2025</div>
            </div>
            <div class="order-details">
                <div class="order-row">
                    <span>Items:</span>
                    <span>2</span>
                </div>
                <div class="order-row">
                    <span>Total:</span>
                    <span>$729.98</span>
                </div>
                <div class="order-row">
                    <span>Status:</span>
                    <span class="order-status status-shipped">Shipped</span>
                </div>
            </div>
            <div class="order-actions">
                <a href="#" class="btn btn-sm btn-outline-primary">View Details</a>
                <a href="#" class="btn btn-sm btn-outline-secondary">Track Package</a>
            </div>
        </div>
        
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Order #GG-29252</div>
                <div class="order-date">March 25, 2025</div>
            </div>
            <div class="order-details">
                <div class="order-row">
                    <span>Items:</span>
                    <span>1</span>
                </div>
                <div class="order-row">
                    <span>Total:</span>
                    <span>$349.99</span>
                </div>
                <div class="order-row">
                    <span>Status:</span>
                    <span class="order-status status-delivered">Delivered</span>
                </div>
            </div>
            <div class="order-actions">
                <a href="#" class="btn btn-sm btn-outline-primary">View Details</a>
                <a href="#" class="btn btn-sm btn-outline-secondary">Write Review</a>
            </div>
        </div>
        
        <a href="#" class="view-all-link" data-tab="orders">View All Orders</a>
    </div>
    
    <!-- Rental Progress -->
    <div class="rental-section">
        <h4>Active Rentals</h4>
        
        <div class="rental-card">
            <div class="rental-header">
                <div class="rental-title">Gaming PC - RTX 3070, i7-12700K, 16GB RAM, 1TB SSD</div>
                <div class="rental-badge">12-Month Plan</div>
            </div>
            
            <div class="payment-progress">
                <div class="progress-header">
                    <span>Payment Progress</span>
                    <span>5 of 12 Payments</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: 41.6%;"></div>
                </div>
                <div class="progress-details">
                    <div class="progress-detail">
                        <div class="progress-label">Monthly Payment</div>
                        <div class="progress-value">$134.99</div>
                    </div>
                    <div class="progress-detail">
                        <div class="progress-label">Next Payment</div>
                        <div class="progress-value">May 1, 2025</div>
                    </div>
                    <div class="progress-detail">
                        <div class="progress-label">Remaining</div>
                        <div class="progress-value">$944.93</div>
                    </div>
                </div>
            </div>
            
            <div class="rental-actions">
                <a href="#" class="btn btn-sm btn-outline-primary">View Details</a>
                <a href="#" class="btn btn-sm btn-outline-secondary">Pay Early</a>
                <a href="#" class="btn btn-sm btn-outline-info">Upgrade Hardware</a>
            </div>
        </div>
        
        <a href="#" class="view-all-link" data-tab="rentals">View All Rentals</a>
    </div>
</div>
