<?php
/**
 * GigGatek Dashboard Main File
 * This file integrates all the dashboard components
 */

// Determine active tab from URL parameter or default to 'dashboard'
$active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'dashboard';

// Include header component
include 'components/dashboard/header.php';
?>

<main class="container">
    <?php 
    // Include navigation component
    include 'components/dashboard/navigation.php';
    
    // Include all tab components
    include 'components/dashboard/overview.php';
    include 'components/dashboard/orders.php';
    include 'components/dashboard/rentals.php';
    include 'components/dashboard/profile.php';
    include 'components/dashboard/addresses.php';
    include 'components/dashboard/payment_methods.php';
    include 'components/dashboard/wishlist.php';
    ?>
    </div><!-- Close dashboard-content div from navigation.php -->
</div><!-- Close dashboard-container div from navigation.php -->
</main>

<?php
// Include footer component
include 'components/dashboard/footer.php';
?>
