<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Wishlist - GigGatek</title>
    <meta name="description" content="View and manage your wishlist of favorite products at GigGatek. Save items for later and easily add them to your cart when you're ready to purchase.">

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
                <a href="wishlist.php" class="wishlist-icon active"><i class="fas fa-heart"></i></a>
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
                <h1>My Wishlist</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Wishlist</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="wishlist-section">
            <div class="container">
                <div class="wishlist-controls">
                    <div class="wishlist-count">
                        <span id="wishlist-item-count">3</span> items in your wishlist
                    </div>
                    <div class="wishlist-actions">
                        <button class="btn btn-outline btn-sm" id="add-all-to-cart">
                            <i class="fas fa-shopping-cart"></i> Add All to Cart
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" id="clear-wishlist">
                            <i class="fas fa-trash-alt"></i> Clear Wishlist
                        </button>
                    </div>
                </div>

                <div class="wishlist-items">
                    <!-- Wishlist Item 1 -->
                    <div class="wishlist-item" data-product-id="1">
                        <div class="wishlist-item-image">
                            <img src="img/products/gpu-rtx3080.png" alt="NVIDIA GeForce RTX 3080">
                        </div>
                        <div class="wishlist-item-details">
                            <h3 class="wishlist-item-title">
                                <a href="product.php?id=1">NVIDIA GeForce RTX 3080 10GB GDDR6X</a>
                            </h3>
                            <div class="wishlist-item-category">Graphics Cards</div>
                            <div class="wishlist-item-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span class="rating-count">(128)</span>
                            </div>
                            <div class="wishlist-item-price">
                                <span class="current-price">$599.99</span>
                                <span class="original-price">$999.99</span>
                                <span class="discount-badge">-40%</span>
                            </div>
                            <div class="wishlist-item-availability in-stock">
                                <i class="fas fa-check-circle"></i> In Stock
                            </div>
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="btn btn-primary add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn btn-outline remove-from-wishlist-btn">
                                <i class="fas fa-trash-alt"></i> Remove
                            </button>
                        </div>
                    </div>

                    <!-- Wishlist Item 2 -->
                    <div class="wishlist-item" data-product-id="3">
                        <div class="wishlist-item-image">
                            <img src="img/products/ram-corsair.png" alt="Corsair Vengeance RGB Pro 32GB">
                        </div>
                        <div class="wishlist-item-details">
                            <h3 class="wishlist-item-title">
                                <a href="product.php?id=3">Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3200MHz</a>
                            </h3>
                            <div class="wishlist-item-category">Memory</div>
                            <div class="wishlist-item-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span class="rating-count">(76)</span>
                            </div>
                            <div class="wishlist-item-price">
                                <span class="current-price">$129.99</span>
                                <span class="original-price">$199.99</span>
                                <span class="discount-badge">-35%</span>
                            </div>
                            <div class="wishlist-item-availability in-stock">
                                <i class="fas fa-check-circle"></i> In Stock
                            </div>
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="btn btn-primary add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn btn-outline remove-from-wishlist-btn">
                                <i class="fas fa-trash-alt"></i> Remove
                            </button>
                        </div>
                    </div>

                    <!-- Wishlist Item 3 -->
                    <div class="wishlist-item" data-product-id="5">
                        <div class="wishlist-item-image">
                            <img src="img/products/ssd-samsung.png" alt="Samsung 970 EVO Plus 1TB NVMe SSD">
                        </div>
                        <div class="wishlist-item-details">
                            <h3 class="wishlist-item-title">
                                <a href="product.php?id=5">Samsung 970 EVO Plus 1TB NVMe SSD</a>
                            </h3>
                            <div class="wishlist-item-category">Storage</div>
                            <div class="wishlist-item-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span class="rating-count">(92)</span>
                            </div>
                            <div class="wishlist-item-price">
                                <span class="current-price">$119.99</span>
                                <span class="original-price">$169.99</span>
                                <span class="discount-badge">-29%</span>
                            </div>
                            <div class="wishlist-item-availability low-stock">
                                <i class="fas fa-exclamation-circle"></i> Low Stock
                            </div>
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="btn btn-primary add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn btn-outline remove-from-wishlist-btn">
                                <i class="fas fa-trash-alt"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>

                <div class="wishlist-empty" style="display: none;">
                    <div class="empty-wishlist-icon">
                        <i class="far fa-heart"></i>
                    </div>
                    <h2>Your wishlist is empty</h2>
                    <p>Browse our products and add items to your wishlist to save them for later.</p>
                    <a href="products.php" class="btn btn-primary">Browse Products</a>
                </div>

                <div class="wishlist-recommendations">
                    <h2>You might also like</h2>
                    <div class="product-grid">
                        <!-- Recommendation 1 -->
                        <div class="product-card">
                            <div class="product-badge">
                                <span class="badge-label condition-excellent">Excellent</span>
                            </div>
                            <div class="product-image">
                                <img src="img/products/motherboard-asus.png" alt="ASUS ROG Strix B550-F Gaming">
                            </div>
                            <div class="product-info">
                                <div class="product-category">Motherboards</div>
                                <h4 class="product-title">ASUS ROG Strix B550-F Gaming</h4>
                                <div class="product-price">
                                    <span class="current-price">$149.99</span>
                                    <span class="original-price">$189.99</span>
                                </div>
                                <button class="btn btn-outline btn-sm add-to-wishlist">
                                    <i class="far fa-heart"></i> Add to Wishlist
                                </button>
                            </div>
                        </div>

                        <!-- Recommendation 2 -->
                        <div class="product-card">
                            <div class="product-badge">
                                <span class="badge-label condition-good">Good</span>
                            </div>
                            <div class="product-image">
                                <img src="img/products/psu-corsair.png" alt="Corsair RM750x 80+ Gold PSU">
                            </div>
                            <div class="product-info">
                                <div class="product-category">Power Supplies</div>
                                <h4 class="product-title">Corsair RM750x 80+ Gold PSU</h4>
                                <div class="product-price">
                                    <span class="current-price">$89.99</span>
                                    <span class="original-price">$129.99</span>
                                </div>
                                <button class="btn btn-outline btn-sm add-to-wishlist">
                                    <i class="far fa-heart"></i> Add to Wishlist
                                </button>
                            </div>
                        </div>

                        <!-- Recommendation 3 -->
                        <div class="product-card">
                            <div class="product-badge">
                                <span class="badge-label condition-excellent">Excellent</span>
                            </div>
                            <div class="product-image">
                                <img src="img/products/cpu-intel.png" alt="Intel Core i7-12700K">
                            </div>
                            <div class="product-info">
                                <div class="product-category">Processors</div>
                                <h4 class="product-title">Intel Core i7-12700K</h4>
                                <div class="product-price">
                                    <span class="current-price">$329.99</span>
                                    <span class="original-price">$419.99</span>
                                </div>
                                <button class="btn btn-outline btn-sm add-to-wishlist">
                                    <i class="far fa-heart"></i> Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
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
            // Initialize wishlist functionality
            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            const removeButtons = document.querySelectorAll('.remove-from-wishlist-btn');
            const addAllToCartButton = document.getElementById('add-all-to-cart');
            const clearWishlistButton = document.getElementById('clear-wishlist');
            
            // Add to cart functionality
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.closest('.wishlist-item').dataset.productId;
                    // In a real app, this would call an API
                    console.log(`Adding product ${productId} to cart`);
                    window.notifications.success('Item added to cart!');
                });
            });
            
            // Remove from wishlist functionality
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const item = this.closest('.wishlist-item');
                    const productId = item.dataset.productId;
                    // In a real app, this would call an API
                    console.log(`Removing product ${productId} from wishlist`);
                    
                    // Animate removal
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.height = '0';
                        item.style.margin = '0';
                        item.style.padding = '0';
                        item.style.overflow = 'hidden';
                    }, 300);
                    
                    setTimeout(() => {
                        item.remove();
                        
                        // Update count
                        const countElement = document.getElementById('wishlist-item-count');
                        const currentCount = parseInt(countElement.textContent);
                        countElement.textContent = currentCount - 1;
                        
                        // Show empty state if no items left
                        if (currentCount - 1 === 0) {
                            document.querySelector('.wishlist-items').style.display = 'none';
                            document.querySelector('.wishlist-controls').style.display = 'none';
                            document.querySelector('.wishlist-empty').style.display = 'block';
                        }
                        
                        window.notifications.info('Item removed from wishlist');
                    }, 600);
                });
            });
            
            // Add all to cart
            if (addAllToCartButton) {
                addAllToCartButton.addEventListener('click', function() {
                    // In a real app, this would call an API
                    console.log('Adding all items to cart');
                    window.notifications.success('All items added to cart!');
                });
            }
            
            // Clear wishlist
            if (clearWishlistButton) {
                clearWishlistButton.addEventListener('click', function() {
                    if (confirm('Are you sure you want to clear your wishlist?')) {
                        // In a real app, this would call an API
                        console.log('Clearing wishlist');
                        
                        // Animate removal of all items
                        const items = document.querySelectorAll('.wishlist-item');
                        items.forEach(item => {
                            item.style.opacity = '0';
                        });
                        
                        setTimeout(() => {
                            document.querySelector('.wishlist-items').style.display = 'none';
                            document.querySelector('.wishlist-controls').style.display = 'none';
                            document.querySelector('.wishlist-empty').style.display = 'block';
                            document.getElementById('wishlist-item-count').textContent = '0';
                            window.notifications.info('Wishlist cleared');
                        }, 300);
                    }
                });
            }
            
            // Add to wishlist buttons in recommendations
            const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
            addToWishlistButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // In a real app, this would call an API
                    console.log('Adding recommended product to wishlist');
                    this.innerHTML = '<i class="fas fa-heart"></i> Added to Wishlist';
                    this.disabled = true;
                    window.notifications.success('Item added to wishlist!');
                });
            });
        });
    </script>
</body>
</html>
