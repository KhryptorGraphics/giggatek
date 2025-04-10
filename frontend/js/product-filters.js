/**
 * GigGatek Product Filtering and Sorting
 * Handles product filtering, sorting, and view options
 */

class ProductFilters {
    constructor() {
        // Initialize state
        this.filters = {
            category: [],
            brand: [],
            condition: [],
            priceRange: {
                min: 0,
                max: 2000
            }
        };
        this.sortBy = 'featured';
        this.viewMode = 'grid';
        this.currentPage = 1;
        this.productsPerPage = 24;
        this.totalProducts = 0;
        this.products = [];
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the product filters
     */
    init() {
        // Check if we're on a page with product filters
        if (!document.querySelector('.filter-sidebar')) {
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load products
        this.loadProducts();
    }
    
    /**
     * Setup event listeners for filters, sorting, and pagination
     */
    setupEventListeners() {
        // Category filters
        document.querySelectorAll('input[name="category"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCategoryFilters();
                this.applyFilters();
            });
        });
        
        // Brand filters
        document.querySelectorAll('input[name="brand"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBrandFilters();
                this.applyFilters();
            });
        });
        
        // Condition filters
        document.querySelectorAll('input[name="condition"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateConditionFilters();
                this.applyFilters();
            });
        });
        
        // Price range slider
        const priceRangeSlider = document.getElementById('price-range');
        if (priceRangeSlider) {
            priceRangeSlider.addEventListener('input', () => {
                this.updatePriceRange(priceRangeSlider.value);
            });
            
            priceRangeSlider.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Sort by dropdown
        const sortBySelect = document.getElementById('sort-by');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', () => {
                this.sortBy = sortBySelect.value;
                this.applyFilters();
            });
        }
        
        // View toggle buttons
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', () => {
                this.setViewMode(button.dataset.view);
            });
        });
        
        // Clear all filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pagination a') || e.target.closest('.pagination a')) {
                e.preventDefault();
                const pageLink = e.target.closest('.pagination a');
                if (pageLink) {
                    const page = parseInt(pageLink.dataset.page);
                    if (!isNaN(page)) {
                        this.goToPage(page);
                    }
                }
            }
        });
    }
    
    /**
     * Update category filters based on checkboxes
     */
    updateCategoryFilters() {
        this.filters.category = [];
        document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
            this.filters.category.push(checkbox.value);
        });
    }
    
    /**
     * Update brand filters based on checkboxes
     */
    updateBrandFilters() {
        this.filters.brand = [];
        document.querySelectorAll('input[name="brand"]:checked').forEach(checkbox => {
            this.filters.brand.push(checkbox.value);
        });
    }
    
    /**
     * Update condition filters based on checkboxes
     */
    updateConditionFilters() {
        this.filters.condition = [];
        document.querySelectorAll('input[name="condition"]:checked').forEach(checkbox => {
            this.filters.condition.push(checkbox.value);
        });
    }
    
    /**
     * Update price range filter
     * @param {number} maxPrice - Maximum price value
     */
    updatePriceRange(maxPrice) {
        this.filters.priceRange.max = parseInt(maxPrice);
        
        // Update the displayed price value
        const priceValueElement = document.getElementById('price-value');
        if (priceValueElement) {
            priceValueElement.textContent = maxPrice >= 2000 ? '$2000+' : `$${maxPrice}`;
        }
    }
    
    /**
     * Set the view mode (grid or list)
     * @param {string} mode - View mode ('grid' or 'list')
     */
    setViewMode(mode) {
        if (mode !== 'grid' && mode !== 'list') {
            return;
        }
        
        this.viewMode = mode;
        
        // Update active button
        document.querySelectorAll('.view-button').forEach(button => {
            if (button.dataset.view === mode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update product grid class
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            if (mode === 'grid') {
                productGrid.classList.remove('product-list');
                productGrid.classList.add('product-grid');
            } else {
                productGrid.classList.remove('product-grid');
                productGrid.classList.add('product-list');
            }
        }
    }
    
    /**
     * Clear all filters
     */
    clearAllFilters() {
        // Reset checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset price range
        const priceRangeSlider = document.getElementById('price-range');
        if (priceRangeSlider) {
            priceRangeSlider.value = 2000;
            this.updatePriceRange(2000);
        }
        
        // Reset filter state
        this.filters = {
            category: [],
            brand: [],
            condition: [],
            priceRange: {
                min: 0,
                max: 2000
            }
        };
        
        // Apply filters (reset)
        this.applyFilters();
    }
    
    /**
     * Go to a specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.totalProducts / this.productsPerPage)) {
            return;
        }
        
        this.currentPage = page;
        this.loadProducts();
    }
    
    /**
     * Apply all filters and reload products
     */
    applyFilters() {
        this.currentPage = 1; // Reset to first page when filters change
        this.loadProducts();
    }
    
    /**
     * Load products from API with current filters and sorting
     */
    async loadProducts() {
        try {
            // Show loading state
            const productsContainer = document.querySelector('.product-grid');
            if (productsContainer) {
                productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
            }
            
            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.productsPerPage,
                sort: this.sortBy
            });
            
            // Add category filters
            if (this.filters.category.length > 0) {
                this.filters.category.forEach(category => {
                    params.append('category', category);
                });
            }
            
            // Add brand filters
            if (this.filters.brand.length > 0) {
                this.filters.brand.forEach(brand => {
                    params.append('brand', brand);
                });
            }
            
            // Add condition filters
            if (this.filters.condition.length > 0) {
                this.filters.condition.forEach(condition => {
                    params.append('condition', condition);
                });
            }
            
            // Add price range
            params.append('price_min', this.filters.priceRange.min);
            params.append('price_max', this.filters.priceRange.max);
            
            // Fetch products from API
            const apiUrl = window.GigGatekConfig ? 
                window.GigGatekConfig.getApiEndpoint(`/products?${params.toString()}`) : 
                `/api/products?${params.toString()}`;
                
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to load products: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store products and total count
            this.products = data.products || data; // Handle both formats
            this.totalProducts = data.total || this.products.length;
            
            // Render products
            this.renderProducts();
            
            // Update product count
            this.updateProductCount();
            
            // Render pagination
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Show error message
            const productsContainer = document.querySelector('.product-grid');
            if (productsContainer) {
                productsContainer.innerHTML = `
                    <div class="error-message">
                        <p>There was a problem loading products.</p>
                        <button id="retry-load-products" class="btn btn-primary">Try Again</button>
                    </div>
                `;
                
                // Add retry button event listener
                const retryButton = document.getElementById('retry-load-products');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        this.loadProducts();
                    });
                }
            }
        }
    }
    
    /**
     * Render products in the product grid
     */
    renderProducts() {
        const productsContainer = document.querySelector('.product-grid');
        if (!productsContainer || !this.products.length) {
            if (productsContainer) {
                productsContainer.innerHTML = '<div class="no-results">No products found matching your criteria.</div>';
            }
            return;
        }
        
        // Clear container
        productsContainer.innerHTML = '';
        
        // Add products
        this.products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            
            // Format price with 2 decimal places
            const formattedPrice = parseFloat(product.purchase_price).toFixed(2);
            const formattedRentalPrice = product.rental_price_12m ? 
                parseFloat(product.rental_price_12m).toFixed(2) : null;
            
            // Get primary image or placeholder
            const imageUrl = product.primary_image || 'img/placeholder-product.png';
            
            productElement.innerHTML = `
                <a href="product.php?id=${product.product_id}" class="product-link">
                    <img src="${imageUrl}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <div class="product-price">$${formattedPrice}</div>
                    ${formattedRentalPrice ? 
                        `<div class="product-rental">or rent for $${formattedRentalPrice}/mo</div>` : ''}
                    <div class="product-category">${product.category}</div>
                </a>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart-btn" 
                        data-product-id="${product.product_id}" 
                        data-product-name="${product.name}" 
                        data-product-price="${product.purchase_price}">
                        Add to Cart
                    </button>
                    <button class="btn btn-outline-secondary wishlist-btn" 
                        data-product-id="${product.product_id}">
                        ♡
                    </button>
                </div>
            `;
            
            productsContainer.appendChild(productElement);
        });
    }
    
    /**
     * Update the product count display
     */
    updateProductCount() {
        const productsCountElement = document.querySelector('.products-count');
        if (productsCountElement) {
            const start = (this.currentPage - 1) * this.productsPerPage + 1;
            const end = Math.min(this.currentPage * this.productsPerPage, this.totalProducts);
            
            productsCountElement.innerHTML = `
                Showing <strong>${start}-${end}</strong> of <strong>${this.totalProducts}</strong> products
            `;
        }
    }
    
    /**
     * Render pagination controls
     */
    renderPagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) {
            return;
        }
        
        const totalPages = Math.ceil(this.totalProducts / this.productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <li class="${this.currentPage === 1 ? 'disabled' : ''}">
                <a href="#" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'aria-disabled="true"' : ''}>
                    Previous
                </a>
            </li>
        `;
        
        // Page numbers
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        // First page
        if (startPage > 1) {
            paginationHtml += `
                <li><a href="#" data-page="1">1</a></li>
                ${startPage > 2 ? '<li class="ellipsis">...</li>' : ''}
            `;
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="${i === this.currentPage ? 'active' : ''}">
                    <a href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Last page
        if (endPage < totalPages) {
            paginationHtml += `
                ${endPage < totalPages - 1 ? '<li class="ellipsis">...</li>' : ''}
                <li><a href="#" data-page="${totalPages}">${totalPages}</a></li>
            `;
        }
        
        // Next button
        paginationHtml += `
            <li class="${this.currentPage === totalPages ? 'disabled' : ''}">
                <a href="#" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'aria-disabled="true"' : ''}>
                    Next
                </a>
            </li>
        `;
        
        paginationContainer.innerHTML = paginationHtml;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global product filters instance
    window.productFilters = new ProductFilters();
});
