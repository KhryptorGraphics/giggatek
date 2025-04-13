<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - GigGatek</title>
    <meta name="description" content="Thank you for your order at GigGatek. Your purchase of quality refurbished computer hardware is confirmed.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">family=Montserrat:wght@400;500;600;700;800<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">family=Roboto:wght@400;500;700<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/modern-update.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/order-confirmation.css">
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo-link"><img src="img/logo.png" alt="GigGatek Logo" id="logo"></a>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="products.php">Products</a></li>
                    <li><a href="rent-to-own.php">Rent-to-Own</a></li>
                    <li><a href="#">Support</a></li>
                    <li><a href="login.php">Account</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="cart.php" class="cart-icon"><i class="fas fa-shopping-cart"></i> <span class="cart-count">0</span></a>
                <a href="login.php" class="login-link" data-i18n="common.login">Login</a>
                <a href="register.php" class="register-link" data-i18n="common.register">Register</a>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="confirmation-container">
            <div class="confirmation-header">
                <div class="confirmation-icon">✓</div>
                <h1>Thank You for Your Order!</h1>
                <p class="confirmation-message">Your order has been successfully placed and is being processed.</p>
            </div>

            <div class="order-details-card">
                <h2>Order Details</h2>
                <div class="order-info">
                    <div class="order-info-item">
                        <span class="label">Order Number:</span>
                        <span class="value" id="order-number">Loading...</span>
                    </div>
                    <div class="order-info-item">
                        <span class="label">Order Date:</span>
                        <span class="value" id="order-date">Loading...</span>
                    </div>
                    <div class="order-info-item">
                        <span class="label">Order Status:</span>
                        <span class="value status-processing">Processing</span>
                    </div>
                    <div class="order-info-item">
                        <span class="label">Payment Method:</span>
                        <span class="value" id="payment-method">Loading...</span>
                    </div>
                </div>
            </div>

            <div class="order-items-card">
                <h2>Order Items</h2>
                <div class="order-items" id="order-items">
                    <!-- Order items will be populated by JavaScript -->
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading order items...</p>
                    </div>
                </div>
            </div>

            <div class="order-summary-card">
                <h2>Order Summary</h2>
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span id="summary-subtotal">Loading...</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span id="summary-shipping">Loading...</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax:</span>
                        <span id="summary-tax">Loading...</span>
                    </div>
                    <div class="summary-row discount" id="discount-row" style="display: none;">
                        <span>Discount:</span>
                        <span id="summary-discount">Loading...</span>
                    </div>
                    <div class="summary-total">
                        <span>Total:</span>
                        <span id="summary-total">Loading...</span>
                    </div>
                </div>
            </div>

            <div class="shipping-info-card">
                <h2>Shipping Information</h2>
                <div class="shipping-info" id="shipping-info">
                    <!-- Shipping info will be populated by JavaScript -->
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading shipping information...</p>
                    </div>
                </div>
            </div>

            <div class="next-steps-card">
                <h2>What's Next?</h2>
                <div class="next-steps">
                    <div class="step">
                        <div class="step-icon">📧</div>
                        <div class="step-content">
                            <h3>Order Confirmation Email</h3>
                            <p>We've sent a confirmation email to your registered email address with all the details of your order.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">🔍</div>
                        <div class="step-content">
                            <h3>Order Processing</h3>
                            <p>Our team is now processing your order. This typically takes 1-2 business days.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">📦</div>
                        <div class="step-content">
                            <h3>Shipping</h3>
                            <p>Once your order ships, we'll send you a tracking number so you can follow your package.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">💳</div>
                        <div class="step-content">
                            <h3>Payment</h3>
                            <p>Your payment has been authorized and will be processed when your order ships.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="confirmation-actions">
                <a href="dashboard.php" class="btn btn-primary">View Order in Dashboard</a>
                <a href="products.php" class="btn btn-secondary">Continue Shopping</a>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>About GigGatek</h3>
                    <p>Quality refurbished computer hardware with flexible purchase and rent-to-own options.</p>
                </div>
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="index.php">Home</a></li>
                        <li><a href="products.php">Products</a></li>
                        <li><a href="rent-to-own.php">Rent-to-Own</a></li>
                        <li><a href="#">Support</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact Us</h3>
                    <p>Email: support@giggatek.com</p>
                    <p>Phone: (555) 123-4567</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 GigGatek. All rights reserved.</p>
                <ul>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Contact Us</a></li>
                </ul>
            </div>
        </div>
    </footer>

    <!-- Include configuration and utility scripts -->
    <script src="js/config.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/notifications.js"></script>
    <script src="js/i18n.js"></script>

    <!-- Order confirmation script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Get order number from URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const orderNumber = urlParams.get('order');

            // Get order data from localStorage (in a real implementation, this would come from the backend)
            const orderData = JSON.parse(localStorage.getItem('giggatek_last_order'));

            if (!orderData) {
                // No order data found, redirect to home page
                window.location.href = 'index.php';
                return;
            }

            // Update order details
            document.getElementById('order-number').textContent = orderNumber || orderData.orderNumber || 'GG-' + Math.floor(100000 + Math.random() * 900000);

            // Format date
            const orderDate = orderData.orderDate ? new Date(orderData.orderDate) : new Date();
            document.getElementById('order-date').textContent = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Update payment method
            const paymentMethodMap = {
                'credit_card': 'Credit Card',
                'paypal': 'PayPal',
                'apple_pay': 'Apple Pay',
                'google_pay': 'Google Pay'
            };
            document.getElementById('payment-method').textContent = paymentMethodMap[orderData.paymentMethod] || 'Credit Card';

            // Update order items
            const orderItemsContainer = document.getElementById('order-items');
            orderItemsContainer.innerHTML = '';

            if (orderData.items && orderData.items.length > 0) {
                orderData.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'order-item';

                    const purchaseType = item.purchase_type === 'rental'
                        ? `${item.rental_term}-month Rent-to-Own`
                        : 'One-time Purchase';

                    const price = item.purchase_type === 'rental'
                        ? `$${item.rental_price.toFixed(2)}/month`
                        : `$${item.price.toFixed(2)}`;

                    itemElement.innerHTML = `
                        <div class="item-image">
                            <img src="${item.image_url || 'img/placeholder-product.png'}" alt="${item.name}">
                        </div>
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <div class="item-meta">
                                <span class="badge badge-${item.condition_class || 'success'}">${item.condition || 'Excellent'}</span>
                                <span class="item-type">${purchaseType}</span>
                            </div>
                        </div>
                        <div class="item-price">
                            <div class="price">${price}</div>
                            <div class="quantity">Qty: ${item.quantity}</div>
                        </div>
                    `;

                    orderItemsContainer.appendChild(itemElement);
                });
            } else {
                orderItemsContainer.innerHTML = '<p>No items found in this order.</p>';
            }

            // Update order summary
            const totals = orderData.totals || {
                subtotal: 0,
                taxAmount: 0,
                shippingCost: 0,
                grandTotal: 0
            };

            document.getElementById('summary-subtotal').textContent = `$${totals.subtotal ? totals.subtotal.toFixed(2) : '0.00'}`;
            document.getElementById('summary-shipping').textContent = totals.shippingCost === 0 ? 'Free' : `$${totals.shippingCost.toFixed(2)}`;
            document.getElementById('summary-tax').textContent = `$${totals.taxAmount ? totals.taxAmount.toFixed(2) : '0.00'}`;
            document.getElementById('summary-total').textContent = `$${totals.grandTotal ? totals.grandTotal.toFixed(2) : '0.00'}`;

            // Show discount if applicable
            if (orderData.couponDiscount && orderData.couponDiscount > 0) {
                document.getElementById('discount-row').style.display = 'flex';
                document.getElementById('summary-discount').textContent = `-$${orderData.couponDiscount.toFixed(2)}`;
            }

            // Update shipping information
            const shippingInfo = document.getElementById('shipping-info');
            const shipping = orderData.shipping || {};

            const shippingMethodMap = {
                'standard': 'Standard Shipping (3-5 business days)',
                'expedited': 'Expedited Shipping (2-3 business days)',
                'overnight': 'Overnight Shipping (1 business day)'
            };

            shippingInfo.innerHTML = `
                <div class="address">
                    <h3>Shipping Address</h3>
                    <p>
                        ${shipping.firstName || ''} ${shipping.lastName || ''}<br>
                        ${shipping.address || ''}<br>
                        ${shipping.apartment ? shipping.apartment + '<br>' : ''}
                        ${shipping.city || ''}, ${shipping.state || ''} ${shipping.zipCode || ''}<br>
                        ${shipping.country || 'United States'}
                    </p>
                </div>
                <div class="shipping-method">
                    <h3>Shipping Method</h3>
                    <p>${shippingMethodMap[orderData.shippingMethod] || 'Standard Shipping'}</p>
                </div>
            `;

            // Clear cart data from localStorage to prevent duplicate orders
            localStorage.removeItem('giggatek_last_order');
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
