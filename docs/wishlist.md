# Wishlist Functionality Documentation

## Overview

The GigGatek Wishlist feature allows users to save products they're interested in for later viewing or purchase. This document provides information about how the wishlist functionality works, how to implement it, and how to maintain it.

## Table of Contents

1. [Features](#features)
2. [Implementation](#implementation)
3. [Frontend Integration](#frontend-integration)
4. [Backend Integration](#backend-integration)
5. [User Experience](#user-experience)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## Features

- **Add to Wishlist**: Save products for later
- **Remove from Wishlist**: Remove products from wishlist
- **Wishlist Dashboard**: View all saved products in the user dashboard
- **Quick Add to Cart**: Add wishlist items to cart with one click
- **Persistence**: Wishlist is saved to the user's account
- **Notifications**: Feedback when adding or removing items
- **Authentication Integration**: Redirects to login if user is not authenticated

## Implementation

The wishlist functionality is implemented using a combination of frontend JavaScript and backend API endpoints.

### Key Components

- **Wishlist Class**: Main JavaScript class for managing wishlist functionality
- **Wishlist API**: Backend endpoints for storing and retrieving wishlist data
- **Wishlist UI**: User interface elements for interacting with the wishlist
- **Wishlist Dashboard**: Tab in the user dashboard for viewing all wishlist items

## Frontend Integration

The frontend integration is handled by the `wishlist.js` file, which provides a `Wishlist` class for managing wishlist functionality.

### Initialization

The wishlist is initialized when the DOM is loaded:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  window.wishlist = new Wishlist();
});
```

### Adding to Wishlist

To add a product to the wishlist:

```javascript
// Add to wishlist button click handler
document.addEventListener('click', function(event) {
  if (event.target.matches('.add-to-wishlist')) {
    event.preventDefault();
    
    const productId = event.target.dataset.productId;
    wishlist.addToWishlist(productId, event.target);
  }
});
```

### Removing from Wishlist

To remove a product from the wishlist:

```javascript
// Remove from wishlist button click handler
document.addEventListener('click', function(event) {
  if (event.target.matches('.remove-from-wishlist')) {
    event.preventDefault();
    
    const productId = event.target.dataset.productId;
    wishlist.removeFromWishlist(productId, event.target);
  }
});
```

### Loading Wishlist

To load the wishlist data:

```javascript
// Load wishlist data
async loadWishlist() {
  try {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
      return;
    }
    
    // Fetch wishlist data from API
    const response = await fetch('/api/wishlist', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load wishlist');
    }
    
    const data = await response.json();
    
    // Store wishlist items
    this.wishlistItems = data.items || [];
    
    // Update UI
    this.updateWishlistUI();
  } catch (error) {
    console.error('Error loading wishlist:', error);
  }
}
```

## Backend Integration

The backend integration is handled by the `wishlist.php` file, which provides API endpoints for managing wishlist data.

### API Endpoints

- `GET /api/wishlist`: Get the user's wishlist
- `POST /api/wishlist`: Add an item to the wishlist
- `DELETE /api/wishlist/{id}`: Remove an item from the wishlist

### Database Schema

The wishlist data is stored in the `wishlist_items` table:

```sql
CREATE TABLE wishlist_items (
  wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  UNIQUE KEY (user_id, product_id)
);
```

### Getting Wishlist Items

```php
// Get wishlist items for the current user
function getWishlistItems($userId) {
  $conn = get_db_connection();
  $stmt = $conn->prepare("
    SELECT w.wishlist_item_id, w.product_id, w.added_at,
           p.name, p.purchase_price, p.rental_price_12m,
           p.condition_rating, p.primary_image
    FROM wishlist_items w
    JOIN products p ON w.product_id = p.product_id
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  ");
  
  $stmt->bind_param("i", $userId);
  $stmt->execute();
  $result = $stmt->get_result();
  
  $items = [];
  while ($row = $result->fetch_assoc()) {
    $items[] = $row;
  }
  
  $stmt->close();
  $conn->close();
  
  return $items;
}
```

### Adding to Wishlist

```php
// Add item to wishlist
function addToWishlist($userId, $productId) {
  $conn = get_db_connection();
  
  // Check if product exists
  $stmt = $conn->prepare("SELECT product_id FROM products WHERE product_id = ?");
  $stmt->bind_param("i", $productId);
  $stmt->execute();
  $result = $stmt->get_result();
  
  if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    return [
      'success' => false,
      'message' => 'Product not found'
    ];
  }
  
  // Check if already in wishlist
  $stmt = $conn->prepare("SELECT wishlist_item_id FROM wishlist_items WHERE user_id = ? AND product_id = ?");
  $stmt->bind_param("ii", $userId, $productId);
  $stmt->execute();
  $result = $stmt->get_result();
  
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    return [
      'success' => true,
      'message' => 'Item already in wishlist',
      'wishlist_item_id' => $row['wishlist_item_id']
    ];
  }
  
  // Add to wishlist
  $stmt = $conn->prepare("INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)");
  $stmt->bind_param("ii", $userId, $productId);
  $stmt->execute();
  
  if ($stmt->affected_rows > 0) {
    $wishlistItemId = $conn->insert_id;
    $stmt->close();
    $conn->close();
    return [
      'success' => true,
      'message' => 'Item added to wishlist',
      'wishlist_item_id' => $wishlistItemId
    ];
  } else {
    $stmt->close();
    $conn->close();
    return [
      'success' => false,
      'message' => 'Failed to add item to wishlist'
    ];
  }
}
```

### Removing from Wishlist

```php
// Remove item from wishlist
function removeFromWishlist($userId, $productId) {
  $conn = get_db_connection();
  $stmt = $conn->prepare("DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?");
  $stmt->bind_param("ii", $userId, $productId);
  $stmt->execute();
  
  if ($stmt->affected_rows > 0) {
    $stmt->close();
    $conn->close();
    return [
      'success' => true,
      'message' => 'Item removed from wishlist'
    ];
  } else {
    $stmt->close();
    $conn->close();
    return [
      'success' => false,
      'message' => 'Item not found in wishlist'
    ];
  }
}
```

## User Experience

### Wishlist Button States

The wishlist button has different states to indicate whether a product is in the wishlist:

- **Not in Wishlist**: Heart outline (♡)
- **In Wishlist**: Filled heart (♥)
- **Adding to Wishlist**: Disabled with loading indicator
- **Removing from Wishlist**: Disabled with loading indicator

### Notifications

The wishlist functionality integrates with the notification system to provide feedback:

- **Added to Wishlist**: Success notification when an item is added
- **Removed from Wishlist**: Info notification when an item is removed
- **Error**: Error notification when an operation fails

### Authentication

If a user tries to add an item to the wishlist without being logged in, they are redirected to the login page with a redirect parameter to return to the product page after login.

## Best Practices

### Performance

- Load wishlist data asynchronously to prevent blocking the UI
- Cache wishlist state to reduce API calls
- Update UI immediately before API call completes for better perceived performance

### User Experience

- Provide clear feedback for all actions
- Make wishlist buttons easily accessible on product cards and detail pages
- Allow adding to cart directly from the wishlist
- Show relevant product information in the wishlist

### Security

- Validate all input on both client and server
- Ensure users can only access their own wishlist data
- Implement proper authentication and authorization

## Examples

### Wishlist Button in Product Card

```html
<div class="product-card">
  <div class="product-image">
    <img src="product-image.jpg" alt="Product Name">
  </div>
  <div class="product-details">
    <h3>Product Name</h3>
    <div class="product-price">$99.99</div>
  </div>
  <div class="product-actions">
    <button class="add-to-cart" data-product-id="123">Add to Cart</button>
    <button class="add-to-wishlist" data-product-id="123">♡</button>
  </div>
</div>
```

### Wishlist Item in Dashboard

```html
<div class="wishlist-item">
  <div class="wishlist-item-image">
    <img src="product-image.jpg" alt="Product Name">
  </div>
  <div class="wishlist-item-details">
    <h4>Product Name</h4>
    <div class="wishlist-item-price">$99.99</div>
    <div class="wishlist-item-added">Added on June 1, 2023</div>
  </div>
  <div class="wishlist-item-actions">
    <button class="btn btn-primary add-to-cart" data-product-id="123">Add to Cart</button>
    <button class="btn btn-outline-danger remove-from-wishlist" data-product-id="123">Remove</button>
  </div>
</div>
```

### Checking if Product is in Wishlist

```javascript
// Check if product is in wishlist
isInWishlist(productId) {
  return this.wishlistItems.some(item => 
    parseInt(item.product_id) === parseInt(productId)
  );
}

// Update wishlist buttons on page
updateWishlistButtons() {
  document.querySelectorAll('.add-to-wishlist').forEach(button => {
    const productId = button.dataset.productId;
    
    if (this.isInWishlist(productId)) {
      button.innerHTML = '♥';
      button.classList.add('in-wishlist');
    } else {
      button.innerHTML = '♡';
      button.classList.remove('in-wishlist');
    }
  });
}
```

### Adding to Cart from Wishlist

```javascript
// Add to cart from wishlist
document.addEventListener('click', function(event) {
  if (event.target.matches('.wishlist-item .add-to-cart')) {
    event.preventDefault();
    
    const productId = event.target.dataset.productId;
    const productName = event.target.closest('.wishlist-item').querySelector('h4').textContent;
    
    // Add to cart
    cart.addItem({
      product_id: productId,
      name: productName,
      // Other product details...
    });
    
    // Show notification
    notifications.success(`${productName} added to cart!`);
  }
});
```
