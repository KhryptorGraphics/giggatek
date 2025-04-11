/**
 * GigGatek PayPal Integration
 * Handles payment processing with PayPal for secure checkout
 */

class PayPalPaymentHandler {
    constructor() {
        // Initialize with PayPal client ID
        // For production, use your live client ID
        this.clientId = 'YOUR_PAYPAL_CLIENT_ID';
        this.paymentId = null;
        this.orderId = null;

        // Reference to the checkout instance
        this.checkout = window.checkout;
    }

    /**
     * Initialize PayPal buttons
     * @param {string} containerId - The ID of the container element
     * @param {number} amount - The payment amount
     * @param {Object} orderData - Order data for metadata
     */
    initializePayPalButtons(containerId, amount, orderData = {}) {
        // Check if PayPal SDK is loaded
        if (!window.paypal) {
            console.error('PayPal SDK not loaded');
            this.showError('PayPal payment system is not available. Please try again later.');
            return;
        }

        // Get container element
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('PayPal container not found:', containerId);
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Create PayPal buttons
        window.paypal.Buttons({
            // Set up the transaction
            createOrder: (data, actions) => {
                return this.createPayPalOrder(amount, orderData);
            },

            // Handle approval
            onApprove: (data, actions) => {
                return this.capturePayPalOrder(data.paymentID, data.payerID);
            },

            // Handle cancellation
            onCancel: (data) => {
                console.log('Payment cancelled:', data);
                this.showError('Payment was cancelled. Please try again.');
            },

            // Handle errors
            onError: (err) => {
                console.error('PayPal error:', err);
                this.showError('An error occurred with PayPal. Please try again later.');
            }
        }).render(container);
    }

    /**
     * Create a PayPal order
     * @param {number} amount - The payment amount
     * @param {Object} orderData - Order data for metadata
     * @returns {Promise<string>} - The PayPal order ID
     */
    async createPayPalOrder(amount, orderData = {}) {
        try {
            // Prepare items for PayPal
            const items = [];
            if (this.checkout && this.checkout.cart && this.checkout.cart.cartItems) {
                for (const item of this.checkout.cart.cartItems) {
                    items.push({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    });
                }
            }

            // Prepare metadata
            const metadata = {
                order_id: orderData.orderId || null,
                customer_name: orderData.customerName || '',
                customer_email: orderData.customerEmail || '',
                items_count: items.length
            };

            // Create order with backend
            const response = await fetch('/backend/payment/paypal_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'create_order',
                    amount: amount,
                    description: 'GigGatek Purchase',
                    items: items,
                    metadata: metadata,
                    return_url: window.location.origin + '/checkout/success',
                    cancel_url: window.location.origin + '/checkout/cancel'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Unknown error occurred');
            }

            this.paymentId = result.payment_id;

            // Return the payment ID
            return result.payment_id;
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            this.showError('Unable to create PayPal order. Please try again later.');
            throw error;
        }
    }

    /**
     * Capture payment for a PayPal order
     * @param {string} paymentId - The PayPal payment ID
     * @param {string} payerId - The PayPal payer ID
     * @returns {Promise<Object>} - The capture result
     */
    async capturePayPalOrder(paymentId, payerId) {
        try {
            // Show loading indicator
            this.showLoading(true);

            // Capture the order with backend
            const response = await fetch('/backend/payment/paypal_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'capture_order',
                    payment_id: paymentId,
                    payer_id: payerId
                })
            });

            const result = await response.json();

            // Hide loading indicator
            this.showLoading(false);

            if (!result.success) {
                throw new Error(result.error || 'Unknown error occurred');
            }

            // Handle successful payment
            if (result.status === 'approved') {
                // Notify checkout of successful payment
                if (this.checkout && typeof this.checkout.handlePayPalSuccess === 'function') {
                    this.checkout.handlePayPalSuccess({
                        paymentMethod: 'paypal',
                        transactionId: result.transaction_id,
                        paymentId: result.payment_id
                    });
                }

                return result;
            } else {
                throw new Error(`Payment not approved. Status: ${result.status}`);
            }
        } catch (error) {
            console.error('Error capturing PayPal order:', error);
            this.showError('Unable to complete PayPal payment. Please try again later.');

            // Notify checkout of payment failure
            if (this.checkout && typeof this.checkout.handlePayPalFailure === 'function') {
                this.checkout.handlePayPalFailure({
                    paymentMethod: 'paypal',
                    error: error.message
                });
            }

            throw error;
        }
    }

    /**
     * Show an error message to the user
     * @param {string} message - The error message
     */
    showError(message) {
        const errorElement = document.getElementById('paypal-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        } else {
            alert(message);
        }
    }

    /**
     * Show or hide loading indicator
     * @param {boolean} show - Whether to show or hide the loading indicator
     */
    showLoading(show) {
        const loadingElement = document.getElementById('paypal-loading');
        if (loadingElement) {
            if (show) {
                loadingElement.classList.add('visible');
            } else {
                loadingElement.classList.remove('visible');
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on checkout page with PayPal container
    if (document.getElementById('paypal-button-container')) {
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD`;
        script.async = true;
        script.onload = () => {
            // Initialize PayPal handler
            window.paypalHandler = new PayPalPaymentHandler();

            // If checkout is available, initialize PayPal buttons
            if (window.checkout && window.checkout.getTotalAmount) {
                const amount = window.checkout.getTotalAmount();
                const orderData = {
                    customerName: window.checkout.getCustomerName(),
                    customerEmail: window.checkout.getCustomerEmail()
                };

                window.paypalHandler.initializePayPalButtons('paypal-button-container', amount, orderData);
            }
        };

        document.body.appendChild(script);
    }
});
