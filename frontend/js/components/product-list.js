/**
 * Product List Component
 *
 * This component displays a list of products with filtering and pagination.
 */

class ProductList {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    this.options = {
      perPage: 12,
      layout: 'grid', // 'grid' or 'list'
      showFilters: true,
      showPagination: true,
      showSorting: true,
      ...options
    };

    this.state = {
      products: [],
      loading: false,
      error: null,
      filters: {
        category: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        condition: [],
        brand: [],
        features: [],
        inStock: false,
        rating: 0
      },
      sort: 'name:asc',
      page: 1,
      totalPages: 1,
      totalProducts: 0,
      useAdvancedFilters: this.options.useAdvancedFilters || false
    };

    this.init();
  }

  /**
   * Initialize component
   */
  init() {
    // Create component structure
    this.render();

    // Initialize advanced filter if enabled
    if (this.state.useAdvancedFilters) {
      this.initAdvancedFilter();
    } else {
      // Initialize autocomplete search
      this.initAutocompleteSearch();
    }

    // Add event listeners
    this.addEventListeners();

    // Load products
    this.loadProducts();
  }

  /**
   * Initialize advanced filter
   */
  initAdvancedFilter() {
    // Check if AdvancedFilter class is available
    if (typeof AdvancedFilter === 'undefined') {
      console.error('AdvancedFilter component not found');
      return;
    }

    // Get container
    const container = this.container.querySelector('#advanced-filter-container');
    if (!container) {
      console.error('Advanced filter container not found');
      return;
    }

    // Initialize advanced filter
    this.advancedFilter = new AdvancedFilter(container, {
      initialFilters: this.state.filters,
      onFilterChange: (filters) => {
        // Update filters
        this.state.filters = {
          ...this.state.filters,
          ...filters
        };

        // Reset page
        this.state.page = 1;

        // Load products
        this.loadProducts();
      }
    });
  }

  /**
   * Initialize autocomplete search
   */
  initAutocompleteSearch() {
    // Check if AutocompleteSearch class is available
    if (typeof AutocompleteSearch === 'undefined') {
      console.error('AutocompleteSearch component not found');
      return;
    }

    // Get container
    const container = this.container.querySelector('#autocomplete-search-container');
    if (!container) {
      console.error('Autocomplete search container not found');
      return;
    }

    // Initialize autocomplete search
    this.autocompleteSearch = new AutocompleteSearch(container, {
      placeholder: 'Search products...',
      minChars: 2,
      delay: 300,
      maxResults: 5,
      apiEndpoint: '/api/v1/search/suggestions',
      onSelect: (suggestion) => {
        // Handle suggestion selection
        if (suggestion.type === 'product') {
          // Set search filter to product name
          this.state.filters.search = suggestion.text;

          // Reset page
          this.state.page = 1;

          // Load products
          this.loadProducts();
        } else if (suggestion.type === 'category') {
          // Set category filter
          this.state.filters.category = suggestion.value;
          this.state.filters.search = '';

          // Update category select if it exists
          const categorySelect = this.container.querySelector('#filter-category');
          if (categorySelect) {
            categorySelect.value = suggestion.value;
          }

          // Reset page
          this.state.page = 1;

          // Load products
          this.loadProducts();
        } else if (suggestion.type === 'brand') {
          // Set brand filter
          this.state.filters.brand = [suggestion.value];
          this.state.filters.search = '';

          // Reset page
          this.state.page = 1;

          // Load products
          this.loadProducts();
        } else if (suggestion.type === 'feature') {
          // Set feature filter
          this.state.filters.features = [suggestion.value];
          this.state.filters.search = '';

          // Reset page
          this.state.page = 1;

          // Load products
          this.loadProducts();
        }
      },
      onSearch: (query) => {
        // Set search filter
        this.state.filters.search = query;

        // Reset page
        this.state.page = 1;

        // Load products
        this.loadProducts();
      }
    });

    // Set initial value
    if (this.state.filters.search) {
      this.autocompleteSearch.setQuery(this.state.filters.search);
    }
  }

  /**
   * Render component
   */
  render() {
    // Clear container
    this.container.innerHTML = '';

    // Create component structure
    this.container.innerHTML = `
      <div class="product-list-component">
        ${this.options.showFilters ? this.renderFilters() : ''}

        <div class="product-list-header">
          <div class="product-list-count">
            <span class="product-count">0</span> products found
          </div>

          ${this.options.showSorting ? this.renderSorting() : ''}

          <div class="product-list-layout">
            <button type="button" class="btn-layout btn-grid ${this.options.layout === 'grid' ? 'active' : ''}" aria-label="Grid view">
              <i class="fas fa-th" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn-layout btn-list ${this.options.layout === 'list' ? 'active' : ''}" aria-label="List view">
              <i class="fas fa-list" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="product-list-content">
          <div class="product-list ${this.options.layout === 'grid' ? 'product-grid' : 'product-list-view'}">
            <div class="product-list-loading">
              <div class="loader-spinner"></div>
              <p>Loading products...</p>
            </div>
          </div>
        </div>

        ${this.options.showPagination ? this.renderPagination() : ''}
      </div>
    `;

    // Store references to elements
    this.elements = {
      component: this.container.querySelector('.product-list-component'),
      filters: this.container.querySelector('.product-list-filters'),
      productList: this.container.querySelector('.product-list'),
      productCount: this.container.querySelector('.product-count'),
      pagination: this.container.querySelector('.product-list-pagination'),
      loading: this.container.querySelector('.product-list-loading'),
      sortSelect: this.container.querySelector('.product-sort-select'),
      gridButton: this.container.querySelector('.btn-grid'),
      listButton: this.container.querySelector('.btn-list')
    };
  }

  /**
   * Render filters
   *
   * @returns {string} Filters HTML
   */
  renderFilters() {
    if (this.state.useAdvancedFilters) {
      return `
        <div class="product-list-filters advanced">
          <div id="advanced-filter-container"></div>
        </div>
      `;
    } else {
      return `
        <div class="product-list-filters">
          <form class="filters-form">
            <div class="filter-group">
              <label for="autocomplete-search-container">Search</label>
              <div id="autocomplete-search-container"></div>
            </div>

            <div class="filter-group">
              <label for="filter-category">Category</label>
              <select id="filter-category" class="form-control">
                <option value="">All Categories</option>
                <option value="cameras" ${this.state.filters.category === 'cameras' ? 'selected' : ''}>Cameras</option>
                <option value="audio" ${this.state.filters.category === 'audio' ? 'selected' : ''}>Audio</option>
                <option value="lighting" ${this.state.filters.category === 'lighting' ? 'selected' : ''}>Lighting</option>
                <option value="accessories" ${this.state.filters.category === 'accessories' ? 'selected' : ''}>Accessories</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-price-min">Price Range</label>
              <div class="price-range">
                <input type="number" id="filter-price-min" class="form-control" placeholder="Min" value="${this.state.filters.minPrice}">
                <span class="price-separator">-</span>
                <input type="number" id="filter-price-max" class="form-control" placeholder="Max" value="${this.state.filters.maxPrice}">
              </div>
            </div>

            <div class="filter-actions">
              <button type="submit" class="btn btn-primary">Apply Filters</button>
              <button type="button" class="btn btn-secondary filter-reset">Reset</button>
            </div>
          </form>
        </div>
      `;
    }
  }

  /**
   * Render sorting
   *
   * @returns {string} Sorting HTML
   */
  renderSorting() {
    return `
      <div class="product-list-sorting">
        <label for="product-sort-select">Sort by:</label>
        <select id="product-sort-select" class="product-sort-select form-control">
          <option value="name:asc" ${this.state.sort === 'name:asc' ? 'selected' : ''}>Name (A-Z)</option>
          <option value="name:desc" ${this.state.sort === 'name:desc' ? 'selected' : ''}>Name (Z-A)</option>
          <option value="price:asc" ${this.state.sort === 'price:asc' ? 'selected' : ''}>Price (Low to High)</option>
          <option value="price:desc" ${this.state.sort === 'price:desc' ? 'selected' : ''}>Price (High to Low)</option>
          <option value="created_at:desc" ${this.state.sort === 'created_at:desc' ? 'selected' : ''}>Newest</option>
          <option value="created_at:asc" ${this.state.sort === 'created_at:asc' ? 'selected' : ''}>Oldest</option>
        </select>
      </div>
    `;
  }

  /**
   * Render pagination
   *
   * @returns {string} Pagination HTML
   */
  renderPagination() {
    return `
      <div class="product-list-pagination">
        <button type="button" class="btn btn-pagination btn-prev" aria-label="Previous page" ${this.state.page <= 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left" aria-hidden="true"></i> Previous
        </button>

        <div class="pagination-info">
          Page <span class="current-page">${this.state.page}</span> of <span class="total-pages">${this.state.totalPages}</span>
        </div>

        <button type="button" class="btn btn-pagination btn-next" aria-label="Next page" ${this.state.page >= this.state.totalPages ? 'disabled' : ''}>
          Next <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    `;
  }

  /**
   * Render products
   */
  renderProducts() {
    if (this.state.loading) {
      // Show loading indicator
      this.elements.loading.style.display = 'flex';
      return;
    }

    // Hide loading indicator
    this.elements.loading.style.display = 'none';

    // Update product count
    this.elements.productCount.textContent = this.state.totalProducts;

    // Check if products exist
    if (!this.state.products || this.state.products.length === 0) {
      this.elements.productList.innerHTML = `
        <div class="product-list-empty">
          <p>No products found matching your criteria.</p>
          <button type="button" class="btn btn-primary filter-reset">Reset Filters</button>
        </div>
      `;
      return;
    }

    // Render products
    const productsHtml = this.state.products.map(product => this.renderProductCard(product)).join('');

    this.elements.productList.innerHTML = productsHtml;

    // Initialize lazy loading for product images
    if (typeof progressiveLoading !== 'undefined') {
      progressiveLoading.refresh();
    }
  }

  /**
   * Render product card
   *
   * @param {Object} product - Product data
   * @returns {string} Product card HTML
   */
  renderProductCard(product) {
    const isGrid = this.options.layout === 'grid';

    return `
      <div class="product-card ${isGrid ? 'product-card-grid' : 'product-card-list'}" data-product-id="${product.id}">
        <div class="product-image">
          <div class="lazy-image-container">
            <img class="lazy-image" data-src="${product.image_url}" alt="${product.name}">
            <div class="lazy-image-placeholder"></div>
          </div>
        </div>

        <div class="product-details">
          <h3 class="product-title">
            <a href="/products/${product.id}">${product.name}</a>
          </h3>

          ${isGrid ? '' : `<p class="product-description">${product.description}</p>`}

          <div class="product-price">
            <span class="price-buy">${this.formatCurrency(product.price)}</span>
            ${product.rental_price ? `<span class="price-rent">Rent for ${this.formatCurrency(product.rental_price)}/day</span>` : ''}
          </div>

          <div class="product-actions">
            <button type="button" class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}">
              Add to Cart
            </button>

            ${product.rental_price ? `
              <button type="button" class="btn btn-secondary btn-rent" data-product-id="${product.id}">
                Rent
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update pagination
   */
  updatePagination() {
    if (!this.options.showPagination || !this.elements.pagination) {
      return;
    }

    // Update pagination info
    const currentPage = this.elements.pagination.querySelector('.current-page');
    const totalPages = this.elements.pagination.querySelector('.total-pages');

    if (currentPage) {
      currentPage.textContent = this.state.page;
    }

    if (totalPages) {
      totalPages.textContent = this.state.totalPages;
    }

    // Update pagination buttons
    const prevButton = this.elements.pagination.querySelector('.btn-prev');
    const nextButton = this.elements.pagination.querySelector('.btn-next');

    if (prevButton) {
      prevButton.disabled = this.state.page <= 1;
    }

    if (nextButton) {
      nextButton.disabled = this.state.page >= this.state.totalPages;
    }
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Filter form submission
    const filtersForm = this.container.querySelector('.filters-form');
    if (filtersForm) {
      filtersForm.addEventListener('submit', event => {
        event.preventDefault();
        this.applyFilters();
      });
    }

    // Filter reset
    const resetButtons = this.container.querySelectorAll('.filter-reset');
    resetButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.resetFilters();
      });
    });

    // Sorting
    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', () => {
        this.state.sort = this.elements.sortSelect.value;
        this.state.page = 1;
        this.loadProducts();
      });
    }

    // Pagination
    if (this.elements.pagination) {
      const prevButton = this.elements.pagination.querySelector('.btn-prev');
      const nextButton = this.elements.pagination.querySelector('.btn-next');

      if (prevButton) {
        prevButton.addEventListener('click', () => {
          if (this.state.page > 1) {
            this.state.page--;
            this.loadProducts();
          }
        });
      }

      if (nextButton) {
        nextButton.addEventListener('click', () => {
          if (this.state.page < this.state.totalPages) {
            this.state.page++;
            this.loadProducts();
          }
        });
      }
    }

    // Layout toggle
    if (this.elements.gridButton) {
      this.elements.gridButton.addEventListener('click', () => {
        this.setLayout('grid');
      });
    }

    if (this.elements.listButton) {
      this.elements.listButton.addEventListener('click', () => {
        this.setLayout('list');
      });
    }

    // Product actions
    this.container.addEventListener('click', event => {
      // Add to cart button
      if (event.target.closest('.btn-add-to-cart')) {
        const button = event.target.closest('.btn-add-to-cart');
        const productId = button.dataset.productId;

        this.addToCart(productId);
      }

      // Rent button
      if (event.target.closest('.btn-rent')) {
        const button = event.target.closest('.btn-rent');
        const productId = button.dataset.productId;

        this.rentProduct(productId);
      }
    });
  }

  /**
   * Apply filters
   */
  applyFilters() {
    // Get filter values
    const categorySelect = this.container.querySelector('#filter-category');
    const minPriceInput = this.container.querySelector('#filter-price-min');
    const maxPriceInput = this.container.querySelector('#filter-price-max');

    // Update state
    this.state.filters = {
      ...this.state.filters,
      category: categorySelect ? categorySelect.value : '',
      minPrice: minPriceInput ? minPriceInput.value : '',
      maxPrice: maxPriceInput ? maxPriceInput.value : ''
    };

    // Reset page
    this.state.page = 1;

    // Load products
    this.loadProducts();
  }

  /**
   * Reset filters
   */
  resetFilters() {
    // Reset filter values
    const categorySelect = this.container.querySelector('#filter-category');
    const minPriceInput = this.container.querySelector('#filter-price-min');
    const maxPriceInput = this.container.querySelector('#filter-price-max');

    if (categorySelect) categorySelect.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Reset state
    this.state.filters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: [],
      brand: [],
      features: [],
      inStock: false,
      rating: 0
    };

    // Reset advanced filter if enabled
    if (this.state.useAdvancedFilters && this.advancedFilter) {
      this.advancedFilter.updateFilters(this.state.filters);
    }

    // Reset autocomplete search if enabled
    if (!this.state.useAdvancedFilters && this.autocompleteSearch) {
      this.autocompleteSearch.setQuery('');
    }

    // Reset page
    this.state.page = 1;

    // Load products
    this.loadProducts();
  }

  /**
   * Set layout
   *
   * @param {string} layout - Layout type ('grid' or 'list')
   */
  setLayout(layout) {
    // Update state
    this.options.layout = layout;

    // Update layout buttons
    if (this.elements.gridButton) {
      this.elements.gridButton.classList.toggle('active', layout === 'grid');
    }

    if (this.elements.listButton) {
      this.elements.listButton.classList.toggle('active', layout === 'list');
    }

    // Update product list
    if (this.elements.productList) {
      this.elements.productList.classList.toggle('product-grid', layout === 'grid');
      this.elements.productList.classList.toggle('product-list-view', layout === 'list');
    }

    // Re-render products
    this.renderProducts();
  }

  /**
   * Load products
   */
  async loadProducts() {
    try {
      // Update loading state
      this.state.loading = true;
      this.renderProducts();

      // Build query parameters
      const params = {
        page: this.state.page,
        per_page: this.options.perPage,
        sort: this.state.sort
      };

      // Add filters
      if (this.state.filters.search) {
        params.search = this.state.filters.search;
      }

      if (this.state.filters.category) {
        params.category = this.state.filters.category;
      }

      if (this.state.filters.minPrice) {
        params.min_price = this.state.filters.minPrice;
      }

      if (this.state.filters.maxPrice) {
        params.max_price = this.state.filters.maxPrice;
      }

      // Add advanced filters if enabled
      if (this.state.useAdvancedFilters) {
        // Add condition filter
        if (this.state.filters.condition && this.state.filters.condition.length > 0) {
          params.condition = this.state.filters.condition.join(',');
        }

        // Add brand filter
        if (this.state.filters.brand && this.state.filters.brand.length > 0) {
          params.brand = this.state.filters.brand.join(',');
        }

        // Add features filter
        if (this.state.filters.features && this.state.filters.features.length > 0) {
          params.features = this.state.filters.features.join(',');
        }

        // Add in-stock filter
        if (this.state.filters.inStock) {
          params.in_stock = true;
        }

        // Add rating filter
        if (this.state.filters.rating > 0) {
          params.min_rating = this.state.filters.rating;
        }
      }

      // Fetch products
      const response = await dataService.getProducts(params);

      // Update state
      this.state.products = response.products;
      this.state.totalProducts = response.total;
      this.state.totalPages = response.total_pages;
      this.state.loading = false;

      // Render products
      this.renderProducts();

      // Update pagination
      this.updatePagination();
    } catch (error) {
      // Update error state
      this.state.error = error;
      this.state.loading = false;

      // Show error message
      this.elements.productList.innerHTML = `
        <div class="product-list-error">
          <p>Error loading products: ${error.message}</p>
          <button type="button" class="btn btn-primary" id="retry-load">Retry</button>
        </div>
      `;

      // Add retry button event listener
      const retryButton = this.container.querySelector('#retry-load');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadProducts();
        });
      }

      // Log error
      console.error('Error loading products:', error);
    }
  }

  /**
   * Add product to cart
   *
   * @param {string|number} productId - Product ID
   */
  async addToCart(productId) {
    try {
      // Find product in current list
      let product = this.state.products.find(p => p.id.toString() === productId.toString());

      // If not found, fetch product
      if (!product) {
        product = await dataService.getProduct(productId);
      }

      // Add to cart
      dataService.addToCart(product, 1, false);

      // Show success notification
      if (typeof notifications !== 'undefined') {
        notifications.success(`${product.name} added to cart`, 'Added to Cart');
      }
    } catch (error) {
      // Show error notification
      if (typeof notifications !== 'undefined') {
        notifications.error(`Error adding product to cart: ${error.message}`, 'Error');
      }

      // Log error
      console.error('Error adding product to cart:', error);
    }
  }

  /**
   * Rent product
   *
   * @param {string|number} productId - Product ID
   */
  async rentProduct(productId) {
    try {
      // Find product in current list
      let product = this.state.products.find(p => p.id.toString() === productId.toString());

      // If not found, fetch product
      if (!product) {
        product = await dataService.getProduct(productId);
      }

      // Show rental modal
      this.showRentalModal(product);
    } catch (error) {
      // Show error notification
      if (typeof notifications !== 'undefined') {
        notifications.error(`Error preparing rental: ${error.message}`, 'Error');
      }

      // Log error
      console.error('Error preparing rental:', error);
    }
  }

  /**
   * Show rental modal
   *
   * @param {Object} product - Product data
   */
  showRentalModal(product) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'rental-modal-title');

    // Set modal content
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="rental-modal-title">Rent ${product.name}</h2>
            <button type="button" class="close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <form id="rental-form">
              <div class="form-group">
                <label for="rental-start-date">Start Date</label>
                <input type="date" id="rental-start-date" class="form-control" required min="${new Date().toISOString().split('T')[0]}">
              </div>

              <div class="form-group">
                <label for="rental-end-date">End Date</label>
                <input type="date" id="rental-end-date" class="form-control" required min="${new Date().toISOString().split('T')[0]}">
              </div>

              <div class="form-group">
                <label for="rental-quantity">Quantity</label>
                <input type="number" id="rental-quantity" class="form-control" value="1" min="1" max="10" required>
              </div>

              <div class="rental-summary">
                <p>Daily Rate: <span class="daily-rate">${this.formatCurrency(product.rental_price)}</span></p>
                <p>Days: <span class="rental-days">1</span></p>
                <p>Subtotal: <span class="rental-subtotal">${this.formatCurrency(product.rental_price)}</span></p>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="add-rental-to-cart">Add to Cart</button>
          </div>
        </div>
      </div>
    `;

    // Add modal to document
    document.body.appendChild(modal);

    // Show modal
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);

    // Create focus trap
    let focusTrap = null;
    if (typeof accessibility !== 'undefined') {
      focusTrap = accessibility.createFocusTrap(modal);
    }

    // Add event listeners
    const closeButton = modal.querySelector('.close');
    const cancelButton = modal.querySelector('[data-dismiss="modal"]');
    const addButton = modal.querySelector('#add-rental-to-cart');
    const startDateInput = modal.querySelector('#rental-start-date');
    const endDateInput = modal.querySelector('#rental-end-date');
    const quantityInput = modal.querySelector('#rental-quantity');

    // Set default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    startDateInput.value = today.toISOString().split('T')[0];
    endDateInput.value = tomorrow.toISOString().split('T')[0];

    // Update rental summary
    const updateSummary = () => {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      const quantity = parseInt(quantityInput.value, 10);

      // Calculate days
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const rentalDays = Math.max(1, days);

      // Update summary
      modal.querySelector('.rental-days').textContent = rentalDays;
      modal.querySelector('.rental-subtotal').textContent = this.formatCurrency(product.rental_price * quantity * rentalDays);
    };

    // Add event listeners for inputs
    startDateInput.addEventListener('change', updateSummary);
    endDateInput.addEventListener('change', updateSummary);
    quantityInput.addEventListener('change', updateSummary);

    // Close modal
    const closeModal = () => {
      modal.classList.remove('show');

      // Remove modal after animation
      setTimeout(() => {
        document.body.removeChild(modal);

        // Release focus trap
        if (focusTrap) {
          focusTrap.release();
        }
      }, 300);
    };

    // Close on button click
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Close on escape key
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

    // Close on outside click
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Add to cart
    addButton.addEventListener('click', () => {
      // Validate form
      const form = modal.querySelector('#rental-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Get values
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      const quantity = parseInt(quantityInput.value, 10);

      // Add to cart
      dataService.addToCart(product, quantity, true, { startDate, endDate });

      // Show success notification
      if (typeof notifications !== 'undefined') {
        notifications.success(`${product.name} rental added to cart`, 'Added to Cart');
      }

      // Close modal
      closeModal();
    });
  }

  /**
   * Format currency
   *
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductList;
}
