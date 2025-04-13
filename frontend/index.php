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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">family=Montserrat:wght@400;500;600;700;800<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">family=Roboto:wght@400;500;700<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/modern-update.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/hero.css">
    <link rel="stylesheet" href="css/categories.css">
    <link rel="stylesheet" href="css/product-carousel.css">
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
                    <li><a href="index.php" class="active" data-i18n="common.home">Home</a></li>
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
        <section class="hero" style="background-image: url('img/banners/hero-banner-dalle.png');">
            <div class="hero-overlay"></div>
            <div class="container animate-on-scroll">
                <div class="hero-content animated">
                    <h1 class="hero-title" data-i18n="home.hero.title">Premium Tech<br>Without Premium Price</h1>
                    <p class="hero-subtitle" data-i18n="home.hero.subtitle">Discover our selection of expertly refurbished hardware with flexible purchase and rent-to-own options designed to fit your budget without compromising performance.</p>
                    <div class="hero-actions">
                        <a href="products.php" class="btn btn-primary btn-lg pulse-effect" data-i18n="home.hero.shopNow">Shop Now</a>
                        <a href="rent-to-own.php" class="btn btn-outline btn-lg" data-i18n="home.hero.learnMore">Explore Rent-to-Own</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="categories-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <h2 data-i18n="home.categories.title">Browse by Category</h2>
                    <p data-i18n="home.categories.subtitle">Find exactly what you need from our extensive selection of refurbished hardware.</p>
                </div>
                <div class="categories-grid">
                    <div class="category-card">
                        <a href="products.php?category=gpus">
                            <img src="img/categories/gpu-dalle.png" alt="Graphics Cards">
                            <h4 data-i18n="home.categories.gpus">Graphics Cards</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=cpus">
                            <img src="img/categories/cpu-dalle.png" alt="Processors">
                            <h4 data-i18n="home.categories.cpus">Processors</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=motherboards">
                            <img src="img/categories/motherboard-dalle.png" alt="Motherboards">
                            <h4 data-i18n="home.categories.motherboards">Motherboards</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=memory">
                            <img src="img/categories/ram-dalle.png" alt="Memory (RAM)">
                            <h4 data-i18n="home.categories.memory">Memory (RAM)</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=storage">
                            <img src="img/categories/storage-dalle.png" alt="Storage">
                            <h4 data-i18n="home.categories.storage">Storage</h4>
                        </a>
                    </div>
                    <div class="category-card">
                        <a href="products.php?category=systems">
                            <img src="img/categories/pc-dalle.png" alt="Complete Systems">
                            <h4 data-i18n="home.categories.systems">Complete Systems</h4>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section class="featured-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <h2>Featured Products</h2>
                    <p>Top-quality refurbished hardware handpicked by our team.</p>
                </div>
                <div class="product-carousel" id="featured-products">
                    <!-- Product 1 -->
                    <div class="product-item animate-on-scroll">
                        <div class="product-badge">
                            <span class="badge-label condition-excellent">Excellent</span>
                            <span class="badge-label badge-discount">-40%</span>
                        </div>
                        <div class="product-image">
                            <img src="img/products/gpu-rtx3080.png" alt="NVIDIA GeForce RTX 3080">
                            <div class="product-overlay">
                                <button class="quick-view-btn"><i class="fas fa-eye"></i> Quick View</button>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-category">Graphics Cards</div>
                            <h4 class="product-title">NVIDIA GeForce RTX 3080 10GB GDDR6X</h4>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span class="rating-count">(128)</span>
                            </div>
                            <div class="product-price">
                                <span class="current-price">$599.99</span>
                                <span class="original-price">$999.99</span>
                            </div>
                            <div class="rent-price">From <strong>$69.99/mo</strong> with Rent-to-Own</div>
                        </div>
                        <div class="product-actions">
                            <button class="action-btn" title="Add to Wishlist"><i class="far fa-heart"></i></button>
                            <button class="action-btn" title="Compare"><i class="fas fa-exchange-alt"></i></button>
                            <a href="product.php?id=1" class="btn btn-primary btn-block">View Details</a>
                        </div>
                    </div>

                    <!-- Product 2 -->
                    <div class="product-item animate-on-scroll" data-delay="100">
                        <div class="product-badge">
                            <span class="badge-label condition-good">Good</span>
                            <span class="badge-label badge-discount">-30%</span>
                        </div>
                        <div class="product-image">
                            <img src="img/products/cpu-ryzen9.png" alt="AMD Ryzen 9 5900X">
                            <div class="product-overlay">
                                <button class="quick-view-btn"><i class="fas fa-eye"></i> Quick View</button>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-category">Processors</div>
                            <h4 class="product-title">AMD Ryzen 9 5900X 12-Core Processor</h4>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                                <span class="rating-count">(94)</span>
                            </div>
                            <div class="product-price">
                                <span class="current-price">$349.99</span>
                                <span class="original-price">$499.99</span>
                            </div>
                            <div class="rent-price">From <strong>$39.99/mo</strong> with Rent-to-Own</div>
                        </div>
                        <div class="product-actions">
                            <button class="action-btn" title="Add to Wishlist"><i class="far fa-heart"></i></button>
                            <button class="action-btn" title="Compare"><i class="fas fa-exchange-alt"></i></button>
                            <a href="product.php?id=2" class="btn btn-primary btn-block">View Details</a>
                        </div>
                    </div>

                    <!-- Product 3 -->
                    <div class="product-item animate-on-scroll" data-delay="200">
                        <div class="product-badge">
                            <span class="badge-label condition-excellent">Excellent</span>
                            <span class="badge-label badge-discount">-35%</span>
                        </div>
                        <div class="product-image">
                            <img src="img/products/ram-corsair.png" alt="Corsair Vengeance RGB Pro 32GB">
                            <div class="product-overlay">
                                <button class="quick-view-btn"><i class="fas fa-eye"></i> Quick View</button>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-category">Memory</div>
                            <h4 class="product-title">Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3200MHz</h4>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span class="rating-count">(76)</span>
                            </div>
                            <div class="product-price">
                                <span class="current-price">$129.99</span>
                                <span class="original-price">$199.99</span>
                            </div>
                            <div class="rent-price">From <strong>$16.99/mo</strong> with Rent-to-Own</div>
                        </div>
                        <div class="product-actions">
                            <button class="action-btn" title="Add to Wishlist"><i class="far fa-heart"></i></button>
                            <button class="action-btn" title="Compare"><i class="fas fa-exchange-alt"></i></button>
                            <a href="product.php?id=3" class="btn btn-primary btn-block">View Details</a>
                        </div>
                    </div>

                    <!-- Product 4 -->
                    <div class="product-item animate-on-scroll" data-delay="300">
                        <div class="product-badge">
                            <span class="badge-label condition-good">Good</span>
                            <span class="badge-label badge-hot">HOT</span>
                        </div>
                        <div class="product-image">
                            <img src="img/products/pc-gaming.png" alt="Gaming PC - RTX 3070, i7, 16GB RAM">
                            <div class="product-overlay">
                                <button class="quick-view-btn"><i class="fas fa-eye"></i> Quick View</button>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-category">Complete Systems</div>
                            <h4 class="product-title">Gaming PC - RTX 3070, i7-12700K, 16GB RAM, 1TB SSD</h4>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span class="rating-count">(52)</span>
                            </div>
                            <div class="product-price">
                                <span class="current-price">$1,299.99</span>
                                <span class="original-price">$1,899.99</span>
                            </div>
                            <div class="rent-price">From <strong>$134.99/mo</strong> with Rent-to-Own</div>
                        </div>
                        <div class="product-actions">
                            <button class="action-btn" title="Add to Wishlist"><i class="far fa-heart"></i></button>
                            <button class="action-btn" title="Compare"><i class="fas fa-exchange-alt"></i></button>
                            <a href="product.php?id=4" class="btn btn-primary btn-block">View Details</a>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-5">
                    <a href="products.php" class="btn btn-secondary btn-lg">Browse All Products</a>
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
                <div class="section-header animate-on-scroll">
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
                <div class="section-header animate-on-scroll">
                    <h2>What Our Customers Say</h2>
                    <p>Don't just take our word for it. See what our customers think about GigGatek.</p>
                </div>
                <div class="testimonials-slider">
                    <!-- Testimonial 1 -->
                    <div class="testimonial">
                        <div class="testimonial-avatar">
                            <img src="img/testimonials/user1.jpg" alt="Michael Richards">
                        </div>
                        <div class="testimonial-content">
                            <div class="testimonial-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="testimonial-quote">
                                "The RTX 3070 I purchased was in perfect condition, just like new! The process was smooth, and the customer service was excellent. I saved over $400 compared to buying new."
                            </div>
                            <div class="testimonial-author">Michael Richards</div>
                            <div class="testimonial-role">Game Developer</div>
                        </div>
                    </div>

                    <!-- Testimonial 2 -->
                    <div class="testimonial">
                        <div class="testimonial-avatar">
                            <img src="img/testimonials/user2.jpg" alt="Sarah Johnson">
                        </div>
                        <div class="testimonial-content">
                            <div class="testimonial-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                            <div class="testimonial-quote">
                                "As a student, the rent-to-own program was perfect for me. I got a powerful workstation for my 3D modeling class without the upfront cost. The flexibility is fantastic!"
                            </div>
                            <div class="testimonial-author">Sarah Johnson</div>
                            <div class="testimonial-role">Architecture Student</div>
                        </div>
                    </div>

                    <!-- Testimonial 3 -->
                    <div class="testimonial">
                        <div class="testimonial-avatar">
                            <img src="img/testimonials/user3.jpg" alt="David Wong">
                        </div>
                        <div class="testimonial-content">
                            <div class="testimonial-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="testimonial-quote">
                                "I've purchased refurbished hardware from many vendors, but GigGatek's quality control is outstanding. Everything arrives meticulously tested and in excellent condition. A+ service!"
                            </div>
                            <div class="testimonial-author">David Wong</div>
                            <div class="testimonial-role">IT Consultant</div>
                        </div>
                    </div>
                </div>
                <div class="testimonial-controls">
                    <button class="testimonial-control prev-testimonial">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="testimonial-indicators">
                        <span class="testimonial-indicator active"></span>
                        <span class="testimonial-indicator"></span>
                        <span class="testimonial-indicator"></span>
                    </div>
                    <button class="testimonial-control next-testimonial">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </section>
<section class="newsletter-section">
    <div class="container animate-on-scroll">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest product updates, special offers, and tech news.</p>
                <p>Subscribe to our newsletter for the latest product updates, special offers, and tech news.</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Your email address" required>
                    <button type="submit">Subscribe Now</button>
                </form>
                <div class="newsletter-privacy">
                    By subscribing, you agree to our <a href="privacy-policy.php">Privacy Policy</a>. We respect your privacy and will never share your information.
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
    <script src="js/testimonials.js"></script>
    <script src="js/app.js"></script>

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
    <script>
        // Animation on scroll
        function animateOnScroll() {
            const elements = document.querySelectorAll(".animate-on-scroll");
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add("animated");
                }
            });
        }

        // Run on page load
        document.addEventListener("DOMContentLoaded", animateOnScroll);

        // Run on scroll
        window.addEventListener("scroll", animateOnScroll);

        // Header scroll effect
        window.addEventListener("scroll", function() {
            const header = document.querySelector("header");
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    </script>
</body>
</html>
