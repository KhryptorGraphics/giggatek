<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Policy - GigGatek</title>
    <meta name="description" content="Learn about GigGatek's shipping policies, delivery timeframes, and shipping methods for all orders.">

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

    <!-- Stylesheets -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link id="language-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/modern-update.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/wishlist.css">
    <link rel="stylesheet" href="css/pwa.css">
    <link rel="stylesheet" href="css/i18n.css">

    <style>
        /* Page-specific styles */
        .policy-section {
            margin-bottom: 40px;
        }
        
        .policy-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
        }
        
        .policy-section h3 {
            color: #444;
            margin-bottom: 15px;
            font-size: 22px;
        }
        
        .policy-section p {
            margin-bottom: 15px;
            line-height: 1.6;
            color: #555;
        }
        
        .policy-section ul, .policy-section ol {
            margin-bottom: 20px;
            padding-left: 20px;
        }
        
        .policy-section li {
            margin-bottom: 10px;
            line-height: 1.6;
            color: #555;
        }
        
        .shipping-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .shipping-table th, .shipping-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .shipping-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .shipping-table tr:last-child td {
            border-bottom: none;
        }
        
        .shipping-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .shipping-info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        
        .shipping-info-card h4 {
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .shipping-info-card p {
            margin-bottom: 10px;
        }
        
        .shipping-calculator {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            margin-bottom: 40px;
        }
        
        .shipping-calculator h3 {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .calculator-form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .form-control {
            width: 100%;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .btn-calculate {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
            grid-column: span 2;
        }
        
        .btn-calculate:hover {
            background-color: #0069d9;
        }
        
        .calculation-result {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
            display: none;
        }
        
        .faq-container {
            margin-bottom: 40px;
        }
        
        .faq-item {
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        
        .faq-question {
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .faq-question::after {
            content: '\f107';
            font-family: 'Font Awesome 5 Free';
            font-weight: 900;
            transition: transform 0.3s;
        }
        
        .faq-question.active::after {
            transform: rotate(180deg);
        }
        
        .faq-answer {
            display: none;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
            margin-top: 10px;
        }
        
        .shipping-map-container {
            margin-bottom: 40px;
        }
        
        .shipping-map {
            height: 400px;
            border-radius: 8px;
            overflow: hidden;
        }
        
        @media (max-width: 768px) {
            .calculator-form {
                grid-template-columns: 1fr;
            }
            
            .btn-calculate {
                grid-column: span 1;
            }
        }
    </style>
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
                <h1>Shipping Policy</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Shipping Policy</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="policy-content">
            <div class="container">
                <div class="policy-section animate-on-scroll">
                    <p class="last-updated">Last Updated: April 10, 2025</p>
                    <p>At GigGatek, we strive to deliver your orders as quickly and efficiently as possible. This policy outlines our shipping procedures, delivery timeframes, and associated costs to ensure you have a clear understanding of our shipping process.</p>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Shipping Methods & Timeframes</h2>
                    <p>We offer several shipping options to best meet your needs. Delivery timeframes are estimates and may vary based on your location and product availability.</p>

                    <table class="shipping-table">
                        <thead>
                            <tr>
                                <th>Shipping Method</th>
                                <th>Estimated Delivery Time</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Standard Shipping</td>
                                <td>5-7 business days</td>
                                <td>$8.99</td>
                            </tr>
                            <tr>
                                <td>Expedited Shipping</td>
                                <td>3-5 business days</td>
                                <td>$14.99</td>
                            </tr>
                            <tr>
                                <td>Express Shipping</td>
                                <td>1-2 business days</td>
                                <td>$24.99</td>
                            </tr>
                            <tr>
                                <td>Free Shipping</td>
                                <td>7-10 business days</td>
                                <td>Free on orders over $99</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="shipping-info-card">
                        <h4>Business Days</h4>
                        <p>Please note that our shipping timeframes are based on business days (Monday through Friday), excluding holidays. Orders placed on weekends or holidays will be processed on the next business day.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Shipping Limitations & Service Areas</h2>
                    <p>Currently, GigGatek ships to all 50 United States, Canada, and select international destinations. Please be aware of the following limitations:</p>

                    <ul>
                        <li><strong>APO/FPO/DPO Addresses:</strong> We do ship to APO/FPO/DPO addresses using USPS, but delivery times may be longer than standard timeframes.</li>
                        <li><strong>P.O. Boxes:</strong> We can ship to P.O. Boxes for smaller items, but larger products may require a physical address.</li>
                        <li><strong>International Shipping:</strong> Additional duties, taxes, and customs fees may apply for international orders and are the responsibility of the recipient.</li>
                        <li><strong>Alaska & Hawaii:</strong> Additional shipping charges may apply for orders shipping to Alaska and Hawaii.</li>
                        <li><strong>Remote Areas:</strong> Some remote locations may incur additional delivery fees or experience longer delivery timeframes.</li>
                    </ul>

                    <div class="shipping-map-container">
                        <div class="shipping-map">
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12505.282474840483!2d-97.73675535000001!3d30.2849982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b599a0cc032f%3A0x5d9b464bd469d57a!2sAustin%2C%20TX%2C%20USA!5e0!3m2!1sen!2sus!4v1649861787100!5m2!1sen!2sus" width="100%" height="100%" allowfullscreen="" loading="lazy"></iframe>
                        </div>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Order Processing</h2>
                    <p>Orders are typically processed within 1-2 business days after payment confirmation. During high-volume periods (such as holidays) or for custom-configured items, processing may take additional time.</p>

                    <h3>Order Verification</h3>
                    <p>For security purposes, some orders may require verification before processing, which could result in slight delays. We'll contact you promptly if additional information is needed.</p>

                    <h3>Tracking Information</h3>
                    <p>Once your order ships, you'll receive a confirmation email with tracking information. You can also view your order status and tracking details in your GigGatek account under "Order History."</p>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Shipping Calculator</h2>
                    <div class="shipping-calculator">
                        <h3>Estimate Your Shipping Cost</h3>
                        <form id="shipping-calculator-form" class="calculator-form">
                            <div class="form-group">
                                <label for="postal-code">Postal/ZIP Code:</label>
                                <input type="text" id="postal-code" class="form-control" placeholder="Enter your postal/ZIP code">
                            </div>
                            <div class="form-group">
                                <label for="country">Country:</label>
                                <select id="country" class="form-control">
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="MX">Mexico</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="order-value">Order Value ($):</label>
                                <input type="number" id="order-value" class="form-control" min="0" step="0.01" placeholder="Enter order value">
                            </div>
                            <div class="form-group">
                                <label for="shipping-method">Shipping Method:</label>
                                <select id="shipping-method" class="form-control">
                                    <option value="standard">Standard Shipping</option>
                                    <option value="expedited">Expedited Shipping</option>
                                    <option value="express">Express Shipping</option>
                                </select>
                            </div>
                            <button type="button" class="btn-calculate" id="calculate-shipping">Calculate Shipping</button>
                            
                            <div class="calculation-result" id="calculation-result">
                                <h4>Estimated Shipping:</h4>
                                <p id="shipping-cost">$0.00</p>
                                <p id="delivery-estimate">Estimated delivery: </p>
                                <p id="free-shipping-message"></p>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Shipping for Rental Products</h2>
                    <p>For rent-to-own products, we offer the following shipping options:</p>

                    <ul>
                        <li><strong>Standard Rental Shipping:</strong> Free shipping on all rental orders.</li>
                        <li><strong>Expedited Rental Shipping:</strong> Available for an additional fee of $9.99.</li>
                        <li><strong>Return Shipping:</strong> Pre-paid return shipping labels are provided for all rental returns.</li>
                    </ul>

                    <div class="shipping-info-card">
                        <h4>Important Rental Shipping Information</h4>
                        <p>All rental products must be returned in their original packaging using our provided return shipping labels. Failure to use the provided shipping labels may result in difficulties tracking your return and potential delays in processing.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Package Delivery & Acceptance</h2>
                    <p>By placing an order with GigGatek, you agree to the following delivery terms:</p>

                    <ol>
                        <li>It is your responsibility to ensure someone is available to receive the package or that it can be safely left at the delivery location.</li>
                        <li>For large item deliveries, we may contact you to schedule a delivery appointment.</li>
                        <li>We strongly recommend inspecting all packages upon receipt. Please report any visible damage immediately to the delivery carrier and contact our customer service team.</li>
                        <li>Once a package is marked as "Delivered" by the carrier, GigGatek is not responsible for packages that are lost, stolen, or damaged after delivery.</li>
                    </ol>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Shipping FAQs</h2>
                    <div class="faq-container">
                        <div class="faq-item">
                            <div class="faq-question">Can I change my shipping address after placing an order?</div>
                            <div class="faq-answer">
                                <p>Address changes may be possible if your order hasn't been processed yet. Please contact our customer service team immediately at support@giggatek.com or call (555) 123-4567. We cannot guarantee that address changes will be possible once an order has entered the fulfillment process.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">What should I do if my package is damaged?</div>
                            <div class="faq-answer">
                                <p>If you receive a damaged package, please: 1) Take photos of the damaged packaging and product, 2) Note the damage when signing for the package if possible, 3) Contact our customer service team within 48 hours of delivery with your order number and photos of the damage.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">Do you offer same-day delivery?</div>
                            <div class="faq-answer">
                                <p>We currently do not offer same-day delivery services. Our fastest shipping option is Express Shipping, which typically delivers within 1-2 business days depending on your location and the time of order placement.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">Can I expedite an order I've already placed?</div>
                            <div class="faq-answer">
                                <p>If your order hasn't shipped yet, you may be able to upgrade your shipping method. Please contact our customer service team as soon as possible with your order number to inquire about expediting options. Additional shipping charges will apply.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">What countries do you ship to?</div>
                            <div class="faq-answer">
                                <p>GigGatek currently ships to all 50 United States, Canada, Mexico, the United Kingdom, Australia, and select countries in the European Union. International shipping rates and delivery timeframes vary by destination. For specific information about shipping to your country, please contact our customer service team.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Contact Us About Shipping</h2>
                    <p>If you have questions about shipping that aren't addressed in this policy, please contact our customer service team:</p>
                    <ul>
                        <li>Email: support@giggatek.com</li>
                        <li>Phone: (555) 123-4567</li>
                        <li>Live Chat: Available on our website during business hours</li>
                    </ul>
                    <p>Our shipping policies are subject to change. We recommend checking this page periodically for updates.</p>
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
            // FAQ Accordion
            const faqQuestions = document.querySelectorAll('.faq-question');
            
            faqQuestions.forEach(question => {
                question.addEventListener('click', function() {
                    const answer = this.nextElementSibling;
                    const isActive = this.classList.contains('active');
                    
                    // Close all other FAQs
                    faqQuestions.forEach(q => {
                        q.classList.remove('active');
                        q.nextElementSibling.style.display = 'none';
                    });
                    
                    // If the clicked FAQ wasn't active, open it
                    if (!isActive) {
                        this.classList.add('active');
                        answer.style.display = 'block';
                    }
                });
            });
            
            // Shipping Calculator
            const calculateBtn = document.getElementById('calculate-shipping');
            
            calculateBtn.addEventListener('click', function() {
                const postalCode = document.getElementById('postal-code').value;
                const country = document.getElementById('country').value;
                const orderValue = parseFloat(document.getElementById('order-value').value) || 0;
                const shippingMethod = document.getElementById('shipping-method').value;
                
                if (!postalCode) {
                    alert('Please enter a postal/ZIP code');
                    return;
                }
                
                // Simple shipping cost calculation logic
                let shippingCost = 0;
                let deliveryDays = '';
                let freeShippingMessage = '';
                
                if (country === 'US') {
                    // US shipping
                    if (shippingMethod === 'standard') {
                        shippingCost = 8.99;
                        deliveryDays = '5-7 business days';
                    } else if (shippingMethod === 'expedited') {
                        shippingCost = 14.99;
                        deliveryDays = '3-5 business days';
                    } else if (shippingMethod === 'express') {
                        shippingCost = 24.99;
                        deliveryDays = '1-2 business days';
                    }
                    
                    // Free shipping for US orders over $99
                    if (orderValue >= 99 && shippingMethod === 'standard') {
                        freeShippingMessage = 'Congratulations! Your order qualifies for FREE shipping!';
                        shippingCost = 0;
                    } else if (orderValue < 99) {
                        const remaining = (99 - orderValue).toFixed(2);
                        freeShippingMessage = `Add $${remaining} more to your order to qualify for FREE shipping!`;
                    }
                } else {
                    // International shipping
                    if (shippingMethod === 'standard') {
                        shippingCost = 24.99;
                        deliveryDays = '7-14 business days';
                    } else if (shippingMethod === 'expedited') {
                        shippingCost = 34.99;
                        deliveryDays = '5-7 business days';
                    } else if (shippingMethod === 'express') {
                        shippingCost = 49.99;
                        deliveryDays = '3-5 business days';
                    }
                    
                    // Free shipping for international orders over $199
                    if (orderValue >= 199 && shippingMethod === 'standard') {
                        freeShippingMessage = 'Congratulations! Your order qualifies for FREE international shipping!';
                        shippingCost = 0;
                    } else if (orderValue < 199) {
                        const remaining = (199 - orderValue).toFixed(2);
                        freeShippingMessage = `Add $${remaining} more to your order to qualify for FREE international shipping!`;
                    }
                }
                
                // Display results
                document.getElementById('shipping-cost').textContent = `$${shippingCost.toFixed(2)}`;
                document.getElementById('delivery-estimate').textContent = `Estimated delivery: ${deliveryDays}`;
                document.getElementById('free-shipping-message').textContent = freeShippingMessage;
                document.getElementById('calculation-result').style.display = 'block';
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