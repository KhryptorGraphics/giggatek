/**
 * GigGatek - Rent-to-Own Calculator and Management Interface
 * 
 * This script handles the rent-to-own functionality, including:
 * - Payment calculator
 * - Rental term selection
 * - Buyout price calculation
 * - Rental management dashboard
 */

// Global variables
let currentProduct = null;
let selectedTerm = 12; // Default to 12 months

/**
 * Initialize the rent-to-own functionality
 */
function initRentToOwn() {
    // Set up event listeners for term selection
    document.querySelectorAll('.term-option').forEach(option => {
        option.addEventListener('click', function() {
            selectedTerm = parseInt(this.dataset.term);
            updateCalculator();
            
            // Update active state
            document.querySelectorAll('.term-option').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set up product selection change listener if on product page
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
        productSelect.addEventListener('change', function() {
            loadProductDetails(this.value);
        });
        
        // Load initial product if selected
        if (productSelect.value) {
            loadProductDetails(productSelect.value);
        }
    } else {
        // Check if we're on a product detail page with data-product-id
        const productDetail = document.querySelector('[data-product-id]');
        if (productDetail) {
            loadProductDetails(productDetail.dataset.productId);
        }
    }

    // Initialize slider if present
    initPaymentSlider();
    
    // Load user rentals if on dashboard
    if (document.getElementById('user-rentals')) {
        loadUserRentals();
    }
}

/**
 * Load product details for rent-to-own calculation
 * @param {number} productId - The ID of the product
 */
function loadProductDetails(productId) {
    if (!productId) return;
    
    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            currentProduct = product;
            updateCalculator();
            updateProductDisplay();
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            showError('Unable to load product details. Please try again later.');
        });
}

/**
 * Update the product display with current product details
 */
function updateProductDisplay() {
    if (!currentProduct) return;
    
    // Update product image
    const productImage = document.getElementById('product-image');
    if (productImage && currentProduct.primary_image) {
        productImage.src = currentProduct.primary_image;
        productImage.alt = currentProduct.name;
    }
    
    // Update product name and description
    const productName = document.getElementById('product-name');
    if (productName) productName.textContent = currentProduct.name;
    
    const productDesc = document.getElementById('product-description');
    if (productDesc) productDesc.textContent = currentProduct.description;
    
    // Update condition rating
    const conditionRating = document.getElementById('condition-rating');
    if (conditionRating) {
        conditionRating.textContent = currentProduct.condition_rating || 'Good';
        
        // Add appropriate class for condition visual indication
        conditionRating.className = ''; // Reset classes
        conditionRating.classList.add('condition-badge');
        
        if (currentProduct.condition_rating) {
            const ratingClass = currentProduct.condition_rating.toLowerCase().replace(' ', '-');
            conditionRating.classList.add(ratingClass);
        }
    }
    
    // Update specifications if they exist
    const specsContainer = document.getElementById('product-specifications');
    if (specsContainer && currentProduct.specifications) {
        specsContainer.innerHTML = '';
        
        for (const [key, value] of Object.entries(currentProduct.specifications)) {
            const specRow = document.createElement('div');
            specRow.className = 'spec-row';
            
            const specName = document.createElement('span');
            specName.className = 'spec-name';
            specName.textContent = key;
            
            const specValue = document.createElement('span');
            specValue.className = 'spec-value';
            specValue.textContent = value;
            
            specRow.appendChild(specName);
            specRow.appendChild(specValue);
            specsContainer.appendChild(specRow);
        }
    }
}

/**
 * Initialize the payment slider for term selection
 */
function initPaymentSlider() {
    const slider = document.getElementById('term-slider');
    if (!slider) return;
    
    // Initialize the slider with noUiSlider if available
    if (window.noUiSlider) {
        noUiSlider.create(slider, {
            start: [12],
            connect: 'lower',
            step: 3,
            range: {
                'min': [3],
                'max': [24]
            },
            pips: {
                mode: 'values',
                values: [3, 6, 12, 18, 24],
                density: 10
            }
        });
        
        slider.noUiSlider.on('update', function(values, handle) {
            selectedTerm = Math.round(values[handle]);
            updateCalculator();
            
            // Update term display
            document.getElementById('selected-term').textContent = selectedTerm;
        });
    } else {
        // Fallback for regular range input
        slider.type = 'range';
        slider.min = 3;
        slider.max = 24;
        slider.step = 3;
        slider.value = 12;
        
        slider.addEventListener('input', function() {
            selectedTerm = parseInt(this.value);
            document.getElementById('selected-term').textContent = selectedTerm;
            updateCalculator();
        });
    }
}

/**
 * Update the rent-to-own calculator with current values
 */
function updateCalculator() {
    if (!currentProduct) return;
    
    // Get price based on selected term
    let monthlyPrice;
    switch(selectedTerm) {
        case 3:
            monthlyPrice = currentProduct.rental_price_3m || (currentProduct.purchase_price / 2.5 / 3);
            break;
        case 6:
            monthlyPrice = currentProduct.rental_price_6m || (currentProduct.purchase_price / 2.2 / 6);
            break;
        case 12:
        default:
            monthlyPrice = currentProduct.rental_price_12m || (currentProduct.purchase_price / 2 / 12);
            break;
    }
    
    // Calculate total cost
    const totalCost = (monthlyPrice * selectedTerm).toFixed(2);
    const purchasePrice = currentProduct.purchase_price.toFixed(2);
    const premiumPercentage = (((totalCost - purchasePrice) / purchasePrice) * 100).toFixed(1);
    
    // Calculate buyout prices at different terms
    const remainingAtThreeMonths = (totalCost - (monthlyPrice * 3)).toFixed(2);
    const remainingAtSixMonths = (totalCost - (monthlyPrice * 6)).toFixed(2);
    const remainingAtNineMonths = (totalCost - (monthlyPrice * 9)).toFixed(2);
    
    // Update UI elements with calculated values
    const elements = {
        'monthly-payment': `$${monthlyPrice.toFixed(2)}`,
        'total-cost': `$${totalCost}`,
        'purchase-price': `$${purchasePrice}`,
        'rental-premium': `${premiumPercentage}%`,
        'buyout-3months': `$${remainingAtThreeMonths}`,
        'buyout-6months': `$${remainingAtSixMonths}`,
        'buyout-9months': `$${remainingAtNineMonths}`
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    // Update comparison chart if it exists
    updateComparisonChart(purchasePrice, totalCost, monthlyPrice);
}

/**
 * Update the buy vs. rent comparison chart
 */
function updateComparisonChart(purchasePrice, totalCost, monthlyPayment) {
    const chartContainer = document.getElementById('comparison-chart');
    if (!chartContainer) return;
    
    if (window.Chart) {
        // Clear previous chart
        while (chartContainer.firstChild) {
            chartContainer.removeChild(chartContainer.firstChild);
        }
        
        // Create canvas for chart
        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);
        
        // Create the chart
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Upfront Purchase', 'Rent-to-Own'],
                datasets: [
                    {
                        label: 'Initial Payment',
                        data: [purchasePrice, monthlyPayment],
                        backgroundColor: '#4a7feb'
                    },
                    {
                        label: 'Total Cost',
                        data: [purchasePrice, totalCost],
                        backgroundColor: '#6c757d'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cost ($)'
                        }
                    }
                }
            }
        });
    } else {
        // Simple fallback if Chart.js is not available
        chartContainer.innerHTML = `
            <div class="comparison-table">
                <div class="comparison-row header">
                    <div class="comparison-cell"></div>
                    <div class="comparison-cell">Upfront Purchase</div>
                    <div class="comparison-cell">Rent-to-Own</div>
                </div>
                <div class="comparison-row">
                    <div class="comparison-cell">Initial Payment</div>
                    <div class="comparison-cell">$${purchasePrice}</div>
                    <div class="comparison-cell">$${monthlyPayment.toFixed(2)}</div>
                </div>
                <div class="comparison-row">
                    <div class="comparison-cell">Total Cost</div>
                    <div class="comparison-cell">$${purchasePrice}</div>
                    <div class="comparison-cell">$${totalCost}</div>
                </div>
            </div>
        `;
    }
}

/**
 * Load current user's rentals for the dashboard
 */
function loadUserRentals() {
    const rentalsContainer = document.getElementById('user-rentals');
    if (!rentalsContainer) return;
    
    // Display loading state
    rentalsContainer.innerHTML = '<div class="loading">Loading your rentals...</div>';
    
    fetch('/api/rentals')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Not logged in
                    redirectToLogin();
                    throw new Error('Please log in to view your rentals');
                }
                throw new Error('Failed to load rentals');
            }
            return response.json();
        })
        .then(data => {
            if (!data.rentals || data.rentals.length === 0) {
                rentalsContainer.innerHTML = `
                    <div class="no-rentals">
                        <p>You don't have any active rentals yet.</p>
                        <a href="/products.php" class="btn btn-primary">Browse Products</a>
                    </div>
                `;
                return;
            }
            
            // Display the rentals
            renderRentals(data.rentals, rentalsContainer);
        })
        .catch(error => {
            console.error('Error loading rentals:', error);
            rentalsContainer.innerHTML = `
                <div class="error-message">
                    <p>${error.message || 'An error occurred while loading your rentals.'}</p>
                    <button onclick="loadUserRentals()" class="btn btn-secondary">Try Again</button>
                </div>
            `;
        });
}

/**
 * Render rentals in the dashboard
 * @param {Array} rentals - The list of rental objects
 * @param {HTMLElement} container - The container element
 */
function renderRentals(rentals, container) {
    container.innerHTML = '';
    
    // Create header/title
    const header = document.createElement('h2');
    header.className = 'section-title';
    header.textContent = 'Your Rentals';
    container.appendChild(header);
    
    // Create rentals grid
    const grid = document.createElement('div');
    grid.className = 'rentals-grid';
    
    rentals.forEach(rental => {
        const rentalCard = document.createElement('div');
        rentalCard.className = 'rental-card';
        rentalCard.dataset.rentalId = rental.rental_id;
        
        // Add status indicator
        const statusClass = rental.status.toLowerCase().replace('_', '-');
        rentalCard.classList.add(`status-${statusClass}`);
        
        // Create card content
        const imageContainer = document.createElement('div');
        imageContainer.className = 'rental-image';
        
        const img = document.createElement('img');
        img.src = rental.primary_image || '/assets/placeholder-product.jpg';
        img.alt = rental.product_name;
        imageContainer.appendChild(img);
        
        const statusBadge = document.createElement('span');
        statusBadge.className = 'status-badge';
        statusBadge.textContent = rental.status.charAt(0).toUpperCase() + rental.status.slice(1).replace('_', ' ');
        imageContainer.appendChild(statusBadge);
        
        // Card details
        const details = document.createElement('div');
        details.className = 'rental-details';
        
        details.innerHTML = `
            <h3 class="rental-product-name">${rental.product_name}</h3>
            <div class="rental-period">
                <span class="rental-dates">${formatDate(rental.start_date)} - ${formatDate(rental.end_date)}</span>
            </div>
            <div class="rental-payment">
                <span class="rental-rate">$${rental.monthly_rate}/month</span>
            </div>
            <div class="rental-progress">
                <div class="progress-bar">
                    <div class="progress-filled" style="width: ${rental.progress_percentage}%"></div>
                </div>
                <div class="progress-text">
                    <span class="progress-percent">${Math.round(rental.progress_percentage)}% Complete</span>
                    <span class="progress-fraction">${rental.paid_payments} / ${rental.total_payments} Payments</span>
                </div>
            </div>
        `;
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'rental-actions';
        
        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-outline';
        viewButton.textContent = 'View Details';
        viewButton.addEventListener('click', () => viewRentalDetails(rental.rental_id));
        actions.appendChild(viewButton);
        
        // Only show buyout button for active rentals
        if (rental.status === 'active' && rental.buyout_price > 0) {
            const buyoutButton = document.createElement('button');
            buyoutButton.className = 'btn btn-primary';
            buyoutButton.textContent = `Buyout ($${rental.buyout_price})`;
            buyoutButton.addEventListener('click', () => initiateRentalBuyout(rental.rental_id, rental.buyout_price));
            actions.appendChild(buyoutButton);
        }
        
        // Assemble card
        rentalCard.appendChild(imageContainer);
        rentalCard.appendChild(details);
        rentalCard.appendChild(actions);
        
        grid.appendChild(rentalCard);
    });
    
    container.appendChild(grid);
}

/**
 * View detailed information about a specific rental
 * @param {number} rentalId - The ID of the rental to view
 */
function viewRentalDetails(rentalId) {
    // Redirect to rental details page or open modal
    window.location.href = `/dashboard.php?view=rental&id=${rentalId}`;
}

/**
 * Initiate the buyout process for a rental
 * @param {number} rentalId - The ID of the rental to buy out
 * @param {number} buyoutAmount - The amount required to buy out the rental
 */
function initiateRentalBuyout(rentalId, buyoutAmount) {
    // Could open a modal to confirm buyout
    if (confirm(`Are you sure you want to buy out this rental for $${buyoutAmount}?`)) {
        // Show loading indicator
        showLoadingOverlay('Processing buyout...');
        
        // Redirect to checkout with buyout parameter
        window.location.href = `/checkout.php?type=buyout&rental_id=${rentalId}`;
    }
}

/**
 * Format a date string into a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorContainer = document.getElementById('error-container') || createErrorContainer();
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Auto-hide after a delay
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

/**
 * Create an error container element if it doesn't exist
 * @returns {HTMLElement} The error container element
 */
function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'error-container';
    container.className = 'error-message';
    
    document.body.appendChild(container);
    return container;
}

/**
 * Show a loading overlay during async operations
 * @param {string} message - The loading message to display
 */
function showLoadingOverlay(message = 'Loading...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-message').textContent = message;
        overlay.style.display = 'flex';
    }
}

/**
 * Hide the loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.php?redirect=${currentPath}`;
}

// Initialize the rent-to-own functionality when the DOM is ready
document.addEventListener('DOMContentLoaded', initRentToOwn);
