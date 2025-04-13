<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frequently Asked Questions - GigGatek</title>
    <meta name="description" content="Find answers to frequently asked questions about GigGatek's products, rent-to-own program, shipping, returns, and technical support.">

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
    
    <style>
        /* FAQ specific styles */
        .faq-section {
            padding: 60px 0;
        }
        
        .faq-tabs {
            display: flex;
            margin-bottom: 30px;
            border-bottom: 1px solid #e0e0e0;
            overflow-x: auto;
            scrollbar-width: thin;
        }
        
        .faq-tabs::-webkit-scrollbar {
            height: 5px;
        }
        
        .faq-tabs::-webkit-scrollbar-thumb {
            background-color: #cccccc;
            border-radius: 10px;
        }
        
        .faq-tab {
            padding: 12px 24px;
            font-weight: 500;
            color: #666;
            cursor: pointer;
            white-space: nowrap;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .faq-tab.active {
            color: #007bff;
        }
        
        .faq-tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: #007bff;
        }
        
        .faq-content {
            display: none;
        }
        
        .faq-content.active {
            display: block;
        }
        
        .faq-accordion {
            margin-bottom: 40px;
        }
        
        .accordion-item {
            margin-bottom: 16px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .accordion-button {
            width: 100%;
            background-color: #f9f9f9;
            padding: 18px 24px;
            text-align: left;
            font-weight: 500;
            color: #333;
            border: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .accordion-button:hover {
            background-color: #f0f0f0;
        }
        
        .accordion-button.active {
            background-color: #eaf2ff;
            color: #007bff;
        }
        
        .accordion-content {
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
        }
        
        .accordion-content-inner {
            padding: 24px;
        }
        
        .accordion-content p:last-child {
            margin-bottom: 0;
        }
        
        .search-faq {
            margin-bottom: 40px;
        }
        
        .search-faq form {
            display: flex;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .search-faq input {
            flex: 1;
            padding: 12px 20px;
            border: 1px solid #e0e0e0;
            border-radius: 4px 0 0 4px;
            font-size: 16px;
        }
        
        .search-faq button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .search-faq button:hover {
            background-color: #0069d9;
        }
        
        .faq-not-found {
            display: none;
            text-align: center;
            padding: 40px 0;
        }
        
        .faq-not-found.show {
            display: block;
        }
        
        .contact-support {
            text-align: center;
            margin-top: 60px;
            padding: 40px;
            background-color: #f9f9f9;
            border-radius: 8px;
        }
        
        .contact-support h3 {
            margin-bottom: 20px;
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
                <h1>Frequently Asked Questions</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item"><a href="support.php">Support</a></li>
                        <li class="breadcrumb-item active" aria-current="page">FAQ</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="faq-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <h2>How Can We Help?</h2>
                    <p>Find answers to our most commonly asked questions.</p>
                </div>

                <div class="search-faq animate-on-scroll">
                    <form id="faqSearch">
                        <input type="text" id="faqSearchInput" placeholder="Search the FAQ...">
                        <button type="submit"><i class="fas fa-search"></i> Search</button>
                    </form>
                </div>

                <div class="faq-tabs">
                    <div class="faq-tab active" data-tab="general">General Questions</div>
                    <div class="faq-tab" data-tab="products">Products & Specifications</div>
                    <div class="faq-tab" data-tab="rentals">Rent-to-Own Program</div>
                    <div class="faq-tab" data-tab="orders">Orders & Shipping</div>
                    <div class="faq-tab" data-tab="returns">Returns & Warranty</div>
                    <div class="faq-tab" data-tab="technical">Technical Support</div>
                </div>

                <!-- General Questions -->
                <div class="faq-content active" id="general">
                    <div class="faq-accordion">
                        <div class="accordion-item">
                            <button class="accordion-button">
                                What is GigGatek?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>GigGatek is a specialized retailer of high-quality refurbished computer hardware. We offer both direct purchase and rent-to-own options for a wide range of products, including graphics cards, processors, memory, storage, complete systems, and more.</p>
                                    <p>Our mission is to make premium technology accessible to everyone by providing thoroughly tested and certified refurbished hardware at competitive prices.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                How is refurbished hardware different from used hardware?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Refurbished hardware is significantly different from simply "used" hardware:</p>
                                    <ul>
                                        <li><strong>Professional Testing:</strong> All our refurbished products undergo comprehensive diagnostic testing to ensure they meet or exceed manufacturer specifications.</li>
                                        <li><strong>Restoration:</strong> Components are thoroughly cleaned, repaired if necessary, and restored to excellent working condition.</li>
                                        <li><strong>Quality Control:</strong> Each product passes through a multi-point inspection before being certified for sale.</li>
                                        <li><strong>Warranty:</strong> Unlike most used hardware, our refurbished products come with a warranty that protects your purchase.</li>
                                    </ul>
                                    <p>In short, refurbished hardware gives you near-new performance and reliability at a fraction of the cost of buying new.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Do you ship internationally?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, we ship to most international destinations. International shipping rates and delivery times vary by country. During checkout, you'll be able to see the shipping options, costs, and estimated delivery times for your location.</p>
                                    <p>Please note that international customers are responsible for any customs fees, import duties, or taxes that may apply when receiving shipments from outside their country.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                How do I contact customer support?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>You can reach our customer support team through multiple channels:</p>
                                    <ul>
                                        <li><strong>Email:</strong> support@giggatek.com</li>
                                        <li><strong>Phone:</strong> (555) 123-4567 (Monday-Friday, 9AM-6PM EST)</li>
                                        <li><strong>Contact Form:</strong> Visit our <a href="contact.php">Contact Page</a></li>
                                        <li><strong>Live Chat:</strong> Available on our website during business hours</li>
                                    </ul>
                                    <p>Our support team typically responds to email inquiries within 24 hours during business days.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products & Specifications -->
                <div class="faq-content" id="products">
                    <div class="faq-accordion">
                        <div class="accordion-item">
                            <button class="accordion-button">
                                How do you grade the condition of your products?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>We grade our refurbished products based on both functionality and cosmetic condition:</p>
                                    <ul>
                                        <li><strong>Excellent:</strong> Products in like-new condition with minimal to no signs of use. These items have been thoroughly tested and function perfectly.</li>
                                        <li><strong>Good:</strong> Products that function perfectly but may have minor cosmetic imperfections such as light scratches or marks that don't affect performance.</li>
                                        <li><strong>Fair:</strong> Products with noticeable cosmetic wear but still in good working condition. These items offer the best value while maintaining reliable performance.</li>
                                    </ul>
                                    <p>All products, regardless of grade, undergo the same rigorous testing process to ensure they meet our performance standards.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Are product specifications the same as new items?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, the technical specifications of our refurbished products are identical to their new counterparts. The core components, architecture, and capabilities remain the same.</p>
                                    <p>For example, a refurbished NVIDIA RTX 3080 will have the same CUDA cores, memory size, and architecture as a new one. The only difference is that it has been previously used, thoroughly tested, and restored to excellent working condition.</p>
                                    <p>Each product listing on our website provides detailed specifications so you know exactly what you're getting.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Do you offer any product customization options?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, we offer customization options for complete systems. When purchasing a refurbished desktop or laptop, you can typically customize:</p>
                                    <ul>
                                        <li>RAM capacity and speed</li>
                                        <li>Storage type (SSD/HDD) and capacity</li>
                                        <li>Operating system options</li>
                                        <li>Additional components (like Wi-Fi cards, optical drives, etc.)</li>
                                    </ul>
                                    <p>For individual components like GPUs and CPUs, we don't offer customization as these are standalone parts with set specifications. However, we maintain a wide inventory to help you find the exact model that meets your needs.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Can I use your refurbished hardware for mining cryptocurrency?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>While our refurbished hardware will technically work for cryptocurrency mining, we have a few important considerations:</p>
                                    <ol>
                                        <li>GPUs used for mining typically experience higher than normal wear and tear due to continuous operation under high loads. This can potentially reduce the lifespan of the hardware.</li>
                                        <li>Our standard warranty does not cover hardware failures resulting from intensive cryptocurrency mining operations, as this is considered outside normal use parameters.</li>
                                        <li>We specifically note in our product listings if a GPU has previously been used for mining, so customers can make informed decisions.</li>
                                    </ol>
                                    <p>If you're specifically looking for mining hardware, please contact our support team for recommendations on the most suitable products for this specific use case.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Rent-to-Own Program -->
                <div class="faq-content" id="rentals">
                    <div class="faq-accordion">
                        <div class="accordion-item">
                            <button class="accordion-button">
                                How does the rent-to-own program work?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Our rent-to-own program allows you to get the hardware you need today while making affordable monthly payments:</p>
                                    <ol>
                                        <li><strong>Select Your Hardware:</strong> Choose any qualifying product from our inventory.</li>
                                        <li><strong>Choose Your Term:</strong> Select a rental period of 3, 6, or 12 months.</li>
                                        <li><strong>Make Monthly Payments:</strong> Your payments are automatically processed each month.</li>
                                        <li><strong>Own Your Hardware:</strong> After your final payment, the hardware is yours to keep!</li>
                                    </ol>
                                    <p>There's no credit check required, and you can upgrade your hardware during your rental period if you need more power.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Is there a credit check for the rent-to-own program?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>No, we do not perform traditional credit checks for our rent-to-own program. Instead, we require:</p>
                                    <ul>
                                        <li>Valid government-issued ID</li>
                                        <li>Proof of income</li>
                                        <li>Valid debit card or bank account for automatic payments</li>
                                        <li>First month's payment and security deposit at checkout</li>
                                    </ul>
                                    <p>This makes our program accessible to customers who may not have established credit or who prefer not to use credit-based financing options.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Can I pay off my rent-to-own agreement early?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, you can pay off your rent-to-own agreement at any time with no prepayment penalties. Early payoff options include:</p>
                                    <ul>
                                        <li><strong>Lump Sum Payment:</strong> Pay the remaining balance in one payment.</li>
                                        <li><strong>Accelerated Payments:</strong> Make additional payments to pay off your agreement faster.</li>
                                    </ul>
                                    <p>When you pay off early, you'll own the hardware immediately, and no further payments will be required. Additionally, paying off early can reduce the total cost compared to making all scheduled monthly payments.</p>
                                    <p>To initiate an early payoff, simply log into your account dashboard or contact our customer support team.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                What happens if I can't make a payment?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>We understand that financial situations can change. If you anticipate difficulty making a payment:</p>
                                    <ol>
                                        <li><strong>Contact Us Early:</strong> Reach out to our customer service team before your payment is due.</li>
                                        <li><strong>Payment Extension:</strong> We may be able to offer a payment extension of up to 10 days.</li>
                                        <li><strong>Adjustment Options:</strong> In some cases, we can work with you to adjust your payment schedule.</li>
                                    </ol>
                                    <p>If a payment is missed without prior arrangement:</p>
                                    <ul>
                                        <li>A late fee may be applied after 5 days</li>
                                        <li>After 15 days, your rental may be considered in default</li>
                                        <li>After 30 days, the equipment may need to be returned</li>
                                    </ul>
                                    <p>Communication is key - we're much more able to work with you if you reach out proactively before a payment issue occurs.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Orders & Shipping -->
                <div class="faq-content" id="orders">
                    <div class="faq-accordion">
                        <div class="accordion-item">
                            <button class="accordion-button">
                                How long does shipping take?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Shipping times vary based on your location and the shipping method chosen:</p>
                                    <ul>
                                        <li><strong>Standard Shipping:</strong> 3-5 business days (continental US)</li>
                                        <li><strong>Expedited Shipping:</strong> 2-3 business days</li>
                                        <li><strong>Express Shipping:</strong> 1-2 business days</li>
                                        <li><strong>International Shipping:</strong> 7-14 business days (varies by country)</li>
                                    </ul>
                                    <p>Orders are typically processed within 1-2 business days before shipping. You'll receive a tracking number via email once your order ships, allowing you to monitor its progress.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Do you offer free shipping?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, we offer free standard shipping on orders over $100 within the continental United States. For orders under $100, a flat shipping rate of $9.95 applies.</p>
                                    <p>Free shipping is not available for:</p>
                                    <ul>
                                        <li>Express or expedited shipping options</li>
                                        <li>International destinations</li>
                                        <li>Alaska, Hawaii, and US territories</li>
                                    </ul>
                                    <p>We occasionally run promotions with special shipping offers, so be sure to check our homepage or subscribe to our newsletter for the latest deals.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Can I change or cancel my order?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Order modifications and cancellations are subject to the following conditions:</p>
                                    <ul>
                                        <li><strong>Within 1 Hour of Ordering:</strong> Most orders can be modified or cancelled without restriction through your account dashboard.</li>
                                        <li><strong>After 1 Hour but Before Shipping:</strong> Contact customer service as soon as possible. We'll try to accommodate your request, but it's not guaranteed if order processing has begun.</li>
                                        <li><strong>After Shipping:</strong> Orders cannot be cancelled once shipped. Standard return policies will apply after delivery.</li>
                                    </ul>
                                    <p>For rent-to-own orders, different conditions may apply. Please contact customer service directly for assistance with modifying rent-to-own agreements.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                How are products packaged for shipping?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>We take great care in packaging your hardware to ensure it arrives safely:</p>
                                    <ul>
                                        <li><strong>Anti-Static Protection:</strong> All electronic components are sealed in anti-static bags.</li>
                                        <li><strong>Cushioning:</strong> Products are surrounded with appropriate cushioning material (foam inserts, air pillows, or bubble wrap).</li>
                                        <li><strong>Sturdy Boxes:</strong> We use double-walled corrugated boxes for additional protection.</li>
                                        <li><strong>Fragile Labeling:</strong> Shipments are clearly marked as containing electronic equipment.</li>
                                    </ul>
                                    <p>For larger items like complete systems, we use specialized packaging with additional reinforcement to prevent damage during transit. All packages are insured against shipping damage.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Returns & Warranty -->
                <div class="faq-content" id="returns">
                    <div class="faq-accordion">
                        <div class="accordion-item">
                            <button class="accordion-button">
                                What is your return policy?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Our return policy for purchased items is straightforward:</p>
                                    <ul>
                                        <li><strong>Return Window:</strong> 30 days from delivery date</li>
                                        <li><strong>Condition Requirement:</strong> Items must be in the same condition as received, with all original packaging and accessories</li>
                                        <li><strong>Refund Method:</strong> Original payment method (processing time: 3-5 business days after we receive the return)</li>
                                        <li><strong>Restocking Fee:</strong> None for defective items; 15% may apply for non-defective returns</li>
                                    </ul>
                                    <p>To initiate a return, log into your account and select the order you wish to return, or contact our customer support team.</p>
                                    <p>For rent-to-own items, please refer to your rental agreement for specific return conditions.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                What warranty coverage do you provide?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>All our refurbished products come with warranty coverage:</p>
                                    <ul>
                                        <li><strong>Standard Purchase Warranty:</strong> 90 days for all refurbished components and systems</li>
                                        <li><strong>Extended Warranty:</strong> Available for purchase (6 months, 1 year, or 2 year options)</li>
                                        <li><strong>Rent-to-Own Warranty:</strong> Coverage for the entire rental period</li>
                                    </ul>
                                    <p>Our warranty covers:</p>
                                    <ul>
                                        <li>Functional defects and failures under normal use</li>
                                        <li>Components that don't perform according to specifications</li>
                                    </ul>
                                    <p>Our warranty does not cover:</p>
                                    <ul>
                                        <li>Physical damage caused after delivery</li>
                                        <li>Issues resulting from improper use or installation</li>
                                        <li>Normal wear and tear</li>
                                        <li>Products with removed or altered serial numbers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                How do I make a warranty claim?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>To make a warranty claim, follow these steps:</p>
                                    <ol>
                                        <li><strong>Contact Support:</strong> Reach out to our technical support team through email, phone, or the support portal on our website.</li>
                                        <li><strong>Initial Troubleshooting:</strong> Our technicians will attempt to resolve the issue remotely with troubleshooting steps.</li>
                                        <li><strong>Claim Approval:</strong> If the issue can't be resolved remotely, we'll issue a Return Merchandise Authorization (RMA) number.</li>
                                        <li><strong>Return the Item:</strong> Ship the item back using the provided shipping label. Include the RMA number on the package.</li>
                                        <li><strong>Resolution:</strong> After inspection, we'll either repair the item, replace it with an equivalent product, or issue a refund, depending on the situation.</li>
                                    </ol>
                                    <p>The entire warranty claim process typically takes 7-14 business days from when we receive the returned item.</p>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Can I purchase additional warranty coverage?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, we offer extended warranty options that can be purchased at the time of checkout:</p>
                                    <ul>
                                        <li><strong>6-Month Extension:</strong> Adds 6 months to the standard 90-day warranty (total coverage: 9 months)</li>
                                        <li><strong>1-Year Extension:</strong> Adds 12 months to the standard 90-day warranty (total coverage: 15 months)</li>
                                        <li><strong>2-Year Extension:</strong> Adds 24 months to the standard 90-day warranty (total coverage: 27 months)</li>
                                    </ul>
                                    <p>Extended warranty pricing varies based on the product category and value. The exact prices are shown during checkout.</p>
                                    <p>Extended warranties offer the same coverage as our standard warranty but for a longer duration. They cannot be purchased after the initial order has been placed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Technical Support -->
                <div class="faq-content" id="technical">
                    <div class="faq-accordion">
                        <div class="accordion-item">
                            <button class="accordion-button">
                                How can I check if a component is compatible with my system?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>There are several ways to determine component compatibility with your current system:</p>
                                    <ol>
                                        <li><strong>Use Our Compatibility Tool:</strong> On product pages, you can enter your system details into our compatibility checker tool for an instant assessment.</li>
                                        <li><strong>Contact Technical Support:</strong> Our tech team can help verify compatibility if you provide your current system specifications.</li>
                                        <li><strong>Check Manufacturer Specifications:</strong> Compare the specifications of your current system with the requirements of the component you're interested in.</li>
                                    </ol>
                                    <p>Key compatibility factors to consider include:</p>
                                    <ul>
                                        <li><strong>For GPUs:</strong> PCIe slot version, physical dimensions, power supply wattage, and available connectors</li>
                                        <li><strong>For CPUs:</strong> Socket type, motherboard chipset, and power requirements</li>
                                        <li><strong>For RAM:</strong> Memory type (DDR3, DDR4, etc.), speed, and motherboard slots</li>
                                        <li><strong>For Storage:</strong> Interface type (SATA, NVMe), available connections, and physical space</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                My product isn't working properly. What should I do?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>If you're experiencing issues with your product, follow these troubleshooting steps:</p>
                                    <ol>
                                        <li><strong>Check Physical Connections:</strong> Ensure all cables are properly connected and seated.</li>
                                        <li><strong>Verify Power Supply:</strong> Confirm your power supply can handle the component's requirements.</li>
                                        <li><strong>Update Drivers/Firmware:</strong> Install the latest drivers or firmware from the manufacturer's website.</li>
                                        <li><strong>Test in Another System:</strong> If possible, try the component in another compatible system to determine if the issue is with the component or your system.</li>
                                    </ol>
                                    <p>If these steps don't resolve the issue:</p>
                                    <ol>
                                        <li>Contact our technical support team at techsupport@giggatek.com or (555) 234-5678</li>
                                        <li>Provide detailed information about the issue and any error messages</li>
                                        <li>Include your order number and the product model</li>
                                        <li>Our team will guide you through advanced troubleshooting or initiate a warranty claim if necessary</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Do you provide installation instructions?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, we provide installation resources for all of our products:</p>
                                    <ul>
                                        <li><strong>Digital Manuals:</strong> Available for download in your account dashboard</li>
                                        <li><strong>Installation Guides:</strong> Step-by-step PDF guides for common components</li>
                                        <li><strong>Video Tutorials:</strong> Instructional videos on our YouTube channel and website</li>
                                        <li><strong>Knowledge Base:</strong> Detailed articles in our support section</li>
                                    </ul>
                                    <p>For complex installations or customers who prefer guidance, we also offer:</p>
                                    <ul>
                                        <li><strong>Remote Installation Support:</strong> Our technicians can guide you through the installation process via screen sharing sessions.</li>
                                        <li><strong>Local Installation Services:</strong> In select areas, we can refer you to certified local technicians for on-site installation (additional fees apply).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <button class="accordion-button">
                                Do you offer technical support after purchase?
                                <span class="icon"><i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-content-inner">
                                    <p>Yes, we provide technical support for all purchased and rented products:</p>
                                    <ul>
                                        <li><strong>Standard Technical Support:</strong> Available to all customers for the duration of the warranty period. This includes troubleshooting, installation guidance, and configuration assistance.</li>
                                        <li><strong>Premium Technical Support:</strong> Available as an optional subscription service that extends beyond the warranty period and includes priority response times and expanded support hours.</li>
                                    </ul>
                                    <p>Our technical support is available through multiple channels:</p>
                                    <ul>
                                        <li>Email: techsupport@giggatek.com</li>
                                        <li>Phone: (555) 234-5678 (Monday-Friday, 9AM-6PM EST)</li>
                                        <li>Live Chat: Available on our website during business hours</li>
                                        <li>Support Ticket System: Through your account dashboard</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="faq-not-found" id="noResultsFound">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No results found</h3>
                    <p>Sorry, we couldn't find any FAQ entries matching your search. Try different keywords or browse the categories above.</p>
                </div>

                <div class="contact-support">
                    <h3>Still Have Questions?</h3>
                    <p>If you couldn't find the answer you were looking for, our support team is here to help.</p>
                    <a href="contact.php" class="btn btn-primary">Contact Support</a>
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
            // Tab switching functionality
            const tabs = document.querySelectorAll('.faq-tab');
            const contents = document.querySelectorAll('.faq-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Hide all content
                    contents.forEach(content => content.classList.remove('active'));
                    // Show content corresponding to clicked tab
                    const contentId = this.dataset.tab;
                    document.getElementById(contentId).classList.add('active');
                });
            });
            
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
            
            // FAQ search functionality
            const faqSearch = document.getElementById('faqSearch');
            const faqSearchInput = document.getElementById('faqSearchInput');
            const noResultsFound = document.getElementById('noResultsFound');
            
            faqSearch.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchTerm = faqSearchInput.value.toLowerCase().trim();
                
                if (searchTerm === '') {
                    // If search is empty, reset view
                    resetFaqView();
                    return;
                }
                
                // Hide all content sections initially
                contents.forEach(content => content.classList.remove('active'));
                
                // Hide all accordion items initially
                const allAccordionItems = document.querySelectorAll('.accordion-item');
                allAccordionItems.forEach(item => item.style.display = 'none');
                
                // Flag to track if any results were found
                let resultsFound = false;
                
                // Search through all accordion items
                allAccordionItems.forEach(item => {
                    const question = item.querySelector('.accordion-button').textContent.toLowerCase();
                    const answer = item.querySelector('.accordion-content-inner').textContent.toLowerCase();
                    
                    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                        // Show this item
                        item.style.display = 'block';
                        
                        // Show the content section this item belongs to
                        const parentContent = item.closest('.faq-content');
                        parentContent.classList.add('active');
                        
                        // Update tab to match
                        const tabId = parentContent.id;
                        tabs.forEach(tab => {
                            if (tab.dataset.tab === tabId) {
                                tab.classList.add('active');
                            } else {
                                tab.classList.remove('active');
                            }
                        });
                        
                        resultsFound = true;
                    }
                });
                
                // Show "no results" message if needed
                if (!resultsFound) {
                    noResultsFound.classList.add('show');
                } else {
                    noResultsFound.classList.remove('show');
                }
            });
            
            // Reset view when search is cleared
            faqSearchInput.addEventListener('input', function() {
                if (this.value === '') {
                    resetFaqView();
                }
            });
            
            function resetFaqView() {
                // Reset accordion items visibility
                const allAccordionItems = document.querySelectorAll('.accordion-item');
                allAccordionItems.forEach(item => item.style.display = 'block');
                
                // Reset tabs and content sections
                tabs[0].click(); // Click the first tab to reset view
                
                // Hide "no results" message
                noResultsFound.classList.remove('show');
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