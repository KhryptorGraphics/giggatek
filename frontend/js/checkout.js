/**
 * GigGatek Checkout
 * Handles the checkout process with backend API integration
 */

class Checkout {
    constructor() {
        this.currentStep = 1;
        this.checkoutData = {
            shipping: {},
            payment: {},
            orderNotes: '',
            shippingMethod: 'standard',
            sameAsBilling: true
        };
        
        // Reference to the cart
        this.cart = window.cart;
        
        this.init();
    }
    
    init() {
        // Check if cart exists and has items
        if (!this.cart || this.cart.cartItems.length === 0) {
            // Redirect to cart page if cart is empty
            window.location.href = 'cart.php';
            return;
        }
        
        // Initialize the checkout UI
        this.updateOrderSummary();
        this.populateReviewItems();
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    updateOrderSummary() {
        if (!this.cart) return;
        
        // Get cart totals
        const totals = this.cart.calculateCartTotals();
        
        // Update summary values
        document.getElementById('summary-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
        document.getElementById('summary-shipping').textContent = totals.shippingCost === 0 ? 'Free' : `$${totals.shippingCost.toFixed(2)}`;
        document.getElementById('summary-tax').textContent = `$${totals.taxAmount.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `$${totals.grandTotal.toFixed(2)}`;
        
        // Update one-time and monthly payments
        if (totals.oneTimeTotal > 0) {
            document.getElementById('summary-onetime').textContent = `$${totals.oneTimeTotal.toFixed(2)}`;
            document.getElementById('summary-onetime').parentElement.style.display = 'flex';
        } else {
            document.getElementById('summary-onetime').parentElement.style.display = 'none';
        }
        
        if (totals.monthlyTotal > 0) {
            document.getElementById('summary-monthly').textContent = `$${totals.monthlyTotal.toFixed(2)}/mo`;
            document.getElementById('summary-monthly').parentElement.style.display = 'flex';
        } else {
            document.getElementById('summary-monthly').parentElement.style.display = 'none';
        }
        
        // Populate summary items
        this.populateSummaryItems();
    }
    
    populateSummaryItems() {
        const summaryItemsContainer = document.getElementById('summary-items');
        if (!summaryItemsContainer || !this.cart) return;
        
        // Clear existing items
        summaryItemsContainer.innerHTML = '';
        
        // Add each cart item to the summary
        this.cart.cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            
            const purchaseType = item.purchase_type === 'rental' ? `${item.rental_term}-mo Rental` : 'Purchase';
            const price = item.purchase_type === 'rental' ? 
                `$${item.rental_price.toFixed(2)}/mo` : 
                `$${item.price.toFixed(2)}`;
            
            itemElement.innerHTML = `
                <div class="summary-item-name">
                    <div class="item-name">${item.name}</div>
                    <div class="item-type">${purchaseType}</div>
                </div>
                <div class="summary-item-price">
                    <div class="item-quantity">x${item.quantity}</div>
                    <div class="item-price">${price}</div>
                </div>
            `;
            
            summaryItemsContainer.appendChild(itemElement);
        });
    }
    
    populateReviewItems() {
        const reviewItemsContainer = document.getElementById('review-items');
        if (!reviewItemsContainer || !this.cart) return;
        
        // Clear existing items
        reviewItemsContainer.innerHTML = '';
        
        // Add each cart item to the review
        this.cart.cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'review-item';
            
            const purchaseType = item.purchase_type === 'rental' ? 
                `${item.rental_term}-month Rent-to-Own` : 
                'One-time Purchase';
            
            const price = item.purchase_type === 'rental' ? 
                `$${item.rental_price.toFixed(2)}/month` : 
                `$${item.price.toFixed(2)}`;
            
            const totalPrice = item.purchase_type === 'rental' ? 
                `$${(item.rental_price * item.rental_term).toFixed(2)} total` : 
                `$${(item.price * item.quantity).toFixed(2)}`;
            
            itemElement.innerHTML = `
                <div class="review-item-image">
                    <img src="${item.image_url || 'img/placeholder-product.png'}" alt="${item.name}">
                </div>
                <div class="review-item-details">
                    <h4>${item.name}</h4>
                    <div class="review-item-type">${purchaseType}</div>
                    <div class="review-item-price">${price} x ${item.quantity}</div>
                    <div class="review-item-total">${totalPrice}</div>
                    <div class="badge badge-${item.condition_class || 'success'}">${item.condition || 'Excellent'} Condition</div>
                </div>
            `;
            
            reviewItemsContainer.appendChild(itemElement);
        });
    }
    
    goToStep(step) {
        // Validate before proceeding
        if (step > this.currentStep && !this.validateCurrentStep()) {
            return false;
        }
        
        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach(el => {
            el.classList.remove('active', 'completed');
            
            const stepNum = parseInt(el.dataset.step);
            if (stepNum < step) {
                el.classList.add('completed');
            } else if (stepNum === step) {
                el.classList.add('active');
            }
        });
        
        // Hide all steps and show the current one
        document.querySelectorAll('.checkout-step').forEach(el => {
            el.classList.remove('active');
        });
        
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Update current step
        this.currentStep = step;
        
        // Special handling for step 4 (confirmation)
        if (step === 4) {
            this.updateConfirmationPage();
        }
        
        // Scroll to top of the checkout container
        document.querySelector('.checkout-container').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        return true;
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1: // Shipping
                return this.validateShippingStep();
            case 2: // Payment
                return this.validatePaymentStep();
            case 3: // Review
                return true; // No validation needed for review step
            default:
                return true;
        }
    }
    
    validateShippingStep() {
        // If using a saved address, it's already valid
        if (document.querySelector('.address-card.selected') && 
            !document.querySelector('#shipping-form').classList.contains('active')) {
            
            // Get the selected address data
            const selectedAddressId = document.querySelector('.address-card.selected').dataset.addressId;
            const addressText = document.querySelector(`.address-card[data-address-id="${selectedAddressId}"] .address-content`).textContent;
            
            // Store shipping data
            this.checkoutData.shipping = {
                addressId: selectedAddressId,
                addressText: addressText.trim(),
                shippingMethod: document.getElementById('shipping-method').value
            };
            
            return true;
        }
        
        // Otherwise validate the shipping form
        const form = document.getElementById('shipping-form');
        
        // Use HTML5 validation API
        if (!form.checkValidity()) {
            // Trigger browser validation UI
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.click();
            return false;
        }
        
        // Get form data
        const formData = new FormData(form);
        const shippingData = {};
        
        for (const [key, value] of formData.entries()) {
            shippingData[key] = value;
        }
        
        // Store shipping data
        this.checkoutData.shipping = shippingData;
        this.checkoutData.shippingMethod = shippingData.shipping_method;
        
        // Update the review step with this information
        this.updateReviewShippingAddress();
        
        return true;
    }
    
    validatePaymentStep() {
        // If using a saved payment method, it's already valid
        if (document.querySelector('.payment-card.selected') &&
            !document.querySelector('#payment-form').classList.contains('active')) {
            
            // Get the selected payment data
            const selectedPaymentId = document.querySelector('.payment-card.selected').dataset.paymentId;
            const paymentText = document.querySelector(`.payment-card[data-payment-id="${selectedPaymentId}"] .payment-details`).textContent;
            
            // Store payment data
            this.checkoutData.payment = {
                paymentId: selectedPaymentId,
                paymentText: paymentText.trim()
            };
            
            // Get billing address setting
            this.checkoutData.sameAsBilling = document.getElementById('same-address').checked;
            
            return true;
        }
        
        // Otherwise validate the payment form
        const form = document.getElementById('payment-form');
        
        // Use HTML5 validation API
        if (!form.checkValidity()) {
            // Trigger browser validation UI
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.click();
            return false;
        }
        
        // Get form data
        const formData = new FormData(form);
        const paymentData = {};
        
        for (const [key, value] of formData.entries()) {
            paymentData[key] = value;
        }
        
        // Store payment data
        this.checkoutData.payment = paymentData;
        
        // Get billing address setting
        this.checkoutData.sameAsBilling = document.getElementById('same-address').checked;
        
        // Update the review step with this information
        this.updateReviewPayment();
        
        return true;
    }
    
    updateReviewShippingAddress() {
        const addressContainer = document.getElementById('review-shipping-address');
        if (!addressContainer) return;
        
        // Format the address
        let addressHTML = '';
        
        if (this.checkoutData.shipping.addressId) {
            // It's a saved address
            addressHTML = document.querySelector(`.address-card[data-address-id="${this.checkoutData.shipping.addressId}"] .address-content`).innerHTML;
        } else {
            // It's a new address
            addressHTML = `
                <p>
                    ${this.checkoutData.shipping.first_name} ${this.checkoutData.shipping.last_name}<br>
                    ${this.checkoutData.shipping.address1}<br>
                    ${this.checkoutData.shipping.address2 ? this.checkoutData.shipping.address2 + '<br>' : ''}
                    ${this.checkoutData.shipping.city}, ${this.checkoutData.shipping.state} ${this.checkoutData.shipping.zip}<br>
                    ${this.checkoutData.shipping.country}
                </p>
            `;
        }
        
        // Add shipping method
        const shippingMethodMap = {
            'standard': 'Standard Shipping (3-5 business days)',
            'expedited': 'Expedited Shipping (2-3 business days)',
            'overnight': 'Overnight Shipping (1 business day)'
        };
        
        const shippingMethodText = shippingMethodMap[this.checkoutData.shippingMethod] || 'Standard Shipping';
        
        addressHTML += `<p><strong>Shipping Method:</strong> ${shippingMethodText}</p>`;
        
        // Update the container
        addressContainer.innerHTML = addressHTML;
    }
    
    updateReviewPayment() {
        const paymentContainer = document.getElementById('review-payment');
        if (!paymentContainer) return;
        
        // Format the payment info
        let paymentHTML = '';
        
        if (this.checkoutData.payment.paymentId) {
            // It's a saved payment method
            const paymentCard = document.querySelector(`.payment-card[data-payment-id="${this.checkoutData.payment.paymentId}"]`);
            const iconClass = paymentCard.querySelector('.payment-icon').className;
            const details = paymentCard.querySelector('.payment-details').innerHTML;
            
            paymentHTML = `
                <div class="${iconClass}"></div>
                ${details}
            `;
        } else {
            // It's a new payment method
            // Determine card type based on first digit
            const cardNumber = this.checkoutData.payment.card_number.replace(/\s/g, '');
            let cardType = 'unknown';
            
            if (cardNumber.startsWith('4')) {
                cardType = 'visa';
            } else if (cardNumber.startsWith('5')) {
                cardType = 'mastercard';
            } else if (cardNumber.startsWith('3')) {
                cardType = 'amex';
            } else if (cardNumber.startsWith('6')) {
                cardType = 'discover';
            }
            
            const last4 = cardNumber.slice(-4);
            
            paymentHTML = `
                <div class="payment-icon ${cardType}"></div>
                <p>
                    ${cardType.charAt(0).toUpperCase() + cardType.slice(1)} ending in ${last4}<br>
                    Expires: ${this.checkoutData.payment.expiry_date}
                </p>
            `;
        }
        
        // Update the container
        paymentContainer.innerHTML = paymentHTML;
    }
    
    updateConfirmationPage() {
        // Generate a random order number
        const orderNumber = 'GG-' + Math.floor(10000 + Math.random() * 90000);
        
        // Get current date
        const orderDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get total from cart
        const total = this.cart.calculateCartTotals().grandTotal.toFixed(2);
        
        // Get email from shipping info
        const email = this.checkoutData.shipping.email || 'john.smith@example.com';
        
        // Update confirmation page
        document.getElementById('order-number').textContent = orderNumber;
        document.getElementById('order-date').textContent = orderDate;
        document.getElementById('order-total').textContent = `$${total}`;
        document.getElementById('confirmation-email').textContent = email;
    }
    
    placeOrder() {
        // Store order notes
        this.checkoutData.orderNotes = document.getElementById('order-notes').value;
        
        // Show loading state
        const placeOrderButton = document.getElementById('place-order');
        const originalButtonText = placeOrderButton.textContent;
        placeOrderButton.textContent = 'Processing...';
        placeOrderButton.disabled = true;
        
        // Get cart totals for payment amount
        const totals = this.cart.calculateCartTotals();
        
        // If using Stripe (new payment method) or selected card is one of the saved ones
        if (document.querySelector('#payment-form').style.display !== 'none' || 
            document.querySelector('.payment-card.selected')) {
            
            // Process using Stripe
            this.processStripePayment(totals.grandTotal)
                .then(paymentResult => {
                    if (paymentResult.success) {
                        // Proceed with order creation
                        return this.cart.createOrder();
                    } else {
                        throw new Error(paymentResult.error || 'Payment failed');
                    }
                })
                .then(response => {
                    // Show confirmation page
                    this.goToStep(4);
                    
                    // Update order number if provided by API
                    if (response.order_id) {
                        document.getElementById('order-number').textContent = response.order_id;
                    }
                })
                .catch(error => {
                    // Show error message
                    console.error('Error processing order:', error);
                    alert(`Error processing order: ${error.message}`);
                    
                    // Reset button
                    placeOrderButton.textContent = originalButtonText;
                    placeOrderButton.disabled = false;
                });
        } else {
            // Fallback to original implementation for testing/development
            setTimeout(() => {
                // Create the order using cart.createOrder()
                this.cart.createOrder()
                    .then(response => {
                        // Show confirmation page
                        this.goToStep(4);
                        
                        // Update order number if provided by API
                        if (response.order_id) {
                            document.getElementById('order-number').textContent = response.order_id;
                        }
                    })
                    .catch(error => {
                        // Show error message
                        alert(`Error creating order: ${error.message}`);
                        
                        // Reset button
                        placeOrderButton.textContent = originalButtonText;
                        placeOrderButton.disabled = false;
                    });
            }, 1500);
        }
    }
    
    /**
     * Process payment through Stripe
     * @param {number} amount - Total amount to charge
     * @returns {Promise<Object>} - Payment result
     */
    async processStripePayment(amount) {
        try {
            // Check if Stripe handler is available
            if (!window.stripeHandler) {
                console.error('Stripe handler not initialized');
                return {
                    success: false,
                    error: 'Payment system not available'
                };
            }
            
            // Check if authentication is available
            if (!window.auth || !window.auth.getToken()) {
                console.error('Authentication required for payment processing');
                return {
                    success: false,
                    error: 'Authentication required'
                };
            }

            // Get Stripe handler
            const stripeHandler = window.stripeHandler;

            // Prepare order metadata
            const metadata = {
                customer_name: `${this.checkoutData.shipping.first_name || ''} ${this.checkoutData.shipping.last_name || ''}`.trim(),
                customer_email: this.checkoutData.shipping.email || '',
                order_notes: this.checkoutData.orderNotes || '',
                items_count: this.cart.cartItems.length,
                auth_token: window.auth.getToken() // Include token for server validation
            };
            
            // Create payment intent
            await stripeHandler.createPaymentIntent(
                amount,
                'GigGatek Order',
                metadata
            );
            
            // Prepare billing details from shipping or billing address
            const billingDetails = {
                name: this.checkoutData.payment.card_name || document.getElementById('card-name').value,
                address: {
                    line1: this.checkoutData.shipping.address1 || '',
                    line2: this.checkoutData.shipping.address2 || '',
                    city: this.checkoutData.shipping.city || '',
                    state: this.checkoutData.shipping.state || '',
                    postal_code: this.checkoutData.shipping.zip || '',
                    country: this.checkoutData.shipping.country || 'US'
                },
                email: this.checkoutData.shipping.email || '',
                phone: this.checkoutData.shipping.phone || ''
            };
            
            // Process the payment
            return await stripeHandler.processPayment(billingDetails);
        } catch (error) {
            console.error('Error processing Stripe payment:', error);
            return {
                success: false,
                error: error.message || 'Payment processing failed'
            };
        }
    }
    
    initEventListeners() {
        // Step navigation buttons
        document.addEventListener('click', event => {
            // Continue to Payment button
            if (event.target.matches('#continue-to-payment')) {
                this.goToStep(2);
            }
            
            // Continue to Review button
            if (event.target.matches('#continue-to-review')) {
                this.goToStep(3);
            }
            
            // Place Order button
            if (event.target.matches('#place-order')) {
                this.placeOrder();
            }
            
            // Back buttons
            if (event.target.matches('#back-to-shipping')) {
                this.goToStep(1);
            }
            
            if (event.target.matches('#back-to-payment')) {
                this.goToStep(2);
            }
            
            // Edit links in review step
            if (event.target.matches('.edit-link')) {
                const step = parseInt(event.target.dataset.step);
                if (step) {
                    this.goToStep(step);
                }
            }
            
            // Select address
            if (event.target.matches('.select-address')) {
                const addressId = event.target.dataset.addressId;
                
                // Remove selected class from all address cards
                document.querySelectorAll('.address-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Add selected class to the clicked address card
                event.target.closest('.address-card').classList.add('selected');
                
                // Hide shipping form
                document.getElementById('shipping-form').style.display = 'none';
                
                // Show continue button
                document.querySelector('.shipping-actions').style.display = 'block';
                
                // Update billing address if "same as shipping" is checked
                if (document.getElementById('same-address').checked) {
                    this.updateBillingAddress();
                }
            }
            
            // Add new address button
            if (event.target.matches('#show-new-address-form')) {
                // Show shipping form
                document.getElementById('shipping-form').style.display = 'block';
                
                // Hide continue button
                document.querySelector('.shipping-actions').style.display = 'none';
                
                // Remove selected class from all address cards
                document.querySelectorAll('.address-card').forEach(card => {
                    card.classList.remove('selected');
                });
            }
            
            // Back to saved addresses button
            if (event.target.matches('#back-to-saved-addresses')) {
                // Hide shipping form
                document.getElementById('shipping-form').style.display = 'none';
                
                // Show continue button
                document.querySelector('.shipping-actions').style.display = 'block';
                
                // Select the first address card
                const firstAddressCard = document.querySelector('.address-card:not(.new-address-card)');
                if (firstAddressCard) {
                    firstAddressCard.classList.add('selected');
                }
            }
            
            // Select payment method
            if (event.target.matches('.select-payment')) {
                const paymentId = event.target.dataset.paymentId;
                
                // Remove selected class from all payment cards
                document.querySelectorAll('.payment-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Add selected class to the clicked payment card
                event.target.closest('.payment-card').classList.add('selected');
                
                // Hide payment form
                document.getElementById('payment-form').style.display = 'none';
            }
            
            // Add new payment method button
            if (event.target.matches('#show-new-payment-form')) {
                // Show payment form
                document.getElementById('payment-form').style.display = 'block';
                
                // Remove selected class from all payment cards
                document.querySelectorAll('.payment-card').forEach(card => {
                    card.classList.remove('selected');
                });
            }
            
            // Back to saved payment methods button
            if (event.target.matches('#back-to-saved-payments')) {
                // Hide payment form
                document.getElementById('payment-form').style.display = 'none';
                
                // Select the first payment card
                const firstPaymentCard = document.querySelector('.payment-card:not(.new-payment-card)');
                if (firstPaymentCard) {
                    firstPaymentCard.classList.add('selected');
                }
            }
            
            // Change billing address button
            if (event.target.matches('#change-billing-address')) {
                // In a real implementation, this would open a modal to change the billing address
                alert('This would open a billing address form');
            }
            
            // Apply promo code button
            if (event.target.matches('#apply-promo')) {
                const promoCode = document.getElementById('promo-code').value;
                if (promoCode) {
                    // In a real implementation, this would make an API call to apply the promo code
                    alert(`Promo code ${promoCode} applied successfully!`);
                } else {
                    alert('Please enter a promo code');
                }
            }
        });
        
        // Form submissions
        const shippingForm = document.getElementById('shipping-form');
        if (shippingForm) {
            shippingForm.addEventListener('submit', e => {
                e.preventDefault();
                if (this.validateShippingStep()) {
                    this.goToStep(2);
                }
            });
        }
        
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', e => {
                e.preventDefault();
                if (this.validatePaymentStep()) {
                    this.goToStep(3);
                }
            });
        }
        
        // Same as shipping address checkbox
        const sameAddressCheckbox = document.getElementById('same-address');
        if (sameAddressCheckbox) {
            sameAddressCheckbox.addEventListener('change', () => {
                this.updateBillingAddress();
            });
        }
        
        // Shipping method change
        const shippingMethodSelect = document.getElementById('shipping-method');
        if (shippingMethodSelect) {
            shippingMethodSelect.addEventListener('change', () => {
                this.checkoutData.shippingMethod = shippingMethodSelect.value;
                
                // Update shipping cost in order summary
                let shippingCost = 0;
                switch (shippingMethodSelect.value) {
                    case 'expedited':
                        shippingCost = 9.99;
                        break;
                    case 'overnight':
                        shippingCost = 19.99;
                        break;
                    default:
                        shippingCost = 0;
                }
                
                // In a real implementation, this would update the cart totals with the new shipping cost
                // For demo purposes, just update the displayed shipping cost
                document.getElementById('summary-shipping').textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
                
                // Update the total
                const subtotal = parseFloat(document.getElementById('summary-subtotal').textContent.replace('$', ''));
                const tax = parseFloat(document.getElementById('summary-tax').textContent.replace('$', ''));
                const total = subtotal + shippingCost + tax;
                
                document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
            });
        }
    }
    
    updateBillingAddress() {
        const billingAddressDetails = document.getElementById('billing-address-details');
        const sameAddress = document.getElementById('same-address').checked;
        
        if (sameAddress) {
            // Get selected shipping address
            const selectedAddress = document.querySelector('.address-card.selected:not(.new-address-card)');
            
            if (selectedAddress) {
                // Copy the address content to billing
                billingAddressDetails.innerHTML = selectedAddress.querySelector('.address-content').innerHTML;
            } else if (this.checkoutData.shipping && this.checkoutData.shipping.first_name) {
                // Use the form data
                billingAddressDetails.innerHTML = `
                    <p>
                        ${this.checkoutData.shipping.first_name} ${this.checkoutData.shipping.last_name}<br>
                        ${this.checkoutData.shipping.address1}<br>
                        ${this.checkoutData.shipping.address2 ? this.checkoutData.shipping.address2 + '<br>' : ''}
                        ${this.checkoutData.shipping.city}, ${this.checkoutData.shipping.state} ${this.checkoutData.shipping.zip}<br>
                        ${this.checkoutData.shipping.country}
                    </p>
                `;
            }
        } else {
            // In a real implementation, this would show a billing address form
            // For now, just show a placeholder
            billingAddressDetails.innerHTML = `
                <p>
                    <i>Click "Change Billing Address" to enter a different address</i>
                </p>
            `;
        }
    }
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize checkout on the checkout page
    if (document.querySelector('.checkout-container')) {
        window.checkout = new Checkout();
    }
});
