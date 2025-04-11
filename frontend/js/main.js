/**
 * Main JavaScript File
 * 
 * This file initializes all components and provides global functionality.
 */

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize accessibility helpers
  if (typeof accessibility !== 'undefined') {
    accessibility.initialize();
  }

  // Initialize progressive loading
  if (typeof progressiveLoading !== 'undefined') {
    progressiveLoading.initialize({
      lazyLoadThreshold: 300,
      infiniteScrollThreshold: 300,
      infiniteScrollCallback: loadMoreItems
    });
  }

  // Initialize tooltips
  initializeTooltips();

  // Initialize responsive tables
  initializeResponsiveTables();

  // Initialize touch-friendly controls
  initializeTouchControls();

  // Initialize guided onboarding
  initializeOnboarding();

  // Add event listeners
  addEventListeners();
});

/**
 * Initialize tooltips
 */
function initializeTooltips() {
  // Check if Bootstrap is available
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover focus'
      });
    });
  } else {
    // Custom tooltip implementation
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      element.addEventListener('mouseenter', showTooltip);
      element.addEventListener('mouseleave', hideTooltip);
      element.addEventListener('focus', showTooltip);
      element.addEventListener('blur', hideTooltip);
    });
  }
}

/**
 * Show tooltip
 * 
 * @param {Event} event - Mouse or focus event
 */
function showTooltip(event) {
  const element = event.currentTarget;
  const tooltipText = element.getAttribute('data-tooltip');
  
  if (!tooltipText) {
    return;
  }
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip bs-tooltip-top show';
  tooltip.setAttribute('role', 'tooltip');
  
  // Create tooltip content
  tooltip.innerHTML = `
    <div class="tooltip-arrow"></div>
    <div class="tooltip-inner">${tooltipText}</div>
  `;
  
  // Position tooltip
  document.body.appendChild(tooltip);
  positionTooltip(tooltip, element);
  
  // Store tooltip reference
  element.tooltip = tooltip;
}

/**
 * Hide tooltip
 * 
 * @param {Event} event - Mouse or focus event
 */
function hideTooltip(event) {
  const element = event.currentTarget;
  
  if (element.tooltip) {
    element.tooltip.remove();
    element.tooltip = null;
  }
}

/**
 * Position tooltip
 * 
 * @param {HTMLElement} tooltip - Tooltip element
 * @param {HTMLElement} target - Target element
 */
function positionTooltip(tooltip, target) {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  const top = targetRect.top - tooltipRect.height - 10;
  const left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
  
  tooltip.style.top = `${top + window.scrollY}px`;
  tooltip.style.left = `${left + window.scrollX}px`;
  
  // Position arrow
  const arrow = tooltip.querySelector('.tooltip-arrow');
  if (arrow) {
    arrow.style.left = `${tooltipRect.width / 2}px`;
  }
}

/**
 * Initialize responsive tables
 */
function initializeResponsiveTables() {
  document.querySelectorAll('table.table-card-view').forEach(table => {
    const headerCells = table.querySelectorAll('thead th');
    const headerTexts = Array.from(headerCells).map(cell => cell.textContent.trim());
    
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      
      cells.forEach((cell, index) => {
        if (index < headerTexts.length) {
          cell.setAttribute('data-label', headerTexts[index]);
        }
      });
    });
  });
}

/**
 * Initialize touch-friendly controls
 */
function initializeTouchControls() {
  // Make card swipe containers touch-friendly
  document.querySelectorAll('.card-swipe-container').forEach(container => {
    let startX;
    let scrollLeft;
    
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  });
  
  // Make range inputs touch-friendly
  document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('touchstart', () => {
      input.style.pointerEvents = 'auto';
    }, { passive: true });
    
    input.addEventListener('touchend', () => {
      input.style.pointerEvents = 'none';
    }, { passive: true });
  });
  
  // Make custom elements accessible as buttons
  document.querySelectorAll('[role="button"]').forEach(element => {
    if (typeof accessibility !== 'undefined') {
      accessibility.makeAccessibleButton(element);
    }
  });
}

/**
 * Initialize guided onboarding
 */
function initializeOnboarding() {
  // Check if onboarding is available
  if (typeof onboarding === 'undefined') {
    return;
  }
  
  // Define onboarding steps
  const steps = [
    {
      title: 'Welcome to GigGatek',
      content: 'This quick tour will help you get started with our platform. We\'ll show you the main features and how to use them.',
      image: '/images/onboarding/welcome.jpg',
      imageAlt: 'Welcome to GigGatek'
    },
    {
      title: 'Browse Products',
      content: 'Explore our wide range of professional equipment for rent or purchase. Use filters to find exactly what you need.',
      element: '#product-catalog',
      image: '/images/onboarding/products.jpg',
      imageAlt: 'Product catalog'
    },
    {
      title: 'Manage Orders',
      content: 'Track your orders and rentals in one place. View order history, check status, and manage returns.',
      element: '#orders-section',
      image: '/images/onboarding/orders.jpg',
      imageAlt: 'Order management'
    },
    {
      title: 'Get Support',
      content: 'Need help? Our support team is available 24/7. Contact us via chat, email, or phone.',
      element: '#support-section',
      image: '/images/onboarding/support.jpg',
      imageAlt: 'Customer support'
    },
    {
      title: 'You\'re All Set!',
      content: 'You\'re now ready to use GigGatek. If you need help at any time, click the Help button in the top right corner.',
      image: '/images/onboarding/complete.jpg',
      imageAlt: 'Onboarding complete'
    }
  ];
  
  // Initialize onboarding
  onboarding.initialize(steps, () => {
    // Show success notification when onboarding is completed
    if (typeof notifications !== 'undefined') {
      notifications.success('You\'ve completed the guided tour!', 'Welcome to GigGatek');
    }
  });
  
  // Start onboarding for new users
  const isNewUser = !onboarding.hasCompleted() && !sessionStorage.getItem('onboarding_shown');
  if (isNewUser) {
    // Delay onboarding start to allow page to load completely
    setTimeout(() => {
      onboarding.start();
      sessionStorage.setItem('onboarding_shown', 'true');
    }, 1000);
  }
  
  // Add event listener for manual onboarding trigger
  const onboardingTrigger = document.getElementById('start-onboarding');
  if (onboardingTrigger) {
    onboardingTrigger.addEventListener('click', () => {
      onboarding.reset();
      onboarding.start();
    });
  }
}

/**
 * Add event listeners
 */
function addEventListeners() {
  // Help panel toggle
  const helpToggle = document.getElementById('help-toggle');
  const helpPanel = document.querySelector('.help-panel');
  
  if (helpToggle && helpPanel) {
    helpToggle.addEventListener('click', () => {
      helpPanel.classList.toggle('show');
      
      if (helpPanel.classList.contains('show')) {
        helpToggle.setAttribute('aria-expanded', 'true');
        
        // Create focus trap
        if (typeof accessibility !== 'undefined') {
          accessibility.createFocusTrap(helpPanel);
        }
      } else {
        helpToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close help panel
    const helpPanelClose = helpPanel.querySelector('.help-panel-close');
    if (helpPanelClose) {
      helpPanelClose.addEventListener('click', () => {
        helpPanel.classList.remove('show');
        helpToggle.setAttribute('aria-expanded', 'false');
      });
    }
  }
  
  // Notification demo
  const notificationDemo = document.getElementById('notification-demo');
  if (notificationDemo && typeof notifications !== 'undefined') {
    notificationDemo.addEventListener('click', () => {
      notifications.info('This is a sample notification', 'Notification Demo', {
        duration: 5000,
        actions: [
          {
            text: 'Action',
            callback: () => {
              alert('Action clicked!');
            }
          }
        ]
      });
    });
  }
}

/**
 * Load more items for infinite scroll
 * 
 * @returns {Promise} Promise that resolves when items are loaded
 */
function loadMoreItems() {
  return new Promise((resolve, reject) => {
    // This is a placeholder function that would be replaced with actual API call
    // In a real implementation, this would fetch data from the server
    
    setTimeout(() => {
      // Simulate API call
      const container = document.querySelector('.infinite-scroll-container');
      
      if (!container) {
        reject(new Error('Container not found'));
        return;
      }
      
      // Get current page from data attribute
      const currentPage = parseInt(container.dataset.page || '1', 10);
      const totalPages = parseInt(container.dataset.totalPages || '5', 10);
      
      if (currentPage >= totalPages) {
        resolve({ allLoaded: true });
        return;
      }
      
      // In a real implementation, this would append items from the API response
      // For demo purposes, we're just cloning existing items
      const items = container.querySelectorAll('.item');
      const fragment = document.createDocumentFragment();
      
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.querySelector('h3').textContent += ` (Page ${currentPage + 1})`;
        fragment.appendChild(clone);
      });
      
      container.appendChild(fragment);
      
      // Update current page
      container.dataset.page = currentPage + 1;
      
      // Initialize lazy loading for new elements
      if (typeof progressiveLoading !== 'undefined') {
        progressiveLoading.refresh();
      }
      
      resolve({
        allLoaded: currentPage + 1 >= totalPages
      });
    }, 1000);
  });
}
