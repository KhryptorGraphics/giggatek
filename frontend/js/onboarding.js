/**
 * Guided Onboarding System
 * 
 * This module provides a guided onboarding experience for new users.
 */

class OnboardingSystem {
  constructor() {
    this.steps = [];
    this.currentStepIndex = 0;
    this.overlay = null;
    this.modal = null;
    this.isActive = false;
    this.onComplete = null;
    this.storageKey = 'giggatek_onboarding_completed';
  }

  /**
   * Initialize the onboarding system
   * 
   * @param {Array} steps - Array of onboarding steps
   * @param {Function} onComplete - Callback function when onboarding is completed
   */
  initialize(steps, onComplete = null) {
    this.steps = steps;
    this.onComplete = onComplete;

    // Check if onboarding has been completed
    if (this.hasCompleted()) {
      return;
    }

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.overlay);

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'onboarding-modal';
    this.overlay.appendChild(this.modal);

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Start the onboarding process
   */
  start() {
    if (this.hasCompleted() || this.steps.length === 0) {
      return;
    }

    this.currentStepIndex = 0;
    this.isActive = true;
    this.showStep(this.currentStepIndex);
    this.overlay.setAttribute('aria-hidden', 'false');

    // Announce to screen readers
    const liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.textContent = 'Onboarding guide started. Press Escape to exit at any time.';
    document.body.appendChild(liveRegion);
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }

  /**
   * Show a specific step
   * 
   * @param {number} index - Step index
   */
  showStep(index) {
    if (index < 0 || index >= this.steps.length) {
      return;
    }

    const step = this.steps[index];
    this.currentStepIndex = index;

    // Update modal content
    this.modal.innerHTML = `
      <div class="onboarding-header">
        <div class="onboarding-step">${index + 1}</div>
        <h2 class="onboarding-title" id="onboarding-title">${step.title}</h2>
      </div>
      <div class="onboarding-body">
        <p>${step.content}</p>
        ${step.image ? `<img src="${step.image}" alt="${step.imageAlt || ''}" />` : ''}
      </div>
      <div class="onboarding-footer">
        <button type="button" class="btn btn-secondary" id="onboarding-prev" ${index === 0 ? 'disabled' : ''}>Previous</button>
        <button type="button" class="btn btn-primary" id="onboarding-next">${index === this.steps.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
      <div class="onboarding-progress">
        ${this.steps.map((_, i) => `<div class="progress-dot ${i === index ? 'active' : ''}"></div>`).join('')}
      </div>
      <button type="button" class="onboarding-close" aria-label="Close onboarding">&times;</button>
    `;

    // Set ARIA attributes
    this.overlay.setAttribute('aria-labelledby', 'onboarding-title');

    // Add event listeners
    this.modal.querySelector('#onboarding-prev').addEventListener('click', () => {
      this.previousStep();
    });

    this.modal.querySelector('#onboarding-next').addEventListener('click', () => {
      this.nextStep();
    });

    this.modal.querySelector('.onboarding-close').addEventListener('click', () => {
      this.close();
    });

    // Show spotlight if element is specified
    if (step.element) {
      const element = document.querySelector(step.element);
      if (element) {
        this.showSpotlight(element);
      } else {
        this.hideSpotlight();
      }
    } else {
      this.hideSpotlight();
    }
  }

  /**
   * Show spotlight on an element
   * 
   * @param {HTMLElement} element - Element to spotlight
   */
  showSpotlight(element) {
    // Remove existing spotlight
    this.hideSpotlight();

    // Get element position and dimensions
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Create spotlight element
    const spotlight = document.createElement('div');
    spotlight.className = 'onboarding-spotlight';
    spotlight.style.top = `${rect.top + scrollTop}px`;
    spotlight.style.left = `${rect.left + scrollLeft}px`;
    spotlight.style.width = `${rect.width}px`;
    spotlight.style.height = `${rect.height}px`;
    document.body.appendChild(spotlight);

    // Scroll element into view if needed
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  /**
   * Hide spotlight
   */
  hideSpotlight() {
    const spotlight = document.querySelector('.onboarding-spotlight');
    if (spotlight) {
      spotlight.parentNode.removeChild(spotlight);
    }
  }

  /**
   * Go to the next step
   */
  nextStep() {
    if (this.currentStepIndex === this.steps.length - 1) {
      this.complete();
    } else {
      this.showStep(this.currentStepIndex + 1);
    }
  }

  /**
   * Go to the previous step
   */
  previousStep() {
    if (this.currentStepIndex > 0) {
      this.showStep(this.currentStepIndex - 1);
    }
  }

  /**
   * Complete the onboarding process
   */
  complete() {
    this.close();
    this.markAsCompleted();

    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Close the onboarding
   */
  close() {
    this.isActive = false;
    this.hideSpotlight();
    this.overlay.setAttribute('aria-hidden', 'true');
  }

  /**
   * Handle keyboard events
   * 
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    if (!this.isActive) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowRight':
        this.nextStep();
        break;
      case 'ArrowLeft':
        this.previousStep();
        break;
    }
  }

  /**
   * Check if onboarding has been completed
   * 
   * @returns {boolean} True if onboarding has been completed
   */
  hasCompleted() {
    return localStorage.getItem(this.storageKey) === 'true';
  }

  /**
   * Mark onboarding as completed
   */
  markAsCompleted() {
    localStorage.setItem(this.storageKey, 'true');
  }

  /**
   * Reset onboarding status
   */
  reset() {
    localStorage.removeItem(this.storageKey);
  }
}

// Create global onboarding instance
const onboarding = new OnboardingSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = onboarding;
}
