# Notification System Documentation

## Overview

GigGatek's notification system provides a unified way to display feedback to users across the application. It supports different notification types, automatic dismissal, and a queue system to prevent notification overload.

## Table of Contents

1. [Features](#features)
2. [Implementation](#implementation)
3. [Usage](#usage)
4. [Customization](#customization)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

## Features

- **Multiple notification types**: Success, error, warning, and info
- **Automatic dismissal**: Notifications automatically disappear after a configurable time
- **Queue system**: Prevents notification overload by showing notifications one after another
- **Pause on hover**: Notifications pause dismissal timer when hovered
- **Custom actions**: Add buttons or links to notifications
- **Position control**: Display notifications in different positions on the screen
- **Animation**: Smooth entrance and exit animations
- **Accessibility**: Screen reader support and keyboard navigation

## Implementation

The notification system is implemented in the `notifications.js` file, which provides a `NotificationSystem` class for creating and managing notifications.

### Key Components

- **NotificationSystem**: Main class for managing notifications
- **Notification container**: DOM element that contains all notifications
- **Notification elements**: Individual notification messages
- **Queue system**: Manages the display of multiple notifications

### Initialization

The notification system is initialized when the DOM is loaded:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  window.notifications = new NotificationSystem();
});
```

## Usage

### Basic Usage

To show a notification, use the `show` method:

```javascript
notifications.show('Your message here', 'success');
```

### Notification Types

There are four notification types:

```javascript
notifications.show('Operation completed successfully', 'success');
notifications.show('Something went wrong', 'error');
notifications.show('Please note this important information', 'warning');
notifications.show('Here is some information', 'info');
```

### Shorthand Methods

For convenience, there are shorthand methods for each notification type:

```javascript
notifications.success('Operation completed successfully');
notifications.error('Something went wrong');
notifications.warning('Please note this important information');
notifications.info('Here is some information');
```

### Custom Options

You can customize notifications with additional options:

```javascript
notifications.show('Your message here', 'success', {
  duration: 5000, // Duration in milliseconds
  dismissible: true, // Allow manual dismissal
  position: 'top-right', // Position on screen
  actions: [ // Custom actions
    {
      text: 'Undo',
      onClick: function() {
        // Undo action
      }
    }
  ]
});
```

### Closing Notifications

Notifications close automatically after their duration, but you can also close them manually:

```javascript
const notificationId = notifications.show('Your message here', 'success');
notifications.close(notificationId);
```

### Clearing All Notifications

To clear all active notifications:

```javascript
notifications.clearAll();
```

## Customization

### CSS Customization

The notification system's appearance can be customized by modifying the `notifications.css` file:

```css
.notification {
  /* Base notification styles */
}

.notification-success {
  /* Success notification styles */
}

.notification-error {
  /* Error notification styles */
}

.notification-warning {
  /* Warning notification styles */
}

.notification-info {
  /* Info notification styles */
}
```

### JavaScript Customization

You can customize the default options when initializing the notification system:

```javascript
const notifications = new NotificationSystem({
  duration: 5000, // Default duration for all notifications
  maxNotifications: 3, // Maximum number of notifications shown at once
  position: 'top-right', // Default position
  dismissible: true, // Allow manual dismissal by default
  pauseOnHover: true, // Pause timer when hovering
  animationDuration: 300 // Animation duration in milliseconds
});
```

## Best Practices

### When to Use Each Type

- **Success**: Use for successful operations (e.g., "Item added to cart")
- **Error**: Use for errors and failures (e.g., "Payment failed")
- **Warning**: Use for important notices that require attention (e.g., "Your session will expire soon")
- **Info**: Use for general information (e.g., "New features available")

### Message Guidelines

- Keep messages concise and clear
- Use consistent language throughout the application
- Include specific details when relevant
- For errors, suggest a solution when possible

### Timing

- Use shorter durations (3-5 seconds) for success and info notifications
- Use longer durations (5-8 seconds) for warnings and errors
- Consider the complexity of the message when setting duration

### Positioning

- Top-right is the standard position for most notifications
- Bottom positions can be used for less important notifications
- Center positions can be used for critical notifications that require immediate attention

## Examples

### Shopping Cart Notification

```javascript
// When adding an item to cart
cart.addItem(product);
notifications.success('Item added to cart!');

// When removing an item from cart
cart.removeItem(productId);
notifications.info('Item removed from cart');
```

### Payment Notification

```javascript
// Successful payment
if (paymentResult.success) {
  notifications.success('Payment processed successfully!');
} else {
  notifications.error(`Payment failed: ${paymentResult.error}`);
}
```

### Form Submission Notification

```javascript
// Form submission
formSubmit()
  .then(response => {
    if (response.success) {
      notifications.success('Form submitted successfully!');
    } else {
      notifications.error(`Submission failed: ${response.message}`);
    }
  })
  .catch(error => {
    notifications.error('An unexpected error occurred. Please try again.');
  });
```

### Notification with Action

```javascript
// Notification with undo action
const itemName = 'Product XYZ';
const itemId = cart.removeItem(productId);

notifications.info(`${itemName} removed from cart`, {
  actions: [
    {
      text: 'Undo',
      onClick: function() {
        cart.restoreItem(itemId);
        notifications.success(`${itemName} restored to cart`);
      }
    }
  ]
});
```

### Session Expiration Warning

```javascript
// Session expiration warning
if (sessionTimeRemaining < 5 * 60 * 1000) { // Less than 5 minutes
  notifications.warning('Your session will expire in 5 minutes. Please save your work.', {
    duration: 10000, // Show for 10 seconds
    actions: [
      {
        text: 'Extend Session',
        onClick: function() {
          extendSession();
          notifications.success('Session extended by 30 minutes');
        }
      }
    ]
  });
}
```
