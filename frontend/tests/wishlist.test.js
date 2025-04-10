/**
 * Tests for the wishlist functionality
 */

// Import the Wishlist class
const Wishlist = require('../js/wishlist').Wishlist;

describe('Wishlist', () => {
  let wishlist;
  
  beforeEach(() => {
    // Reset DOM mocks
    document.querySelector.mockReset();
    document.getElementById.mockReset();
    document.createElement.mockReset();
    document.addEventListener.mockReset();
    
    // Reset fetch mock
    fetch.mockReset();
    
    // Create a new instance for each test
    wishlist = new Wishlist();
    
    // Mock auth module
    window.auth = {
      isAuthenticated: jest.fn().mockReturnValue(true),
      getAuthHeaders: jest.fn().mockReturnValue({ 'Authorization': 'Bearer test-token' }),
      getToken: jest.fn().mockReturnValue('test-token')
    };
    
    // Mock notifications module
    window.notifications = {
      show: jest.fn()
    };
  });
  
  test('should initialize correctly', () => {
    // Initialize wishlist
    wishlist.init();
    
    // Check if event listeners were set up
    expect(document.addEventListener).toHaveBeenCalled();
  });
  
  test('should load wishlist items from API', async () => {
    // Mock wishlist container
    const mockContainer = {
      innerHTML: ''
    };
    document.querySelector.mockReturnValue(mockContainer);
    
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        items: [
          {
            product_id: 1,
            name: 'Test Product',
            purchase_price: 99.99,
            rental_price_12m: 9.99,
            condition_rating: 'Excellent',
            primary_image: 'test-image.jpg'
          }
        ]
      })
    });
    
    // Load wishlist
    await wishlist.loadWishlist();
    
    // Check if API was called correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
    
    // Check if wishlist items were stored
    expect(wishlist.wishlistItems.length).toBe(1);
    expect(wishlist.wishlistItems[0].product_id).toBe(1);
    
    // Check if container was updated
    expect(mockContainer.innerHTML).not.toBe('');
  });
  
  test('should handle empty wishlist', async () => {
    // Mock wishlist container
    const mockContainer = {
      innerHTML: ''
    };
    document.querySelector.mockReturnValue(mockContainer);
    
    // Mock successful API response with empty items
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        items: []
      })
    });
    
    // Load wishlist
    await wishlist.loadWishlist();
    
    // Check if container shows empty state
    expect(mockContainer.innerHTML).toContain('Your wishlist is empty');
  });
  
  test('should handle API errors', async () => {
    // Mock wishlist container
    const mockContainer = {
      innerHTML: ''
    };
    document.querySelector.mockReturnValue(mockContainer);
    
    // Mock failed API response
    fetch.mockRejectedValueOnce(new Error('API error'));
    
    // Load wishlist
    await wishlist.loadWishlist();
    
    // Check if error message is shown
    expect(mockContainer.innerHTML).toContain('problem loading your wishlist');
  });
  
  test('should add item to wishlist', async () => {
    // Mock button element
    const mockButton = {
      innerHTML: '♡',
      disabled: false,
      dataset: {
        productId: '123'
      },
      classList: {
        add: jest.fn()
      }
    };
    
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Item added to wishlist',
        wishlist_item_id: 456
      })
    });
    
    // Add to wishlist
    await wishlist.addToWishlist('123', mockButton);
    
    // Check if API was called correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          product_id: '123'
        })
      })
    );
    
    // Check if button was updated
    expect(mockButton.innerHTML).toBe('♥');
    expect(mockButton.classList.add).toHaveBeenCalledWith('in-wishlist');
    
    // Check if notification was shown
    expect(window.notifications.show).toHaveBeenCalledWith('Item added to wishlist!');
  });
  
  test('should remove item from wishlist', async () => {
    // Mock button element
    const mockButton = {
      innerHTML: 'Remove',
      disabled: false,
      dataset: {
        productId: '123'
      },
      closest: jest.fn().mockReturnValue({
        classList: {
          add: jest.fn()
        },
        remove: jest.fn()
      })
    };
    
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Item removed from wishlist'
      })
    });
    
    // Mock setTimeout to execute callback immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 999;
    });
    
    // Remove from wishlist
    await wishlist.removeFromWishlist('123', mockButton);
    
    // Check if API was called correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/123'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
    
    // Check if notification was shown
    expect(window.notifications.show).toHaveBeenCalledWith('Item removed from wishlist!');
  });
  
  test('should check if product is in wishlist', () => {
    // Set wishlist items
    wishlist.wishlistItems = [
      { product_id: 1 },
      { product_id: 2 },
      { product_id: 3 }
    ];
    
    // Check if products are in wishlist
    expect(wishlist.isInWishlist(1)).toBe(true);
    expect(wishlist.isInWishlist('1')).toBe(true); // Test string conversion
    expect(wishlist.isInWishlist(4)).toBe(false);
  });
  
  test('should redirect to login if user is not authenticated', () => {
    // Mock auth to return not authenticated
    window.auth.isAuthenticated.mockReturnValue(false);
    
    // Mock location.href
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: 'http://localhost/products.php'
    });
    
    // Try to add to wishlist
    wishlist.addToWishlist('123');
    
    // Check if redirected to login
    expect(window.location.href).toContain('login.php?redirect=');
  });
});
