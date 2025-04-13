<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Center - GigGatek</title>
    <meta name="description" content="Get help and support for your GigGatek products. Find answers to common questions, troubleshooting guides, and contact information.">

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
                    <li><a href="support.php" class="active" data-i18n="common.support">Support</a></li>
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
                <h1>Support Center</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Support</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="support-overview">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <h2>How Can We Help You Today?</h2>
                    <p>Access resources and support for your GigGatek products.</p>
                </div>

                <div class="support-options">
                    <div class="support-card animate-on-scroll">
                        <div class="support-icon">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <h3>Frequently Asked Questions</h3>
                        <p>Find quick answers to common questions about our products, services, and policies.</p>
                        <a href="faq.php" class="btn btn-outline">View FAQs</a>
                    </div>

                    <div class="support-card animate-on-scroll" data-delay="100">
                        <div class="support-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <h3>Contact Support</h3>
                        <p>Get in touch with our customer support team for personalized assistance with your inquiries.</p>
                        <a href="contact.php" class="btn btn-outline">Contact Us</a>
                    </div>

                    <div class="support-card animate-on-scroll" data-delay="200">
                        <div class="support-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <h3>Policies & Information</h3>
                        <p>Learn about our shipping, returns, warranty, and other important policies.</p>
                        <div class="policy-links">
                            <a href="shipping-policy.php">Shipping</a> • 
                            <a href="return-policy.php">Returns</a> • 
                            <a href="warranty-information.php">Warranty</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="troubleshooting-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <h2>Common Troubleshooting</h2>
                    <p>Quick guides to resolve common issues with your hardware.</p>
                </div>

                <div class="troubleshooting-accordion">
                    <div class="accordion-item">
                        <button class="accordion-button">
                            My GPU is showing display artifacts. What should I do?
                            <span class="icon"><i class="fas fa-chevron-down"></i></span>
                        </button>
                        <div class="accordion-content">
                            <p>Display artifacts often indicate issues with GPU temperature or memory. Try these steps:</p>
                            <ol>
                                <li>Ensure your graphics card is properly seated in the PCIe slot</li>
                                <li>Check that all power connectors are securely attached</li>
                                <li>Clean your GPU fans and heatsink to improve cooling</li>
                                <li>Update to the latest graphics drivers</li>
                                <li>Monitor temperatures using software like MSI Afterburner</li>
                            </ol>
                            <p>If problems persist, please <a href="contact.php">contact our support team</a> for further assistance.</p>
                        </div>
                    </div>

                    <div class="accordion-item">
                        <button class="accordion-button">
                            My system won't boot after installing new RAM
                            <span class="icon"><i class="fas fa-chevron-down"></i></span>
                        </button>
                        <div class="accordion-content">
                            <p>Boot issues after RAM installation are common but usually easy to fix:</p>
                            <ol>
                                <li>Ensure the RAM is fully inserted and the clips are engaged</li>
                                <li>Try using just one RAM stick at a time to identify a potentially faulty module</li>
                                <li>Verify your motherboard supports the RAM capacity and speed</li>
                                <li>Reset CMOS/BIOS to default settings</li>
                                <li>Check that the RAM is installed in the correct slots according to your motherboard manual</li>
                            </ol>
                        </div>
                    </div>

                    <div class="accordion-item">
                        <button class="accordion-button">
                            How do I check my rental payment history?
                            <span class="icon"><i class="fas fa-chevron-down"></i></span>
                        </button>
                        <div class="accordion-content">
                            <p>To access your rental payment history:</p>
                            <ol>
                                <li>Log into your GigGatek account</li>
                                <li>Navigate to the Dashboard</li>
                                <li>Select the "Rentals" tab</li>
                                <li>Choose the specific rental agreement</li>
                                <li>View the "Payment History" section for a complete record of all payments</li>
                            </ol>
                            <p>You can also download payment receipts for your records from this section.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="support-contact-section">
            <div class="container">
                <div class="contact-cards">
                    <div class="contact-card">
                        <div class="contact-icon">
                            <i class="fas fa-headset"></i>
                        </div>
                        <h3>Customer Support</h3>
                        <p>Our team is available Monday-Friday, 9AM-6PM EST</p>
                        <div class="contact-info">
                            <p><strong>Phone:</strong> (555) 123-4567</p>
                            <p><strong>Email:</strong> support@giggatek.com</p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <i class="fas fa-tools"></i>
                        </div>
                        <h3>Technical Support</h3>
                        <p>For technical issues and troubleshooting</p>
                        <div class="contact-info">
                            <p><strong>Phone:</strong> (555) 234-5678</p>
                            <p><strong>Email:</strong> techsupport@giggatek.com</p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <h3>Billing & Payments</h3>
                        <p>For questions regarding orders and payments</p>
                        <div class="contact-info">
                            <p><strong>Phone:</strong> (555) 345-6789</p>
                            <p><strong>Email:</strong> billing@giggatek.com</p>
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
            // Accordion functionality
            const accordionButtons = document.querySelectorAll('.accordion-button');
            
            accordionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    this.classList.toggle('active');
                    
                    const content = this.nextElementSibling;
                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                    } else {
                        content.style.maxHeight = content.scrollHeight + "px";
                    }
                    
                    // Update icon
                    const icon = this.querySelector('.icon i');
                    if (icon.classList.contains('fa-chevron-down')) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    } else {
                        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                });
            });
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