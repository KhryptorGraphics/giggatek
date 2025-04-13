<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - GigGatek</title>
    <meta name="description" content="Get in touch with GigGatek's customer support team. We're here to help with all your questions about products, orders, rentals, and technical support.">

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
        /* Contact page specific styles */
        .contact-section {
            padding: 60px 0;
        }
        
        .contact-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        
        .contact-method {
            padding: 30px;
            background-color: #f7f9fc;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .contact-method:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .contact-icon {
            width: 70px;
            height: 70px;
            line-height: 70px;
            background-color: rgba(0, 123, 255, 0.1);
            border-radius: 50%;
            margin: 0 auto 20px;
            color: #007bff;
            font-size: 24px;
        }
        
        .contact-method h3 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .contact-method p {
            margin-bottom: 20px;
            color: #666;
        }
        
        .contact-form {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 5px 30px rgba(0,0,0,0.08);
        }
        
        .form-row {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        
        .form-control {
            width: 100%;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-control:focus {
            border-color: #007bff;
            outline: none;
        }
        
        textarea.form-control {
            min-height: 150px;
            resize: vertical;
        }
        
        .btn-submit {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            font-weight: 500;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .btn-submit:hover {
            background-color: #0069d9;
        }
        
        .form-row {
            display: flex;
            gap: 20px;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        .contact-map {
            height: 450px;
            margin-top: 60px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 30px rgba(0,0,0,0.1);
        }
        
        .contact-map iframe {
            width: 100%;
            height: 100%;
            border: 0;
        }
        
        .business-hours {
            margin-top: 60px;
            padding: 40px;
            background-color: #f7f9fc;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .business-hours h3 {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .hours-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .hours-table th, .hours-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .hours-table th {
            font-weight: 500;
            color: #333;
        }
        
        .hours-table td {
            color: #666;
        }
        
        .today {
            font-weight: 500;
            color: #007bff !important;
        }
        
        @media (max-width: 768px) {
            .form-row {
                flex-direction: column;
                gap: 0;
            }
            
            .contact-methods {
                grid-template-columns: 1fr;
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
                <h1>Contact Us</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Contact Us</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="contact-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <h2>Get In Touch</h2>
                    <p>Have questions, comments, or need support? We're here to help!</p>
                </div>

                <div class="contact-methods">
                    <div class="contact-method animate-on-scroll">
                        <div class="contact-icon">
                            <i class="fas fa-phone-alt"></i>
                        </div>
                        <h3>Call Us</h3>
                        <p>Our customer service team is ready to assist you Monday through Friday, 9AM-6PM EST.</p>
                        <p><strong>Customer Support:</strong> (555) 123-4567</p>
                        <p><strong>Technical Support:</strong> (555) 234-5678</p>
                        <p><strong>Billing & Payments:</strong> (555) 345-6789</p>
                    </div>

                    <div class="contact-method animate-on-scroll" data-delay="100">
                        <div class="contact-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <h3>Email Us</h3>
                        <p>Send us an email and we'll get back to you within 24 hours during business days.</p>
                        <p><strong>General Inquiries:</strong> info@giggatek.com</p>
                        <p><strong>Customer Support:</strong> support@giggatek.com</p>
                        <p><strong>Technical Support:</strong> techsupport@giggatek.com</p>
                    </div>

                    <div class="contact-method animate-on-scroll" data-delay="200">
                        <div class="contact-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3>Visit Us</h3>
                        <p>Our headquarters is located in the heart of the tech district.</p>
                        <p>123 Tech Avenue<br>Suite 400<br>Silicon Valley, CA 94123<br>United States</p>
                    </div>
                </div>

                <div class="contact-form animate-on-scroll">
                    <h3>Send Us a Message</h3>
                    <form id="contactForm" action="api/contact/submit.php" method="post">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input type="text" id="firstName" name="firstName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name *</label>
                                <input type="text" id="lastName" name="lastName" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" class="form-control">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="subject">Subject *</label>
                            <select id="subject" name="subject" class="form-control" required>
                                <option value="">Select a subject</option>
                                <option value="Product Inquiry">Product Inquiry</option>
                                <option value="Order Status">Order Status</option>
                                <option value="Rent-to-Own Inquiry">Rent-to-Own Inquiry</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Returns & Warranty">Returns & Warranty</option>
                                <option value="Billing Question">Billing Question</option>
                                <option value="Website Feedback">Website Feedback</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="orderNumber">Order Number (if applicable)</label>
                            <input type="text" id="orderNumber" name="orderNumber" class="form-control">
                        </div>

                        <div class="form-group">
                            <label for="message">Message *</label>
                            <textarea id="message" name="message" class="form-control" required></textarea>
<div class="form-group">
    <div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY"></div>
</div>
                        </div>

                        <div class="form-group">
                            <button type="submit" class="btn-submit">Send Message</button>
                        </div>
                    </form>
                </div>

                <div class="contact-map animate-on-scroll">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.7206442461147!2d-122.41941708436047!3d37.77492147975643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sTwitter!5e0!3m2!1sen!2sus!4v1649861787100!5m2!1sen!2sus" allowfullscreen="" loading="lazy"></iframe>
                </div>

                <div class="business-hours animate-on-scroll">
                    <h3>Business Hours</h3>
                    <table class="hours-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Customer Support</th>
                                <th>Technical Support</th>
                                <th>Headquarters</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="monday">
                                <td>Monday</td>
                                <td>9:00 AM - 6:00 PM EST</td>
                                <td>8:00 AM - 8:00 PM EST</td>
                                <td>9:00 AM - 5:00 PM PST</td>
                            </tr>
                            <tr class="tuesday">
                                <td>Tuesday</td>
                                <td>9:00 AM - 6:00 PM EST</td>
                                <td>8:00 AM - 8:00 PM EST</td>
                                <td>9:00 AM - 5:00 PM PST</td>
                            </tr>
                            <tr class="wednesday">
                                <td>Wednesday</td>
                                <td>9:00 AM - 6:00 PM EST</td>
                                <td>8:00 AM - 8:00 PM EST</td>
                                <td>9:00 AM - 5:00 PM PST</td>
                            </tr>
                            <tr class="thursday">
                                <td>Thursday</td>
                                <td>9:00 AM - 6:00 PM EST</td>
                                <td>8:00 AM - 8:00 PM EST</td>
                                <td>9:00 AM - 5:00 PM PST</td>
                            </tr>
                            <tr class="friday">
                                <td>Friday</td>
                                <td>9:00 AM - 6:00 PM EST</td>
                                <td>8:00 AM - 8:00 PM EST</td>
                                <td>9:00 AM - 5:00 PM PST</td>
                            </tr>
                            <tr class="saturday">
                                <td>Saturday</td>
                                <td>10:00 AM - 4:00 PM EST</td>
                                <td>10:00 AM - 6:00 PM EST</td>
                                <td>Closed</td>
                            </tr>
                            <tr class="sunday">
                                <td>Sunday</td>
                                <td>Closed</td>
                                <td>Emergency Support Only</td>
                                <td>Closed</td>
                            </tr>
                        </tbody>
                    </table>
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
            // Form validation and submission
            const contactForm = document.getElementById('contactForm');
            
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validate form
                let isValid = true;
                const requiredFields = contactForm.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                    } else {
                        field.classList.remove('error');
                    }
                });
                
                // Submit form if valid
                if (isValid) {
                    // In a real application, you would typically use AJAX to submit the form
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                }
            });
            
            // Highlight today in business hours table
            const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const dayMap = {
                0: 'sunday',
                1: 'monday',
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday',
                6: 'saturday'
            };
            
            const todayRow = document.querySelector(`.${dayMap[today]}`);
            if (todayRow) {
                todayRow.classList.add('today');
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