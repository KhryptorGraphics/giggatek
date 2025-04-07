<?php
/**
 * GigGatek Dashboard Orders Component
 * Contains the orders tab content
 */
?>
<!-- Orders Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'orders' ? 'active' : ''; ?>" id="orders-tab">
    <div class="dashboard-header">
        <h2>My Orders</h2>
    </div>
    
    <div class="order-list">
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
        
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Order #GG-28976</div>
                <div class="order-date">February 18, 2025</div>
            </div>
            <div class="order-details">
                <div class="order-row">
                    <span>Items:</span>
                    <span>3</span>
                </div>
                <div class="order-row">
                    <span>Total:</span>
                    <span>$449.97</span>
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
    </div>
</div>
