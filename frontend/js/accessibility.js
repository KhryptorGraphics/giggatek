/**
 * Accessibility Helpers
 * 
 * This module provides accessibility enhancements for the application.
 */

class AccessibilityHelper {
  constructor() {
    this.focusTrap = null;
    this.skipLink = null;
    this.initialized = false;
  }

  /**
   * Initialize accessibility helpers
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    // Add skip to content link
    this.addSkipLink();

    // Add focus outline for keyboard users
    this.addFocusOutlineForKeyboardUsers();

    // Initialize ARIA live regions
    this.initializeAriaLiveRegions();

    // Add keyboard navigation for custom components
    this.enhanceKeyboardNavigation();

    // Mark as initialized
    this.initialized = true;
  }

  /**
   * Add skip to content link
   */
  addSkipLink() {
    // Check if skip link already exists
    if (document.querySelector('.skip-to-content')) {
      return;
    }

    // Create skip link
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-to-content';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Store reference
    this.skipLink = skipLink;

    // Add main content ID if it doesn't exist
    const mainContent = document.querySelector('main, [role="main"]');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  /**
   * Add focus outline for keyboard users only
   */
  addFocusOutlineForKeyboardUsers() {
    // Add class to body when user is navigating with keyboard
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-user');
      }
    });

    // Remove class when user clicks with mouse
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-user');
    });

    // Add CSS to hide focus outline for mouse users
    if (!document.getElementById('accessibility-styles')) {
      const style = document.createElement('style');
      style.id = 'accessibility-styles';
      style.textContent = `
        body:not(.keyboard-user) *:focus {
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Initialize ARIA live regions
   */
  initializeAriaLiveRegions() {
    // Create polite live region
    if (!document.getElementById('aria-live-polite')) {
      const politeRegion = document.createElement('div');
      politeRegion.id = 'aria-live-polite';
      politeRegion.className = 'sr-only';
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(politeRegion);
    }

    // Create assertive live region
    if (!document.getElementById('aria-live-assertive')) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'aria-live-assertive';
      assertiveRegion.className = 'sr-only';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(assertiveRegion);
    }
  }

  /**
   * Announce message to screen readers
   * 
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level (polite or assertive)
   */
  announce(message, priority = 'polite') {
    const region = document.getElementById(`aria-live-${priority}`);
    if (region) {
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 50);
    }
  }

  /**
   * Enhance keyboard navigation for custom components
   */
  enhanceKeyboardNavigation() {
    // Enhance card swipe containers
    document.querySelectorAll('.card-swipe-container').forEach(container => {
      // Add tabindex to make container focusable
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '0');
      }

      // Add keyboard navigation
      container.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          container.scrollBy({ left: 300, behavior: 'smooth' });
          event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
          container.scrollBy({ left: -300, behavior: 'smooth' });
          event.preventDefault();
        }
      });
    });

    // Enhance custom dropdowns
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
      const button = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');

      if (button && menu) {
        // Add ARIA attributes
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        menu.setAttribute('role', 'menu');

        // Add keyboard navigation
        button.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            button.setAttribute('aria-expanded', 'true');
            menu.classList.add('show');
            const firstItem = menu.querySelector('[role="menuitem"]');
            if (firstItem) {
              firstItem.focus();
            }
            event.preventDefault();
          }
        });

        menu.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            button.setAttribute('aria-expanded', 'false');
            menu.classList.remove('show');
            button.focus();
            event.preventDefault();
          } else if (event.key === 'ArrowDown') {
            const currentItem = document.activeElement;
            const nextItem = currentItem.nextElementSibling;
            if (nextItem && nextItem.getAttribute('role') === 'menuitem') {
              nextItem.focus();
            }
            event.preventDefault();
          } else if (event.key === 'ArrowUp') {
            const currentItem = document.activeElement;
            const prevItem = currentItem.previousElementSibling;
            if (prevItem && prevItem.getAttribute('role') === 'menuitem') {
              prevItem.focus();
            } else {
              button.focus();
              button.setAttribute('aria-expanded', 'false');
              menu.classList.remove('show');
            }
            event.preventDefault();
          }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
          if (!dropdown.contains(event.target)) {
            button.setAttribute('aria-expanded', 'false');
            menu.classList.remove('show');
          }
        });
      }
    });
  }

  /**
   * Create a focus trap for modal dialogs
   * 
   * @param {HTMLElement} element - Element to trap focus within
   * @returns {Object} Focus trap object
   */
  createFocusTrap(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store previously focused element
    const previouslyFocused = document.activeElement;

    // Focus first element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Handle tab key
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            event.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            event.preventDefault();
          }
        }
      }
    };

    // Add event listener
    element.addEventListener('keydown', handleKeyDown);

    // Return focus trap object
    return {
      release: () => {
        element.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocused && previouslyFocused.focus) {
          previouslyFocused.focus();
        }
      }
    };
  }

  /**
   * Make an element accessible as a button
   * 
   * @param {HTMLElement} element - Element to make accessible
   */
  makeAccessibleButton(element) {
    // Add role
    element.setAttribute('role', 'button');

    // Add tabindex if not present
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    // Add keyboard event listeners
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        element.click();
        event.preventDefault();
      }
    });
  }

  /**
   * Check if high contrast mode is enabled
   * 
   * @returns {boolean} True if high contrast mode is enabled
   */
  isHighContrastMode() {
    // Check if forced-colors media query is supported
    if (window.matchMedia('(forced-colors: active)').matches) {
      return true;
    }

    // Check for Windows high contrast mode
    if (window.matchMedia('(-ms-high-contrast: active)').matches) {
      return true;
    }

    return false;
  }
}

// Create global accessibility helper instance
const accessibility = new AccessibilityHelper();

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  accessibility.initialize();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = accessibility;
}
