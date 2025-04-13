<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warranty Information - GigGatek</title>
    <meta name="description" content="Learn about GigGatek's warranty coverage, extended protection plans, and how to file warranty claims for your tech purchases.">

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
        
        .warranty-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .warranty-table th, .warranty-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .warranty-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .warranty-table tr:last-child td {
            border-bottom: none;
        }
        
        .warranty-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .warranty-info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        
        .warranty-info-card.warning {
            border-left-color: #ffc107;
        }
        
        .warranty-info-card.danger {
            border-left-color: #dc3545;
        }
        
        .warranty-info-card.success {
            border-left-color: #28a745;
        }
        
        .warranty-info-card h4 {
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .warranty-info-card.warning h4 {
            color: #856404;
        }
        
        .warranty-info-card.danger h4 {
            color: #721c24;
        }
        
        .warranty-info-card.success h4 {
            color: #155724;
        }
        
        .warranty-info-card p {
            margin-bottom: 10px;
        }
        
        .warranty-steps {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
        }
        
        .warranty-step {
            flex: 1;
            min-width: 200px;
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            position: relative;
        }
        
        .warranty-step .step-number {
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
        
        .warranty-step h4 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .warranty-step p {
            margin-bottom: 0;
        }
        
        .warranty-plans {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
        }
        
        .warranty-plan {
            flex: 1;
            min-width: 250px;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .warranty-plan:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .warranty-plan h4 {
            color: #007bff;
            font-size: 22px;
            margin-bottom: 10px;
        }
        
        .warranty-plan .price {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin-bottom: 15px;
        }
        
        .warranty-plan .price span {
            font-size: 14px;
            font-weight: 400;
            color: #777;
        }
        
        .warranty-plan ul {
            text-align: left;
            padding-left: 20px;
            margin-bottom: 20px;
        }
        
        .warranty-plan ul li {
            margin-bottom: 8px;
        }
        
        .warranty-plan .btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
            display: inline-block;
            text-decoration: none;
        }
        
        .warranty-plan .btn:hover {
            background-color: #0069d9;
        }
        
        .warranty-plan.featured {
            border: 2px solid #007bff;
            position: relative;
            transform: scale(1.05);
        }
        
        .warranty-plan.featured::before {
            content: "RECOMMENDED";
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #007bff;
            color: white;
            padding: 5px 10px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 4px;
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
        
        .warranty-calculator {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            margin-bottom: 40px;
        }
        
        .warranty-calculator h3 {
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
        
        @media (max-width: 768px) {
            .calculator-form {
                grid-template-columns: 1fr;
            }
            
            .btn-calculate {
                grid-column: span 1;
            }
            
            .warranty-steps, .warranty-plans {
                flex-direction: column;
            }
            
            .warranty-plan.featured {
                transform: scale(1);
                margin: 10px 0;
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
                <h1>Warranty Information</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Warranty Information</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="policy-content">
            <div class="container">
                <div class="policy-section animate-on-scroll">
                    <p class="last-updated">Last Updated: April 10, 2025</p>
                    <p>At GigGatek, we stand behind the quality of our products. This warranty information outlines the coverage, terms, and procedures for all warranty claims on GigGatek products. Our warranty policies are designed to provide you with peace of mind and ensure your satisfaction with your purchase.</p>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Standard Warranty Coverage</h2>
                    <p>All products purchased from GigGatek come with our standard warranty coverage. The duration and specifics of coverage vary by product category:</p>

                    <table class="warranty-table">
                        <thead>
                            <tr>
                                <th>Product Category</th>
                                <th>Warranty Period</th>
                                <th>Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Refurbished Computers & Laptops</td>
                                <td>90 days</td>
                                <td>Parts and labor for manufacturing defects</td>
                            </tr>
                            <tr>
                                <td>Certified Refurbished Computers & Laptops</td>
                                <td>1 year</td>
                                <td>Parts and labor for manufacturing defects</td>
                            </tr>
                            <tr>
                                <td>Monitors & Displays</td>
                                <td>90 days</td>
                                <td>Parts and labor, including pixel defects exceeding manufacturer standards</td>
                            </tr>
                            <tr>
                                <td>Computer Components (RAM, SSDs, etc.)</td>
                                <td>60 days</td>
                                <td>Replacement for defective parts</td>
                            </tr>
                            <tr>
                                <td>Peripherals & Accessories</td>
                                <td>30 days</td>
                                <td>Replacement for defective items</td>
                            </tr>
                            <tr>
                                <td>Networking Equipment</td>
                                <td>90 days</td>
                                <td>Parts and labor for manufacturing defects</td>
                            </tr>
                            <tr>
                                <td>Rent-to-Own Products</td>
                                <td>Duration of rental period</td>
                                <td>Comprehensive coverage (see Rent-to-Own section)</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="warranty-info-card">
                        <h4>Warranty Start Date</h4>
                        <p>Your warranty period begins on the date of product delivery to the shipping address you provided. Proof of purchase is required for all warranty claims.</p>
                        <p>For replacement products provided under warranty, the warranty coverage will be the remainder of the original warranty or 30 days, whichever is longer.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Extended Protection Plans</h2>
                    <p>For additional peace of mind, GigGatek offers Extended Protection Plans that provide coverage beyond our standard warranty. These plans must be purchased at the time of your product purchase.</p>

                    <div class="warranty-plans">
                        <div class="warranty-plan">
                            <h4>Basic Protection</h4>
                            <div class="price">From $49.99 <span>one-time payment</span></div>
                            <ul>
                                <li>Extends standard warranty by 1 additional year</li>
                                <li>Covers the same defects as standard warranty</li>
                                <li>Free shipping on warranty repairs</li>
                                <li>24/7 technical support</li>
                            </ul>
                            <a href="#" class="btn">Learn More</a>
                        </div>
                        <div class="warranty-plan featured">
                            <h4>Premium Protection</h4>
                            <div class="price">From $89.99 <span>one-time payment</span></div>
                            <ul>
                                <li>Extends standard warranty by 2 additional years</li>
                                <li>Covers the same defects as standard warranty</li>
                                <li>Free shipping on warranty repairs</li>
                                <li>24/7 priority technical support</li>
                                <li>One free accidental damage repair</li>
                                <li>No-hassle replacement for qualifying issues</li>
                            </ul>
                            <a href="#" class="btn">Learn More</a>
                        </div>
                        <div class="warranty-plan">
                            <h4>Business Protection</h4>
                            <div class="price">From $129.99 <span>one-time payment</span></div>
                            <ul>
                                <li>Extends standard warranty by 3 additional years</li>
                                <li>Covers the same defects as standard warranty</li>
                                <li>Free expedited shipping on warranty repairs</li>
                                <li>24/7 dedicated business technical support</li>
                                <li>Two free accidental damage repairs</li>
                                <li>Next-business-day replacement for qualifying issues</li>
                                <li>Data recovery services</li>
                            </ul>
                            <a href="#" class="btn">Learn More</a>
                        </div>
                    </div>

                    <div class="warranty-calculator">
                        <h3>Extended Protection Plan Calculator</h3>
                        <form id="warranty-calculator-form" class="calculator-form">
                            <div class="form-group">
                                <label for="product-category">Product Category:</label>
                                <select id="product-category" class="form-control">
                                    <option value="">Select Category</option>
                                    <option value="computers">Computers & Laptops</option>
                                    <option value="monitors">Monitors & Displays</option>
                                    <option value="components">Computer Components</option>
                                    <option value="peripherals">Peripherals & Accessories</option>
                                    <option value="networking">Networking Equipment</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="product-price">Product Price ($):</label>
                                <input type="number" id="product-price" class="form-control" min="0" step="0.01" placeholder="Enter product price">
                            </div>
                            <div class="form-group">
                                <label for="protection-level">Protection Level:</label>
                                <select id="protection-level" class="form-control">
                                    <option value="">Select Protection Level</option>
                                    <option value="basic">Basic Protection</option>
                                    <option value="premium">Premium Protection</option>
                                    <option value="business">Business Protection</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="business-use">Business Use:</label>
                                <select id="business-use" class="form-control">
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            <button type="button" class="btn-calculate" id="calculate-protection">Calculate Price</button>
                            
                            <div class="calculation-result" id="calculation-result">
                                <h4>Protection Plan Price:</h4>
                                <p id="protection-cost">$0.00</p>
                                <p id="coverage-details"></p>
                                <p id="recommendation"></p>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Warranty Claim Process</h2>
                    <p>If you experience an issue with a GigGatek product that you believe is covered under warranty, please follow these steps to initiate a warranty claim:</p>

                    <div class="warranty-steps">
                        <div class="warranty-step">
                            <div class="step-number">1</div>
                            <h4>Gather Information</h4>
                            <p>Collect your order number, product details (including serial number if applicable), and a detailed description of the issue you're experiencing. Photos or videos demonstrating the issue are helpful when applicable.</p>
                        </div>
                        <div class="warranty-step">
                            <div class="step-number">2</div>
                            <h4>Contact Support</h4>
                            <p>Submit a warranty claim through your GigGatek account or contact our customer service team at warranty@giggatek.com or (555) 123-4567. Our technical support team may provide troubleshooting steps to resolve the issue remotely.</p>
                        </div>
                        <div class="warranty-step">
                            <div class="step-number">3</div>
                            <h4>Obtain RMA</h4>
                            <p>If the issue can't be resolved remotely, you'll receive a Return Merchandise Authorization (RMA) number and return instructions. All warranty returns require an RMA number.</p>
                        </div>
                        <div class="warranty-step">
                            <div class="step-number">4</div>
                            <h4>Ship the Product</h4>
                            <p>Package the product securely in its original packaging if possible. Include all accessories that came with the product unless otherwise instructed. Clearly mark the RMA number on the outside of the package.</p>
                        </div>
                        <div class="warranty-step">
                            <div class="step-number">5</div>
                            <h4>Evaluation & Resolution</h4>
                            <p>Our technical team will evaluate the product to verify the issue and warranty coverage. We'll then repair or replace the product as appropriate according to our warranty terms.</p>
                        </div>
                        <div class="warranty-step">
                            <div class="step-number">6</div>
                            <h4>Return Shipping</h4>
                            <p>Once repaired or replaced, we'll return the product to you. Standard warranty returns are shipped via ground shipping. Extended Protection Plan customers may receive expedited shipping.</p>
                        </div>
                    </div>

                    <div class="warranty-info-card warning">
                        <h4>Important Warranty Claim Information</h4>
                        <p>For most products, the customer is responsible for shipping costs to send the product to GigGatek for warranty service. GigGatek covers the cost of return shipping after service is completed.</p>
                        <p>Customers with Extended Protection Plans receive free two-way shipping on all warranty claims.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>What's Not Covered</h2>
                    <p>While our warranty provides coverage for manufacturing defects, certain conditions and damages are not covered:</p>

                    <ul>
                        <li><strong>Normal wear and tear</strong> that occurs with regular product use</li>
                        <li><strong>Accidental damage</strong> such as drops, spills, or electrical surges (unless covered by an Extended Protection Plan)</li>
                        <li><strong>Cosmetic damage</strong> that doesn't affect product functionality</li>
                        <li><strong>Unauthorized modifications</strong> or repairs by third parties</li>
                        <li><strong>Software issues</strong> unrelated to hardware defects, including viruses, malware, or user-installed software</li>
                        <li><strong>Environmental damage</strong> caused by exposure to extreme temperatures, liquids, or other harmful elements</li>
                        <li><strong>Improper use</strong> or failure to follow product instructions</li>
                        <li><strong>Consumable parts</strong> such as batteries after the first 30 days (batteries are covered for manufacturing defects for 30 days)</li>
                        <li><strong>Products with altered or removed serial numbers</strong></li>
                        <li><strong>Products purchased from unauthorized resellers</strong></li>
                    </ul>

                    <div class="warranty-info-card danger">
                        <h4>Warranty Voiding Actions</h4>
                        <p>The following actions will void your product warranty:</p>
                        <ul>
                            <li>Physical damage to the product due to misuse, accidents, or negligence</li>
                            <li>Unauthorized modification or tampering with hardware or firmware</li>
                            <li>Removal or alteration of product serial numbers or warranty seals</li>
                            <li>Operating the product outside of its environmental specifications</li>
                            <li>Using non-approved accessories or components that cause damage</li>
                        </ul>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Special Conditions for Rent-to-Own Products</h2>
                    <p>Our rent-to-own products come with special warranty coverage designed to provide comprehensive protection throughout the rental period:</p>

                    <ul>
                        <li><strong>Coverage Duration:</strong> Warranty coverage remains active for the entire duration of your rental period.</li>
                        <li><strong>Coverage Scope:</strong> Includes all manufacturing defects and normal equipment failures that are not the result of misuse or abuse.</li>
                        <li><strong>Replacements:</strong> If a rental product cannot be repaired in a timely manner, we'll provide a comparable replacement device at no additional cost.</li>
                        <li><strong>End of Rental:</strong> Once you complete your rent-to-own term and take ownership of the product, standard warranty coverage (based on product category) begins from the ownership transfer date.</li>
                        <li><strong>Coverage Limitations:</strong> While our rental warranty is comprehensive, it does not cover intentional damage, theft, or loss. We recommend considering personal insurance for these scenarios.</li>
                    </ul>

                    <div class="warranty-info-card success">
                        <h4>Extended Protection for Rent-to-Own</h4>
                        <p>When you complete your rent-to-own term and take ownership of the product, you have the option to purchase an Extended Protection Plan at a 25% discount within 30 days of ownership transfer. This provides continued coverage beyond the standard warranty.</p>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Warranty FAQs</h2>
                    <div class="faq-container">
                        <div class="faq-item">
                            <div class="faq-question">What's the difference between the standard warranty and an Extended Protection Plan?</div>
                            <div class="faq-answer">
                                <p>The standard warranty covers manufacturing defects for a specific period after purchase, with coverage varying by product category. Extended Protection Plans offer longer coverage periods, additional benefits like accidental damage protection, priority support, and free shipping for warranty claims. These plans provide more comprehensive coverage and peace of mind beyond the standard warranty period.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">How do I know if a problem is covered under warranty?</div>
                            <div class="faq-answer">
                                <p>Generally, any hardware malfunction or failure that occurs during normal use and is not caused by accidental damage, misuse, or unauthorized modifications is covered under warranty. If you're unsure, contact our technical support team who can help determine if your issue is covered. The team may walk you through troubleshooting steps to accurately diagnose the problem. Issues like software problems, virus infections, or physical damage typically aren't covered under the standard warranty.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">Can I transfer my warranty to someone else if I sell the product?</div>
                            <div class="faq-answer">
                                <p>Yes, our standard warranties are transferable. If you sell or gift a GigGatek product, the remaining warranty period transfers to the new owner. The new owner will need the original proof of purchase and should contact our customer service to update the ownership information in our system. Extended Protection Plans, however, are typically non-transferable and remain with the original purchaser unless special arrangements are made through customer service.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">What happens to my data during a warranty repair?</div>
                            <div class="faq-answer">
                                <p>GigGatek is not responsible for backing up or preserving any data stored on products sent in for warranty service. We always recommend backing up all data before sending any device for repair. During the repair process, we may need to reinstall the operating system or replace storage components, which could result in data loss. In some cases, our technicians may attempt to preserve data if possible, but this cannot be guaranteed. Customers with Business Protection Plans do have access to data recovery services as part of their coverage.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">How long do warranty repairs typically take?</div>
                            <div class="faq-answer">
                                <p>Our standard warranty repair time is 7-10 business days from the time we receive your product (not including shipping time). This can vary based on the nature of the repair, part availability, and current service volume. Customers with Extended Protection Plans receive priority service, with Premium Protection repairs typically taking 3-5 business days and Business Protection repairs taking 1-3 business days. You can check the status of your warranty repair at any time through your GigGatek account or by contacting customer service with your RMA number.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="policy-section animate-on-scroll">
                    <h2>Contact Us About Warranty</h2>
                    <p>If you have questions about warranty coverage or need to initiate a warranty claim:</p>
                    <ul>
                        <li>Email: warranty@giggatek.com</li>
                        <li>Phone: (555) 123-4567</li>
                        <li>Live Chat: Available on our website during business hours</li>
                        <li>Account Portal: Log in to your GigGatek account and select "Support" → "Warranty Claims"</li>
                    </ul>
                    <p>Our warranty policies are subject to change. We recommend checking this page periodically for updates. Any warranty policy changes will only apply to purchases made after the change date.</p>
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
            
            // Protection Plan Calculator
            const calculateBtn = document.getElementById('calculate-protection');
            
            calculateBtn.addEventListener('click', function() {
                const category = document.getElementById('product-category').value;
                const price = parseFloat(document.getElementById('product-price').value) || 0;
                const level = document.getElementById('protection-level').value;
                const businessUse = document.getElementById('business-use').value;
                
                if (!category || !price || !level) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                // Simple protection plan calculation logic
                let protectionCost = 0;
                let coverageDetails = '';
                let recommendation = '';
                
                // Base rates
                const rates = {
                    basic: 0.1,    // 10% of product price
                    premium: 0.15, // 15% of product price
                    business: 0.2  // 20% of product price
                };
                
                // Category multipliers
                const categoryMultipliers = {
                    computers: 1.0,
                    monitors: 0.9,
                    components: 0.8,
                    peripherals: 0.7,
                    networking: 0.85
                };
                
                // Business use multiplier
                const businessMultiplier = businessUse === 'yes' ? 1.2 : 1.0;
                
                // Calculate cost
                protectionCost = price * rates[level] * categoryMultipliers[category] * businessMultiplier;
                
                // Minimum costs
                const minimumCosts = {
                    basic: 49.99,
                    premium: 89.99,
                    business: 129.99
                };
                
                // Ensure we're not below minimum cost
                protectionCost = Math.max(protectionCost, minimumCosts[level]);
                
                // Round to two decimal places
                protectionCost = protectionCost.toFixed(2);
                
                // Set coverage details based on protection level
                if (level === 'basic') {
                    coverageDetails = 'Extends standard warranty by 1 year with free shipping on warranty repairs and 24/7 technical support.';
                } else if (level === 'premium') {
                    coverageDetails = 'Extends standard warranty by 2 years with free shipping, 24/7 priority support, and one free accidental damage repair.';
                } else if (level === 'business') {
                    coverageDetails = 'Extends standard warranty by 3 years with expedited shipping, dedicated support, two accidental damage repairs, and data recovery services.';
                }
                
                // Set recommendation
                if (price > 500) {
                    recommendation = 'For high-value items like this, we recommend Premium or Business Protection for maximum coverage.';
                } else if (businessUse === 'yes') {
                    recommendation = 'For business use, we recommend Business Protection to minimize downtime and ensure continuity.';
                } else {
                    recommendation = 'This protection plan provides excellent value for your investment.';
                }
                
                // Display results
                document.getElementById('protection-cost').textContent = `$${protectionCost}`;
                document.getElementById('coverage-details').textContent = coverageDetails;
                document.getElementById('recommendation').textContent = recommendation;
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