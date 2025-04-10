<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GigGatek - Refurbished Computer Hardware & Rent-to-Own Technology</title>
    <meta name="description" content="GigGatek offers quality refurbished computer hardware with both direct purchase and rent-to-own options. Find GPUs, CPUs, complete systems, and more!">

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
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/wishlist.css">
    <link rel="stylesheet" href="css/pwa.css">
    <link rel="stylesheet" href="css/i18n.css">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link id="language-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo-link"><img src="img/logo.png" alt="GigGatek Logo" id="logo"></a>
            <nav>
                <ul>
                    <li><a href="index.php" class="active" data-i18n="common.home">Home</a></li>
                    <li><a href="products.php" data-i18n="common.products">Products</a></li>
                    <li><a href="rent-to-own.php" data-i18n="common.rentToOwn">Rent-to-Own</a></li>
                    <li><a href="#" data-i18n="common.support">Support</a></li>
                    <li><a href="login.php" data-i18n="common.account">Account</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="cart.php" class="cart-icon"><i class="fas fa-shopping-cart"></i> <span class="cart-count">0</span></a>
                <a href="login.php" class="login-link" data-i18n="common.login">Login</a>
                <a href="register.php" class="register-link" data-i18n="common.register">Register</a>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1 data-i18n="home.hero.title">Quality Tech, Flexible Options</h1>
                <p data-i18n="home.hero.subtitle">Discover premium refurbished computer hardware with both purchase and rent-to-own options to fit your budget and needs.</p>
                <div class="hero-actions">
                    <a href="products.php" class="btn btn-primary btn-lg" data-i18n="home.hero.shopNow">Shop Now</a>
                    <a href="rent-to-own.php" class="btn btn-secondary btn-lg" data-i18n="home.hero.learnMore">Learn About Rent-to-Own</a>
                </div>
            </div>
        </section>

        <section class="categories-section">
            <div class="container">
                <div class="section-header">
                    <h2 data-i18n="home.categories.title">Browse by Category</h2>
                    <p data-i18n="home.categories.subtitle">Find exactly what you need from our extensive selection of refurbished hardware.</p>
                </div>
                <div class="categories-grid">
                    <div class="category-card">
                        <a href="products.php?category=gpus">
                            <img src="img/categories/gpu.png" alt="Graphics Cards">
                            <h4 data-i18n="home.categories.gpus">Graphics Cards</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=cpus">
                            <img src="img/categories/cpu.png" alt="Processors">
                            <h4 data-i18n="home.categories.cpus">Processors</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=motherboards">
                            <img src="img/categories/motherboard.png" alt="Motherboards">
                            <h4 data-i18n="home.categories.motherboards">Motherboards</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=memory">
                            <img src="img/categories/ram.png" alt="Memory (RAM)">
                            <h4 data-i18n="home.categories.memory">Memory (RAM)</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=storage">
                            <img src="img/categories/storage.png" alt="Storage">
                            <h4 data-i18n="home.categories.storage">Storage</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=systems">
                            <img src="img/categories/pc.png" alt="Complete Systems">
                            <h4 data-i18n="home.categories.systems">Complete Systems</h4>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section class="featured-section">
            <div class="container">
                <div class="section-header">
                    <h2>Featured Products</h2>
                    <p>Top-quality refurbished hardware handpicked by our team.</p>
                </div>
                <div class="product-grid" id="featured-products">
                    <!-- Product 1 -->
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/gpu-rtx3080.png" alt="NVIDIA GeForce RTX 3080">
                        <h4>NVIDIA GeForce RTX 3080 10GB GDDR6X</h4>
                        <div class="price">$599.99</div>
                        <div class="rent-price">From $69.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=1" class="btn btn-primary">View Details</a>
                    </div>

                    <!-- Product 2 -->
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/cpu-ryzen9.png" alt="AMD Ryzen 9 5900X">
                        <h4>AMD Ryzen 9 5900X 12-Core Processor</h4>
                        <div class="price">$349.99</div>
                        <div class="rent-price">From $39.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=2" class="btn btn-primary">View Details</a>
                    </div>

                    <!-- Product 3 -->
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/ram-corsair.png" alt="Corsair Vengeance RGB Pro 32GB">
                        <h4>Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3200MHz</h4>
                        <div class="price">$129.99</div>
                        <div class="rent-price">From $16.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=3" class="btn btn-primary">View Details</a>
                    </div>

                    <!-- Product 4 -->
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/pc-gaming.png" alt="Gaming PC - RTX 3070, i7, 16GB RAM">
                        <h4>Gaming PC - RTX 3070, i7-12700K, 16GB RAM, 1TB SSD</h4>
                        <div class="price">$1,299.99</div>
                        <div class="rent-price">From $134.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=4" class="btn btn-primary">View Details</a>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <a href="products.php" class="btn btn-secondary">View All Products</a>
                </div>
            </div>
        </section>

        <section class="banner-section">
            <div class="container">
                <div class="banner rent-to-own-banner">
                    <div class="banner-content">
                        <h2>Flexible Rent-to-Own Options</h2>
                        <p>Get the hardware you need today with affordable monthly payments. After your final payment, the hardware is yours to keep!</p>
                        <ul class="banner-features">
                            <li>No credit check required</li>
                            <li>Flexible terms: 3, 6, or 12 months</li>
                            <li>Option to upgrade anytime</li>
                            <li>Quality refurbished hardware</li>
                        </ul>
                        <a href="rent-to-own.php" class="btn btn-primary">Learn More</a>
                    </div>
                    <div class="banner-image">
                        <img src="img/rent-to-own-banner.png" alt="Rent-to-Own Computer Hardware">
                    </div>
                </div>
            </div>
        </section>

        <section class="why-choose-section">
            <div class="container">
                <div class="section-header">
                    <h2>Why Choose GigGatek?</h2>
                    <p>Our commitment to quality and customer satisfaction sets us apart.</p>
                </div>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">✓</div>
                        <h3>Quality Tested</h3>
                        <p>Every product undergoes rigorous testing and certification before being offered for sale or rental.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🛠️</div>
                        <h3>Warranty Included</h3>
                        <p>All products come with a warranty that covers the entire rental period or 90 days for purchases.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">💰</div>
                        <h3>Best Value</h3>
                        <p>Get high-performance hardware at a fraction of the original retail price.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🌱</div>
                        <h3>Eco-Friendly</h3>
                        <p>Our refurbishing process extends the lifecycle of hardware, reducing electronic waste.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="testimonials-section">
            <div class="container">
                <div class="section-header">
                    <h2>What Our Customers Say</h2>
                    <p>Don't just take our word for it. See what our customers think about GigGatek.</p>
                </div>
                <div class="testimonials-slider">
                    <div class="testimonial">
                        <div class="testimonial-quote">
                            "The RTX 3070 I rented was in perfect condition, and after 12 months of payments, it was mine! The process was smooth, and the customer service was excellent."
                        </div>
                        <div class="testimonial-author">Michael Richards</div>
                        <div class="testimonial-role">Game Developer</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="newsletter-section">
            <div class="container">
                <h2>Stay Updated</h2>
                <p>Subscribe to our newsletter for the latest product updates, special offers, and tech news.</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Your email address" required>
                    <button type="submit">Subscribe</button>
                </form>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p data-i18n="footer.copyright" data-i18n-params='{"year": "2025"}' >&copy; 2025 GigGatek. All rights reserved.</p>
            <ul>
                <li><a href="#" data-i18n="footer.privacyPolicy">Privacy Policy</a></li>
                <li><a href="#" data-i18n="footer.termsOfService">Terms of Service</a></li>
                <li><a href="#" data-i18n="footer.contactUs">Contact Us</a></li>
            </ul>
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

    <!-- Offline indicator -->
    <div class="offline-indicator">
        <span class="icon">📶</span>
        <span data-i18n="common.offline">You are currently offline. Some features may be unavailable.</span>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Any JavaScript functionality can be added here
            console.log('GigGatek homepage loaded successfully!');

            // Test notification system
            setTimeout(() => {
                window.notifications.success('Welcome to GigGatek!', { duration: 5000 });
            }, 1000);
        });
    </script>
</body>
</html>
