<?php
/**
 * GigGatek Dashboard Navigation Component
 * Contains the sidebar navigation for the dashboard
 */
?>
<div class="dashboard-container">
    <!-- Dashboard Navigation -->
    <aside class="dashboard-nav">
        <h3>My Account</h3>
        
        <ul>
            <li><a href="#" class="<?php echo $active_tab === 'dashboard' ? 'active' : ''; ?>" data-tab="dashboard">Dashboard</a></li>
            <li><a href="#" class="<?php echo $active_tab === 'orders' ? 'active' : ''; ?>" data-tab="orders">Orders</a></li>
            <li><a href="#" class="<?php echo $active_tab === 'rentals' ? 'active' : ''; ?>" data-tab="rentals">Rentals</a></li>
            <li><a href="#" class="<?php echo $active_tab === 'profile' ? 'active' : ''; ?>" data-tab="profile">Profile</a></li>
            <li><a href="#" class="<?php echo $active_tab === 'addresses' ? 'active' : ''; ?>" data-tab="addresses">Addresses</a></li>
            <li><a href="#" class="<?php echo $active_tab === 'payment-methods' ? 'active' : ''; ?>" data-tab="payment-methods">Payment Methods</a></li>
            <li><a href="#" class="<?php echo $active_tab === 'wishlist' ? 'active' : ''; ?>" data-tab="wishlist">Wishlist</a></li>
            <li><a href="#" id="sign-out-link">Sign Out</a></li>
        </ul>
    </aside>
    
    <!-- Dashboard Content -->
    <div class="dashboard-content">
