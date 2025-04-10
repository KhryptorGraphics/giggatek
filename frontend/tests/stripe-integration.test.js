/**
 * Tests for the Stripe integration
 */

// Import the StripeHandler class
const StripeHandler = require('../js/stripe-integration').StripeHandler;

describe('StripeHandler', () => {
  let stripeHandler;
  
  beforeEach(() => {
    // Reset DOM mocks
    document.querySelector.mockReset();
    document.getElementById.mockReset();
    document.createElement.mockReset();
    document.addEventListener.mockReset();
    
    // Reset fetch mock
    fetch.mockReset();
    
    // Create a new instance for each test
    stripeHandler = new StripeHandler({
      publicKey: 'pk_test_123',
      returnUrl: 'http://localhost/checkout.php'
    });
    
    // Mock auth module
    window.auth = {
      getToken: jest.fn().mockReturnValue('test-token')
    };
  });
  
  test('should initialize Stripe with the provided public key', () => {
    // Initialize Stripe handler
    stripeHandler.init();
    
    // Check if Stripe was initialized with the correct key
    expect(window.Stripe).toHaveBeenCalledWith('pk_test_123');
  });
  
  test('should load Stripe.js if not already loaded', async () => {
    // Mock document.head.appendChild
    const mockScript = {
      src: '',
      async: false,
      onload: null,
      onerror: null
    };
    document.createElement.mockReturnValue(mockScript);
    
    // Remove Stripe from window
    const originalStripe = window.Stripe;
    delete window.Stripe;
    
    // Load Stripe.js
    const loadPromise = stripeHandler.loadStripeJs();
    
    // Check if script was created correctly
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(mockScript.src).toBe('https://js.stripe.com/v3/');
    expect(mockScript.async).toBe(true);
    
    // Simulate script load
    mockScript.onload();
    
    // Restore Stripe
    window.Stripe = originalStripe;
    
    // Wait for promise to resolve
    await loadPromise;
  });
  
  test('should set up payment form with Stripe Elements', () => {
    // Mock payment form
    const mockForm = {
      id: 'payment-form'
    };
    document.getElementById.mockReturnValueOnce(mockForm);
    
    // Mock card element
    const mockCardElement = {
      id: 'card-element',
      className: '',
      parentNode: {
        insertBefore: jest.fn()
      }
    };
    document.getElementById.mockReturnValueOnce(mockCardElement);
    
    // Mock card errors element
    const mockCardErrors = {
      id: 'card-errors',
      className: ''
    };
    document.getElementById.mockReturnValueOnce(mockCardErrors);
    
    // Mock Stripe elements
    const mockElements = {
      create: jest.fn().mockReturnValue({
        mount: jest.fn(),
        on: jest.fn()
      })
    };
    
    // Set up Stripe instance
    stripeHandler.options.stripe = {
      elements: jest.fn().mockReturnValue(mockElements)
    };
    
    // Set up payment form
    stripeHandler.setupPaymentForm();
    
    // Check if elements were created correctly
    expect(stripeHandler.options.stripe.elements).toHaveBeenCalled();
    expect(mockElements.create).toHaveBeenCalledWith('card', expect.any(Object));
    expect(stripeHandler.options.paymentForm).toBe(mockForm);
  });
  
  test('should create a payment intent', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        client_secret: 'test_secret',
        payment_intent: 'pi_123'
      })
    });
    
    // Create payment intent
    const result = await stripeHandler.createPaymentIntent(99.99, 'Test payment', { order_id: '123' });
    
    // Check if API was called correctly
    expect(fetch).toHaveBeenCalledWith(
      '/api/stripe/create-payment-intent',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }),
        body: JSON.stringify({
          amount: 9999, // Converted to cents
          currency: 'usd',
          description: 'Test payment',
          metadata: { order_id: '123' }
        })
      })
    );
    
    // Check if client secret was stored
    expect(stripeHandler.options.clientSecret).toBe('test_secret');
    expect(stripeHandler.options.paymentIntent).toBe('pi_123');
    
    // Check if result contains expected data
    expect(result.success).toBe(true);
    expect(result.client_secret).toBe('test_secret');
  });
  
  test('should process a payment', async () => {
    // Set up client secret and card element
    stripeHandler.options.clientSecret = 'test_secret';
    stripeHandler.options.card = { id: 'card_element' };
    
    // Mock successful payment confirmation
    stripeHandler.options.stripe = {
      confirmCardPayment: jest.fn().mockResolvedValue({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_123'
        }
      })
    };
    
    // Process payment
    const result = await stripeHandler.processPayment({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    // Check if Stripe was called correctly
    expect(stripeHandler.options.stripe.confirmCardPayment).toHaveBeenCalledWith(
      'test_secret',
      {
        payment_method: {
          card: { id: 'card_element' },
          billing_details: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      }
    );
    
    // Check if result indicates success
    expect(result.success).toBe(true);
    expect(result.paymentIntent.status).toBe('succeeded');
  });
  
  test('should handle payment errors', async () => {
    // Set up client secret and card element
    stripeHandler.options.clientSecret = 'test_secret';
    stripeHandler.options.card = { id: 'card_element' };
    
    // Mock failed payment confirmation
    stripeHandler.options.stripe = {
      confirmCardPayment: jest.fn().mockResolvedValue({
        error: {
          message: 'Your card was declined'
        }
      })
    };
    
    // Process payment
    const result = await stripeHandler.processPayment({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    // Check if result indicates failure
    expect(result.success).toBe(false);
    expect(result.error).toBe('Your card was declined');
  });
  
  test('should handle payment requiring additional action', async () => {
    // Set up client secret and card element
    stripeHandler.options.clientSecret = 'test_secret';
    stripeHandler.options.card = { id: 'card_element' };
    
    // Mock payment requiring action
    stripeHandler.options.stripe = {
      confirmCardPayment: jest.fn().mockResolvedValue({
        paymentIntent: {
          status: 'requires_action',
          client_secret: 'test_secret',
          id: 'pi_123'
        }
      }),
      handleCardAction: jest.fn().mockResolvedValue({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_123'
        }
      })
    };
    
    // Process payment
    const result = await stripeHandler.processPayment({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    // Check if handleCardAction was called
    expect(stripeHandler.options.stripe.handleCardAction).toHaveBeenCalledWith('test_secret');
    
    // Check if result indicates success
    expect(result.success).toBe(true);
    expect(result.paymentIntent.status).toBe('succeeded');
  });
  
  test('should show payment result', () => {
    // Mock result container
    const mockContainer = {
      id: 'payment-result',
      className: '',
      innerHTML: '',
      style: {}
    };
    document.getElementById.mockReturnValueOnce(null); // First call returns null
    document.createElement.mockReturnValue(mockContainer);
    
    // Show successful payment result
    stripeHandler.showPaymentResult({
      success: true,
      paymentIntent: {
        id: 'pi_123'
      }
    });
    
    // Check if container was created and populated correctly
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockContainer.id).toBe('payment-result');
    expect(mockContainer.className).toContain('success');
    expect(mockContainer.innerHTML).toContain('Payment Successful');
    expect(mockContainer.innerHTML).toContain('pi_123');
    expect(mockContainer.style.display).toBe('block');
    
    // Reset mocks
    document.getElementById.mockReset();
    document.createElement.mockReset();
    
    // Mock existing container
    const existingContainer = {
      id: 'payment-result',
      className: '',
      innerHTML: '',
      style: {}
    };
    document.getElementById.mockReturnValueOnce(existingContainer);
    
    // Show failed payment result
    stripeHandler.showPaymentResult({
      success: false,
      error: 'Payment failed'
    });
    
    // Check if container was updated correctly
    expect(existingContainer.className).toContain('error');
    expect(existingContainer.innerHTML).toContain('Payment Failed');
    expect(existingContainer.innerHTML).toContain('Payment failed');
    expect(existingContainer.style.display).toBe('block');
  });
});
