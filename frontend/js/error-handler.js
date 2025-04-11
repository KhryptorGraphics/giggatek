/**
 * Error Handler
 * 
 * This module provides error handling functionality for the application.
 */

class ErrorHandler {
  constructor() {
    this.defaultMessages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Authentication required. Please log in to continue.',
      403: 'You do not have permission to access this resource.',
      404: 'The requested resource was not found.',
      409: 'Conflict with the current state of the resource.',
      422: 'Validation error. Please check your input and try again.',
      429: 'Too many requests. Please try again later.',
      500: 'An unexpected error occurred. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
      0: 'Network error. Please check your internet connection and try again.'
    };
    
    this.errorListeners = [];
    
    // Set up global error handling
    this.setupGlobalErrorHandling();
  }

  /**
   * Set up global error handling
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      const error = event.reason;
      
      // Check if error is an API error
      if (error && error.name === 'ApiError') {
        this.handleApiError(error);
        
        // Prevent default handling
        event.preventDefault();
      }
    });
    
    // Handle global errors
    window.addEventListener('error', event => {
      const error = event.error;
      
      // Check if error is an API error
      if (error && error.name === 'ApiError') {
        this.handleApiError(error);
        
        // Prevent default handling
        event.preventDefault();
      }
    });
  }

  /**
   * Handle API error
   * 
   * @param {ApiError} error - API error
   * @returns {boolean} True if error was handled
   */
  handleApiError(error) {
    // Check if error is an API error
    if (!error || error.name !== 'ApiError') {
      return false;
    }
    
    // Get error details
    const status = error.status || 0;
    const message = error.message || this.getDefaultMessage(status);
    const data = error.data || {};
    
    // Handle specific error types
    switch (status) {
      case 401:
        // Authentication error
        this.handleAuthError(error);
        break;
      
      case 403:
        // Permission error
        this.handlePermissionError(error);
        break;
      
      case 422:
        // Validation error
        this.handleValidationError(error);
        break;
      
      case 429:
        // Rate limit error
        this.handleRateLimitError(error);
        break;
      
      default:
        // Generic error
        this.showErrorNotification(message, status);
        break;
    }
    
    // Notify error listeners
    this.notifyErrorListeners(error);
    
    return true;
  }

  /**
   * Handle authentication error
   * 
   * @param {ApiError} error - API error
   */
  handleAuthError(error) {
    // Show notification
    this.showErrorNotification(
      'Your session has expired. Please log in again.',
      'Authentication Error'
    );
    
    // Redirect to login page if not already there
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login')) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }
  }

  /**
   * Handle permission error
   * 
   * @param {ApiError} error - API error
   */
  handlePermissionError(error) {
    // Show notification
    this.showErrorNotification(
      'You do not have permission to perform this action.',
      'Permission Error'
    );
  }

  /**
   * Handle validation error
   * 
   * @param {ApiError} error - API error
   */
  handleValidationError(error) {
    const data = error.data || {};
    const errors = data.errors || [];
    
    if (errors.length > 0) {
      // Show first validation error
      const firstError = errors[0];
      const message = `${firstError.field}: ${firstError.message}`;
      
      this.showErrorNotification(message, 'Validation Error');
    } else {
      // Show generic validation error
      this.showErrorNotification(
        'Please check your input and try again.',
        'Validation Error'
      );
    }
    
    // Dispatch validation error event
    window.dispatchEvent(new CustomEvent('validation:error', {
      detail: { errors }
    }));
  }

  /**
   * Handle rate limit error
   * 
   * @param {ApiError} error - API error
   */
  handleRateLimitError(error) {
    const data = error.data || {};
    const retryAfter = data.retryAfter || 60;
    
    // Show notification
    this.showErrorNotification(
      `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      'Rate Limit Error'
    );
  }

  /**
   * Show error notification
   * 
   * @param {string} message - Error message
   * @param {string} title - Error title
   */
  showErrorNotification(message, title = 'Error') {
    // Check if notifications module is available
    if (typeof notifications !== 'undefined') {
      notifications.error(message, title);
    } else {
      // Fallback to alert
      console.error(`${title}: ${message}`);
    }
  }

  /**
   * Get default error message
   * 
   * @param {number} status - HTTP status code
   * @returns {string} Default error message
   */
  getDefaultMessage(status) {
    return this.defaultMessages[status] || this.defaultMessages[0];
  }

  /**
   * Add error listener
   * 
   * @param {Function} listener - Error listener function
   * @returns {Function} Function to remove listener
   */
  addErrorListener(listener) {
    this.errorListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify error listeners
   * 
   * @param {Error} error - Error object
   */
  notifyErrorListeners(error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Handle form validation errors
   * 
   * @param {HTMLFormElement} form - Form element
   * @param {Array} errors - Validation errors
   */
  handleFormValidationErrors(form, errors) {
    if (!form || !errors || !errors.length) {
      return;
    }
    
    // Clear existing validation messages
    form.querySelectorAll('.is-invalid').forEach(element => {
      element.classList.remove('is-invalid');
    });
    
    form.querySelectorAll('.invalid-feedback').forEach(element => {
      element.remove();
    });
    
    // Add validation messages
    errors.forEach(error => {
      const field = form.querySelector(`[name="${error.field}"]`);
      
      if (field) {
        // Add invalid class
        field.classList.add('is-invalid');
        
        // Add error message
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = error.message;
        
        // Insert after field
        field.parentNode.insertBefore(feedback, field.nextSibling);
        
        // Set focus on first invalid field
        if (field === form.querySelector('.is-invalid')) {
          field.focus();
        }
      }
    });
  }
}

// Create global error handler instance
const errorHandler = new ErrorHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = errorHandler;
}
