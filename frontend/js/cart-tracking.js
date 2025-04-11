/**
 * Cart Tracking Script
 * 
 * This script tracks shopping cart activity for abandoned cart recovery.
 * Include this script on all pages that have cart functionality.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart tracker
    if (typeof CartTracker !== 'undefined') {
        window.cartTracker = new CartTracker({
            trackingEndpoint: '/api/abandoned-carts/track',
            trackingInterval: 60000 // 1 minute
        });
    }
});
