<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Return Policy - GigGatek</title>
    <meta name="description" content="Learn about GigGatek's return and refund policies, including eligibility criteria, process, and special conditions.">

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
        
        .return-steps {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
        }
        
        .return-step {
            flex: 1;
            min-width: 200px;
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            position: relative;
        }
        
        .return-step .step-number {
            position: absolute;
            top: -15px;
            left: -15px;
            width: 40px;
            height: 40px;
            background-color: #007bff;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
        }
        
        .return-step h4 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .return-step p {
            margin-bottom: 0;
        }
        
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        
        .info-card.warning {
            border-left-color: #ffc107;
        }
        
        .info-card.danger {
            border-left-color: #dc3545;
        }
        
        .info-card.success {
            border-left-color: #28a745;
        }
        
        .info-card h4 {
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .info-card.warning h4 {
            color: #856404;
        }
        
        .info-card.danger h4 {
            color: #721c24;
        }
        
        .info-card.success h4 {
            color: #155724;
        }
        
        .info-card p {
            margin-bottom: 10px;
        }
        
        .return-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .return-table th, .return-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .return-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .return-table tr:last-child td {
            border-bottom: none;
        }
        
        .return-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .return-types {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        
        .return-type {
            flex: 1;
            min-width: 250px;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .return-type:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .return-type h4 {
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
            margin-bottom: 15px;
            color: #333;
        }
        
        .return-type ul {
            padding-left: 20px;
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
                <h1>Return Policy</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Return Policy</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="policy-content">
            <div class="container">
                <div class="policy-section animate-on-scroll">
                    <p class="last-updated">Last Updated: April 10, 2025</p>
                    <p>At GigGatek, customer satisfaction is our priority. We've designed our return policy to be fair, transparent, and hassle-free. This policy outlines the procedures, timeframes, and conditions for returning products purchased or rented from GigGatek.</p>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Return Eligibility & Timeframes</h2>
                    <p>Our standard return period varies based on product category and purchase type:</p>

                    <table class="return-table">
                        <thead>
                            <tr>
                                <th>Product Category</th>
                                <th>Return Window</th>
                                <th>Condition Requirements</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Computers & Laptops</td>
                                <td>30 days from delivery</td>
                                <td>Like-new condition with all original packaging and accessories</td>
                            </tr>
                            <tr>
                                <td>Monitors & Displays</td>
                                <td>30 days from delivery</td>
                                <td>No dead pixels, all original packaging and accessories</td>
                            </tr>
                            <tr>
                                <td>Computer Components</td>
                                <td>15 days from delivery</td>
                                <td>Unopened/unused or defective only</td>
                            </tr>
                            <tr>
                                <td>Peripherals & Accessories</td>
                                <td>14 days from delivery</td>
                                <td>Like-new condition with all original packaging</td>
                            </tr>
                            <tr>
                                <td>Networking Equipment</td>
                                <td>30 days from delivery</td>
                                <td>Like-new condition with all original packaging</td>
                            </tr>
                            <tr>
                                <td>Rent-to-Own Products</td>
                                <td>7 days from delivery</td>
                                <td>Like-new condition with all original packaging and accessories</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="info-card">
                        <h4>Important Eligibility Information</h4>
                        <p>To be eligible for a return, your item must be in the same condition that you received it. It must also be in the original packaging with all accessories, manuals, and documentation included.</p>
                        <p>Certain items are exempt from our standard return policy:</p>
                        <ul>
                            <li>Gift cards</li>
                            <li>Downloadable software products</li>
                            <li>Opened software or digital media (unless defective)</li>
                            <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                            <li>Custom-configured systems with specialized components</li>
                        </ul>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Return Process</h2>
                    <p>To ensure a smooth return experience, please follow these steps:</p>

                    <div class="return-steps">
                        <div class="return-step">
                            <div class="step-number">1</div>
                            <h4>Initiate Your Return</h4>
                            <p>Log in to your GigGatek account and navigate to "Order History." Select the order containing the item you wish to return and click "Return Item." Alternatively, contact our customer support team for assistance.</p>
                        </div>
                        <div class="return-step">
                            <div class="step-number">2</div>
                            <h4>Return Authorization</h4>
                            <p>Complete the return request form, specifying your reason for return. Once approved, you'll receive a Return Merchandise Authorization (RMA) number and return shipping instructions.</p>
                        </div>
                        <div class="return-step">
                            <div class="step-number">3</div>
                            <h4>Package Your Return</h4>
                            <p>Carefully pack the item in its original packaging with all included accessories. Place the RMA number visibly on the outside of the package and include the return form inside.</p>
                        </div>
                        <div class="return-step">
                            <div class="step-number">4</div>
                            <h4>Ship Your Return</h4>
                            <p>Use the prepaid return shipping label provided (if applicable) or ship the package to the address provided in the return instructions. We recommend using a tracked shipping method.</p>
                        </div>
                        <div class="return-step">
                            <div class="step-number">5</div>
                            <h4>Return Processing</h4>
                            <p>Once we receive your return, our team will inspect the item. This typically takes 1-3 business days. You'll receive email notifications as your return progresses.</p>
                        </div>
                        <div class="return-step">
                            <div class="step-number">6</div>
                            <h4>Refund or Replacement</h4>
                            <p>If approved, refunds will be processed to your original payment method. For replacements, a new item will be shipped once your return is processed.</p>
                        </div>
                    </div>

                    <div class="info-card warning">
                        <h4>Important Return Shipping Information</h4>
                        <p>For standard returns (non-defective items), return shipping costs are the customer's responsibility unless otherwise specified. For defective products or items shipped in error, GigGatek will provide a prepaid return shipping label.</p>
                        <p>International returns may incur additional shipping costs and customs fees.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Types of Returns</h2>
                    <div class="return-types">
                        <div class="return-type">
                            <h4>Standard Returns</h4>
                            <p>For items returned within the eligible timeframe that meet our condition requirements. You may choose between:</p>
                            <ul>
                                <li>Full refund to original payment method</li>
                                <li>Store credit (with 10% bonus value)</li>
                                <li>Product exchange</li>
                            </ul>
                        </div>
                        <div class="return-type">
                            <h4>Defective Product Returns</h4>
                            <p>For products that arrive damaged or become defective within the warranty period:</p>
                            <ul>
                                <li>Free return shipping</li>
                                <li>Priority processing</li>
                                <li>Options for repair, replacement, or refund</li>
                            </ul>
                        </div>
                        <div class="return-type">
                            <h4>Rent-to-Own Returns</h4>
                            <p>Special conditions apply to our rental products:</p>
                            <ul>
                                <li>7-day satisfaction guarantee</li>
                                <li>Return at any time during rental period (fees may apply)</li>
                                <li>Pre-paid return shipping labels provided</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Refund Processing</h2>
                    <p>Once your return is approved, refunds will be processed as follows:</p>

                    <ul>
                        <li><strong>Credit/Debit Card Payments:</strong> Refunds will be issued to the original payment card within 3-5 business days after processing. It may take an additional 5-10 business days for the refund to appear on your account statement, depending on your financial institution.</li>
                        <li><strong>PayPal Payments:</strong> Refunds will be processed within 1-2 business days and should appear in your PayPal account immediately.</li>
                        <li><strong>Store Credit/Gift Cards:</strong> Refunds to store credit or gift cards will be processed within 1-2 business days.</li>
                        <li><strong>Financing/Lease Payments:</strong> Refunds for financed or leased purchases will be processed according to the terms of your financing agreement. Please contact our customer service for specific details.</li>
                    </ul>

                    <div class="info-card">
                        <h4>Refund Amount Details</h4>
                        <p>Refunds include the price of the product and sales tax. Original shipping costs are refunded only if the return is due to our error or if the product is defective. Return shipping costs are not refundable unless otherwise specified.</p>
                        <p>If you used a coupon or promotional discount, the refund amount will reflect the actual amount paid after discounts.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Exchanges</h2>
                    <p>If you prefer to exchange your item rather than receive a refund, please indicate this on your return request form. There are two types of exchanges:</p>

                    <ul>
                        <li><strong>Even Exchange:</strong> Replace with the identical item (different size, color, etc.). Even exchanges are processed as soon as your return is received.</li>
                        <li><strong>Uneven Exchange:</strong> Replace with a different item or model. If the new item costs more, you'll need to pay the difference. If it costs less, we'll refund the difference.</li>
                    </ul>

                    <div class="info-card">
                        <h4>Exchange Availability</h4>
                        <p>Exchanges are subject to product availability. If your preferred replacement is out of stock, our customer service team will contact you to discuss alternatives or process a refund instead.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Special Conditions for Rent-to-Own Products</h2>
                    <p>Our rent-to-own products come with special return considerations:</p>

                    <ul>
                        <li><strong>7-Day Satisfaction Guarantee:</strong> If you're not completely satisfied with your rental product, you can return it within 7 days of delivery for a full refund of any payments made, excluding the initial delivery fee.</li>
                        <li><strong>Early Termination:</strong> After the initial 7-day period, you may return the rental item at any time, but early termination fees may apply as outlined in your rental agreement.</li>
                        <li><strong>Condition Requirements:</strong> Rental returns must be in good working condition with only reasonable wear and tear. Excessive damage may result in additional fees as outlined in your rental agreement.</li>
                        <li><strong>Return Shipping:</strong> Pre-paid return shipping labels are provided for all rental returns. Please use the original packaging or request replacement packaging if needed.</li>
                    </ul>

                    <div class="info-card">
                        <h4>Rental Payment Impact</h4>
                        <p>When returning a rental product, your payment obligations end on the date we receive the product back in our warehouse, assuming the product meets our condition requirements. A final statement will be issued showing any remaining balance or refund due.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Restocking Fees</h2>
                    <p>In some cases, a restocking fee may apply to returned items:</p>

                    <table class="return-table">
                        <thead>
                            <tr>
                                <th>Condition/Category</th>
                                <th>Restocking Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Unopened items with intact factory seals</td>
                                <td>No fee</td>
                            </tr>
                            <tr>
                                <td>Opened but unused items with all original packaging</td>
                                <td>5% of purchase price</td>
                            </tr>
                            <tr>
                                <td>Used items in excellent condition with all original packaging</td>
                                <td>15% of purchase price</td>
                            </tr>
                            <tr>
                                <td>Custom-configured systems</td>
                                <td>20% of purchase price</td>
                            </tr>
                            <tr>
                                <td>Defective items or items shipped in error</td>
                                <td>No fee</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="info-card warning">
                        <h4>Restocking Fee Exceptions</h4>
                        <p>Restocking fees are waived for defective products, items shipped in error, or if you're exchanging for a similar item. Restocking fees also don't apply during the 7-day satisfaction guarantee period for rent-to-own products.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Return FAQs</h2>
                    <div class="faq-container">
                        <div class="faq-item">
                            <div class="faq-question">What if my return is past the eligible return period?</div>
                            <div class="faq-answer">
                                <p>While we strictly adhere to our return timeframes, we understand that exceptional circumstances can occur. If you're outside the standard return window, please contact our customer service team to discuss your situation. Returns outside the standard window are evaluated on a case-by-case basis and may only be eligible for store credit if approved.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">Can I return a gift I received?</div>
                            <div class="faq-answer">
                                <p>Yes, gift returns are processed similarly to standard returns. You'll need the order number from the gift receipt or packing slip. Gift returns are typically issued as store credit unless the original purchaser authorizes a refund to their payment method. We'll never notify the gift giver about the return unless specifically requested.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">What happens if I receive a defective item?</div>
                            <div class="faq-answer">
                                <p>If you receive a defective item, please contact our customer service team immediately. For items defective upon delivery, we'll provide a prepaid return shipping label and arrange for a replacement or refund. For items that become defective during the warranty period, please refer to our Warranty Information page for specific procedures based on the product category.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">Do I have to pay for return shipping?</div>
                            <div class="faq-answer">
                                <p>For standard returns (non-defective items), return shipping costs are the customer's responsibility unless otherwise specified. For defective products, items shipped in error, or during promotional free-return periods, GigGatek will provide a prepaid return shipping label. For rent-to-own products, prepaid return shipping labels are always provided.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">How do I return an item that was delivered damaged?</div>
                            <div class="faq-answer">
                                <p>If your item arrives with physical damage to the product or packaging, please do the following: 1) Document the damage with photos before opening the package further, 2) Contact our customer service team within 48 hours of delivery, 3) Provide your order number and photos of the damage. We'll issue a prepaid return shipping label and arrange for a replacement or refund.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Contact Us About Returns</h2>
                    <p>If you have questions about returns that aren't addressed in this policy, please contact our customer service team:</p>
                    <ul>
                        <li>Email: returns@giggatek.com</li>
                        <li>Phone: (555) 123-4567</li>
                        <li>Live Chat: Available on our website during business hours</li>
                    </ul>
                    <p>Our return policies are subject to change. We recommend checking this page periodically for updates.</p>
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
            
            // Initialize first FAQ item as open
            if (faqQuestions.length > 0) {
                faqQuestions[0].classList.add('active');
                faqQuestions[0].nextElementSibling.style.display = 'block';
            }
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