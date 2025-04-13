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
            <li><a href="dashboard.php?tab=dashboard" class="<?php echo $active_tab === 'dashboard' ? 'active' : ''; ?>" data-tab="dashboard">Dashboard</a></li>
            <li><a href="dashboard.php?tab=orders" class="<?php echo $active_tab === 'orders' ? 'active' : ''; ?>" data-tab="orders">Orders</a></li>
            <li><a href="dashboard.php?tab=rentals" class="<?php echo $active_tab === 'rentals' ? 'active' : ''; ?>" data-tab="rentals">Rentals</a></li>
            <li><a href="dashboard.php?tab=rental-agreements" class="<?php echo $active_tab === 'rental-agreements' ? 'active' : ''; ?>" data-tab="rental-agreements">Rental Agreements</a></li>
            <li><a href="dashboard.php?tab=profile" class="<?php echo $active_tab === 'profile' ? 'active' : ''; ?>" data-tab="profile">Profile</a></li>
            <li><a href="dashboard.php?tab=addresses" class="<?php echo $active_tab === 'addresses' ? 'active' : ''; ?>" data-tab="addresses">Addresses</a></li>
            <li><a href="dashboard.php?tab=payment-methods" class="<?php echo $active_tab === 'payment-methods' ? 'active' : ''; ?>" data-tab="payment-methods">Payment Methods</a></li>
            <li><a href="dashboard.php?tab=wishlist" class="<?php echo $active_tab === 'wishlist' ? 'active' : ''; ?>" data-tab="wishlist">Wishlist</a></li>
            <li><a href="dashboard.php?tab=support" class="<?php echo $active_tab === 'support' ? 'active' : ''; ?>" data-tab="support">Support</a></li>
            <li><a href="logout.php" id="sign-out-link">Sign Out</a></li>
        </ul>
    </aside>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
