<?php
/**
 * GigGatek Dashboard Payment Methods Component
 * Contains the payment methods tab content
 */
?>
<!-- Payment Methods Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'payment-methods' ? 'active' : ''; ?>" id="payment-methods-tab">
    <div class="dashboard-header">
        <h2>Payment Methods</h2>
        <button class="btn btn-primary btn-sm" id="add-payment-btn">Add Payment Method</button>
    </div>
    
    <div class="payment-methods-list">
        <div class="payment-card">
            <div class="payment-badge default">Default</div>
            <div class="payment-info">
                <div class="payment-icon visa"></div>
                <div class="payment-details">
                    <h4>Visa ending in 1234</h4>
                    <p>Expires: 05/2027</p>
                </div>
            </div>
            <div class="payment-actions">
                <a href="#" class="btn btn-sm btn-outline-primary">Edit</a>
                <a href="#" class="btn btn-sm btn-outline-danger">Delete</a>
            </div>
        </div>
        
        <div class="payment-card">
            <div class="payment-info">
                <div class="payment-icon mastercard"></div>
                <div class="payment-details">
                    <h4>Mastercard ending in 5678</h4>
                    <p>Expires: 09/2026</p>
                </div>
            </div>
            <div class="payment-actions">
                <a href="#" class="btn btn-sm btn-outline-secondary">Set as Default</a>
                <a href="#" class="btn btn-sm btn-outline-primary">Edit</a>
                <a href="#" class="btn btn-sm btn-outline-danger">Delete</a>
            </div>
        </div>
    </div>
</div>
