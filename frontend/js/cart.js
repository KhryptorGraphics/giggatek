/**
 * GigGatek Cart Management
 * Handles cart functionality with backend API integration
 */

class ShoppingCart {
    constructor() {
        this.cartItems = [];
        this.init();
    }

    init() {
        // Load cart from localStorage
        this.loadCart();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Update cart UI
        this.updateCartUI();
    }

    loadCart() {
        const savedCart = localStorage.getItem('giggatek_cart');
        if (savedCart) {
            try {
                this.cartItems = JSON.parse(savedCart);
            } catch (e) {
                console.error('Error parsing cart data:', e);
                this.cartItems = [];
            }
        }
    }

    saveCart() {
        localStorage.setItem('giggatek_cart', JSON.stringify(this.cartItems));
    }

    addItem(product) {
        // Check if product already exists in cart
        const existingItem = this.cartItems.find(item => 
            item.product_id === product.product_id && 
            item.purchase_type === product.purchase_type && 
            item.rental_term === product.rental_term
        );

        if (existingItem) {
            // Increase quantity if already in cart
            existingItem.quantity += product.quantity || 1;
        } else {
            // Add new item to cart
            this.cartItems.push({
                ...product,
                quantity: product.quantity || 1,
                added_at: new Date().toISOString()
            });
        }

        // Save cart to localStorage
        this.saveCart();
        
        // Update UI
        this.updateCartUI();
        
        // Show confirmation message
        this.showNotification('Item added to cart!');
    }

    updateItemQuantity(productId, purchaseType, rentalTerm, newQuantity) {
        // Find the item in the cart
        const itemIndex = this.cartItems.findIndex(item => 
            item.product_id === productId && 
            item.purchase_type === purchaseType && 
            item.rental_term === rentalTerm
        );

        if (itemIndex >= 0) {
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                this.removeItem(productId, purchaseType, rentalTerm);
            } else {
                // Update quantity
                this.cartItems[itemIndex].quantity = newQuantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    removeItem(productId, purchaseType, rentalTerm) {
        // Filter out the item to remove
        this.cartItems = this.cartItems.filter(item => 
            !(item.product_id === productId && 
              item.purchase_type === purchaseType && 
              item.rental_term === rentalTerm)
        );
        
        // Save cart to localStorage
        this.saveCart();
        
        // Update UI
        this.updateCartUI();
    }

    clearCart() {
        this.cartItems = [];
        this.saveCart();
        this.updateCartUI();
    }

    calculateCartTotals() {
        let subtotal = 0;
        let totalItems = 0;
        let oneTimeTotal = 0;
        let monthlyTotal = 0;

        this.cartItems.forEach(item => {
            totalItems += item.quantity;
            
            if (item.purchase_type === 'purchase') {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                oneTimeTotal += itemTotal;
            } else if (item.purchase_type === 'rental') {
                const itemTotal = item.rental_price * item.quantity;
                subtotal += itemTotal;
                monthlyTotal += itemTotal;
            }
        });

        // Calculate tax (simplified for demo - in production would call backend API)
        const taxRate = 0.0825; // Example tax rate (8.25%)
        const taxAmount = subtotal * taxRate;
        
        // Free shipping for orders over $500 (example business rule)
        const shippingCost = subtotal > 500 ? 0 : 9.99;
        
        const grandTotal = subtotal + taxAmount + shippingCost;

        return {
            subtotal,
            taxAmount,
            shippingCost,
            grandTotal,
            totalItems,
            oneTimeTotal,
            monthlyTotal
        };
    }

    updateCartUI() {
        // Update cart icon in header
        this.updateCartIcon();
        
        // If on cart page, update cart items display
        if (document.getElementById('cart-items-container')) {
            this.renderCartItems();
        }
    }

    updateCartIcon() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = this.cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            
            // Show/hide the counter based on item count
            if (totalItems > 0) {
                cartCountElement.classList.remove('hidden');
            } else {
                cartCountElement.classList.add('hidden');
            }
        }
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cart-items-container');
        const emptyCartEl = document.getElementById('empty-cart');
        
        if (!cartContainer) return;
        
        // If cart is empty, show empty cart message
        if (this.cartItems.length === 0) {
            cartContainer.style.display = 'none';
            if (emptyCartEl) emptyCartEl.style.display = 'block';
            return;
        }
        
        // Show cart items container, hide empty message
        cartContainer.style.display = 'block';
        if (emptyCartEl) emptyCartEl.style.display = 'none';
        
        // Update cart header
        const totalItems = this.cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartHeaderEl = cartContainer.querySelector('.cart-header h3');
        if (cartHeaderEl) {
            cartHeaderEl.textContent = `Cart Items (${totalItems})`;
        }
        
        // Clear existing items (except the header)
        const cartHeader = cartContainer.querySelector('.cart-header');
        cartContainer.innerHTML = '';
        cartContainer.appendChild(cartHeader);
        
        // Add each cart item to the container
        this.cartItems.forEach(item => {
            const itemElement = this.createCartItemElement(item);
            cartContainer.appendChild(itemElement);
        });
        
        // Update order summary
        this.updateOrderSummary();
    }

    createCartItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        const purchaseType = item.purchase_type === 'rental' 
            ? `${item.rental_term}-month Rent-to-Own plan` 
            : 'Purchase (One-time payment)';
        
        const price = item.purchase_type === 'rental' 
            ? `$${item.rental_price.toFixed(2)}/month` 
            : `$${item.price.toFixed(2)}`;
        
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image_url || 'img/placeholder-product.png'}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${price}</div>
                <div class="cart-item-rental">${purchaseType}</div>
                <div class="badge badge-${item.condition_class || 'success'}">${item.condition || 'Excellent'} Condition</div>
            </div>
            <div class="cart-item-actions">
                ${item.purchase_type === 'rental' ? `
                    <button class="btn btn-sm btn-outline-primary mb-2" data-action="change-plan"
                        data-product-id="${item.product_id}" 
                        data-purchase-type="${item.purchase_type}"
                        data-rental-term="${item.rental_term}">Change Plan</button>
                ` : `
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease"
                            data-product-id="${item.product_id}" 
                            data-purchase-type="${item.purchase_type}"
                            data-rental-term="${item.rental_term}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10"
                            data-product-id="${item.product_id}" 
                            data-purchase-type="${item.purchase_type}"
                            data-rental-term="${item.rental_term}">
                        <button class="quantity-btn" data-action="increase"
                            data-product-id="${item.product_id}" 
                            data-purchase-type="${item.purchase_type}"
                            data-rental-term="${item.rental_term}">+</button>
                    </div>
                `}
                <button class="btn btn-sm btn-danger" data-action="remove"
                    data-product-id="${item.product_id}" 
                    data-purchase-type="${item.purchase_type}"
                    data-rental-term="${item.rental_term}">Remove</button>
            </div>
        `;
        
        return itemElement;
    }

    updateOrderSummary() {
        const summaryEl = document.querySelector('.cart-summary');
        if (!summaryEl) return;
        
        const totals = this.calculateCartTotals();
        
        // Update items count and subtotal
        const itemsRow = summaryEl.querySelector('.summary-row:nth-child(1)');
        if (itemsRow) {
            itemsRow.innerHTML = `
                <span>Items (${totals.totalItems}):</span>
                <span>$${totals.subtotal.toFixed(2)}</span>
            `;
        }
        
        // Update shipping cost
        const shippingRow = summaryEl.querySelector('.summary-row:nth-child(2)');
        if (shippingRow) {
            shippingRow.innerHTML = `
                <span>Shipping:</span>
                <span>${totals.shippingCost === 0 ? 'Free' : '$' + totals.shippingCost.toFixed(2)}</span>
            `;
        }
        
        // Update tax
        const taxRow = summaryEl.querySelector('.summary-row:nth-child(3)');
        if (taxRow) {
            taxRow.innerHTML = `
                <span>Tax:</span>
                <span>$${totals.taxAmount.toFixed(2)}</span>
            `;
        }
        
        // Update total
        const totalRow = summaryEl.querySelector('.summary-total');
        if (totalRow) {
            totalRow.innerHTML = `
                <span>Total:</span>
                <span>$${totals.grandTotal.toFixed(2)}</span>
            `;
        }
        
        // Update payment details
        const summaryDetails = summaryEl.querySelector('.summary-details');
        if (summaryDetails) {
            summaryDetails.innerHTML = '';
            
            if (totals.oneTimeTotal > 0) {
                const oneTimeEl = document.createElement('div');
                oneTimeEl.className = 'summary-detail';
                oneTimeEl.innerHTML = `
                    <span>One-time Payment:</span>
                    <span>$${totals.oneTimeTotal.toFixed(2)}</span>
                `;
                summaryDetails.appendChild(oneTimeEl);
            }
            
            if (totals.monthlyTotal > 0) {
                const monthlyEl = document.createElement('div');
                monthlyEl.className = 'summary-detail';
                monthlyEl.innerHTML = `
                    <span>Monthly Payment:</span>
                    <span>$${totals.monthlyTotal.toFixed(2)}/mo</span>
                `;
                summaryDetails.appendChild(monthlyEl);
            }
        }
    }

    initEventListeners() {
        // Add to cart buttons (for product pages)
        document.addEventListener('click', event => {
            // Add to cart button
            if (event.target.matches('#add-to-cart-btn, .add-to-cart-btn')) {
                event.preventDefault();
                
                // Get product details from data attributes or form inputs
                const productId = parseInt(event.target.dataset.productId || document.getElementById('product-id')?.value);
                const name = event.target.dataset.productName || document.getElementById('product-name')?.textContent;
                const purchaseType = document.querySelector('input[name="purchase_type"]:checked')?.value || 'purchase';
                
                let price, rentalPrice, rentalTerm;
                
                if (purchaseType === 'purchase') {
                    price = parseFloat(event.target.dataset.price || document.getElementById('product-price')?.dataset.price);
                } else {
                    // Get rental term and price
                    rentalTerm = parseInt(document.querySelector('input[name="rental_term"]:checked')?.value || 12);
                    rentalPrice = parseFloat(document.getElementById(`rental-price-${rentalTerm}m`)?.dataset.price);
                }
                
                const imageUrl = event.target.dataset.imageUrl || 
                    document.querySelector('.product-main-image img')?.src || 
                    'img/placeholder-product.png';
                
                const condition = event.target.dataset.condition || 
                    document.querySelector('.product-condition')?.textContent || 'Excellent';
                
                // Map condition to CSS class
                const conditionMap = {
                    'Excellent': 'success',
                    'Very Good': 'info',
                    'Good': 'warning',
                    'Fair': 'danger'
                };
                
                const conditionClass = conditionMap[condition] || 'success';
                
                // Create product object
                const product = {
                    product_id: productId,
                    name: name,
                    purchase_type: purchaseType,
                    price: price,
                    rental_price: rentalPrice,
                    rental_term: rentalTerm,
                    image_url: imageUrl,
                    condition: condition,
                    condition_class: conditionClass,
                    quantity: 1
                };
                
                // Add to cart
                this.addItem(product);
            }
            
            // Cart page event handlers
            if (document.getElementById('cart-items-container')) {
                // Quantity decrease button
                if (event.target.matches('.quantity-btn[data-action="decrease"]')) {
                    const productId = parseInt(event.target.dataset.productId);
                    const purchaseType = event.target.dataset.purchaseType;
                    const rentalTerm = parseInt(event.target.dataset.rentalTerm || 0);
                    const input = event.target.parentElement.querySelector('.quantity-input');
                    const currentQty = parseInt(input.value);
                    const newQty = Math.max(1, currentQty - 1);
                    
                    input.value = newQty;
                    this.updateItemQuantity(productId, purchaseType, rentalTerm, newQty);
                }
                
                // Quantity increase button
                if (event.target.matches('.quantity-btn[data-action="increase"]')) {
                    const productId = parseInt(event.target.dataset.productId);
                    const purchaseType = event.target.dataset.purchaseType;
                    const rentalTerm = parseInt(event.target.dataset.rentalTerm || 0);
                    const input = event.target.parentElement.querySelector('.quantity-input');
                    const currentQty = parseInt(input.value);
                    const newQty = Math.min(10, currentQty + 1);
                    
                    input.value = newQty;
                    this.updateItemQuantity(productId, purchaseType, rentalTerm, newQty);
                }
                
                // Remove item button
                if (event.target.matches('[data-action="remove"]')) {
                    const productId = parseInt(event.target.dataset.productId);
                    const purchaseType = event.target.dataset.purchaseType;
                    const rentalTerm = parseInt(event.target.dataset.rentalTerm || 0);
                    
                    this.removeItem(productId, purchaseType, rentalTerm);
                }
                
                // Change rental plan button
                if (event.target.matches('[data-action="change-plan"]')) {
                    // Open modal with rental plan options
                    // This would typically open a modal with 3, 6, 12 month options
                    alert('This would open a modal to change the rental plan term');
                }
                
                // Proceed to checkout button
                if (event.target.matches('.cart-actions .btn-primary')) {
                    window.location.href = 'checkout.php';
                }
            }
        });
        
        // Quantity input change
        document.addEventListener('change', event => {
            if (event.target.matches('.quantity-input')) {
                const productId = parseInt(event.target.dataset.productId);
                const purchaseType = event.target.dataset.purchaseType;
                const rentalTerm = parseInt(event.target.dataset.rentalTerm || 0);
                const newQty = parseInt(event.target.value);
                
                // Enforce min/max
                if (newQty < 1) event.target.value = 1;
                if (newQty > 10) event.target.value = 10;
                
                this.updateItemQuantity(productId, purchaseType, rentalTerm, parseInt(event.target.value));
            }
        });
    }

    showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    createOrder() {
        // Prepare order data from cart
        const orderItems = this.cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            is_rental: item.purchase_type === 'rental',
            rental_term_months: item.rental_term
        }));
        
        // Get totals
        const totals = this.calculateCartTotals();
        
        // Get shipping address (would come from form in real implementation)
        const shippingAddress = JSON.parse(localStorage.getItem('giggatek_shipping_address')) || {};
        
        // Create order object
        const orderData = {
            items: orderItems,
            shipping_address: shippingAddress,
            payment_method: localStorage.getItem('giggatek_payment_method') || 'credit_card',
            shipping_method: 'standard',
            shipping_cost: totals.shippingCost,
            tax_amount: totals.taxAmount,
            notes: localStorage.getItem('giggatek_order_notes') || ''
        };
        
        // In a real implementation, this would be an API call
        return this.submitOrderToAPI(orderData);
    }

    // Submit order to backend API
    submitOrderToAPI(orderData) {
        return new Promise(async (resolve, reject) => {
            try {
                // Ensure auth module is available
                if (!window.auth) {
                    throw new Error('Authentication module is required for order submission');
                }
                
                // Get auth token
                const token = window.auth.getToken();
                if (!token) {
                    throw new Error('Authentication required to place an order');
                }
                
                // Make API call to backend
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to create order');
                }
                
                // Clear cart on successful order
                this.clearCart();
                
                resolve(data);
            } catch (error) {
                console.error('Order submission error:', error);
                reject(error);
            }
        });
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global cart instance
    window.cart = new ShoppingCart();
    
    // Add cart count to header if it doesn't exist
    const navUl = document.querySelector('header nav ul');
    if (navUl) {
        const accountLi = navUl.querySelector('li:last-child');
        
        // Check if cart count badge already exists
        if (!document.getElementById('cart-count')) {
            const cartLi = document.createElement('li');
            cartLi.innerHTML = `
                <a href="cart.php" class="cart-icon">
                    <span class="icon">🛒</span>
                    <span id="cart-count" class="badge ${window.cart.cartItems.length === 0 ? 'hidden' : ''}">
                        ${window.cart.cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                </a>
            `;
            
            navUl.insertBefore(cartLi, accountLi);
        }
    }
});
