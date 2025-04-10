/**
 * GigGatek Wishlist Management
 * Handles wishlist functionality with backend API integration
 */

class Wishlist {
    constructor() {
        this.wishlistItems = [];
        this.apiBaseUrl = window.GigGatekConfig ? window.GigGatekConfig.getApiEndpoint('/wishlist') : '/api/wishlist';
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the wishlist
     */
    init() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Load wishlist if on dashboard wishlist tab
        const wishlistTab = document.getElementById('wishlist-tab');
        if (wishlistTab && wishlistTab.classList.contains('active')) {
            this.loadWishlist();
        }
        
        // Listen for dashboard tab changes
        document.addEventListener('dashboard:tabChanged', (e) => {
            if (e.detail.tab === 'wishlist') {
                this.loadWishlist();
            }
        });
    }
    
    /**
     * Setup event listeners for wishlist-related actions
     */
    setupEventListeners() {
        // Add to wishlist buttons (on product pages and listings)
        document.addEventListener('click', (e) => {
            // Add to wishlist button
            if (e.target.matches('.add-to-wishlist, .wishlist-btn') || e.target.closest('.add-to-wishlist, .wishlist-btn')) {
                e.preventDefault();
                
                const button = e.target.matches('.add-to-wishlist, .wishlist-btn') ? 
                    e.target : e.target.closest('.add-to-wishlist, .wishlist-btn');
                
                const productId = button.dataset.productId;
                if (productId) {
                    this.addToWishlist(productId, button);
                }
            }
            
            // Remove from wishlist button
            if (e.target.matches('.remove-wishlist') || e.target.closest('.remove-wishlist')) {
                e.preventDefault();
                
                const button = e.target.matches('.remove-wishlist') ? 
                    e.target : e.target.closest('.remove-wishlist');
                
                const productId = button.dataset.productId;
                if (productId) {
                    this.removeFromWishlist(productId, button);
                }
            }
        });
    }
    
    /**
     * Get authentication headers for API requests (from auth module)
     * @returns {Object} Headers object with Authorization header
     */
    getAuthHeaders() {
        return window.auth ? window.auth.getAuthHeaders() : {};
    }
    
    /**
     * Load wishlist items from API
     */
    async loadWishlist() {
        // Check if user is authenticated
        if (window.auth && !window.auth.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = '/login.php?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }
        
        const wishlistContainer = document.querySelector('#wishlist-tab .product-grid');
        if (!wishlistContainer) return;
        
        try {
            // Show loading state
            wishlistContainer.innerHTML = '<div class="loading">Loading wishlist...</div>';
            
            const response = await fetch(this.apiBaseUrl, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load wishlist: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.wishlistItems = data.items || [];
                
                // Render wishlist
                this.renderWishlist();
            } else {
                throw new Error(data.error || 'Failed to load wishlist');
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            
            wishlistContainer.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading your wishlist.</p>
                    <button id="retry-load-wishlist" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-wishlist');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.loadWishlist());
            }
        }
    }
    
    /**
     * Render wishlist items in the wishlist container
     */
    renderWishlist() {
        const wishlistContainer = document.querySelector('#wishlist-tab .product-grid');
        if (!wishlistContainer) return;
        
        // Clear container
        wishlistContainer.innerHTML = '';
        
        // Show empty state if no items
        if (this.wishlistItems.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="no-data">
                    <p>Your wishlist is empty.</p>
                    <a href="/products.php" class="btn btn-primary">Browse Products</a>
                </div>
            `;
            return;
        }
        
        // Add wishlist items
        this.wishlistItems.forEach(item => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            
            // Format price with 2 decimal places
            const formattedPrice = parseFloat(item.purchase_price).toFixed(2);
            const formattedRentalPrice = item.rental_price_12m ? 
                parseFloat(item.rental_price_12m).toFixed(2) : null;
            
            // Get primary image or placeholder
            const imageUrl = item.primary_image || 'img/placeholder-product.png';
            
            // Add condition badge
            let conditionClass = '';
            if (item.condition_rating === 'Excellent') {
                conditionClass = 'condition-excellent';
            } else if (item.condition_rating === 'Good') {
                conditionClass = 'condition-good';
            } else if (item.condition_rating === 'Fair') {
                conditionClass = 'condition-fair';
            }
            
            productElement.innerHTML = `
                <div class="condition-badge ${conditionClass}">${item.condition_rating}</div>
                <img src="${imageUrl}" alt="${item.name}">
                <h4>${item.name}</h4>
                <div class="price">$${formattedPrice}</div>
                ${formattedRentalPrice ? 
                    `<div class="rent-price">From $${formattedRentalPrice}/mo with Rent-to-Own</div>` : ''}
                <div class="wishlist-actions">
                    <a href="product.php?id=${item.product_id}" class="btn btn-primary">View Details</a>
                    <button class="btn btn-outline-primary add-to-cart-btn" 
                        data-product-id="${item.product_id}" 
                        data-product-name="${item.name}" 
                        data-product-price="${item.purchase_price}">
                        Add to Cart
                    </button>
                    <button class="btn btn-sm btn-outline-danger remove-wishlist" 
                        data-product-id="${item.product_id}">
                        Remove
                    </button>
                </div>
            `;
            
            wishlistContainer.appendChild(productElement);
        });
    }
    
    /**
     * Add a product to the wishlist
     * @param {number|string} productId - ID of the product to add
     * @param {HTMLElement} button - Button element that triggered the action
     */
    async addToWishlist(productId, button) {
        // Check if user is authenticated
        if (window.auth && !window.auth.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = '/login.php?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }
        
        try {
            // Show loading state
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<span class="spinner"></span>';
                button.disabled = true;
            }
            
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Show success message
                this.showNotification('Item added to wishlist!');
                
                // Update button state
                if (button) {
                    button.innerHTML = '♥';
                    button.classList.add('in-wishlist');
                    button.title = 'In your wishlist';
                }
                
                // Reload wishlist if on wishlist page
                const wishlistTab = document.getElementById('wishlist-tab');
                if (wishlistTab && wishlistTab.classList.contains('active')) {
                    this.loadWishlist();
                }
            } else {
                throw new Error(data.error || 'Failed to add to wishlist');
            }
        } catch (error) {
            console.error(`Error adding product ${productId} to wishlist:`, error);
            
            // Show error message
            this.showNotification('Error adding to wishlist. Please try again.', 'error');
            
            // Reset button state
            if (button) {
                button.innerHTML = '♡';
                button.disabled = false;
            }
        }
    }
    
    /**
     * Remove a product from the wishlist
     * @param {number|string} productId - ID of the product to remove
     * @param {HTMLElement} button - Button element that triggered the action
     */
    async removeFromWishlist(productId, button) {
        try {
            // Show loading state
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<span class="spinner"></span>';
                button.disabled = true;
            }
            
            const response = await fetch(`${this.apiBaseUrl}/${productId}`, {
                method: 'DELETE',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Show success message
                this.showNotification('Item removed from wishlist!');
                
                // Update button state if on product page
                const wishlistButtons = document.querySelectorAll(`.add-to-wishlist[data-product-id="${productId}"], .wishlist-btn[data-product-id="${productId}"]`);
                wishlistButtons.forEach(btn => {
                    btn.innerHTML = '♡';
                    btn.classList.remove('in-wishlist');
                    btn.title = 'Add to wishlist';
                });
                
                // Remove item from wishlist page if on wishlist page
                const wishlistTab = document.getElementById('wishlist-tab');
                if (wishlistTab && wishlistTab.classList.contains('active')) {
                    // Find the product item and remove it with animation
                    const productItem = button.closest('.product-item');
                    if (productItem) {
                        productItem.classList.add('removing');
                        setTimeout(() => {
                            productItem.remove();
                            
                            // Reload wishlist to show empty state if needed
                            this.loadWishlist();
                        }, 300);
                    }
                }
            } else {
                throw new Error(data.error || 'Failed to remove from wishlist');
            }
        } catch (error) {
            console.error(`Error removing product ${productId} from wishlist:`, error);
            
            // Show error message
            this.showNotification('Error removing from wishlist. Please try again.', 'error');
            
            // Reset button state
            if (button) {
                button.innerHTML = 'Remove';
                button.disabled = false;
            }
        }
    }
    
    /**
     * Check if a product is in the wishlist
     * @param {number|string} productId - ID of the product to check
     * @returns {boolean} True if product is in wishlist, false otherwise
     */
    isInWishlist(productId) {
        return this.wishlistItems.some(item => item.product_id === parseInt(productId));
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'error', etc.)
     */
    showNotification(message, type = 'success') {
        // Use notification system if available
        if (window.notifications) {
            window.notifications.show(message, type);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global wishlist instance
    window.wishlist = new Wishlist();
});
