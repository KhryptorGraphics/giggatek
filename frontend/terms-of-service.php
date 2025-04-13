<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service - GigGatek</title>
    <meta name="description" content="Read the legal terms and conditions for using GigGatek's website, purchasing products, and participating in our rent-to-own program.">

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
        .terms-section {
            margin-bottom: 45px;
        }
        
        .terms-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }
        
        .terms-section h3 {
            color: #444;
            margin: 25px 0 15px;
            font-size: 22px;
        }
        
        .terms-section p {
            margin-bottom: 15px;
            line-height: 1.7;
            color: #555;
        }
        
        .terms-section ul, .terms-section ol {
            margin-bottom: 20px;
            padding-left: 25px;
        }
        
        .terms-section li {
            margin-bottom: 10px;
            line-height: 1.7;
            color: #555;
        }
        
        .terms-toc {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .terms-toc h3 {
            margin-top: 0;
            margin-bottom: 15px;
        }
        
        .terms-toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .terms-toc ul li {
            margin-bottom: 10px;
        }
        
        .terms-toc ul li a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .terms-toc ul li a:hover {
            color: #0056b3;
            text-decoration: underline;
        }
        
        .terms-toc .toc-level-2 {
            padding-left: 20px;
        }
        
        .terms-date {
            text-align: right;
            font-style: italic;
            color: #777;
            margin-bottom: 30px;
        }
        
        .info-callout {
            background-color: #e8f4fd;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        
        .info-callout.warning {
            background-color: #fff3cd;
            border-left-color: #ffc107;
        }
        
        .info-callout.important {
            background-color: #f8d7da;
            border-left-color: #dc3545;
        }
        
        .info-callout h4 {
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .info-callout.warning h4 {
            color: #856404;
        }
        
        .info-callout.important h4 {
            color: #721c24;
        }
        
        .terms-agreement {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 40px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            text-align: center;
        }
        
        .terms-agreement p {
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .btn-primary {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary:hover {
            background-color: #0069d9;
        }
        
        .definitions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .definitions-table th, .definitions-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .definitions-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .definitions-table tr:last-child td {
            border-bottom: none;
        }
        
        .definitions-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        @media (max-width: 768px) {
            .definitions-table {
                display: block;
                overflow-x: auto;
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
                <h1>Terms of Service</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Terms of Service</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="terms-content">
            <div class="container">
                <div class="terms-date animate-on-scroll">
                    <p>Last Updated: April 10, 2025</p>
                </div>

                <div class="info-callout animate-on-scroll">
                    <h4>IMPORTANT NOTICE</h4>
                    <p>These Terms of Service ("Terms") govern your use of the GigGatek website, products, and services, including our rent-to-own program. Please read these Terms carefully before using our services. By accessing or using our website or services, you agree to be bound by these Terms, our <a href="privacy-policy.php">Privacy Policy</a>, and any additional terms referenced herein.</p>
                    <p>If you do not agree to these Terms, please do not use our website or services.</p>
                </div>

                <div class="terms-toc animate-on-scroll">
                    <h3>Table of Contents</h3>
                    <ul>
                        <li><a href="#definitions">1. Definitions</a></li>
                        <li><a href="#acceptance">2. Acceptance of Terms</a></li>
                        <li><a href="#account">3. User Accounts</a></li>
                        <li><a href="#purchase">4. Purchase Terms</a></li>
                        <li><a href="#rent-to-own">5. Rent-to-Own Program</a></li>
                        <li><a href="#payment">6. Payment Terms</a></li>
                        <li><a href="#shipping">7. Shipping and Delivery</a></li>
                        <li><a href="#returns">8. Returns and Refunds</a></li>
                        <li><a href="#warranty">9. Warranty Information</a></li>
                        <li><a href="#intellectual-property">10. Intellectual Property</a></li>
                        <li><a href="#user-content">11. User Content</a></li>
                        <li><a href="#prohibited-activities">12. Prohibited Activities</a></li>
                        <li><a href="#termination">13. Termination</a></li>
                        <li><a href="#disclaimer">14. Disclaimer of Warranties</a></li>
                        <li><a href="#limitation">15. Limitation of Liability</a></li>
                        <li><a href="#indemnification">16. Indemnification</a></li>
                        <li><a href="#dispute">17. Dispute Resolution</a></li>
                        <li><a href="#governing-law">18. Governing Law</a></li>
                        <li><a href="#changes">19. Changes to Terms</a></li>
                        <li><a href="#contact">20. Contact Information</a></li>
                    </ul>
                </div>

                <div id="definitions" class="terms-section animate-on-scroll">
                    <h2>1. Definitions</h2>
                    <p>To help you understand these Terms, here are definitions of key terms used throughout:</p>
                    
                    <table class="definitions-table">
                        <tr>
                            <th>Term</th>
                            <th>Definition</th>
                        </tr>
                        <tr>
                            <td>"GigGatek," "we," "us," or "our"</td>
                            <td>Refers to GigGatek, Inc., its subsidiaries, affiliates, officers, employees, agents, partners, and contractors.</td>
                        </tr>
                        <tr>
                            <td>"Website" or "Site"</td>
                            <td>Refers to the website located at www.giggatek.com, all associated websites and subdomains, and any mobile applications we provide.</td>
                        </tr>
                        <tr>
                            <td>"Services"</td>
                            <td>Refers to all products, services, content, features, technologies, functions, and websites offered or provided by GigGatek.</td>
                        </tr>
                        <tr>
                            <td>"User," "you," or "your"</td>
                            <td>Refers to any individual or entity that accesses or uses our Services.</td>
                        </tr>
                        <tr>
                            <td>"Account"</td>
                            <td>Refers to the registered account created by a User to access certain features of our Services.</td>
                        </tr>
                        <tr>
                            <td>"User Content"</td>
                            <td>Refers to any content, materials, or information (including reviews, comments, feedback, suggestions, ideas) that you submit, post, or display on or through our Services.</td>
                        </tr>
                        <tr>
                            <td>"Rent-to-Own Program"</td>
                            <td>Refers to our program that allows users to rent products with an option to apply rental payments toward eventual ownership.</td>
                        </tr>
                    </table>
                </div>

                <div id="acceptance" class="terms-section animate-on-scroll">
                    <h2>2. Acceptance of Terms</h2>
                    <p>By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms, our <a href="privacy-policy.php">Privacy Policy</a>, and any additional terms referenced herein. If you are using our Services on behalf of a company, organization, or other entity, you represent and warrant that you have the authority to bind that entity to these Terms.</p>
                    
                    <p>You must be at least 18 years old and capable of forming a legally binding contract to use our Services. If you are under 18, you may only use our Services under the supervision of a parent or legal guardian who agrees to be bound by these Terms.</p>
                    
                    <p>We reserve the right to change or modify these Terms at any time, as described in Section 19 below. Your continued use of our Services following any changes constitutes your acceptance of the revised Terms.</p>
                </div>

                <div id="account" class="terms-section animate-on-scroll">
                    <h2>3. User Accounts</h2>
                    
                    <h3>3.1 Account Creation</h3>
                    <p>To access certain features of our Services, you may need to create an account. When you create an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    
                    <h3>3.2 Account Security</h3>
                    <p>You are responsible for safeguarding your password and for any activities or actions taken using your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot and will not be liable for any loss or damage arising from your failure to protect your account information, including your password.</p>
                    
                    <h3>3.3 Account Types</h3>
                    <p>We may offer different types of accounts with various features and benefits. Some accounts may have additional terms and conditions that apply. We reserve the right to modify, suspend, or discontinue account types at any time.</p>
                    
                    <h3>3.4 Account Termination</h3>
                    <p>We reserve the right to suspend or terminate your account and your access to our Services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason. We may also suspend or terminate your account if you haven't accessed it for an extended period.</p>
                    
                    <div class="info-callout warning">
                        <h4>Important Notice About Account Information</h4>
                        <p>You are responsible for keeping your account information, including your email address and payment methods, current and accurate. Failure to maintain accurate account information may result in your inability to access our Services or receive important notifications about your orders or account status.</p>
                    </div>
                </div>

                <div id="purchase" class="terms-section animate-on-scroll">
                    <h2>4. Purchase Terms</h2>
                    
                    <h3>4.1 Product Listings</h3>
                    <p>We strive to provide accurate product descriptions, pricing, and availability information. However, we do not warrant that product descriptions, pricing, or other content on our Site is accurate, complete, reliable, current, or error-free. If a product offered through our Services is not as described, your sole remedy is to return it in an unused condition according to our <a href="return-policy.php">Return Policy</a>.</p>
                    
                    <h3>4.2 Pricing and Availability</h3>
                    <p>All prices are shown in US dollars unless otherwise specified. We reserve the right to change prices at any time without notice. The availability of products is subject to change without notice. We reserve the right to limit quantities of items purchased.</p>
                    
                    <h3>4.3 Order Acceptance</h3>
                    <p>Your receipt of an order confirmation does not constitute our acceptance of your order. We reserve the right to accept or reject your order for any reason, including but not limited to product availability, errors in product or pricing information, or problems identified by our credit or fraud departments.</p>
                    
                    <h3>4.4 Refurbished Products</h3>
                    <p>Many of our products are refurbished. Refurbished products have been previously used but have been restored to working condition. These products may show signs of use or cosmetic imperfections. Each product listing will indicate whether the product is refurbished and its condition grade. By purchasing a refurbished product, you acknowledge that you understand the product is not new and may have some imperfections or signs of use.</p>
                    
                    <div class="info-callout">
                        <h4>About Our Refurbished Products</h4>
                        <p>Our refurbished products undergo a thorough inspection and quality assurance process to ensure they meet our standards. We offer different condition grades:</p>
                        <ul>
                            <li><strong>Grade A:</strong> Like-new condition with minimal to no cosmetic imperfections.</li>
                            <li><strong>Grade B:</strong> Good condition with some cosmetic imperfections (scratches, scuffs, etc.) that do not affect functionality.</li>
                            <li><strong>Grade C:</strong> Fair condition with noticeable cosmetic imperfections, but fully functional.</li>
                        </ul>
                        <p>All refurbished products come with our standard warranty appropriate to their product category, as outlined in our <a href="warranty-information.php">Warranty Information</a>.</p>
                    </div>
                </div>

                <div id="rent-to-own" class="terms-section animate-on-scroll">
                    <h2>5. Rent-to-Own Program</h2>
                    
                    <h3>5.1 Program Overview</h3>
                    <p>Our Rent-to-Own Program allows eligible customers to rent products with an option to purchase them by making regular rental payments. After a specified number of payments, you may gain ownership of the product or return it according to the terms of your rental agreement.</p>
                    
                    <h3>5.2 Eligibility</h3>
                    <p>To be eligible for our Rent-to-Own Program, you must:</p>
                    <ul>
                        <li>Be at least 18 years old</li>
                        <li>Have a valid government-issued ID</li>
                        <li>Provide proof of income</li>
                        <li>Have a valid credit or debit card and bank account</li>
                        <li>Meet any additional criteria specified in the rental application</li>
                    </ul>
                    
                    <h3>5.3 Rental Agreement</h3>
                    <p>When you participate in our Rent-to-Own Program, you will enter into a separate rental agreement that outlines the specific terms of your rental, including payment amounts, payment schedule, rental duration, and ownership options. The rental agreement is a legally binding contract that supplements these Terms.</p>
                    
                    <h3>5.4 Ownership Transfer</h3>
                    <p>Ownership of the rented product will transfer to you only after you have made all required payments as specified in your rental agreement or exercised the early purchase option according to the terms of your rental agreement. Until ownership transfers, the product remains the property of GigGatek.</p>
                    
                    <h3>5.5 Early Purchase Option</h3>
                    <p>Your rental agreement may include an option to purchase the product before the end of the rental term. The early purchase price will be calculated based on the terms specified in your rental agreement.</p>
                    
                    <h3>5.6 Product Return</h3>
                    <p>If you choose to return the product before completing all payments required for ownership, you must return it in good working condition, subject only to reasonable wear and tear. Additional fees may apply for damaged, non-functional, or incomplete returns as specified in your rental agreement.</p>
                    
                    <h3>5.7 Default</h3>
                    <p>If you fail to make payments as specified in your rental agreement, you will be in default. In the event of default, we may take actions including but not limited to terminating your rental agreement, requiring the return of the product, and pursuing collection of amounts owed, consistent with applicable law.</p>
                    
                    <div class="info-callout warning">
                        <h4>Important Notice About Rent-to-Own</h4>
                        <p>The total cost of acquiring a product through our Rent-to-Own Program may be higher than purchasing the product outright. Please review your rental agreement carefully before entering into it. If you have questions about the terms, please contact our customer service team before signing the agreement.</p>
                    </div>
                </div>

                <div id="payment" class="terms-section animate-on-scroll">
                    <h2>6. Payment Terms</h2>
                    
                    <h3>6.1 Payment Methods</h3>
                    <p>We accept various payment methods, including major credit cards, debit cards, and other payment methods as indicated during the checkout process. By providing a payment method, you represent that you are authorized to use the payment method and that the payment information you provide is accurate and complete.</p>
                    
                    <h3>6.2 Billing</h3>
                    <p>For one-time purchases, you will be charged at the time of purchase. For the Rent-to-Own Program, you will be billed according to the payment schedule specified in your rental agreement. You authorize us to charge your payment method for all amounts due under these Terms or your rental agreement.</p>
                    
                    <h3>6.3 Late Payments</h3>
                    <p>If your payment is not received by the due date, we may charge late fees as permitted by law and as specified in your rental agreement (for Rent-to-Own customers). We may also suspend or terminate your access to our Services, including repossession of rented products for Rent-to-Own customers, consistent with applicable law.</p>
                    
                    <h3>6.4 Taxes</h3>
                    <p>You are responsible for paying all taxes, duties, and similar charges associated with your transactions on our Site, including sales tax, value-added tax, and use tax. We will collect and remit taxes where required by law.</p>
                    
                    <h3>6.5 Recurring Payments for Rent-to-Own</h3>
                    <p>If you participate in our Rent-to-Own Program, you authorize us to store your payment method and to automatically charge the payment method on file according to your rental agreement until all payments have been made or the agreement is otherwise terminated.</p>
                </div>

                <div id="shipping" class="terms-section animate-on-scroll">
                    <h2>7. Shipping and Delivery</h2>
                    <p>Our shipping and delivery terms are detailed in our <a href="shipping-policy.php">Shipping Policy</a>, which is incorporated by reference into these Terms. By placing an order, you agree to the terms of our Shipping Policy.</p>
                    
                    <p>Key shipping terms include:</p>
                    <ul>
                        <li>We ship to addresses within the United States and select international destinations.</li>
                        <li>Shipping times and costs vary based on product, destination, and shipping method selected.</li>
                        <li>Risk of loss and title for products purchased from our Site pass to you upon our delivery to the carrier.</li>
                        <li>You are responsible for inspecting products upon delivery and reporting any visible damage to the carrier and to us promptly.</li>
                    </ul>
                </div>

                <div id="returns" class="terms-section animate-on-scroll">
                    <h2>8. Returns and Refunds</h2>
                    <p>Our return and refund policies are detailed in our <a href="return-policy.php">Return Policy</a>, which is incorporated by reference into these Terms. By placing an order, you agree to the terms of our Return Policy.</p>
                    
                    <p>Key return terms include:</p>
                    <ul>
                        <li>Most products can be returned within 30 days of delivery for a full refund or exchange.</li>
                        <li>Products must be in their original condition, including packaging, accessories, and documentation.</li>
                        <li>Some products, such as software with broken seals or customized items, may not be eligible for return.</li>
                        <li>Return shipping costs may be the responsibility of the customer unless the return is due to our error or a defective product.</li>
                    </ul>
                </div>

                <div id="warranty" class="terms-section animate-on-scroll">
                    <h2>9. Warranty Information</h2>
                    <p>Our warranty terms are detailed in our <a href="warranty-information.php">Warranty Information</a> page, which is incorporated by reference into these Terms. The specific warranty coverage for a product depends on the product category and whether the product is new, refurbished, or part of our Rent-to-Own Program.</p>
                    
                    <p>Generally, our warranties cover manufacturing defects and hardware failures during the specified warranty period but do not cover damage from accidents, misuse, or normal wear and tear. Extended warranty options may be available for purchase with certain products.</p>
                </div>

                <div id="intellectual-property" class="terms-section animate-on-scroll">
                    <h2>10. Intellectual Property</h2>
                    
                    <h3>10.1 Our Intellectual Property</h3>
                    <p>The content, organization, graphics, design, compilation, look and feel, and other matters related to our Site are protected by applicable copyright, trademark, and other intellectual property laws. All intellectual property rights in the Site and its content (including but not limited to text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software) are owned by GigGatek or its licensors.</p>
                    
                    <h3>10.2 Limited License</h3>
                    <p>We grant you a limited, non-exclusive, non-transferable license to access and use our Site for personal, non-commercial purposes. This license does not include:</p>
                    <ul>
                        <li>Any resale or commercial use of our Site or its contents</li>
                        <li>Any collection and use of product listings, descriptions, or prices</li>
                        <li>Any derivative use of our Site or its contents</li>
                        <li>Any downloading or copying of account information for the benefit of another merchant</li>
                        <li>Any use of data mining, robots, or similar data gathering and extraction tools</li>
                    </ul>
                    
                    <h3>10.3 Trademarks</h3>
                    <p>GigGatek, the GigGatek logo, and other marks indicated on our Site are trademarks or registered trademarks of GigGatek or its affiliates. Other trademarks not owned by us that appear on our Site are the property of their respective owners, who may or may not be affiliated with, connected to, or sponsored by us.</p>
                    
                    <h3>10.4 Third-Party Intellectual Property</h3>
                    <p>We respect the intellectual property rights of others and expect users of our Services to do the same. We will respond to notices of alleged copyright infringement that comply with applicable law. If you believe your work has been copied in a way that constitutes copyright infringement, please provide us with the following information:</p>
                    <ul>
                        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
                        <li>Identification of the copyrighted work claimed to have been infringed</li>
                        <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity</li>
                        <li>Your contact information, including your address, telephone number, and an email address</li>
                        <li>A statement by you that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law</li>
                        <li>A statement that the information in the notification is accurate, and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
                    </ul>
                    <p>You can submit copyright infringement notices to our designated agent at: legal@giggatek.com</p>
                </div>

                <div id="user-content" class="terms-section animate-on-scroll">
                    <h2>11. User Content</h2>
                    
                    <h3>11.1 Content Submission</h3>
                    <p>Our Services may allow you to submit or post content, such as reviews, comments, suggestions, ideas, or other materials ("User Content"). You retain ownership of your User Content, but by submitting or posting it, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content throughout the world in any media.</p>
                    
                    <h3>11.2 Content Restrictions</h3>
                    <p>You agree not to submit or post User Content that:</p>
                    <ul>
                        <li>Is false, misleading, defamatory, obscene, abusive, hateful, threatening, or harassing</li>
                        <li>Infringes or violates any patent, trademark, trade secret, copyright, or other intellectual property or proprietary right</li>
                        <li>Violates the privacy or publicity rights of any person</li>
                        <li>Contains software viruses, malware, or any other harmful code</li>
                        <li>Constitutes unauthorized or unsolicited advertising, junk or bulk email ("spamming")</li>
                        <li>Violates any applicable law or these Terms</li>
                    </ul>
                    
                    <h3>11.3 Content Monitoring</h3>
                    <p>We do not have an obligation to monitor User Content, but we reserve the right to review and remove any User Content for any reason, including but not limited to violation of these Terms. We may also impose limits on certain features or restrict your access to parts or all of our Services without notice or liability.</p>
                    
                    <h3>11.4 Feedback</h3>
                    <p>If you provide us with feedback or suggestions about our Services, you agree that we may use such feedback or suggestions without compensation or obligation to you.</p>
                </div>

                <div id="prohibited-activities" class="terms-section animate-on-scroll">
                    <h2>12. Prohibited Activities</h2>
                    <p>In addition to other prohibitions set forth in these Terms, you agree not to:</p>
                    <ul>
                        <li>Use our Services for any illegal purpose or in violation of any local, state, national, or international law</li>
                        <li>Violate or encourage others to violate the rights of third parties, including intellectual property rights</li>
                        <li>Interfere with or disrupt our Services or servers or networks connected to our Services</li>
                        <li>Attempt to gain unauthorized access to our Services, user accounts, or computer systems or networks</li>
                        <li>Harvest or collect user information, including email addresses, without consent</li>
                        <li>Use the Services to transmit any computer viruses, worms, defects, Trojan horses, or other destructive items</li>
                        <li>Manipulate identifiers to disguise the origin of any content transmitted through the Services</li>
                        <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity</li>
                        <li>Use automated scripts to collect information from or otherwise interact with our Services</li>
                        <li>Create multiple accounts for disruptive or abusive purposes</li>
                        <li>Attempt to circumvent any technology used by us or our partners to protect our Services or content</li>
                        <li>Use the Services in a manner inconsistent with these Terms</li>
                    </ul>
                    
                    <div class="info-callout important">
                        <h4>Important</h4>
                        <p>Violating these prohibitions may result in the termination of your account, prohibition from using our Services, and/or legal action, including but not limited to civil and criminal liability.</p>
                    </div>
                </div>

                <div id="termination" class="terms-section animate-on-scroll">
                    <h2>13. Termination</h2>
                    <p>We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason, including but not limited to if you breach these Terms. Upon termination, your right to use our Services will immediately cease.</p>
                    
                    <p>If you have an active rental agreement under our Rent-to-Own Program, termination of your account does not terminate your obligations under that agreement. You remain bound by the terms of your rental agreement until it is properly terminated or completed according to its terms.</p>
                    
                    <p>All provisions of these Terms which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
                </div>

                <div id="disclaimer" class="terms-section animate-on-scroll">
                    <h2>14. Disclaimer of Warranties</h2>
                    <p>YOUR USE OF OUR SERVICES IS AT YOUR SOLE RISK. OUR SERVICES AND ALL PRODUCTS AND SERVICES DELIVERED TO YOU THROUGH OUR SERVICES ARE (EXCEPT AS EXPRESSLY STATED BY US) PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
                    
                    <p>WITHOUT LIMITING THE FOREGOING, WE EXPLICITLY DISCLAIM ANY WARRANTIES REGARDING:</p>
                    <ul>
                        <li>THE ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT ON OUR SITE</li>
                        <li>THE OPERATION OF OUR SITE BEING UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS</li>
                        <li>THE CORRECTION OF DEFECTS OR ERRORS IN OUR SERVICES</li>
                        <li>THAT OUR SERVICES OR THE SERVERS THAT MAKE OUR SERVICES AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS</li>
                    </ul>
                    
                    <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.</p>
                </div>

                <div id="limitation" class="terms-section animate-on-scroll">
                    <h2>15. Limitation of Liability</h2>
                    <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL GIGGATEK, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:</p>
                    <ul>
                        <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE OUR SERVICES</li>
                        <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON OUR SERVICES</li>
                        <li>ANY CONTENT OBTAINED FROM OUR SERVICES</li>
                        <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
                    </ul>
                    
                    <p>WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.</p>
                    
                    <p>IN NO EVENT SHALL OUR AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF OUR SERVICES EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US FOR PURCHASES OR RENTALS DURING THE SIX (6) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY, OR (B) $100.</p>
                    
                    <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.</p>
                </div>

                <div id="indemnification" class="terms-section animate-on-scroll">
                    <h2>16. Indemnification</h2>
                    <p>You agree to indemnify, defend, and hold harmless GigGatek, its affiliates, officers, directors, employees, agents, licensors, and suppliers from and against all losses, expenses, damages, and costs, including reasonable attorneys' fees, resulting from any violation of these Terms by you or any activity related to your account (including negligent or wrongful conduct) by you or any other person accessing our Services using your account.</p>
                </div>

                <div id="dispute" class="terms-section animate-on-scroll">
                    <h2>17. Dispute Resolution</h2>
                    
                    <h3>17.1 Agreement to Arbitrate</h3>
                    <p>You and GigGatek agree that any dispute, claim, or controversy arising out of or relating to these Terms or your use of our Services shall be resolved through binding arbitration, except that either party may seek relief in small claims court for disputes or claims within the scope of that court's jurisdiction.</p>
                    
                    <h3>17.2 Arbitration Procedures</h3>
                    <p>The arbitration will be conducted by the American Arbitration Association (AAA) under its rules, including the AAA's Consumer Arbitration Rules, available at www.adr.org. The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing but need not provide a statement of reasons unless requested by a party.</p>
                    
                    <h3>17.3 Class Action Waiver</h3>
                    <p>YOU AND GIGGATEK AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. Unless both you and GigGatek agree otherwise, the arbitrator may not consolidate more than one person's claims and may not otherwise preside over any form of a representative or class proceeding.</p>
                    
                    <h3>17.4 Exceptions to Arbitration</h3>
                    <p>Notwithstanding the foregoing, either party may seek emergency equitable relief in any court of competent jurisdiction to protect its intellectual property rights pending the completion of arbitration. Also, you or GigGatek may seek relief in small claims court for disputes or claims within the scope of that court's jurisdiction.</p>
                    
                    <h3>17.5 Opt-Out Right</h3>
                    <p>You have the right to opt out of the arbitration and class action waiver provisions set forth above by sending written notice of your decision to opt out to legal@giggatek.com within 30 days of first accepting these Terms. If you opt out of these arbitration provisions, we also will not be bound by them.</p>
                </div>

                <div id="governing-law" class="terms-section animate-on-scroll">
                    <h2>18. Governing Law</h2>
                    <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.</p>
                </div>

                <div id="changes" class="terms-section animate-on-scroll">
                    <h2>19. Changes to Terms</h2>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                    
                    <p>By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use our Services.</p>
                </div>

                <div id="contact" class="terms-section animate-on-scroll">
                    <h2>20. Contact Information</h2>
                    <p>If you have any questions about these Terms, please contact us at:</p>
                    <p>
                        <strong>GigGatek Legal Department</strong><br>
                        123 Tech Boulevard<br>
                        Suite 456<br>
                        San Francisco, CA 94107<br>
                        United States
                    </p>
                    <p>
                        <strong>Email:</strong> legal@giggatek.com<br>
                        <strong>Phone:</strong> (555) 123-4567
                    </p>
                </div>

                <div class="terms-agreement animate-on-scroll">
                    <p>By using our Services, you acknowledge that you have read these Terms of Service, understand them, and agree to be bound by them.</p>
                    <a href="index.php" class="btn-primary">Return to Homepage</a>
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
            // Smooth scrolling for table of contents links
            document.querySelectorAll('.terms-toc a').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
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