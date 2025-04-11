/**
 * Advanced Filter Component
 * 
 * This component provides enhanced filtering capabilities for product listings.
 */

class AdvancedFilter {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    this.options = {
      onFilterChange: null,
      initialFilters: {},
      showClearAll: true,
      collapsible: true,
      ...options
    };
    
    this.state = {
      filters: {
        search: this.options.initialFilters.search || '',
        category: this.options.initialFilters.category || '',
        minPrice: this.options.initialFilters.minPrice || '',
        maxPrice: this.options.initialFilters.maxPrice || '',
        condition: this.options.initialFilters.condition || [],
        brand: this.options.initialFilters.brand || [],
        features: this.options.initialFilters.features || [],
        inStock: this.options.initialFilters.inStock || false,
        rating: this.options.initialFilters.rating || 0
      },
      categories: [],
      brands: [],
      features: [],
      conditions: ['Excellent', 'Good', 'Fair'],
      expanded: {
        category: true,
        price: true,
        condition: true,
        brand: true,
        features: true,
        availability: true,
        rating: true
      },
      loading: false
    };
    
    this.init();
  }
  
  /**
   * Initialize component
   */
  init() {
    // Create component structure
    this.render();
    
    // Add event listeners
    this.addEventListeners();
    
    // Load filter options
    this.loadFilterOptions();
  }
  
  /**
   * Render component
   */
  render() {
    this.container.innerHTML = `
      <div class="advanced-filter">
        <div class="filter-header">
          <h3>Filters</h3>
          ${this.options.showClearAll ? '<button type="button" class="btn-clear-all">Clear All</button>' : ''}
        </div>
        
        <div class="filter-body">
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.category ? 'expanded' : ''}" data-section="category">
              <h4>Category</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.category ? '' : 'collapsed'}" id="category-filters">
              <div class="filter-loading">Loading categories...</div>
            </div>
          </div>
          
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.price ? 'expanded' : ''}" data-section="price">
              <h4>Price Range</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.price ? '' : 'collapsed'}">
              <div class="price-range-inputs">
                <div class="price-input">
                  <label for="filter-price-min">Min</label>
                  <input type="number" id="filter-price-min" class="form-control" placeholder="Min" value="${this.state.filters.minPrice}">
                </div>
                <div class="price-input">
                  <label for="filter-price-max">Max</label>
                  <input type="number" id="filter-price-max" class="form-control" placeholder="Max" value="${this.state.filters.maxPrice}">
                </div>
              </div>
              <div class="price-range-slider">
                <input type="range" id="price-range-slider" min="0" max="2000" step="50" value="1000">
              </div>
              <div class="price-range-labels">
                <span>$0</span>
                <span>$2000+</span>
              </div>
            </div>
          </div>
          
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.condition ? 'expanded' : ''}" data-section="condition">
              <h4>Condition</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.condition ? '' : 'collapsed'}">
              ${this.renderConditionFilters()}
            </div>
          </div>
          
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.brand ? 'expanded' : ''}" data-section="brand">
              <h4>Brand</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.brand ? '' : 'collapsed'}" id="brand-filters">
              <div class="filter-loading">Loading brands...</div>
            </div>
          </div>
          
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.features ? 'expanded' : ''}" data-section="features">
              <h4>Features</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.features ? '' : 'collapsed'}" id="feature-filters">
              <div class="filter-loading">Loading features...</div>
            </div>
          </div>
          
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.availability ? 'expanded' : ''}" data-section="availability">
              <h4>Availability</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.availability ? '' : 'collapsed'}">
              <div class="checkbox-filter">
                <input type="checkbox" id="filter-in-stock" ${this.state.filters.inStock ? 'checked' : ''}>
                <label for="filter-in-stock">In Stock Only</label>
              </div>
            </div>
          </div>
          
          <div class="filter-section">
            <div class="filter-section-header ${this.options.collapsible ? 'collapsible' : ''} ${this.state.expanded.rating ? 'expanded' : ''}" data-section="rating">
              <h4>Rating</h4>
              ${this.options.collapsible ? '<span class="toggle-icon"></span>' : ''}
            </div>
            <div class="filter-section-body ${this.state.expanded.rating ? '' : 'collapsed'}">
              <div class="rating-filter">
                <div class="rating-options">
                  <div class="rating-option ${this.state.filters.rating >= 4 ? 'selected' : ''}" data-rating="4">
                    <span class="stars">★★★★</span><span class="star-empty">★</span> & Up
                  </div>
                  <div class="rating-option ${this.state.filters.rating === 3 ? 'selected' : ''}" data-rating="3">
                    <span class="stars">★★★</span><span class="star-empty">★★</span> & Up
                  </div>
                  <div class="rating-option ${this.state.filters.rating === 2 ? 'selected' : ''}" data-rating="2">
                    <span class="stars">★★</span><span class="star-empty">★★★</span> & Up
                  </div>
                  <div class="rating-option ${this.state.filters.rating === 1 ? 'selected' : ''}" data-rating="1">
                    <span class="stars">★</span><span class="star-empty">★★★★</span> & Up
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="filter-footer">
          <button type="button" class="btn btn-primary btn-apply-filters">Apply Filters</button>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.elements = {
      clearAllButton: this.container.querySelector('.btn-clear-all'),
      applyFiltersButton: this.container.querySelector('.btn-apply-filters'),
      minPriceInput: this.container.querySelector('#filter-price-min'),
      maxPriceInput: this.container.querySelector('#filter-price-max'),
      priceRangeSlider: this.container.querySelector('#price-range-slider'),
      inStockCheckbox: this.container.querySelector('#filter-in-stock'),
      categoryFilters: this.container.querySelector('#category-filters'),
      brandFilters: this.container.querySelector('#brand-filters'),
      featureFilters: this.container.querySelector('#feature-filters'),
      ratingOptions: this.container.querySelectorAll('.rating-option'),
      sectionHeaders: this.container.querySelectorAll('.filter-section-header.collapsible')
    };
  }
  
  /**
   * Render condition filters
   * 
   * @returns {string} Condition filters HTML
   */
  renderConditionFilters() {
    return this.state.conditions.map(condition => `
      <div class="checkbox-filter">
        <input type="checkbox" id="filter-condition-${condition.toLowerCase()}" 
          ${this.state.filters.condition.includes(condition) ? 'checked' : ''} 
          value="${condition}">
        <label for="filter-condition-${condition.toLowerCase()}">${condition}</label>
      </div>
    `).join('');
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    // Clear all filters
    if (this.elements.clearAllButton) {
      this.elements.clearAllButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
    
    // Apply filters
    if (this.elements.applyFiltersButton) {
      this.elements.applyFiltersButton.addEventListener('click', () => {
        this.applyFilters();
      });
    }
    
    // Price range inputs
    if (this.elements.minPriceInput) {
      this.elements.minPriceInput.addEventListener('change', () => {
        this.state.filters.minPrice = this.elements.minPriceInput.value;
      });
    }
    
    if (this.elements.maxPriceInput) {
      this.elements.maxPriceInput.addEventListener('change', () => {
        this.state.filters.maxPrice = this.elements.maxPriceInput.value;
      });
    }
    
    // In stock checkbox
    if (this.elements.inStockCheckbox) {
      this.elements.inStockCheckbox.addEventListener('change', () => {
        this.state.filters.inStock = this.elements.inStockCheckbox.checked;
      });
    }
    
    // Rating options
    if (this.elements.ratingOptions) {
      this.elements.ratingOptions.forEach(option => {
        option.addEventListener('click', () => {
          const rating = parseInt(option.dataset.rating);
          this.state.filters.rating = rating;
          
          // Update UI
          this.elements.ratingOptions.forEach(opt => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');
        });
      });
    }
    
    // Collapsible sections
    if (this.elements.sectionHeaders) {
      this.elements.sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
          const section = header.dataset.section;
          this.toggleSection(section);
        });
      });
    }
    
    // Condition checkboxes
    const conditionCheckboxes = this.container.querySelectorAll('input[id^="filter-condition-"]');
    conditionCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const condition = checkbox.value;
        if (checkbox.checked) {
          if (!this.state.filters.condition.includes(condition)) {
            this.state.filters.condition.push(condition);
          }
        } else {
          this.state.filters.condition = this.state.filters.condition.filter(c => c !== condition);
        }
      });
    });
  }
  
  /**
   * Toggle filter section
   * 
   * @param {string} section - Section name
   */
  toggleSection(section) {
    // Toggle expanded state
    this.state.expanded[section] = !this.state.expanded[section];
    
    // Update UI
    const header = this.container.querySelector(`.filter-section-header[data-section="${section}"]`);
    const body = header.nextElementSibling;
    
    if (this.state.expanded[section]) {
      header.classList.add('expanded');
      body.classList.remove('collapsed');
    } else {
      header.classList.remove('expanded');
      body.classList.add('collapsed');
    }
  }
  
  /**
   * Load filter options
   */
  async loadFilterOptions() {
    this.state.loading = true;
    
    try {
      // Load categories
      const categories = await this.fetchCategories();
      this.state.categories = categories;
      this.renderCategoryFilters();
      
      // Load brands
      const brands = await this.fetchBrands();
      this.state.brands = brands;
      this.renderBrandFilters();
      
      // Load features
      const features = await this.fetchFeatures();
      this.state.features = features;
      this.renderFeatureFilters();
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      this.state.loading = false;
    }
  }
  
  /**
   * Fetch categories
   * 
   * @returns {Promise<Array>} Categories
   */
  async fetchCategories() {
    // This would normally fetch from an API
    // For now, return mock data
    return [
      { id: 'gpus', name: 'GPUs' },
      { id: 'cpus', name: 'CPUs' },
      { id: 'motherboards', name: 'Motherboards' },
      { id: 'ram', name: 'RAM' },
      { id: 'storage', name: 'Storage' },
      { id: 'cases', name: 'Cases' },
      { id: 'power-supplies', name: 'Power Supplies' },
      { id: 'cooling', name: 'Cooling' },
      { id: 'peripherals', name: 'Peripherals' },
      { id: 'complete-systems', name: 'Complete Systems' }
    ];
  }
  
  /**
   * Fetch brands
   * 
   * @returns {Promise<Array>} Brands
   */
  async fetchBrands() {
    // This would normally fetch from an API
    // For now, return mock data
    return [
      { id: 'nvidia', name: 'NVIDIA' },
      { id: 'amd', name: 'AMD' },
      { id: 'intel', name: 'Intel' },
      { id: 'asus', name: 'ASUS' },
      { id: 'msi', name: 'MSI' },
      { id: 'gigabyte', name: 'Gigabyte' },
      { id: 'evga', name: 'EVGA' },
      { id: 'corsair', name: 'Corsair' },
      { id: 'kingston', name: 'Kingston' },
      { id: 'western-digital', name: 'Western Digital' }
    ];
  }
  
  /**
   * Fetch features
   * 
   * @returns {Promise<Array>} Features
   */
  async fetchFeatures() {
    // This would normally fetch from an API
    // For now, return mock data
    return [
      { id: 'vr-ready', name: 'VR Ready' },
      { id: 'ray-tracing', name: 'Ray Tracing' },
      { id: 'dlss', name: 'DLSS Support' },
      { id: 'rgb', name: 'RGB Lighting' },
      { id: 'overclocked', name: 'Factory Overclocked' },
      { id: 'water-cooling', name: 'Water Cooling' },
      { id: 'silent', name: 'Silent Operation' },
      { id: 'ssd', name: 'SSD Storage' },
      { id: 'wifi', name: 'Built-in WiFi' },
      { id: 'bluetooth', name: 'Bluetooth' }
    ];
  }
  
  /**
   * Render category filters
   */
  renderCategoryFilters() {
    if (!this.elements.categoryFilters) return;
    
    const html = this.state.categories.map(category => `
      <div class="checkbox-filter">
        <input type="checkbox" id="filter-category-${category.id}" 
          ${this.state.filters.category === category.id ? 'checked' : ''} 
          value="${category.id}">
        <label for="filter-category-${category.id}">${category.name}</label>
      </div>
    `).join('');
    
    this.elements.categoryFilters.innerHTML = html;
    
    // Add event listeners
    const categoryCheckboxes = this.container.querySelectorAll('input[id^="filter-category-"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // Only one category can be selected at a time
        if (checkbox.checked) {
          this.state.filters.category = checkbox.value;
          
          // Uncheck other checkboxes
          categoryCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
              cb.checked = false;
            }
          });
        } else {
          this.state.filters.category = '';
        }
      });
    });
  }
  
  /**
   * Render brand filters
   */
  renderBrandFilters() {
    if (!this.elements.brandFilters) return;
    
    const html = this.state.brands.map(brand => `
      <div class="checkbox-filter">
        <input type="checkbox" id="filter-brand-${brand.id}" 
          ${this.state.filters.brand.includes(brand.id) ? 'checked' : ''} 
          value="${brand.id}">
        <label for="filter-brand-${brand.id}">${brand.name}</label>
      </div>
    `).join('');
    
    this.elements.brandFilters.innerHTML = html;
    
    // Add event listeners
    const brandCheckboxes = this.container.querySelectorAll('input[id^="filter-brand-"]');
    brandCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const brand = checkbox.value;
        if (checkbox.checked) {
          if (!this.state.filters.brand.includes(brand)) {
            this.state.filters.brand.push(brand);
          }
        } else {
          this.state.filters.brand = this.state.filters.brand.filter(b => b !== brand);
        }
      });
    });
  }
  
  /**
   * Render feature filters
   */
  renderFeatureFilters() {
    if (!this.elements.featureFilters) return;
    
    const html = this.state.features.map(feature => `
      <div class="checkbox-filter">
        <input type="checkbox" id="filter-feature-${feature.id}" 
          ${this.state.filters.features.includes(feature.id) ? 'checked' : ''} 
          value="${feature.id}">
        <label for="filter-feature-${feature.id}">${feature.name}</label>
      </div>
    `).join('');
    
    this.elements.featureFilters.innerHTML = html;
    
    // Add event listeners
    const featureCheckboxes = this.container.querySelectorAll('input[id^="filter-feature-"]');
    featureCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const feature = checkbox.value;
        if (checkbox.checked) {
          if (!this.state.filters.features.includes(feature)) {
            this.state.filters.features.push(feature);
          }
        } else {
          this.state.filters.features = this.state.filters.features.filter(f => f !== feature);
        }
      });
    });
  }
  
  /**
   * Apply filters
   */
  applyFilters() {
    // Call onFilterChange callback if provided
    if (typeof this.options.onFilterChange === 'function') {
      this.options.onFilterChange(this.state.filters);
    }
  }
  
  /**
   * Clear all filters
   */
  clearAllFilters() {
    // Reset filters
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
    
    // Update UI
    this.render();
    this.addEventListeners();
    this.loadFilterOptions();
    
    // Call onFilterChange callback if provided
    if (typeof this.options.onFilterChange === 'function') {
      this.options.onFilterChange(this.state.filters);
    }
  }
  
  /**
   * Update filters
   * 
   * @param {Object} filters - New filters
   */
  updateFilters(filters) {
    // Update filters
    this.state.filters = {
      ...this.state.filters,
      ...filters
    };
    
    // Update UI
    this.render();
    this.addEventListeners();
    this.loadFilterOptions();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedFilter;
}
