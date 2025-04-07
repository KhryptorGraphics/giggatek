<?php
/**
 * GigGatek Dashboard Rentals Component
 * Contains the rentals tab content
 */
?>
<!-- Rentals Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'rentals' ? 'active' : ''; ?>" id="rentals-tab">
    <div class="dashboard-header">
        <h2>My Rentals</h2>
    </div>
    
    <div class="rental-section">
        <h3>Active Rentals</h3>
        
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
        
        <h3 class="mt-4">Completed Rentals</h3>
        
        <div class="rental-card">
            <div class="rental-header">
                <div class="rental-title">NVIDIA GeForce RTX 3080 10GB GDDR6X</div>
                <div class="rental-badge completed">6-Month Plan (Paid Off)</div>
            </div>
            
            <div class="rental-details">
                <div class="rental-row">
                    <span>Start Date:</span>
                    <span>September 1, 2024</span>
                </div>
                <div class="rental-row">
                    <span>End Date:</span>
                    <span>February 28, 2025</span>
                </div>
                <div class="rental-row">
                    <span>Monthly Payment:</span>
                    <span>$119.99</span>
                </div>
                <div class="rental-row">
                    <span>Total Paid:</span>
                    <span>$719.94</span>
                </div>
                <div class="rental-row">
                    <span>Status:</span>
                    <span class="rental-status completed">Owned</span>
                </div>
            </div>
            
            <div class="rental-actions">
                <a href="#" class="btn btn-sm btn-outline-primary">View Details</a>
                <a href="#" class="btn btn-sm btn-outline-secondary">Write Review</a>
            </div>
        </div>
    </div>
</div>
