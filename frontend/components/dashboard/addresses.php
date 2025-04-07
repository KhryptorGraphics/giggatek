<?php
/**
 * GigGatek Dashboard Addresses Component
 * Contains the addresses tab content
 */
?>
<!-- Addresses Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'addresses' ? 'active' : ''; ?>" id="addresses-tab">
    <div class="dashboard-header">
        <h2>My Addresses</h2>
        <button class="btn btn-primary btn-sm" id="add-address-btn">Add New Address</button>
    </div>
    
    <div class="addresses-list">
        <div class="address-card">
            <div class="address-badge default">Default</div>
            <div class="address-content">
                <h4>Home</h4>
                <p>John Smith<br>
                123 Main Street<br>
                Apt 4B<br>
                San Francisco, CA 94103<br>
                United States</p>
                <p>Phone: (555) 123-4567</p>
            </div>
            <div class="address-actions">
                <a href="#" class="btn btn-sm btn-outline-primary">Edit</a>
                <a href="#" class="btn btn-sm btn-outline-danger">Delete</a>
            </div>
        </div>
        
        <div class="address-card">
            <div class="address-content">
                <h4>Work</h4>
                <p>John Smith<br>
                456 Market Street<br>
                San Francisco, CA 94105<br>
                United States</p>
                <p>Phone: (555) 987-6543</p>
            </div>
            <div class="address-actions">
                <a href="#" class="btn btn-sm btn-outline-secondary">Set as Default</a>
                <a href="#" class="btn btn-sm btn-outline-primary">Edit</a>
                <a href="#" class="btn btn-sm btn-outline-danger">Delete</a>
            </div>
        </div>
    </div>
</div>
