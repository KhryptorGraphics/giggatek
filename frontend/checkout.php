<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - GigGatek</title>
    <meta name="description" content="Complete your purchase of quality refurbished computer hardware at GigGatek.">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/stripe-elements.css">
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
        <div class="checkout-container">
            <h1>Checkout</h1>

            <div class="checkout-progress">
                <div class="progress-step active" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-name">Shipping</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-name">Payment</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-name">Review</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="4">
                    <div class="step-number">4</div>
                    <div class="step-name">Confirmation</div>
                </div>
            </div>

            <div class="checkout-content">
                <!-- Step 1: Shipping Information -->
                <section class="checkout-step active" id="step-1">
                    <h2>Shipping Information</h2>

                    <div class="saved-addresses" id="saved-addresses">
                        <h3>Saved Addresses</h3>
                        <div class="address-cards">
                            <div class="address-card selected" data-address-id="1">
                                <div class="address-badge default">Default</div>
                                <div class="address-content">
                                    <h4>Home</h4>
                                    <p>John Smith<br>
                                    123 Main Street<br>
                                    Apt 4B<br>
                                    San Francisco, CA 94103<br>
                                    United States</p>
                                    <p>Phone: (555) 123-4567</p>
                                </div>
                                <div class="address-actions">
                                    <button type="button" class="btn btn-sm btn-primary select-address" data-address-id="1">Select</button>
                                </div>
                            </div>

                            <div class="address-card" data-address-id="2">
                                <div class="address-content">
                                    <h4>Work</h4>
                                    <p>John Smith<br>
                                    456 Market Street<br>
                                    San Francisco, CA 94105<br>
                                    United States</p>
                                    <p>Phone: (555) 987-6543</p>
                                </div>
                                <div class="address-actions">
                                    <button type="button" class="btn btn-sm btn-outline-primary select-address" data-address-id="2">Select</button>
                                </div>
                            </div>

                            <div class="address-card new-address-card" id="new-address-card">
                                <div class="address-content">
                                    <h4>Add New Address</h4>
                                    <p>Enter a new shipping address for your order</p>
                                </div>
                                <div class="address-actions">
                                    <button type="button" class="btn btn-sm btn-outline-primary" id="show-new-address-form">Add New</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form id="shipping-form" class="shipping-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first-name">First Name *</label>
                                <input type="text" id="first-name" name="first_name" class="form-control" required>
                            </div>

                            <div class="form-group">
                                <label for="last-name">Last Name *</label>
                                <input type="text" id="last-name" name="last_name" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="address1">Address Line 1 *</label>
                            <input type="text" id="address1" name="address1" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label for="address2">Address Line 2</label>
                            <input type="text" id="address2" name="address2" class="form-control">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City *</label>
                                <input type="text" id="city" name="city" class="form-control" required>
                            </div>

                            <div class="form-group">
                                <label for="state">State/Province *</label>
                                <input type="text" id="state" name="state" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="zip">ZIP/Postal Code *</label>
                                <input type="text" id="zip" name="zip" class="form-control" required>
                            </div>

                            <div class="form-group">
                                <label for="country">Country *</label>
                                <select id="country" name="country" class="form-control" required>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="MX">Mexico</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" name="email" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label for="shipping-method">Shipping Method *</label>
                            <select id="shipping-method" name="shipping_method" class="form-control" required>
                                <option value="standard">Standard Shipping (3-5 business days) - Free</option>
                                <option value="expedited">Expedited Shipping (2-3 business days) - $9.99</option>
                                <option value="overnight">Overnight Shipping (1 business day) - $19.99</option>
                            </select>
                        </div>

                        <div class="form-check">
                            <input type="checkbox" id="save-address" name="save_address" class="form-check-input">
                            <label for="save-address" class="form-check-label">Save this address for future orders</label>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="back-to-saved-addresses">Back to Saved Addresses</button>
                            <button type="submit" class="btn btn-primary">Continue to Payment</button>
                        </div>
                    </form>

                    <div class="shipping-actions">
                        <button type="button" class="btn btn-primary" id="continue-to-payment">Continue to Payment</button>
                    </div>
                </section>

                <!-- Step 2: Payment Information -->
                <section class="checkout-step" id="step-2">
                    <h2>Payment Information</h2>

                    <div class="saved-payment-methods" id="saved-payment-methods">
                        <h3>Saved Payment Methods</h3>
                        <div class="payment-cards">
                            <div class="payment-card selected" data-payment-id="1">
                                <div class="payment-badge default">Default</div>
                                <div class="payment-info">
                                    <div class="payment-icon visa"></div>
                                    <div class="payment-details">
                                        <h4>Visa ending in 1234</h4>
                                        <p>Expires: 05/2027</p>
                                    </div>
                                </div>
                                <div class="payment-actions">
                                    <button type="button" class="btn btn-sm btn-primary select-payment" data-payment-id="1">Select</button>
                                </div>
                            </div>

                            <div class="payment-card" data-payment-id="2">
                                <div class="payment-info">
                                    <div class="payment-icon mastercard"></div>
                                    <div class="payment-details">
                                        <h4>Mastercard ending in 5678</h4>
                                        <p>Expires: 09/2026</p>
                                    </div>
                                </div>
                                <div class="payment-actions">
                                    <button type="button" class="btn btn-sm btn-outline-primary select-payment" data-payment-id="2">Select</button>
                                </div>
                            </div>

                            <div class="payment-card new-payment-card" id="new-payment-card">
                                <div class="payment-info">
                                    <div class="payment-icon add"></div>
                                    <div class="payment-details">
                                        <h4>Add New Payment Method</h4>
                                        <p>Enter a new payment method for your order</p>
                                    </div>
                                </div>
                                <div class="payment-actions">
                                    <button type="button" class="btn btn-sm btn-outline-primary" id="show-new-payment-form">Add New</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-method-tabs">
                        <ul class="nav nav-tabs" id="payment-tabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <a class="nav-link active" id="card-tab" data-toggle="tab" href="#card-payment" role="tab" aria-controls="card-payment" aria-selected="true">Credit Card</a>
                            </li>
                            <li class="nav-item" role="presentation">
                                <a class="nav-link" id="paypal-tab" data-toggle="tab" href="#paypal-payment" role="tab" aria-controls="paypal-payment" aria-selected="false">PayPal</a>
                            </li>
                        </ul>

                        <div class="tab-content" id="payment-tabs-content">
                            <div class="tab-pane fade show active" id="card-payment" role="tabpanel" aria-labelledby="card-tab">
                                <form id="payment-form" class="payment-form">
                                    <div class="form-group">
                                        <label for="card-name">Name on Card *</label>
                                        <input type="text" id="card-name" name="card_name" class="form-control" required>
                                    </div>

                                    <div class="form-group">
                                        <label for="card-element">Credit or Debit Card *</label>
                                        <div id="card-element" class="form-control stripe-element">
                                            <!-- Stripe Elements will be inserted here -->
                                        </div>
                                        <div id="card-errors" class="text-danger mt-2"></div>
                                    </div>

                                    <div class="form-check">
                                        <input type="checkbox" id="save-payment" name="save_payment" class="form-check-input">
                                        <label for="save-payment" class="form-check-label">Save this payment method for future orders</label>
                                    </div>
                                </form>
                            </div>

                            <div class="tab-pane fade" id="paypal-payment" role="tabpanel" aria-labelledby="paypal-tab">
                                <div class="paypal-container">
                                    <p>Click the PayPal button below to complete your payment with PayPal.</p>
                                    <div id="paypal-button-container"></div>
                                    <div id="paypal-errors" class="text-danger mt-2"></div>
                                    <div id="paypal-loading" class="loading-indicator">
                                        <div class="spinner"></div>
                                        <p>Processing payment...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="back-to-saved-payments">Back to Saved Methods</button>
                            <button type="submit" class="btn btn-primary">Continue to Review</button>
                        </div>
                    </form>

                    <div class="billing-address">
                        <h3>Billing Address</h3>

                        <div class="form-check mb-3">
                            <input type="checkbox" id="same-address" name="same_address" class="form-check-input" checked>
                            <label for="same-address" class="form-check-label">Same as shipping address</label>
                        </div>

                        <div id="billing-address-details" class="address-details">
                            <p>
                                John Smith<br>
                                123 Main Street, Apt 4B<br>
                                San Francisco, CA 94103<br>
                                United States
                            </p>
                        </div>

                        <button type="button" class="btn btn-sm btn-outline-secondary" id="change-billing-address">Change Billing Address</button>
                    </div>

                    <div class="payment-actions">
                        <button type="button" class="btn btn-secondary" id="back-to-shipping">Back to Shipping</button>
                        <button type="button" class="btn btn-primary" id="continue-to-review">Continue to Review</button>
                    </div>
                </section>

                <!-- Step 3: Order Review -->
                <section class="checkout-step" id="step-3">
                    <h2>Order Review</h2>

                    <div class="order-review">
                        <div class="review-section">
                            <h3>Items</h3>
                            <div class="review-items" id="review-items">
                                <!-- Items will be populated dynamically with JavaScript -->
                            </div>
                        </div>

                        <div class="review-section">
                            <h3>Shipping Address</h3>
                            <div class="review-address" id="review-shipping-address">
                                <p>
                                    John Smith<br>
                                    123 Main Street, Apt 4B<br>
                                    San Francisco, CA 94103<br>
                                    United States
                                </p>
                                <p><strong>Shipping Method:</strong> Standard Shipping (3-5 business days)</p>
                            </div>
                            <a href="#" class="edit-link" data-step="1">Edit</a>
                        </div>

                        <div class="review-section">
                            <h3>Payment</h3>
                            <div class="review-payment" id="review-payment">
                                <div class="payment-icon visa"></div>
                                <p>Visa ending in 1234<br>Expires: 05/2027</p>
                            </div>
                            <a href="#" class="edit-link" data-step="2">Edit</a>
                        </div>
                    </div>

                    <div class="order-notes">
                        <h3>Order Notes (Optional)</h3>
                        <textarea id="order-notes" name="order_notes" class="form-control" rows="3" placeholder="Add any special instructions or notes for your order"></textarea>
                    </div>

                    <div class="review-actions">
                        <button type="button" class="btn btn-secondary" id="back-to-payment">Back to Payment</button>
                        <button type="button" class="btn btn-primary" id="place-order">Place Order</button>
                    </div>
                </section>

                <!-- Step 4: Order Confirmation -->
                <section class="checkout-step" id="step-4">
                    <div class="order-confirmation">
                        <div class="confirmation-icon">✓</div>
                        <h2>Thank You for Your Order!</h2>
                        <p class="confirmation-message">Your order has been successfully placed.</p>

                        <div class="order-details">
                            <div class="order-detail">
                                <span>Order Number:</span>
                                <span id="order-number">GG-29385</span>
                            </div>
                            <div class="order-detail">
                                <span>Order Date:</span>
                                <span id="order-date">April 7, 2025</span>
                            </div>
                            <div class="order-detail">
                                <span>Total Amount:</span>
                                <span id="order-total">$1,174.48</span>
                            </div>
                        </div>

                        <p>A confirmation email has been sent to <span id="confirmation-email">john.smith@example.com</span></p>

                        <div class="next-steps">
                            <h3>What's Next?</h3>
                            <ul>
                                <li>You'll receive an email once your order has been processed.</li>
                                <li>Once your order ships, we'll send you tracking information.</li>
                                <li>For rental items, you'll receive information about your first payment date.</li>
                            </ul>
                        </div>

                        <div class="confirmation-actions">
                            <a href="dashboard.php" class="btn btn-primary">View Order in Dashboard</a>
                            <a href="products.php" class="btn btn-secondary">Continue Shopping</a>
                        </div>
                    </div>
                </section>
            </div>

            <div class="checkout-sidebar">
                <div class="order-summary">
                    <h3>Order Summary</h3>

                    <div class="summary-items" id="summary-items">
                        <!-- Items will be populated dynamically with JavaScript -->
                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span id="summary-subtotal">$1,084.97</span>
                    </div>

                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span id="summary-shipping">Free</span>
                    </div>

                    <div class="summary-row">
                        <span>Tax:</span>
                        <span id="summary-tax">$89.51</span>
                    </div>

                    <div class="summary-total">
                        <span>Total:</span>
                        <span id="summary-total">$1,174.48</span>
                    </div>

                    <div class="summary-details">
                        <div class="summary-detail">
                            <span>One-time Payment:</span>
                            <span id="summary-onetime">$949.98</span>
                        </div>
                        <div class="summary-detail">
                            <span>Monthly Payment:</span>
                            <span id="summary-monthly">$134.99/mo</span>
                        </div>
                    </div>
                </div>

                <div class="promo-code">
                    <h4>Promo Code</h4>
                    <div class="promo-code-form">
                        <input type="text" id="promo-code" name="promo_code" class="form-control" placeholder="Enter promo code">
                        <button type="button" class="btn btn-outline-primary" id="apply-promo">Apply</button>
                    </div>
                </div>

                <div class="secure-checkout">
                    <div class="secure-icon">🔒</div>
                    <div class="secure-text">
                        <h4>Secure Checkout</h4>
                        <p>Your payment information is encrypted and secure.</p>
                    </div>
                </div>

                <div class="payment-methods">
                    <h4>We Accept</h4>
                    <div class="payment-icons">
                        <span class="payment-icon visa"></span>
                        <span class="payment-icon mastercard"></span>
                        <span class="payment-icon amex"></span>
                        <span class="payment-icon discover"></span>
                        <span class="payment-icon paypal"></span>
                    </div>
                </div>

                <div class="need-help">
                    <h4>Need Help?</h4>
                    <p>Our customer service team is available Monday-Friday, 9AM-6PM EST.</p>
                    <a href="#" class="btn btn-outline-secondary">Contact Support</a>
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

    <!-- Include the Stripe.js library -->
    <script src="https://js.stripe.com/v3/"></script>
    <!-- Include the cart.js file first -->
    <script src="js/cart.js"></script>
    <!-- Then include the payment integration files -->
    <script src="js/stripe-integration.js"></script>
    <script src="js/paypal-integration.js"></script>
    <!-- Finally include the checkout.js file -->
    <script src="js/checkout.js"></script>
</body>
</html>
