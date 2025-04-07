/**
 * GigGatek Stripe Integration
 * Handles payment processing with Stripe for secure checkout
 */

class StripePaymentHandler {
    constructor() {
        // Initialize with Stripe publishable key
        // For production, use your live publishable key
        // This is a test publishable key for demonstration
        this.stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
        this.elements = null;
        this.paymentElement = null;
        this.cardElement = null;
        this.paymentIntentId = null;
        this.clientSecret = null;
        
        // Reference to the checkout instance
        this.checkout = window.checkout;
    }
    
    /**
     * Initialize Stripe Elements
     */
    async initializeStripeElements() {
        try {
            // Create elements instance
            this.elements = this.stripe.elements();
            
            // Create and mount the card element
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        color: '#32325d',
                        fontFamily: 'Roboto, sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder': {
                            color: '#aab7c4'
                        }
                    },
                    invalid: {
                        color: '#dc3545',
                        iconColor: '#dc3545'
                    }
                }
            });
            
            // Mount the card element
            const cardElementMount = document.getElementById('card-element');
            if (cardElementMount) {
                this.cardElement.mount('#card-element');
                
                // Listen for errors
                this.cardElement.on('change', event => {
                    const displayError = document.getElementById('card-errors');
                    if (displayError) {
                        displayError.textContent = event.error ? event.error.message : '';
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing Stripe Elements:', error);
            this.showError('Unable to initialize payment system. Please try again later.');
        }
    }
    
    /**
     * Create a payment intent with the backend
     * @param {number} amount - The payment amount
     * @param {string} description - Payment description
     * @param {Object} metadata - Additional order metadata
     * @returns {Promise<Object>} - The payment intent details
     */
    async createPaymentIntent(amount, description, metadata = {}) {
        try {
            const response = await fetch('/backend/payment/stripe_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'create_payment_intent',
                    amount: amount,
                    description: description,
                    metadata: metadata
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Unknown error occurred');
            }
            
            this.clientSecret = result.client_secret;
            this.paymentIntentId = result.payment_intent_id;
            
            return result;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }
    
    /**
     * Process the payment with the provided payment method
     * @param {Object} billingDetails - Customer billing details
     * @returns {Promise<Object>} - Payment result
     */
    async processPayment(billingDetails) {
        try {
            if (!this.cardElement) {
                throw new Error('Payment form not initialized');
            }
            
            // Use the card element to create a payment method
            const result = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
                billing_details: billingDetails
            });
            
            if (result.error) {
                throw result.error;
            }
            
            // Confirm the payment intent with the payment method
            const confirmResult = await fetch('/backend/payment/stripe_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'confirm_payment_intent',
                    payment_intent_id: this.paymentIntentId,
                    payment_method_id: result.paymentMethod.id
                })
            });
            
            const confirmResponse = await confirmResult.json();
            
            if (!confirmResponse.success) {
                throw new Error(confirmResponse.error || 'Payment confirmation failed');
            }
            
            return {
                success: true,
                status: confirmResponse.status,
                paymentIntentId: confirmResponse.payment_intent_id
            };
        } catch (error) {
            console.error('Error processing payment:', error);
            return {
                success: false,
                error: error.message || 'Payment processing failed'
            };
        }
    }
    
    /**
     * Show an error message to the user
     * @param {string} message - The error message
     */
    showError(message) {
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on checkout page with Stripe container
    if (document.getElementById('card-element')) {
        window.stripeHandler = new StripePaymentHandler();
        window.stripeHandler.initializeStripeElements();
    }
});
