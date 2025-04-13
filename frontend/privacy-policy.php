<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - GigGatek</title>
    <meta name="description" content="Learn about how GigGatek collects, uses, and protects your personal information and your data privacy rights.">

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
            margin-bottom: 45px;
        }
        
        .policy-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }
        
        .policy-section h3 {
            color: #444;
            margin: 25px 0 15px;
            font-size: 22px;
        }
        
        .policy-section p {
            margin-bottom: 15px;
            line-height: 1.7;
            color: #555;
        }
        
        .policy-section ul, .policy-section ol {
            margin-bottom: 20px;
            padding-left: 25px;
        }
        
        .policy-section li {
            margin-bottom: 10px;
            line-height: 1.7;
            color: #555;
        }
        
        .policy-summary {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .policy-summary h3 {
            color: #007bff;
            margin-top: 0;
            margin-bottom: 15px;
        }
        
        .policy-summary p {
            font-size: 16px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .data-table th, .data-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .data-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .data-table tr:last-child td {
            border-bottom: none;
        }
        
        .data-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        
        .info-card.important {
            border-left-color: #dc3545;
            background-color: #fff8f8;
        }
        
        .info-card h4 {
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .info-card.important h4 {
            color: #dc3545;
        }
        
        .policy-toc {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .policy-toc h3 {
            margin-top: 0;
            margin-bottom: 15px;
        }
        
        .policy-toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .policy-toc ul li {
            margin-bottom: 10px;
        }
        
        .policy-toc ul li a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .policy-toc ul li a:hover {
            color: #0056b3;
            text-decoration: underline;
        }
        
        .policy-toc .toc-level-2 {
            padding-left: 20px;
        }
        
        .policy-date {
            text-align: right;
            font-style: italic;
            color: #777;
            margin-bottom: 30px;
        }
        
        .consent-options {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
        }
        
        .consent-option {
            flex: 1;
            min-width: 250px;
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .consent-option h4 {
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
            margin-bottom: 15px;
            color: #333;
        }
        
        .consent-option p {
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .cookie-settings {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .cookie-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }
        
        .cookie-toggle:last-child {
            border-bottom: none;
        }
        
        .cookie-toggle .toggle-label {
            flex: 1;
        }
        
        .cookie-toggle .toggle-label h4 {
            margin: 0 0 5px;
            font-size: 18px;
        }
        
        .cookie-toggle .toggle-label p {
            margin: 0;
            font-size: 14px;
            color: #777;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background-color: #007bff;
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }
        
        .cookie-actions {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 20px;
        }
        
        .cookie-btn {
            padding: 10px 20px;
            border-radius: 4px;
            border: none;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .cookie-btn.primary {
            background-color: #007bff;
            color: #fff;
        }
        
        .cookie-btn.primary:hover {
            background-color: #0069d9;
        }
        
        .cookie-btn.secondary {
            background-color: #f8f9fa;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .cookie-btn.secondary:hover {
            background-color: #e2e6ea;
        }
        
        @media (max-width: 768px) {
            .consent-options {
                flex-direction: column;
            }
            
            .cookie-toggle {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .toggle-switch {
                margin-top: 10px;
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
                <h1>Privacy Policy</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Privacy Policy</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="policy-content">
            <div class="container">
                <div class="policy-date animate-on-scroll">
                    <p>Last Updated: April 10, 2025</p>
                </div>

                <div class="policy-summary animate-on-scroll">
                    <h3>Privacy Policy Summary</h3>
                    <p>This Privacy Policy explains how GigGatek collects, uses, shares, and protects your personal information when you visit our website, use our services, or interact with us. We value your privacy and are committed to protecting your personal data. This summary provides an overview of our privacy practices, but we encourage you to read the full policy for more detailed information.</p>
                </div>

                <div class="policy-toc animate-on-scroll">
                    <h3>Table of Contents</h3>
                    <ul>
                        <li><a href="#introduction">1. Introduction</a></li>
                        <li><a href="#information-we-collect">2. Information We Collect</a></li>
                        <li><a href="#how-we-use-information">3. How We Use Your Information</a></li>
                        <li><a href="#information-sharing">4. Information Sharing and Disclosure</a></li>
                        <li><a href="#cookies">5. Cookies and Similar Technologies</a></li>
                        <li><a href="#data-retention">6. Data Retention</a></li>
                        <li><a href="#data-security">7. Data Security</a></li>
                        <li><a href="#your-rights">8. Your Rights and Choices</a></li>
                        <li><a href="#children-privacy">9. Children's Privacy</a></li>
                        <li><a href="#international-transfers">10. International Data Transfers</a></li>
                        <li><a href="#policy-changes">11. Changes to This Privacy Policy</a></li>
                        <li><a href="#contact-us">12. Contact Us</a></li>
                    </ul>
                </div>

                <div id="introduction" class="policy-section animate-on-scroll">
                    <h2>1. Introduction</h2>
                    <p>GigGatek ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://www.giggatek.com">www.giggatek.com</a> (the "Site"), use our mobile application, or use our services, including our rent-to-own program.</p>
                    
                    <p>We process personal data in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA) where applicable.</p>
                    
                    <p>By accessing or using our Site and services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Site or services.</p>
                </div>

                <div id="information-we-collect" class="policy-section animate-on-scroll">
                    <h2>2. Information We Collect</h2>
                    <p>We collect several types of information from and about users of our Site and services, including:</p>
                    
                    <h3>2.1 Information You Provide to Us</h3>
                    <ul>
                        <li><strong>Account Information:</strong> When you create an account with us, we collect your name, email address, phone number, username, password, and preferences.</li>
                        <li><strong>Profile Information:</strong> If you complete a profile, we may collect additional information such as your profile picture, bio, and other details you choose to provide.</li>
                        <li><strong>Order and Transaction Information:</strong> When you make a purchase or participate in our rent-to-own program, we collect your billing and shipping address, payment details, items purchased or rented, and related transaction information.</li>
                        <li><strong>Financial Information:</strong> For rent-to-own applications, we may collect financial information including income details, employment information, and other data necessary to assess eligibility.</li>
                        <li><strong>Communications:</strong> If you contact us directly, we may collect information about your communication and any information you provide within it.</li>
                        <li><strong>Survey Responses:</strong> Information you provide when completing surveys or questionnaires.</li>
                        <li><strong>User Content:</strong> Information you provide when posting reviews, comments, or other content on our Site.</li>
                    </ul>
                    
                    <h3>2.2 Information We Collect Automatically</h3>
                    <p>As you navigate through and interact with our Site, we may use automatic data collection technologies to collect certain information, including:</p>
                    <ul>
                        <li><strong>Usage Information:</strong> Details of your visits to our Site, including traffic data, location data, logs, and other communication data and the resources you access and use on the Site.</li>
                        <li><strong>Device Information:</strong> Information about your computer, mobile device, or other device used to access our Site, including IP address, device type, operating system, browser type, and device identifiers.</li>
                        <li><strong>Location Information:</strong> General location information based on IP address or more precise location information if you allow our mobile application to access your location.</li>
                        <li><strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and similar tracking technologies to collect information about your browsing activities. See the "Cookies and Similar Technologies" section for more details.</li>
                    </ul>
                    
                    <h3>2.3 Information from Third Parties</h3>
                    <p>We may receive information about you from third parties, including:</p>
                    <ul>
                        <li><strong>Business Partners:</strong> Information from our business partners, such as payment processors and shipping companies.</li>
                        <li><strong>Social Media:</strong> If you access our Site through social media platforms or use social media login features, we may receive information from these platforms.</li>
                        <li><strong>Credit Bureaus:</strong> For rent-to-own applications, we may obtain credit reports and other information from credit bureaus.</li>
                        <li><strong>Public Sources:</strong> Information from publicly available sources, such as public social media profiles.</li>
                    </ul>
                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Category of Information</th>
                                <th>Examples</th>
                                <th>Source of Collection</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Personal Identifiers</td>
                                <td>Name, address, email address, phone number, account username</td>
                                <td>Directly from you, authentication services</td>
                            </tr>
                            <tr>
                                <td>Customer Records</td>
                                <td>Purchase history, payment information, shipping address</td>
                                <td>Directly from you, payment processors, shipping partners</td>
                            </tr>
                            <tr>
                                <td>Financial Information</td>
                                <td>Income, employment information, credit history</td>
                                <td>Directly from you, credit bureaus</td>
                            </tr>
                            <tr>
                                <td>Commercial Information</td>
                                <td>Products purchased or viewed, rental history</td>
                                <td>Your interactions with our Site</td>
                            </tr>
                            <tr>
                                <td>Internet Activity</td>
                                <td>Browsing history, search history, website interaction</td>
                                <td>Cookies, analytics providers, your interactions with our Site</td>
                            </tr>
                            <tr>
                                <td>Geolocation Data</td>
                                <td>IP-based location, GPS location (with consent)</td>
                                <td>Your device, mobile app (with permission)</td>
                            </tr>
                            <tr>
                                <td>Inferences</td>
                                <td>Preferences, characteristics, behavior, attitudes</td>
                                <td>Derived from other collected information</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div id="how-we-use-information" class="policy-section animate-on-scroll">
                    <h2>3. How We Use Your Information</h2>
                    <p>We use the information we collect about you for various purposes, including to:</p>
                    <ul>
                        <li><strong>Provide, maintain, and improve our services</strong>, including processing transactions, fulfilling orders, managing your account, and providing customer service.</li>
                        <li><strong>Process and manage rent-to-own applications and agreements</strong>, including performing credit checks and assessing eligibility.</li>
                        <li><strong>Personalize your experience</strong> by delivering content and product recommendations relevant to your interests.</li>
                        <li><strong>Communicate with you</strong> about our products, services, promotions, and events, and respond to your inquiries and requests.</li>
                        <li><strong>Monitor and analyze trends, usage, and activities</strong> to improve our Site and services.</li>
                        <li><strong>Detect, investigate, and prevent fraudulent transactions</strong> and other illegal activities and protect the rights and property of GigGatek and others.</li>
                        <li><strong>Comply with legal obligations</strong> and enforce our terms and policies.</li>
                        <li><strong>With your consent, for other purposes</strong> that we disclose at the time we request your information.</li>
                    </ul>
                    
                    <div class="info-card">
                        <h4>Legal Basis for Processing (GDPR)</h4>
                        <p>For individuals in the European Economic Area (EEA), the United Kingdom, or Switzerland, we rely on the following legal bases to process your personal data:</p>
                        <ul>
                            <li><strong>Contractual Necessity:</strong> To perform the contract we have with you (e.g., processing your order, providing our services).</li>
                            <li><strong>Legitimate Interests:</strong> For our legitimate business interests (e.g., improving our services, fraud prevention) where your rights do not override these interests.</li>
                            <li><strong>Legal Obligation:</strong> To comply with laws and regulations.</li>
                            <li><strong>Consent:</strong> When you have given us specific consent, such as for marketing communications or certain cookies.</li>
                        </ul>
                    </div>
                </div>

                <div id="information-sharing" class="policy-section animate-on-scroll">
                    <h2>4. Information Sharing and Disclosure</h2>
                    <p>We may share your personal information in the following circumstances:</p>
                    
                    <h3>4.1 Service Providers</h3>
                    <p>We share information with third-party service providers who perform services on our behalf, such as:</p>
                    <ul>
                        <li>Payment processors to process payments and handle billing information</li>
                        <li>Shipping and fulfillment companies to deliver products</li>
                        <li>Customer service providers to assist with inquiries</li>
                        <li>Marketing providers to help with promotional campaigns</li>
                        <li>Analytics providers to help us understand Site usage</li>
                        <li>Cloud service providers for data storage</li>
                    </ul>
                    <p>These service providers are only permitted to use your information as necessary to provide services to us and are required to maintain the confidentiality and security of your information.</p>
                    
                    <h3>4.2 Business Transfers</h3>
                    <p>If GigGatek undergoes a merger, acquisition, or sale of all or a portion of its assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our Site of any change in ownership or uses of your personal information.</p>
                    
                    <h3>4.3 Legal Requirements</h3>
                    <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency). We may also disclose your information to:</p>
                    <ul>
                        <li>Enforce our terms and policies</li>
                        <li>Protect and defend our rights or property</li>
                        <li>Prevent or investigate possible wrongdoing in connection with our services</li>
                        <li>Protect the personal safety of users of our services or the public</li>
                    </ul>
                    
                    <h3>4.4 With Your Consent</h3>
                    <p>We may share your information with third parties when you have given us your consent to do so.</p>
                    
                    <div class="info-card important">
                        <h4>Important Notice About Information Sharing</h4>
                        <p>We do not sell your personal information to third parties for monetary compensation. However, under some privacy laws, certain types of data sharing for targeted advertising or marketing purposes might be considered a "sale" of data. To the extent this is the case, you have the right to opt out of such sharing.</p>
                    </div>
                </div>

                <div id="cookies" class="policy-section animate-on-scroll">
                    <h2>5. Cookies and Similar Technologies</h2>
                    <p>We use cookies, web beacons, pixel tags, and similar tracking technologies to collect information about your browsing activities on our Site.</p>
                    
                    <h3>5.1 What Are Cookies?</h3>
                    <p>Cookies are small data files that are placed on your device when you visit a website. They allow us to remember your preferences, understand how our Site is used, and personalize content.</p>
                    
                    <h3>5.2 Types of Cookies We Use</h3>
                    <ul>
                        <li><strong>Essential Cookies:</strong> These are necessary for the Site to function properly and cannot be switched off in our systems. They enable basic functions like page navigation and access to secure areas of the Site.</li>
                        <li><strong>Performance Cookies:</strong> These help us count visits and traffic sources so we can measure and improve the performance of our Site. They help us know which pages are the most and least popular.</li>
                        <li><strong>Functionality Cookies:</strong> These enable the Site to provide enhanced functionality and personalization, such as remembering your preferences and settings.</li>
                        <li><strong>Targeting Cookies:</strong> These may be set through our Site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertising on other sites.</li>
                    </ul>
                    
                    <h3>5.3 Cookie Management</h3>
                    <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience. You can manage your cookie preferences on our Site through our Cookie Consent Manager.</p>
                    
                    <div class="cookie-settings">
                        <h3>Cookie Preferences</h3>
                        <p>You can customize your cookie preferences below. Essential cookies cannot be disabled as they are necessary for the website to function properly.</p>
                        
                        <div class="cookie-toggle">
                            <div class="toggle-label">
                                <h4>Essential Cookies</h4>
                                <p>Required for basic site functionality. Always active.</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" checked disabled>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="cookie-toggle">
                            <div class="toggle-label">
                                <h4>Performance Cookies</h4>
                                <p>Help us improve our website by collecting anonymous information.</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="performance-cookies" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="cookie-toggle">
                            <div class="toggle-label">
                                <h4>Functionality Cookies</h4>
                                <p>Allow the website to remember choices you make and provide enhanced features.</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="functionality-cookies" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="cookie-toggle">
                            <div class="toggle-label">
                                <h4>Targeting Cookies</h4>
                                <p>Used to deliver advertisements relevant to you and your interests.</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="targeting-cookies">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="cookie-actions">
                            <button class="cookie-btn secondary" id="decline-all">Decline All</button>
                            <button class="cookie-btn primary" id="accept-all">Accept All</button>
                            <button class="cookie-btn primary" id="save-preferences">Save Preferences</button>
                        </div>
                    </div>
                </div>

                <div id="data-retention" class="policy-section animate-on-scroll">
                    <h2>6. Data Retention</h2>
                    <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The criteria used to determine our retention periods include:</p>
                    <ul>
                        <li>The length of time we have an ongoing relationship with you</li>
                        <li>Legal obligations to which we are subject</li>
                        <li>Whether retention is advisable considering our legal position (such as for statutes of limitations, litigation, or regulatory investigations)</li>
                    </ul>
                    
                    <p>For rent-to-own customers, we retain relevant financial information for the duration of the rental agreement plus any additional period required by law for tax, accounting, or legal purposes.</p>
                    
                    <p>When we no longer need to use your information, we will take steps to securely delete or anonymize it. If this is not possible (for example, because your information has been stored in backup archives), we will securely store your information and isolate it from any further use until deletion is possible.</p>
                </div>

                <div id="data-security" class="policy-section animate-on-scroll">
                    <h2>7. Data Security</h2>
                    <p>We have implemented appropriate technical and organizational measures designed to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                    
                    <p>Our security measures include:</p>
                    <ul>
                        <li>Encryption of sensitive data in transit and at rest</li>
                        <li>Regular security assessments of our systems</li>
                        <li>Access controls and authentication measures for our employees and contractors</li>
                        <li>Physical and environmental safeguards for our servers and facilities</li>
                        <li>Regular monitoring for potential vulnerabilities and attacks</li>
                        <li>Employee training on security practices and data protection</li>
                    </ul>
                    
                    <p>If you have reason to believe that your interaction with us is no longer secure, please immediately notify us by contacting our Privacy Team at privacy@giggatek.com.</p>
                </div>

                <div id="your-rights" class="policy-section animate-on-scroll">
                    <h2>8. Your Rights and Choices</h2>
                    <p>Depending on your location and applicable law, you may have various rights regarding your personal information:</p>
                    
                    <h3>8.1 Access and Portability</h3>
                    <p>You may have the right to access the personal information we hold about you and to request a copy of your information in a structured, commonly used, and machine-readable format.</p>
                    
                    <h3>8.2 Correction</h3>
                    <p>You may have the right to request that we correct inaccurate or incomplete information about you. You can often update your information directly in your account settings.</p>
                    
                    <h3>8.3 Deletion</h3>
                    <p>You may have the right to request that we delete your personal information in certain circumstances, such as when it is no longer necessary for the purpose for which it was collected.</p>
                    
                    <h3>8.4 Restriction and Objection</h3>
                    <p>You may have the right to request that we restrict the processing of your information and to object to our processing of your information based on our legitimate interests.</p>
                    
                    <h3>8.5 Withdraw Consent</h3>
                    <p>Where we process your information based on your consent, you have the right to withdraw that consent at any time.</p>
                    
                    <h3>8.6 Marketing Choices</h3>
                    <p>You can opt out of receiving marketing communications from us by clicking the "unsubscribe" link in our emails, updating your communication preferences in your account settings, or contacting us directly.</p>
                    
                    <h3>8.7 Do Not Track Signals</h3>
                    <p>Some browsers have a "Do Not Track" feature that signals to websites that you visit that you do not want to have your online activity tracked. Our Site currently does not respond to "Do Not Track" signals.</p>
                    
                    <h3>8.8 Exercising Your Rights</h3>
                    <p>To exercise any of these rights, please contact us at privacy@giggatek.com or through the "Contact Us" section below. We may need to verify your identity before fulfilling your request. We will respond to your request within the timeframe required by applicable law.</p>
                    
                    <div class="consent-options">
                        <div class="consent-option">
                            <h4>Marketing Preferences</h4>
                            <p>Manage how we contact you with offers, updates, and information about our products and services.</p>
                            <a href="dashboard.php?section=communication-preferences" class="btn">Manage Preferences</a>
                        </div>
                        <div class="consent-option">
                            <h4>Data Subject Rights</h4>
                            <p>Submit a request to access, correct, delete, or export your personal information.</p>
                            <a href="dashboard.php?section=privacy-requests" class="btn">Submit Request</a>
                        </div>
                        <div class="consent-option">
                            <h4>Cookie Settings</h4>
                            <p>Control which cookies and tracking technologies can be used when you visit our Site.</p>
                            <a href="#cookies" class="btn">Manage Cookies</a>
                        </div>
                    </div>
                </div>

                <div id="children-privacy" class="policy-section animate-on-scroll">
                    <h2>9. Children's Privacy</h2>
                    <p>Our Site and services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to delete that information. If you believe we might have any information from or about a child under 18, please contact us immediately.</p>
                </div>

                <div id="international-transfers" class="policy-section animate-on-scroll">
                    <h2>10. International Data Transfers</h2>
                    <p>GigGatek is based in the United States, and we process and store information on servers located in the United States. If you are located outside the United States, please be aware that information we collect may be transferred to and processed in the United States or other countries where our service providers are located.</p>
                    
                    <p>If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, we ensure that any transfer of your personal data to countries outside these regions is done in accordance with applicable data protection laws. We may use Standard Contractual Clauses approved by the European Commission or other appropriate safeguards to protect your information when it is transferred internationally.</p>
                </div>

                <div id="policy-changes" class="policy-section animate-on-scroll">
                    <h2>11. Changes to This Privacy Policy</h2>
                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. If we make material changes, we will notify you by posting the updated policy on our Site and updating the "Last Updated" date at the top of this policy. In some cases, we may also notify you by email or through a notice on our homepage.</p>
                    
                    <p>We encourage you to review this Privacy Policy periodically to stay informed about our information practices. Your continued use of our Site and services after any changes to this Privacy Policy constitutes your acceptance of the revised policy.</p>
                </div>

                <div id="contact-us" class="policy-section animate-on-scroll">
                    <h2>12. Contact Us</h2>
                    <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:</p>
                    <p>
                        <strong>GigGatek Privacy Team</strong><br>
                        123 Tech Boulevard<br>
                        Suite 456<br>
                        San Francisco, CA 94107<br>
                        United States
                    </p>
                    <p>
                        <strong>Email:</strong> privacy@giggatek.com<br>
                        <strong>Phone:</strong> (555) 123-4567
                    </p>
                    <p>For individuals in the European Union, we have appointed a data protection representative who can be contacted at eu-representative@giggatek.com.</p>
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
            // Cookie consent functionality
            const performanceCookiesCheckbox = document.getElementById('performance-cookies');
            const functionalityCookiesCheckbox = document.getElementById('functionality-cookies');
            const targetingCookiesCheckbox = document.getElementById('targeting-cookies');
            const acceptAllBtn = document.getElementById('accept-all');
            const declineAllBtn = document.getElementById('decline-all');
            const savePreferencesBtn = document.getElementById('save-preferences');
            
            // Load saved preferences if they exist
            const savedPreferences = localStorage.getItem('cookiePreferences');
            if (savedPreferences) {
                const preferences = JSON.parse(savedPreferences);
                performanceCookiesCheckbox.checked = preferences.performance;
                functionalityCookiesCheckbox.checked = preferences.functionality;
                targetingCookiesCheckbox.checked = preferences.targeting;
            }
            
            // Accept all cookies
            acceptAllBtn.addEventListener('click', function() {
                performanceCookiesCheckbox.checked = true;
                functionalityCookiesCheckbox.checked = true;
                targetingCookiesCheckbox.checked = true;
                saveCookiePreferences();
            });
            
            // Decline all cookies except essential
            declineAllBtn.addEventListener('click', function() {
                performanceCookiesCheckbox.checked = false;
                functionalityCookiesCheckbox.checked = false;
                targetingCookiesCheckbox.checked = false;
                saveCookiePreferences();
            });
            
            // Save custom preferences
            savePreferencesBtn.addEventListener('click', function() {
                saveCookiePreferences();
            });
            
            function saveCookiePreferences() {
                const preferences = {
                    essential: true, // Always required
                    performance: performanceCookiesCheckbox.checked,
                    functionality: functionalityCookiesCheckbox.checked,
                    targeting: targetingCookiesCheckbox.checked
                };
                
                localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
                
                // Here you would typically set or remove the actual cookies based on preferences
                alert('Your cookie preferences have been saved!');
            }
            
            // Smooth scrolling for table of contents links
            document.querySelectorAll('.policy-toc a').forEach(anchor => {
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