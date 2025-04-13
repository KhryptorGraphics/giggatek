<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifications - GigGatek</title>
    <meta name="description" content="View and manage your notifications from GigGatek. Stay updated on order status, special offers, and important account information.">

    <!-- PWA Meta Tags -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#007bff">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="GigGatek">

    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" href="/img/icons/icon-152.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/img/icons/icon-152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/img/icons/icon-180.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/img/icons/icon-167.png">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/img/icons/icon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/img/icons/icon-16.png">

    <!-- Fonts and Styles -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/wishlist.css">
    <link rel="stylesheet" href="css/pwa.css">
    <link rel="stylesheet" href="css/i18n.css">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link id="language-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo-link"><img src="img/logo-new.png" alt="GigGatek Logo" id="logo" width="180"></a>
            <nav>
                <ul>
                    <li><a href="index.php" data-i18n="common.home">Home</a></li>
                    <li><a href="products.php" data-i18n="common.products">Products</a></li>
                    <li><a href="rent-to-own.php" data-i18n="common.rentToOwn">Rent-to-Own</a></li>
                    <li><a href="support.php" data-i18n="common.support">Support</a></li>
                    <li><a href="login.php" data-i18n="common.account">Account</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="#" class="search-icon" id="searchToggle"><i class="fas fa-search"></i></a>
                <a href="notifications.php" class="notifications-icon"><i class="fas fa-bell"></i></a>
                <a href="wishlist.php" class="wishlist-icon"><i class="fas fa-heart"></i></a>
                <a href="cart.php" class="cart-icon"><i class="fas fa-shopping-cart"></i> <span class="cart-count">0</span></a>
                <a href="login.php" class="login-link" data-i18n="common.login">Login</a>
                <a href="register.php" class="register-link" data-i18n="common.register">Register</a>
            </div>
        </div>
        <div class="search-panel" id="searchPanel">
            <div class="container">
                <form action="products.php" method="get" class="search-form">
                    <input type="text" name="search" placeholder="Search for products..." class="search-input">
                    <button type="submit" class="search-button"><i class="fas fa-search"></i></button>
                </form>
                <button class="search-close" id="searchClose"><i class="fas fa-times"></i></button>
            </div>
        </div>
    </header>

    <main>
        <section class="page-header">
            <div class="container">
                <h1>Notifications</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Notifications</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="notifications-section">
            <div class="container">
                <div class="notifications-controls">
                    <div class="notifications-count">
                        <span id="unread-count" class="badge">4</span> unread notifications
                    </div>
                    <div class="notifications-actions">
                        <button class="btn btn-outline btn-sm" id="mark-all-read">
                            <i class="fas fa-check-double"></i> Mark All as Read
                        </button>
                        <div class="notifications-filter">
                            <label for="notification-filter">Filter:</label>
                            <select id="notification-filter" class="form-control">
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                                <option value="orders">Orders</option>
                                <option value="system">System</option>
                                <option value="promotions">Promotions</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="notifications-list">
                    <!-- Notification 1 - Order -->
                    <div class="notification-item unread" data-type="orders">
                        <div class="notification-icon order-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-header">
                                <h3 class="notification-title">Order Shipped</h3>
                                <span class="notification-time">2 hours ago</span>
                            </div>
                            <div class="notification-body">
                                <p>Your order #GT78945 has been shipped! Track your package with tracking number: <strong>1Z999AA10123456784</strong></p>
                            </div>
                            <div class="notification-actions">
                                <a href="order-confirmation.php?id=GT78945" class="btn btn-sm btn-outline">View Order</a>
                                <button class="btn btn-sm btn-text mark-read" title="Mark as read">
                                    <i class="far fa-check-circle"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Notification 2 - System -->
                    <div class="notification-item unread" data-type="system">
                        <div class="notification-icon system-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-header">
                                <h3 class="notification-title">Security Alert</h3>
                                <span class="notification-time">Yesterday</span>
                            </div>
                            <div class="notification-body">
                                <p>We noticed a login to your account from a new device. If this was you, you can ignore this message. If not, please secure your account immediately.</p>
                            </div>
                            <div class="notification-actions">
                                <a href="dashboard.php?tab=security" class="btn btn-sm btn-outline">Security Settings</a>
                                <button class="btn btn-sm btn-text mark-read" title="Mark as read">
                                    <i class="far fa-check-circle"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Notification 3 - Promotion -->
                    <div class="notification-item unread" data-type="promotions">
                        <div class="notification-icon promotion-icon">
                            <i class="fas fa-tag"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-header">
                                <h3 class="notification-title">Flash Sale: 24 Hours Only!</h3>
                                <span class="notification-time">2 days ago</span>
                            </div>
                            <div class="notification-body">
                                <p>Save up to 50% on selected graphics cards and processors. Limited stock available!</p>
                            </div>
                            <div class="notification-actions">
                                <a href="products.php?sale=flash" class="btn btn-sm btn-outline">Shop Now</a>
                                <button class="btn btn-sm btn-text mark-read" title="Mark as read">
                                    <i class="far fa-check-circle"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Notification 4 - Order -->
                    <div class="notification-item unread" data-type="orders">
                        <div class="notification-icon order-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-header">
                                <h3 class="notification-title">Payment Successful</h3>
                                <span class="notification-time">3 days ago</span>
                            </div>
                            <div class="notification-body">
                                <p>Your payment of <strong>$599.99</strong> for order #GT78945 was successful. Thank you for your purchase!</p>
                            </div>
                            <div class="notification-actions">
                                <a href="order-confirmation.php?id=GT78945" class="btn btn-sm btn-outline">View Order</a>
                                <button class="btn btn-sm btn-text mark-read" title="Mark as read">
                                    <i class="far fa-check-circle"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Notification 5 - System (Read) -->
                    <div class="notification-item" data-type="system">
                        <div class="notification-icon system-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-header">
                                <h3 class="notification-title">System Maintenance</h3>
                                <span class="notification-time">1 week ago</span>
                            </div>
                            <div class="notification-body">
                                <p>Our website will be undergoing scheduled maintenance on June 15th from 2:00 AM to 4:00 AM EST. Some services may be temporarily unavailable during this time.</p>
                            </div>
                            <div class="notification-actions">
                                <button class="btn btn-sm btn-text delete-notification" title="Delete notification">
                                    <i class="far fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Notification 6 - Promotion (Read) -->
                    <div class="notification-item" data-type="promotions">
                        <div class="notification-icon promotion-icon">
                            <i class="fas fa-gift"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-header">
                                <h3 class="notification-title">Special Offer: Free Shipping</h3>
                                <span class="notification-time">2 weeks ago</span>
                            </div>
                            <div class="notification-body">
                                <p>Enjoy free shipping on all orders over $100 for the next 7 days. Use code <strong>FREESHIP100</strong> at checkout.</p>
                            </div>
                            <div class="notification-actions">
                                <button class="btn btn-sm btn-text delete-notification" title="Delete notification">
                                    <i class="far fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="notifications-empty" style="display: none;">
                    <div class="empty-notifications-icon">
                        <i class="far fa-bell"></i>
                    </div>
                    <h2>No notifications</h2>
                    <p>You don't have any notifications at the moment. We'll notify you about order updates, special offers, and more.</p>
                </div>

                <div class="notifications-pagination">
                    <button class="pagination-prev" disabled>
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <div class="pagination-info">
                        Page 1 of 1
                    </div>
                    <button class="pagination-next" disabled>
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="notifications-preferences">
                    <h3>Notification Preferences</h3>
                    <p>Manage what types of notifications you receive and how you receive them.</p>
                    <a href="dashboard.php?tab=notification-settings" class="btn btn-outline">Manage Preferences</a>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-section">
                <h4>About GigGatek</h4>
                <p>GigGatek offers quality refurbished computer hardware with both direct purchase and rent-to-own options. Our mission is to make technology accessible to everyone.</p>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="products.php">Products</a></li>
                    <li><a href="rent-to-own.php">Rent-to-Own</a></li>
                    <li><a href="support.php">Support</a></li>
                    <li><a href="login.php">Account</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Customer Service</h4>
                <ul>
                    <li><a href="contact.php">Contact Us</a></li>
                    <li><a href="faq.php">FAQ</a></li>
                    <li><a href="shipping-policy.php">Shipping Policy</a></li>
                    <li><a href="return-policy.php">Return Policy</a></li>
                    <li><a href="warranty-information.php">Warranty Information</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Connect With Us</h4>
                <div class="footer-social">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-youtube"></i></a>
                    <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container">
                <p data-i18n="footer.copyright" data-i18n-params='{"year": "2025"}'>&copy; 2025 GigGatek. All rights reserved.</p>
                <ul>
                    <li><a href="privacy-policy.php" data-i18n="footer.privacyPolicy">Privacy Policy</a></li>
                    <li><a href="terms-of-service.php" data-i18n="footer.termsOfService">Terms of Service</a></li>
                    <li><a href="sitemap.php" data-i18n="footer.sitemap">Sitemap</a></li>
                </ul>
            </div>
        </div>
    </footer>

    <!-- Include configuration and utility scripts -->
    <script src="js/config.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/notifications.js"></script>
    <script src="js/wishlist.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/pwa.js"></script>
    <script src="js/i18n.js"></script>
    <script src="js/app.js"></script>

    <!-- Offline indicator -->
    <div class="offline-indicator">
        <span class="icon">📶</span>
        <span data-i18n="common.offline">You are currently offline. Some features may be unavailable.</span>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize notifications functionality
            const markReadButtons = document.querySelectorAll('.mark-read');
            const deleteButtons = document.querySelectorAll('.delete-notification');
            const markAllReadButton = document.getElementById('mark-all-read');
            const filterSelect = document.getElementById('notification-filter');
            
            // Mark as read functionality
            markReadButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const notificationItem = this.closest('.notification-item');
                    
                    // In a real app, this would call an API
                    console.log('Marking notification as read');
                    
                    // Update UI
                    notificationItem.classList.remove('unread');
                    this.innerHTML = '<i class="fas fa-check-circle"></i>';
                    this.disabled = true;
                    
                    // Update unread count
                    updateUnreadCount();
                });
            });
            
            // Delete notification functionality
            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const notificationItem = this.closest('.notification-item');
                    
                    // In a real app, this would call an API
                    console.log('Deleting notification');
                    
                    // Animate removal
                    notificationItem.style.opacity = '0';
                    setTimeout(() => {
                        notificationItem.style.height = '0';
                        notificationItem.style.margin = '0';
                        notificationItem.style.padding = '0';
                        notificationItem.style.overflow = 'hidden';
                    }, 300);
                    
                    setTimeout(() => {
                        notificationItem.remove();
                        
                        // Show empty state if no notifications left
                        if (document.querySelectorAll('.notification-item').length === 0) {
                            document.querySelector('.notifications-list').style.display = 'none';
                            document.querySelector('.notifications-controls').style.display = 'none';
                            document.querySelector('.notifications-pagination').style.display = 'none';
                            document.querySelector('.notifications-empty').style.display = 'block';
                        }
                    }, 600);
                });
            });
            
            // Mark all as read
            if (markAllReadButton) {
                markAllReadButton.addEventListener('click', function() {
                    // In a real app, this would call an API
                    console.log('Marking all notifications as read');
                    
                    // Update UI
                    const unreadItems = document.querySelectorAll('.notification-item.unread');
                    unreadItems.forEach(item => {
                        item.classList.remove('unread');
                        const markReadBtn = item.querySelector('.mark-read');
                        if (markReadBtn) {
                            markReadBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
                            markReadBtn.disabled = true;
                        }
                    });
                    
                    // Update unread count
                    document.getElementById('unread-count').textContent = '0';
                    
                    // Show success message
                    window.notifications.success('All notifications marked as read');
                });
            }
            
            // Filter notifications
            if (filterSelect) {
                filterSelect.addEventListener('change', function() {
                    const filterValue = this.value;
                    const notificationItems = document.querySelectorAll('.notification-item');
                    
                    notificationItems.forEach(item => {
                        if (filterValue === 'all') {
                            item.style.display = 'flex';
                        } else if (filterValue === 'unread') {
                            item.style.display = item.classList.contains('unread') ? 'flex' : 'none';
                        } else {
                            // Filter by type (orders, system, promotions)
                            item.style.display = item.dataset.type === filterValue ? 'flex' : 'none';
                        }
                    });
                    
                    // Show empty state if no visible notifications
                    const visibleItems = document.querySelectorAll('.notification-item[style="display: flex"]');
                    if (visibleItems.length === 0) {
                        document.querySelector('.notifications-empty').style.display = 'block';
                    } else {
                        document.querySelector('.notifications-empty').style.display = 'none';
                    }
                });
            }
            
            // Helper function to update unread count
            function updateUnreadCount() {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                document.getElementById('unread-count').textContent = unreadItems.length;
            }
        });
    </script>
</body>
</html>
