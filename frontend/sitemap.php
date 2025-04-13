<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap - GigGatek</title>
    <meta name="description" content="Explore the complete website structure of GigGatek. Find links to all our pages, product categories, support resources, and more.">

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
        .sitemap-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        .sitemap-section {
            margin-bottom: 40px;
        }

        .sitemap-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }

        .sitemap-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
        }

        .sitemap-category {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .sitemap-category:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .sitemap-category h3 {
            color: #007bff;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 22px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }

        .sitemap-category ul {
            list-style-type: none;
            padding-left: 0;
            margin-bottom: 0;
        }

        .sitemap-category ul li {
            margin-bottom: 10px;
            line-height: 1.4;
        }

        .sitemap-category ul li:last-child {
            margin-bottom: 0;
        }

        .sitemap-category ul li a {
            color: #555;
            text-decoration: none;
            transition: color 0.3s;
            display: block;
            padding: 5px 0;
        }

        .sitemap-category ul li a:hover {
            color: #007bff;
        }

        .sitemap-category ul li a i {
            margin-right: 8px;
            width: 18px;
            color: #777;
        }

        .subcategory {
            margin-left: 15px;
            border-left: 1px solid #eee;
            padding-left: 15px;
        }

        .subcategory li a {
            font-size: 0.95em;
        }

        .sitemap-search {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .sitemap-search h3 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 22px;
        }

        .search-form {
            display: flex;
            max-width: 600px;
        }

        .search-form input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 4px 0 0 4px;
            font-size: 16px;
        }

        .search-form button {
            padding: 12px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .search-form button:hover {
            background-color: #0069d9;
        }

        .search-form button i {
            margin-right: 5px;
        }

        .sitemap-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
        }

        @media (max-width: 768px) {
            .sitemap-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }

            .sitemap-category {
                padding: 15px;
            }

            .search-form {
                flex-direction: column;
            }

            .search-form input {
                border-radius: 4px;
                margin-bottom: 10px;
            }

            .search-form button {
                border-radius: 4px;
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
                <h1>Sitemap</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Sitemap</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="sitemap-content">
            <div class="sitemap-container">
                <div class="sitemap-search animate-on-scroll">
                    <h3>Search Our Site</h3>
                    <form action="products.php" method="get" class="search-form">
                        <input type="text" name="search" placeholder="What are you looking for?">
                        <button type="submit"><i class="fas fa-search"></i> Search</button>
                    </form>
                </div>

                <div class="sitemap-section animate-on-scroll">
                    <h2>Main Navigation</h2>
                    <div class="sitemap-grid">
                        <div class="sitemap-category">
                            <h3><i class="fas fa-home"></i> Home</h3>
                            <ul>
                                <li><a href="index.php"><i class="fas fa-angle-right"></i> Homepage</a></li>
                                <li><a href="index.php"><i class="fas fa-angle-right"></i> Featured Products</a></li>
                                <li><a href="index.php"><i class="fas fa-angle-right"></i> New Arrivals</a></li>
                                <li><a href="index.php"><i class="fas fa-angle-right"></i> Special Offers</a></li>
                                <li><a href="index.php"><i class="fas fa-angle-right"></i> Customer Testimonials</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-desktop"></i> Products</h3>
                            <ul>
                                <li><a href="products.php"><i class="fas fa-angle-right"></i> All Products</a></li>
                                <li><a href="products.php?category=laptops"><i class="fas fa-angle-right"></i> Laptops</a></li>
                                <li><a href="products.php?category=desktops"><i class="fas fa-angle-right"></i> Desktop Computers</a></li>
                                <li><a href="products.php?category=monitors"><i class="fas fa-angle-right"></i> Monitors</a></li>
                                <li><a href="products.php?category=components"><i class="fas fa-angle-right"></i> Computer Components</a></li>
                                <li><a href="products.php?category=accessories"><i class="fas fa-angle-right"></i> Accessories</a></li>
                                <li><a href="products.php?category=networking"><i class="fas fa-angle-right"></i> Networking</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-handshake"></i> Rent-to-Own</h3>
                            <ul>
                                <li><a href="rent-to-own.php"><i class="fas fa-angle-right"></i> Rent-to-Own Program</a></li>
                                <li><a href="rent-to-own.php"><i class="fas fa-angle-right"></i> How It Works</a></li>
                                <li><a href="rent-to-own.php"><i class="fas fa-angle-right"></i> Eligible Products</a></li>
                                <li><a href="rent-to-own.php"><i class="fas fa-angle-right"></i> Payment Calculator</a></li>
                                <li><a href="rent-to-own.php"><i class="fas fa-angle-right"></i> Frequently Asked Questions</a></li>
                                <li><a href="rent-to-own.php"><i class="fas fa-angle-right"></i> Apply Now</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-headset"></i> Support</h3>
                            <ul>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Support Center</a></li>
                                <li><a href="faq.php"><i class="fas fa-angle-right"></i> Frequently Asked Questions</a></li>
                                <li><a href="contact.php"><i class="fas fa-angle-right"></i> Contact Us</a></li>
                                <li><a href="warranty-information.php"><i class="fas fa-angle-right"></i> Warranty Information</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Troubleshooting Guides</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Returns & Exchanges</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Technical Support</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="sitemap-section animate-on-scroll">
                    <h2>User Account</h2>
                    <div class="sitemap-grid">
                        <div class="sitemap-category">
                            <h3><i class="fas fa-user-circle"></i> My Account</h3>
                            <ul>
                                <li><a href="login.php"><i class="fas fa-angle-right"></i> Login</a></li>
                                <li><a href="register.php"><i class="fas fa-angle-right"></i> Register</a></li>
                                <li><a href="dashboard.php"><i class="fas fa-angle-right"></i> Account Dashboard</a></li>
                                <li><a href="dashboard.php?section=profile"><i class="fas fa-angle-right"></i> My Profile</a></li>
                                <li><a href="dashboard.php?section=orders"><i class="fas fa-angle-right"></i> Order History</a></li>
                                <li><a href="dashboard.php?section=rentals"><i class="fas fa-angle-right"></i> My Rentals</a></li>
                                <li><a href="dashboard.php?section=wishlist"><i class="fas fa-angle-right"></i> Wishlist</a></li>
                                <li><a href="dashboard.php?section=addresses"><i class="fas fa-angle-right"></i> Address Book</a></li>
                                <li><a href="dashboard.php?section=payment-methods"><i class="fas fa-angle-right"></i> Payment Methods</a></li>
                                <li><a href="dashboard.php?section=password"><i class="fas fa-angle-right"></i> Change Password</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-shopping-bag"></i> Shopping</h3>
                            <ul>
                                <li><a href="cart.php"><i class="fas fa-angle-right"></i> Shopping Cart</a></li>
                                <li><a href="checkout.php"><i class="fas fa-angle-right"></i> Checkout</a></li>
                                <li><a href="order-confirmation.php"><i class="fas fa-angle-right"></i> Order Confirmation</a></li>
                                <li><a href="wishlist.php"><i class="fas fa-angle-right"></i> Wishlist</a></li>
                                <li><a href="dashboard.php?section=track-order"><i class="fas fa-angle-right"></i> Track Order</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="sitemap-section animate-on-scroll">
                    <h2>Product Categories</h2>
                    <div class="sitemap-grid">
                        <div class="sitemap-category">
                            <h3><i class="fas fa-laptop"></i> Laptops</h3>
                            <ul>
                                <li><a href="products.php?category=laptops&type=business"><i class="fas fa-angle-right"></i> Business Laptops</a></li>
                                <li><a href="products.php?category=laptops&type=gaming"><i class="fas fa-angle-right"></i> Gaming Laptops</a></li>
                                <li><a href="products.php?category=laptops&type=ultrabook"><i class="fas fa-angle-right"></i> Ultrabooks</a></li>
                                <li><a href="products.php?category=laptops&type=convertible"><i class="fas fa-angle-right"></i> 2-in-1 Convertibles</a></li>
                                <li><a href="products.php?category=laptops&type=budget"><i class="fas fa-angle-right"></i> Budget Laptops</a></li>
                                <li><a href="products.php?category=laptops&type=workstation"><i class="fas fa-angle-right"></i> Mobile Workstations</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-desktop"></i> Desktop Computers</h3>
                            <ul>
                                <li><a href="products.php?category=desktops&type=all-in-one"><i class="fas fa-angle-right"></i> All-in-One Desktops</a></li>
                                <li><a href="products.php?category=desktops&type=gaming"><i class="fas fa-angle-right"></i> Gaming Desktops</a></li>
                                <li><a href="products.php?category=desktops&type=business"><i class="fas fa-angle-right"></i> Business Desktops</a></li>
                                <li><a href="products.php?category=desktops&type=workstation"><i class="fas fa-angle-right"></i> Workstations</a></li>
                                <li><a href="products.php?category=desktops&type=mini"><i class="fas fa-angle-right"></i> Mini PCs</a></li>
                                <li><a href="products.php?category=desktops&type=server"><i class="fas fa-angle-right"></i> Servers</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-tv"></i> Monitors</h3>
                            <ul>
                                <li><a href="products.php?category=monitors&type=office"><i class="fas fa-angle-right"></i> Office Monitors</a></li>
                                <li><a href="products.php?category=monitors&type=gaming"><i class="fas fa-angle-right"></i> Gaming Monitors</a></li>
                                <li><a href="products.php?category=monitors&type=professional"><i class="fas fa-angle-right"></i> Professional Monitors</a></li>
                                <li><a href="products.php?category=monitors&type=ultrawide"><i class="fas fa-angle-right"></i> Ultrawide Monitors</a></li>
                                <li><a href="products.php?category=monitors&type=4k"><i class="fas fa-angle-right"></i> 4K Monitors</a></li>
                                <li><a href="products.php?category=monitors&type=touch"><i class="fas fa-angle-right"></i> Touch Screen Monitors</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-microchip"></i> Computer Components</h3>
                            <ul>
                                <li><a href="products.php?category=components&type=processors"><i class="fas fa-angle-right"></i> Processors (CPUs)</a></li>
                                <li><a href="products.php?category=components&type=graphics-cards"><i class="fas fa-angle-right"></i> Graphics Cards (GPUs)</a></li>
                                <li><a href="products.php?category=components&type=memory"><i class="fas fa-angle-right"></i> Memory (RAM)</a></li>
                                <li><a href="products.php?category=components&type=storage"><i class="fas fa-angle-right"></i> Storage (SSDs, HDDs)</a></li>
                                <li><a href="products.php?category=components&type=motherboards"><i class="fas fa-angle-right"></i> Motherboards</a></li>
                                <li><a href="products.php?category=components&type=power-supplies"><i class="fas fa-angle-right"></i> Power Supplies</a></li>
                                <li><a href="products.php?category=components&type=cooling"><i class="fas fa-angle-right"></i> Cooling Systems</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-keyboard"></i> Accessories</h3>
                            <ul>
                                <li><a href="products.php?category=accessories&type=keyboards"><i class="fas fa-angle-right"></i> Keyboards</a></li>
                                <li><a href="products.php?category=accessories&type=mice"><i class="fas fa-angle-right"></i> Mice & Pointing Devices</a></li>
                                <li><a href="products.php?category=accessories&type=headsets"><i class="fas fa-angle-right"></i> Headsets & Audio</a></li>
                                <li><a href="products.php?category=accessories&type=webcams"><i class="fas fa-angle-right"></i> Webcams</a></li>
                                <li><a href="products.php?category=accessories&type=docking"><i class="fas fa-angle-right"></i> Docking Stations</a></li>
                                <li><a href="products.php?category=accessories&type=cables"><i class="fas fa-angle-right"></i> Cables & Adapters</a></li>
                                <li><a href="products.php?category=accessories&type=bags"><i class="fas fa-angle-right"></i> Laptop Bags & Cases</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-network-wired"></i> Networking</h3>
                            <ul>
                                <li><a href="products.php?category=networking&type=routers"><i class="fas fa-angle-right"></i> Routers</a></li>
                                <li><a href="products.php?category=networking&type=switches"><i class="fas fa-angle-right"></i> Switches</a></li>
                                <li><a href="products.php?category=networking&type=wifi"><i class="fas fa-angle-right"></i> WiFi Systems</a></li>
                                <li><a href="products.php?category=networking&type=modems"><i class="fas fa-angle-right"></i> Modems</a></li>
                                <li><a href="products.php?category=networking&type=adapters"><i class="fas fa-angle-right"></i> Network Adapters</a></li>
                                <li><a href="products.php?category=networking&type=security"><i class="fas fa-angle-right"></i> Network Security</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="sitemap-section animate-on-scroll">
                    <h2>Information Pages</h2>
                    <div class="sitemap-grid">
                        <div class="sitemap-category">
                            <h3><i class="fas fa-info-circle"></i> Company Info</h3>
                            <ul>
                                <li><a href="about-us.php"><i class="fas fa-angle-right"></i> About Us</a></li>
                                <li><a href="our-story.php"><i class="fas fa-angle-right"></i> Our Story</a></li>
                                <li><a href="team.php"><i class="fas fa-angle-right"></i> Our Team</a></li>
                                <li><a href="careers.php"><i class="fas fa-angle-right"></i> Careers</a></li>
                                <li><a href="blog.php"><i class="fas fa-angle-right"></i> Blog</a></li>
                                <li><a href="news.php"><i class="fas fa-angle-right"></i> News & Press</a></li>
                                <li><a href="testimonials.php"><i class="fas fa-angle-right"></i> Customer Testimonials</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-file-alt"></i> Policies & Legal</h3>
                            <ul>
                                <li><a href="privacy-policy.php"><i class="fas fa-angle-right"></i> Privacy Policy</a></li>
                                <li><a href="terms-of-service.php"><i class="fas fa-angle-right"></i> Terms of Service</a></li>
                                <li><a href="shipping-policy.php"><i class="fas fa-angle-right"></i> Shipping Policy</a></li>
                                <li><a href="return-policy.php"><i class="fas fa-angle-right"></i> Return Policy</a></li>
                                <li><a href="warranty-information.php"><i class="fas fa-angle-right"></i> Warranty Information</a></li>
                                <li><a href="accessibility.php"><i class="fas fa-angle-right"></i> Accessibility Statement</a></li>
                                <li><a href="cookies-policy.php"><i class="fas fa-angle-right"></i> Cookies Policy</a></li>
                            </ul>
                        </div>

                        <div class="sitemap-category">
                            <h3><i class="fas fa-question-circle"></i> Help & Resources</h3>
                            <ul>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Computer Buying Guide</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Tech Glossary</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Product Comparisons</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Computer Maintenance Tips</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Tech Support Resources</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Video Tutorials</a></li>
                                <li><a href="support.php"><i class="fas fa-angle-right"></i> Downloads & Manuals</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="sitemap-footer animate-on-scroll">
                    <p>Can't find what you're looking for? <a href="contact.php">Contact us</a> for assistance.</p>
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
            // Add animation for cards
            const cards = document.querySelectorAll('.sitemap-category');

            const animateCards = () => {
                cards.forEach(card => {
                    const cardPosition = card.getBoundingClientRect().top;
                    const screenPosition = window.innerHeight / 1.2;

                    if (cardPosition < screenPosition) {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }
                });
            };

            // Set initial styles
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            });

            // Run animation on load and scroll
            animateCards();
            window.addEventListener('scroll', animateCards);
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