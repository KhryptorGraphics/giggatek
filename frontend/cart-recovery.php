<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recover Your Cart - GigGatek</title>
    <meta name="description" content="Recover your saved shopping cart at GigGatek. We've saved your items for you!">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/components/abandoned-cart-recovery.css">
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo-link"><img src="img/logo.png" alt="GigGatek Logo" id="logo"></a>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="products.php">Products</a></li>
                    <li><a href="rent-to-own.php">Rent-to-Own</a></li>
                    <li><a href="about.php">About</a></li>
                    <li><a href="contact.php">Contact</a></li>
                </ul>
            </nav>
            <div class="cart-account">
                <a href="cart.php" class="cart-icon">
                    <span class="cart-count">0</span>
                    <i class="fas fa-shopping-cart"></i>
                </a>
                <a href="account.php" class="account-icon">
                    <i class="fas fa-user"></i>
                </a>
            </div>
        </div>
    </header>
    
    <main>
        <div class="container">
            <div class="page-header">
                <h1>Recover Your Cart</h1>
                <p>We've saved your shopping cart for you. You can restore it and continue shopping.</p>
            </div>
            
            <div id="cart-recovery-container"></div>
        </div>
    </main>
    
    <footer>
        <div class="container">
            <div class="footer-top">
                <div class="footer-col">
                    <h3>Shop</h3>
                    <ul>
                        <li><a href="products.php">All Products</a></li>
                        <li><a href="products.php?category=gpus">GPUs</a></li>
                        <li><a href="products.php?category=cpus">CPUs</a></li>
                        <li><a href="products.php?category=motherboards">Motherboards</a></li>
                        <li><a href="products.php?category=ram">RAM</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Rent-to-Own</h3>
                    <ul>
                        <li><a href="rent-to-own.php">How It Works</a></li>
                        <li><a href="rent-to-own.php#calculator">Payment Calculator</a></li>
                        <li><a href="rent-to-own.php#faq">FAQ</a></li>
                        <li><a href="rent-to-own.php#terms">Terms & Conditions</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="contact.php">Contact</a></li>
                        <li><a href="blog.php">Blog</a></li>
                        <li><a href="careers.php">Careers</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Support</h3>
                    <ul>
                        <li><a href="support.php">Help Center</a></li>
                        <li><a href="returns.php">Returns & Warranty</a></li>
                        <li><a href="shipping.php">Shipping Information</a></li>
                        <li><a href="privacy.php">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2023 GigGatek. All rights reserved.</p>
                <div class="social-links">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
        </div>
    </footer>
    
    <!-- Scripts -->
    <script src="js/env.js"></script>
    <script src="js/config.js"></script>
    <script src="js/api-client.js"></script>
    <script src="js/state-manager.js"></script>
    <script src="js/data-service.js"></script>
    <script src="js/components/abandoned-cart-recovery.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize state manager
            window.stateManager = new StateManager();
            
            // Initialize API client
            const apiClient = new ApiClient({
                baseUrl: ENV.get('apiBaseUrl')
            });
            
            // Initialize data service
            const dataService = new DataService(apiClient, window.stateManager);
            
            // Initialize cart recovery component
            const cartRecovery = new AbandonedCartRecovery('#cart-recovery-container', {
                onRecovery: (cartData) => {
                    console.log('Cart recovered:', cartData);
                    
                    // Show notification
                    if (typeof notifications !== 'undefined') {
                        notifications.success('Your cart has been restored!', 'Cart Recovered');
                    }
                }
            });
            
            // Update cart count
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                const cart = dataService.getCart();
                const itemCount = cart.items ? cart.items.length : 0;
                cartCountElement.textContent = itemCount.toString();
            }
        });
    </script>
</body>
</html>
