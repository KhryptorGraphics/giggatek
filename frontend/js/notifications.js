/**
 * Unified Notification System
 * 
 * This module provides a unified notification system for the application.
 */

class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.initialize();
  }

  /**
   * Initialize the notification system
   */
  initialize() {
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
      this.container = document.createElement('div');
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.notification-container');
    }

    // Initialize ARIA live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
    this.liveRegion = liveRegion;
  }

  /**
   * Show a notification
   * 
   * @param {Object} options - Notification options
   * @param {string} options.type - Notification type (success, info, warning, danger)
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {number} options.duration - Duration in milliseconds (default: 5000)
   * @param {Array} options.actions - Array of action buttons
   * @param {Function} options.onClose - Callback function when notification is closed
   * @returns {string} Notification ID
   */
  show(options) {
    const defaults = {
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      actions: [],
      onClose: null
    };

    const settings = { ...defaults, ...options };
    const id = 'notification-' + Date.now();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${settings.type}`;
    notification.id = id;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');

    // Create notification content
    let iconClass = '';
    switch (settings.type) {
      case 'success':
        iconClass = 'fas fa-check-circle';
        break;
      case 'info':
        iconClass = 'fas fa-info-circle';
        break;
      case 'warning':
        iconClass = 'fas fa-exclamation-triangle';
        break;
      case 'danger':
        iconClass = 'fas fa-times-circle';
        break;
    }

    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon ${iconClass}" aria-hidden="true"></span>
        <h4 class="notification-title">${settings.title}</h4>
        <button type="button" class="notification-close" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="notification-body">
        <p>${settings.message}</p>
      </div>
      ${settings.actions.length > 0 ? '<div class="notification-actions"></div>' : ''}
      <div class="notification-progress"></div>
    `;

    // Add action buttons
    if (settings.actions.length > 0) {
      const actionsContainer = notification.querySelector('.notification-actions');
      settings.actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.addEventListener('click', () => {
          if (action.callback) {
            action.callback();
          }
          this.close(id);
        });
        actionsContainer.appendChild(button);
      });
    }

    // Add event listeners
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.close(id);
    });

    // Add to container
    this.container.appendChild(notification);

    // Add to notifications array
    this.notifications.push({
      id,
      element: notification,
      timer: settings.duration > 0 ? setTimeout(() => this.close(id), settings.duration) : null,
      onClose: settings.onClose
    });

    // Announce to screen readers
    this.liveRegion.textContent = `${settings.type} notification: ${settings.title}. ${settings.message}`;

    return id;
  }

  /**
   * Close a notification
   * 
   * @param {string} id - Notification ID
   */
  close(id) {
    const index = this.notifications.findIndex(notification => notification.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      
      // Clear timer
      if (notification.timer) {
        clearTimeout(notification.timer);
      }
      
      // Add hiding class for animation
      notification.element.classList.add('notification-hiding');
      
      // Remove after animation
      setTimeout(() => {
        if (notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
        
        // Call onClose callback
        if (notification.onClose) {
          notification.onClose();
        }
        
        // Remove from notifications array
        this.notifications.splice(index, 1);
      }, 300);
    }
  }

  /**
   * Close all notifications
   */
  closeAll() {
    [...this.notifications].forEach(notification => {
      this.close(notification.id);
    });
  }

  /**
   * Show a success notification
   * 
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   * @returns {string} Notification ID
   */
  success(message, title = 'Success', options = {}) {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  /**
   * Show an info notification
   * 
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   * @returns {string} Notification ID
   */
  info(message, title = 'Information', options = {}) {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  /**
   * Show a warning notification
   * 
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   * @returns {string} Notification ID
   */
  warning(message, title = 'Warning', options = {}) {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  /**
   * Show an error notification
   * 
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   * @returns {string} Notification ID
   */
  error(message, title = 'Error', options = {}) {
    return this.show({
      type: 'danger',
      title,
      message,
      ...options
    });
  }
}

// Create global notification instance
const notifications = new NotificationSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = notifications;
}
