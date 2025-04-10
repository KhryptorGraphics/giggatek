# User Dashboard Documentation

## Overview

The GigGatek User Dashboard provides customers with a central place to manage their account, view orders, track rentals, manage payment methods, and update personal information.

## Table of Contents

1. [Features](#features)
2. [Implementation](#implementation)
3. [Dashboard Tabs](#dashboard-tabs)
4. [Data Integration](#data-integration)
5. [Customization](#customization)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## Features

- **Overview Dashboard**: Summary of recent activity and account status
- **Orders Management**: View and track orders
- **Rentals Management**: Monitor rental payments and status
- **Wishlist**: View and manage saved products
- **Account Settings**: Update personal information and preferences
- **Payment Methods**: Manage saved payment methods
- **Shipping Addresses**: Manage saved shipping addresses
- **Responsive Design**: Optimized for all device sizes

## Implementation

The dashboard is implemented using a combination of HTML, CSS, and JavaScript:

- `dashboard.php`: Main dashboard template
- `dashboard.css`: Dashboard-specific styles
- `dashboard.js`: Dashboard functionality

### Key Components

- **Dashboard Container**: Main container for the dashboard
- **Dashboard Navigation**: Side navigation for switching between tabs
- **Dashboard Content**: Content area for displaying the active tab
- **Dashboard Header**: Header with user information and notifications
- **Dashboard Cards**: Cards for displaying summary information

### Initialization

The dashboard is initialized when the DOM is loaded:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  window.dashboard = new Dashboard();
});
```

## Dashboard Tabs

### Overview Tab

The Overview tab provides a summary of the user's account:

- Recent orders
- Upcoming rental payments
- Account statistics
- Quick links to common actions

### Orders Tab

The Orders tab displays the user's order history:

- List of all orders
- Order status and tracking information
- Order details (items, prices, shipping information)
- Actions (view details, track shipment, reorder)

### Rentals Tab

The Rentals tab shows the user's active rentals:

- List of rented items
- Payment status and history
- Rental term progress
- Actions (make payment, view details)

### Wishlist Tab

The Wishlist tab displays the user's saved products:

- List of wishlist items
- Product information (price, availability)
- Actions (add to cart, remove from wishlist)

### Settings Tab

The Settings tab allows the user to manage their account:

- Personal information (name, email, phone)
- Password management
- Communication preferences
- Account deletion

### Addresses Tab

The Addresses tab manages the user's shipping addresses:

- List of saved addresses
- Default address selection
- Actions (add, edit, delete)

### Payment Methods Tab

The Payment Methods tab manages the user's payment methods:

- List of saved payment methods
- Default payment method selection
- Actions (add, edit, delete)

## Data Integration

The dashboard integrates with the backend API to fetch and update user data:

### Loading Data

```javascript
async loadOrders() {
  try {
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load orders');
    }
    
    const data = await response.json();
    this.orders = data.orders;
    this.renderOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    this.showError('orders-container', 'Failed to load orders. Please try again later.');
  }
}
```

### Updating Data

```javascript
async updateProfile(formData) {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    const data = await response.json();
    notifications.success('Profile updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    notifications.error('Failed to update profile. Please try again.');
    throw error;
  }
}
```

## Customization

### CSS Customization

The dashboard's appearance can be customized by modifying the `dashboard.css` file:

```css
.dashboard-container {
  /* Dashboard container styles */
}

.dashboard-nav {
  /* Navigation styles */
}

.dashboard-content {
  /* Content area styles */
}

.dashboard-card {
  /* Card styles */
}
```

### JavaScript Customization

You can customize the dashboard behavior by modifying the `dashboard.js` file:

```javascript
// Custom tab initialization
initializeCustomTab() {
  // Custom tab initialization code
}

// Custom data loading
async loadCustomData() {
  // Custom data loading code
}

// Custom rendering
renderCustomContent() {
  // Custom rendering code
}
```

## Best Practices

### Performance

- Load data asynchronously to prevent blocking the UI
- Implement pagination for large data sets
- Cache data when appropriate to reduce API calls
- Use lazy loading for images and content not immediately visible

### User Experience

- Provide clear feedback for all actions
- Maintain consistent design across all tabs
- Ensure all interactive elements are accessible
- Provide helpful error messages when things go wrong
- Remember user's last active tab between sessions

### Security

- Validate all input on both client and server
- Use HTTPS for all API calls
- Implement proper authentication and authorization
- Protect sensitive user information

## Examples

### Tab Switching

```javascript
// Switch to a specific tab
switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.dashboard-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show the selected tab
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Update navigation
  document.querySelectorAll('.dashboard-nav a').forEach(link => {
    link.classList.remove('active');
  });
  
  document.querySelector(`.dashboard-nav a[data-tab="${tabName}"]`).classList.add('active');
  
  // Load tab-specific data if needed
  this.loadTabData(tabName);
  
  // Save active tab to localStorage
  localStorage.setItem('activeTab', tabName);
}
```

### Order Card Rendering

```javascript
renderOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'order-card';
  
  card.innerHTML = `
    <div class="order-header">
      <div class="order-id">Order #${order.order_id}</div>
      <div class="order-date">${new Date(order.order_date).toLocaleDateString()}</div>
    </div>
    <div class="order-content">
      <div class="order-items">${order.items_count} items</div>
      <div class="order-total">$${order.total.toFixed(2)}</div>
      <div class="order-status">
        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
      </div>
    </div>
    <div class="order-actions">
      <button class="btn btn-sm btn-outline-primary" data-order-id="${order.order_id}" data-action="view-order">
        View Details
      </button>
    </div>
  `;
  
  return card;
}
```

### Form Submission

```javascript
// Handle profile form submission
document.getElementById('profile-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const formData = new FormData(this);
  const formObject = {};
  
  formData.forEach((value, key) => {
    formObject[key] = value;
  });
  
  try {
    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    // Submit form data
    await dashboard.updateProfile(formObject);
    
    // Reset form state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  } catch (error) {
    // Handle error
    console.error('Form submission error:', error);
  }
});
```
