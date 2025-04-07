<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shopping Cart - GigGatek</title>
    <meta name="description" content="Review your selected refurbished hardware products and rent-to-own options before checkout.">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/style.css">
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
        </div>
    </header>

    <main class="container">
        <h1 class="mb-4">Shopping Cart</h1>
        
        <div class="row">
            <div class="col-12 col-lg-8">
                <!-- Cart Items -->
                <div class="cart-container" id="cart-items-container">
                    <div class="cart-header">
                        <h3>Cart Items (3)</h3>
                    </div>
                    
                    <!-- Item 1 -->
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="img/products/gpu-rtx3080.png" alt="NVIDIA GeForce RTX 3080">
                        </div>
                        <div class="cart-item-details">
                            <h4>NVIDIA GeForce RTX 3080 10GB GDDR6X</h4>
                            <div class="cart-item-price">$599.99</div>
                            <div class="cart-item-rental">Purchase (One-time payment)</div>
                            <div class="badge badge-success">Excellent Condition</div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn" data-action="decrease">-</button>
                                <input type="number" class="quantity-input" value="1" min="1" max="10">
                                <button class="quantity-btn" data-action="increase">+</button>
                            </div>
                            <button class="btn btn-sm btn-danger" data-action="remove">Remove</button>
                        </div>
                    </div>
                    
                    <!-- Item 2 -->
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="img/products/cpu-ryzen9.png" alt="AMD Ryzen 9 5900X">
                        </div>
                        <div class="cart-item-details">
                            <h4>AMD Ryzen 9 5900X 12-Core Processor</h4>
                            <div class="cart-item-price">$349.99</div>
                            <div class="cart-item-rental">Purchase (One-time payment)</div>
                            <div class="badge badge-warning">Good Condition</div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn" data-action="decrease">-</button>
                                <input type="number" class="quantity-input" value="1" min="1" max="10">
                                <button class="quantity-btn" data-action="increase">+</button>
                            </div>
                            <button class="btn btn-sm btn-danger" data-action="remove">Remove</button>
                        </div>
                    </div>
                    
                    <!-- Item 3 (Rental) -->
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="img/products/pc-gaming.png" alt="Gaming PC">
                        </div>
                        <div class="cart-item-details">
                            <h4>Gaming PC - RTX 3070, i7-12700K, 16GB RAM, 1TB SSD</h4>
                            <div class="cart-item-price">$134.99/month</div>
                            <div class="cart-item-rental">12-month Rent-to-Own plan</div>
                            <div class="badge badge-warning">Good Condition</div>
                        </div>
                        <div class="cart-item-actions">
                            <button class="btn btn-sm btn-outline-primary mb-2">Change Plan</button>
                            <button class="btn btn-sm btn-danger" data-action="remove">Remove</button>
                        </div>
                    </div>
                </div>
                
                <!-- Empty Cart State (initially hidden) -->
                <div class="cart-empty" id="empty-cart" style="display: none;">
                    <h3>Your Cart is Empty</h3>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="products.php" class="btn btn-primary">Browse Products</a>
                </div>
                
                <!-- Recently Viewed -->
                <div class="recently-viewed mt-5">
                    <h3>Recently Viewed</h3>
                    <div class="product-grid">
                        <!-- Product 1 -->
                        <div class="product-item">
                            <div class="condition-badge condition-excellent">Excellent</div>
                            <img src="img/products/ram-corsair.png" alt="Corsair Vengeance RGB Pro 32GB">
                            <h4>Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3200MHz</h4>
                            <div class="price">$129.99</div>
                            <div class="rent-price">From $16.99/mo with Rent-to-Own</div>
                            <a href="product.php?id=3" class="btn btn-primary">View Details</a>
                        </div>
                        
                        <!-- Product 2 -->
                        <div class="product-item">
                            <div class="condition-badge condition-fair">Fair</div>
                            <img src="img/products/gpu-rtx3070.png" alt="NVIDIA GeForce RTX 3070">
                            <h4>NVIDIA GeForce RTX 3070 8GB GDDR6</h4>
                            <div class="price">$449.99</div>
                            <div class="rent-price">From $49.99/mo with Rent-to-Own</div>
                            <a href="product.php?id=5" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-12 col-lg-4">
                <!-- Cart Summary -->
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    
                    <div class="summary-row">
                        <span>Items (3):</span>
                        <span>$1,084.97</span>
                    </div>
                    
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    
                    <div class="summary-row">
                        <span>Tax:</span>
                        <span>$89.51</span>
                    </div>
                    
                    <div class="summary-total">
                        <span>Total:</span>
                        <span>$1,174.48</span>
                    </div>
                    
                    <div class="summary-details">
                        <div class="summary-detail">
                            <span>One-time Payment:</span>
                            <span>$949.98</span>
                        </div>
                        <div class="summary-detail">
                            <span>Monthly Payment:</span>
                            <span>$134.99/mo</span>
                        </div>
                    </div>
                    
                    <div class="cart-actions">
                        <button class="btn btn-primary btn-block mb-2">Proceed to Checkout</button>
                        <a href="products.php" class="btn btn-outline-secondary btn-block">Continue Shopping</a>
                    </div>
                </div>
                
                <!-- Promo Code -->
                <div class="promo-code-container mt-4">
                    <h4>Promo Code</h4>
                    <div class="d-flex">
                        <input type="text" class="form-control" placeholder="Enter promo code">
                        <button class="btn btn-outline-primary ml-2">Apply</button>
                    </div>
                </div>
                
                <!-- Payment Options -->
                <div class="payment-options mt-4">
                    <h4>We Accept</h4>
                    <div class="payment-icons">
                        <img src="img/icons/visa.svg" alt="Visa">
                        <img src="img/icons/mastercard.svg" alt="Mastercard">
                        <img src="img/icons/amex.svg" alt="American Express">
                        <img src="img/icons/paypal.svg" alt="PayPal">
                    </div>
                </div>
                
                <!-- Help Section -->
                <div class="help-section mt-4">
                    <h4>Need Help?</h4>
                    <p>Our customer service team is available Monday-Friday, 9AM-6PM EST.</p>
                    <a href="#" class="btn btn-outline-primary btn-block">Contact Support</a>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 GigGatek. All rights reserved.</p>
            <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Contact Us</a></li>
            </ul>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Quantity controls
            const quantityBtns = document.querySelectorAll('.quantity-btn');
            
            quantityBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.dataset.action;
                    const input = this.parentElement.querySelector('.quantity-input');
                    const currentValue = parseInt(input.value);
                    
                    if (action === 'decrease' && currentValue > 1) {
                        input.value = currentValue - 1;
                    } else if (action === 'increase' && currentValue < 10) {
                        input.value = currentValue + 1;
                    }
                    
                    // Update cart total (in a real app, this would call an API)
                    updateCartSummary();
                });
            });
            
            // Remove item buttons
            const removeButtons = document.querySelectorAll('[data-action="remove"]');
            
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const cartItem = this.closest('.cart-item');
                    
                    // Animate removal
                    cartItem.style.opacity = '0';
                    setTimeout(() => {
                        cartItem.remove();
                        
                        // Check if cart is empty
                        const remainingItems = document.querySelectorAll('.cart-item');
                        if (remainingItems.length === 0) {
                            document.getElementById('cart-items-container').style.display = 'none';
                            document.getElementById('empty-cart').style.display = 'block';
                        }
                        
                        // Update cart total
                        updateCartSummary();
                    }, 300);
                });
            });
            
            // Function to update cart summary (simplified for demo)
            function updateCartSummary() {
                console.log('Cart summary updated');
                // In a real app, this would recalculate totals based on items and quantities
            }
        });
    </script>
</body>
</html>
