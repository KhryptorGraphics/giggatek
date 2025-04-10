/**
 * GigGatek Notification System
 * Provides a unified notification system for the entire application
 */

class NotificationSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            position: options.position || 'top-right',
            duration: options.duration || 5000, // 5 seconds
            maxNotifications: options.maxNotifications || 5,
            container: options.container || document.body
        };
        
        // Notification queue
        this.queue = [];
        
        // Active notifications
        this.activeNotifications = [];
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the notification system
     */
    init() {
        // Create notification container
        this.createContainer();
    }
    
    /**
     * Create the notification container
     */
    createContainer() {
        // Check if container already exists
        let container = document.getElementById('notification-container');
        
        if (!container) {
            // Create container
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = `notification-container ${this.options.position}`;
            
            // Add to DOM
            this.options.container.appendChild(container);
        }
        
        this.container = container;
    }
    
    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
     * @param {Object} options - Additional options
     */
    show(message, type = 'info', options = {}) {
        // Create notification object
        const notification = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            message,
            type,
            duration: options.duration || this.options.duration,
            onClose: options.onClose || null
        };
        
        // Add to queue
        this.queue.push(notification);
        
        // Process queue
        this.processQueue();
    }
    
    /**
     * Process the notification queue
     */
    processQueue() {
        // Check if we can show more notifications
        if (this.activeNotifications.length >= this.options.maxNotifications) {
            return;
        }
        
        // Get next notification from queue
        const notification = this.queue.shift();
        
        if (!notification) {
            return;
        }
        
        // Show notification
        this.renderNotification(notification);
        
        // Process next notification if any
        if (this.queue.length > 0) {
            setTimeout(() => this.processQueue(), 300);
        }
    }
    
    /**
     * Render a notification
     * @param {Object} notification - Notification object
     */
    renderNotification(notification) {
        // Create notification element
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.id = notification.id;
        
        // Add notification content
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${notification.message}</div>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // Add to container
        this.container.appendChild(element);
        
        // Add to active notifications
        this.activeNotifications.push({
            id: notification.id,
            element,
            timer: null,
            onClose: notification.onClose
        });
        
        // Add event listeners
        const closeButton = element.querySelector('.notification-close');
        closeButton.addEventListener('click', () => this.close(notification.id));
        
        // Add hover pause/resume
        element.addEventListener('mouseenter', () => this.pauseNotification(notification.id));
        element.addEventListener('mouseleave', () => this.resumeNotification(notification.id));
        
        // Show with animation
        setTimeout(() => {
            element.classList.add('visible');
            
            // Add progress bar animation
            const progressBar = element.querySelector('.notification-progress');
            progressBar.style.transition = `width ${notification.duration}ms linear`;
            progressBar.style.width = '0%';
            
            // Auto-close after duration
            const timer = setTimeout(() => {
                this.close(notification.id);
            }, notification.duration);
            
            // Store timer reference
            const activeNotification = this.activeNotifications.find(n => n.id === notification.id);
            if (activeNotification) {
                activeNotification.timer = timer;
                activeNotification.startTime = Date.now();
                activeNotification.duration = notification.duration;
                activeNotification.remainingTime = notification.duration;
            }
        }, 10);
    }
    
    /**
     * Close a notification
     * @param {string} id - Notification ID
     */
    close(id) {
        // Find notification
        const index = this.activeNotifications.findIndex(n => n.id === id);
        
        if (index === -1) {
            return;
        }
        
        const notification = this.activeNotifications[index];
        
        // Clear timer
        if (notification.timer) {
            clearTimeout(notification.timer);
        }
        
        // Remove from active notifications
        this.activeNotifications.splice(index, 1);
        
        // Hide with animation
        notification.element.classList.remove('visible');
        notification.element.classList.add('hiding');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            
            // Call onClose callback if provided
            if (typeof notification.onClose === 'function') {
                notification.onClose();
            }
            
            // Process queue
            this.processQueue();
        }, 300);
    }
    
    /**
     * Pause a notification timer
     * @param {string} id - Notification ID
     */
    pauseNotification(id) {
        const notification = this.activeNotifications.find(n => n.id === id);
        
        if (!notification || !notification.timer) {
            return;
        }
        
        // Clear timer
        clearTimeout(notification.timer);
        
        // Calculate remaining time
        const elapsedTime = Date.now() - notification.startTime;
        notification.remainingTime = notification.duration - elapsedTime;
        
        // Pause progress bar animation
        const progressBar = notification.element.querySelector('.notification-progress');
        const computedStyle = window.getComputedStyle(progressBar);
        const width = parseFloat(computedStyle.getPropertyValue('width'));
        const parentWidth = parseFloat(computedStyle.getPropertyValue('parent-width')) || progressBar.parentNode.offsetWidth;
        const percentComplete = (width / parentWidth) * 100;
        
        progressBar.style.transition = 'none';
        progressBar.style.width = `${percentComplete}%`;
    }
    
    /**
     * Resume a notification timer
     * @param {string} id - Notification ID
     */
    resumeNotification(id) {
        const notification = this.activeNotifications.find(n => n.id === id);
        
        if (!notification) {
            return;
        }
        
        // Set new timer with remaining time
        notification.timer = setTimeout(() => {
            this.close(id);
        }, notification.remainingTime);
        
        // Update start time
        notification.startTime = Date.now();
        
        // Resume progress bar animation
        const progressBar = notification.element.querySelector('.notification-progress');
        progressBar.style.transition = `width ${notification.remainingTime}ms linear`;
        progressBar.style.width = '0%';
    }
    
    /**
     * Show a success notification
     * @param {string} message - Notification message
     * @param {Object} options - Additional options
     */
    success(message, options = {}) {
        this.show(message, 'success', options);
    }
    
    /**
     * Show an error notification
     * @param {string} message - Notification message
     * @param {Object} options - Additional options
     */
    error(message, options = {}) {
        this.show(message, 'error', options);
    }
    
    /**
     * Show a warning notification
     * @param {string} message - Notification message
     * @param {Object} options - Additional options
     */
    warning(message, options = {}) {
        this.show(message, 'warning', options);
    }
    
    /**
     * Show an info notification
     * @param {string} message - Notification message
     * @param {Object} options - Additional options
     */
    info(message, options = {}) {
        this.show(message, 'info', options);
    }
    
    /**
     * Clear all notifications
     */
    clearAll() {
        // Close all active notifications
        [...this.activeNotifications].forEach(notification => {
            this.close(notification.id);
        });
        
        // Clear queue
        this.queue = [];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global notifications instance
    window.notifications = new NotificationSystem();
});
