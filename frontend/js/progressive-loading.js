/**
 * Progressive Loading System
 * 
 * This module provides progressive loading functionality for the application.
 */

class ProgressiveLoading {
  constructor() {
    this.options = {
      lazyLoadThreshold: 200,
      infiniteScrollThreshold: 200,
      infiniteScrollContainer: window,
      paginationSelector: '.pagination',
      loadMoreSelector: '.load-more',
      loadingIndicator: '<div class="infinite-scroll-loader"><div class="loader-spinner"></div><div class="loader-text">Loading more items...</div></div>'
    };
    
    this.observers = {
      lazyLoad: null,
      infiniteScroll: null
    };
    
    this.callbacks = {
      infiniteScroll: null
    };
    
    this.state = {
      loading: false,
      allLoaded: false
    };
  }

  /**
   * Initialize progressive loading
   * 
   * @param {Object} options - Configuration options
   */
  initialize(options = {}) {
    this.options = { ...this.options, ...options };
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Initialize infinite scroll if callback is provided
    if (options.infiniteScrollCallback) {
      this.callbacks.infiniteScroll = options.infiniteScrollCallback;
      this.initInfiniteScroll();
    }
    
    // Replace pagination with load more button if needed
    if (options.usePaginationReplacement) {
      this.replacePaginationWithLoadMore();
    }
  }

  /**
   * Initialize lazy loading for images
   */
  initLazyLoading() {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      this.observers.lazyLoad = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyElement = entry.target;
            
            if (lazyElement.classList.contains('lazy-image')) {
              // Lazy load image
              const src = lazyElement.dataset.src;
              if (src) {
                const img = new Image();
                img.onload = () => {
                  lazyElement.src = src;
                  lazyElement.classList.add('loaded');
                  
                  // Hide placeholder
                  const placeholder = lazyElement.parentNode.querySelector('.lazy-image-placeholder');
                  if (placeholder) {
                    placeholder.classList.add('hidden');
                  }
                  
                  // Remove from observer
                  this.observers.lazyLoad.unobserve(lazyElement);
                };
                img.src = src;
              }
            } else if (lazyElement.classList.contains('progressive-image-full')) {
              // Progressive image loading
              const src = lazyElement.dataset.src;
              if (src) {
                const img = new Image();
                img.onload = () => {
                  lazyElement.src = src;
                  lazyElement.classList.add('loaded');
                  
                  // Remove from observer
                  this.observers.lazyLoad.unobserve(lazyElement);
                };
                img.src = src;
              }
            } else if (lazyElement.classList.contains('lazy-background')) {
              // Lazy load background image
              const src = lazyElement.dataset.background;
              if (src) {
                const img = new Image();
                img.onload = () => {
                  lazyElement.style.backgroundImage = `url(${src})`;
                  lazyElement.classList.add('loaded');
                  
                  // Remove from observer
                  this.observers.lazyLoad.unobserve(lazyElement);
                };
                img.src = src;
              }
            } else if (lazyElement.classList.contains('lazy-iframe')) {
              // Lazy load iframe
              const src = lazyElement.dataset.src;
              if (src) {
                lazyElement.src = src;
                lazyElement.classList.add('loaded');
                
                // Remove from observer
                this.observers.lazyLoad.unobserve(lazyElement);
              }
            }
          }
        });
      }, {
        rootMargin: `${this.options.lazyLoadThreshold}px 0px`,
        threshold: 0.01
      });
      
      // Observe all lazy elements
      document.querySelectorAll('.lazy-image, .progressive-image-full, .lazy-background, .lazy-iframe').forEach(element => {
        this.observers.lazyLoad.observe(element);
      });
    } else {
      // Fallback for browsers that don't support Intersection Observer
      this.loadAllLazyElements();
    }
  }

  /**
   * Initialize infinite scroll
   */
  initInfiniteScroll() {
    // Check if callback is provided
    if (!this.callbacks.infiniteScroll) {
      return;
    }
    
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      // Create sentinel element
      const sentinel = document.createElement('div');
      sentinel.className = 'infinite-scroll-sentinel';
      sentinel.style.height = '1px';
      sentinel.style.visibility = 'hidden';
      
      // Find container
      const container = typeof this.options.infiniteScrollContainer === 'string' 
        ? document.querySelector(this.options.infiniteScrollContainer) 
        : this.options.infiniteScrollContainer;
      
      // Append sentinel to container
      if (container === window) {
        document.body.appendChild(sentinel);
      } else {
        container.appendChild(sentinel);
      }
      
      // Create observer
      this.observers.infiniteScroll = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.state.loading && !this.state.allLoaded) {
          this.loadMore();
        }
      }, {
        root: container === window ? null : container,
        rootMargin: `0px 0px ${this.options.infiniteScrollThreshold}px 0px`,
        threshold: 0.01
      });
      
      // Observe sentinel
      this.observers.infiniteScroll.observe(sentinel);
    } else {
      // Fallback for browsers that don't support Intersection Observer
      const container = typeof this.options.infiniteScrollContainer === 'string' 
        ? document.querySelector(this.options.infiniteScrollContainer) 
        : this.options.infiniteScrollContainer;
      
      const scrollHandler = () => {
        if (this.state.loading || this.state.allLoaded) {
          return;
        }
        
        const scrollElement = container === window ? document.documentElement : container;
        const scrollPosition = scrollElement.scrollTop + scrollElement.clientHeight;
        const scrollHeight = scrollElement.scrollHeight;
        
        if (scrollHeight - scrollPosition <= this.options.infiniteScrollThreshold) {
          this.loadMore();
        }
      };
      
      container.addEventListener('scroll', scrollHandler);
    }
  }

  /**
   * Replace pagination with load more button
   */
  replacePaginationWithLoadMore() {
    const pagination = document.querySelector(this.options.paginationSelector);
    if (!pagination) {
      return;
    }
    
    // Create load more button
    const loadMore = document.createElement('div');
    loadMore.className = 'load-more';
    loadMore.innerHTML = '<button type="button" class="btn btn-primary">Load More</button>';
    
    // Replace pagination with load more button
    pagination.parentNode.replaceChild(loadMore, pagination);
    
    // Add event listener
    loadMore.querySelector('button').addEventListener('click', () => {
      this.loadMore();
    });
  }

  /**
   * Load more items
   */
  loadMore() {
    if (this.state.loading || this.state.allLoaded || !this.callbacks.infiniteScroll) {
      return;
    }
    
    this.state.loading = true;
    
    // Show loading indicator
    const loadMore = document.querySelector(this.options.loadMoreSelector);
    if (loadMore) {
      loadMore.innerHTML = this.options.loadingIndicator;
    } else {
      const container = typeof this.options.infiniteScrollContainer === 'string' 
        ? document.querySelector(this.options.infiniteScrollContainer) 
        : this.options.infiniteScrollContainer;
      
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'infinite-scroll-loader-container';
      loadingIndicator.innerHTML = this.options.loadingIndicator;
      
      if (container === window) {
        document.body.appendChild(loadingIndicator);
      } else {
        container.appendChild(loadingIndicator);
      }
    }
    
    // Call callback
    this.callbacks.infiniteScroll()
      .then(result => {
        this.state.loading = false;
        
        // Update state
        if (result.allLoaded) {
          this.state.allLoaded = true;
        }
        
        // Update load more button
        const loadMore = document.querySelector(this.options.loadMoreSelector);
        if (loadMore) {
          if (this.state.allLoaded) {
            loadMore.innerHTML = '<p class="text-center">No more items to load</p>';
          } else {
            loadMore.innerHTML = '<button type="button" class="btn btn-primary">Load More</button>';
            loadMore.querySelector('button').addEventListener('click', () => {
              this.loadMore();
            });
          }
        }
        
        // Remove loading indicator
        const loadingIndicator = document.querySelector('.infinite-scroll-loader-container');
        if (loadingIndicator) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
      })
      .catch(error => {
        console.error('Error loading more items:', error);
        this.state.loading = false;
        
        // Update load more button
        const loadMore = document.querySelector(this.options.loadMoreSelector);
        if (loadMore) {
          loadMore.innerHTML = '<button type="button" class="btn btn-danger">Error loading more items. Try again</button>';
          loadMore.querySelector('button').addEventListener('click', () => {
            this.loadMore();
          });
        }
        
        // Remove loading indicator
        const loadingIndicator = document.querySelector('.infinite-scroll-loader-container');
        if (loadingIndicator) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
      });
  }

  /**
   * Load all lazy elements (fallback for browsers without Intersection Observer)
   */
  loadAllLazyElements() {
    // Load all lazy images
    document.querySelectorAll('.lazy-image').forEach(image => {
      const src = image.dataset.src;
      if (src) {
        image.src = src;
        image.classList.add('loaded');
        
        // Hide placeholder
        const placeholder = image.parentNode.querySelector('.lazy-image-placeholder');
        if (placeholder) {
          placeholder.classList.add('hidden');
        }
      }
    });
    
    // Load all progressive images
    document.querySelectorAll('.progressive-image-full').forEach(image => {
      const src = image.dataset.src;
      if (src) {
        image.src = src;
        image.classList.add('loaded');
      }
    });
    
    // Load all lazy backgrounds
    document.querySelectorAll('.lazy-background').forEach(element => {
      const src = element.dataset.background;
      if (src) {
        element.style.backgroundImage = `url(${src})`;
        element.classList.add('loaded');
      }
    });
    
    // Load all lazy iframes
    document.querySelectorAll('.lazy-iframe').forEach(iframe => {
      const src = iframe.dataset.src;
      if (src) {
        iframe.src = src;
        iframe.classList.add('loaded');
      }
    });
  }

  /**
   * Refresh lazy loading (call this when new lazy elements are added to the DOM)
   */
  refresh() {
    if (this.observers.lazyLoad) {
      document.querySelectorAll('.lazy-image:not(.loaded), .progressive-image-full:not(.loaded), .lazy-background:not(.loaded), .lazy-iframe:not(.loaded)').forEach(element => {
        this.observers.lazyLoad.observe(element);
      });
    } else {
      this.loadAllLazyElements();
    }
  }

  /**
   * Reset infinite scroll state
   */
  resetInfiniteScroll() {
    this.state.loading = false;
    this.state.allLoaded = false;
  }
}

// Create global progressive loading instance
const progressiveLoading = new ProgressiveLoading();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = progressiveLoading;
}
