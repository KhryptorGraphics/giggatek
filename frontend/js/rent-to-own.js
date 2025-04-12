/**
 * GigGatek Rent-to-Own Calculator
 * 
 * This script powers the interactive rental calculator on the rent-to-own page,
 * allowing users to visualize payment options and total costs based on 
 * product selection and rental term.
 */

// Import utility modules
import { formatCurrency, formatPercentage } from './modules/formatters.js';

// Global state variables
let currentProduct = null;
let selectedTerm = 12; // Default term in months
let chartModuleLoaded = false;

// DOM elements
const elements = {
    productSelect: document.getElementById('product-select'),
    productImage: document.getElementById('product-image'),
    productName: document.getElementById('product-name'),
    productDescription: document.getElementById('product-description'),
    productDetails: document.getElementById('product-details'),
    productSpecifications: document.getElementById('product-specifications'),
    conditionRating: document.getElementById('condition-rating'),
    termOptions: document.querySelectorAll('.term-option'),
    termSlider: document.getElementById('term-slider'),
    selectedTermDisplay: document.getElementById('selected-term'),
    monthlyPayment: document.getElementById('monthly-payment'),
    purchasePrice: document.getElementById('purchase-price'),
    totalCost: document.getElementById('total-cost'),
    rentalPremium: document.getElementById('rental-premium'),
    buyout3months: document.getElementById('buyout-3months'),
    buyout6months: document.getElementById('buyout-6months'),
    buyout9months: document.getElementById('buyout-9months'),
    comparisonChart: document.getElementById('comparison-chart')
};

/**
 * Calculate the monthly rate for a product
 * 
 * @param {number} price - Product purchase price
 * @param {number} term - Rental term in months
 * @returns {number} - Monthly payment
 */
function calculateMonthlyRate(price, term) {
    // Interest rate factor (higher for shorter terms)
    let interestFactor;
    
    switch (true) {
        case (term <= 3):
            interestFactor = 0.05; // 5% markup for 3 month terms
            break;
        case (term <= 6):
            interestFactor = 0.10; // 10% markup for 6 month terms
            break;
        case (term <= 12):
            interestFactor = 0.15; // 15% markup for 12 month terms
            break;
        default:
            interestFactor = 0.20; // 20% markup for longer terms
    }
    
    // Calculate total amount to be financed with interest markup
    const totalFinanced = price * (1 + interestFactor);
    
    // Calculate monthly payment
    return totalFinanced / term;
}

/**
 * Calculate buyout amount at a specific month
 * 
 * @param {number} price - Product purchase price
 * @param {number} monthlyRate - Monthly payment amount
 * @param {number} term - Total rental term
 * @param {number} month - Current month
 * @returns {number} - Buyout amount
 */
function calculateBuyoutAmount(price, monthlyRate, term, month) {
    if (month >= term) {
        return 0; // Fully paid
    }
    
    // Total amount to be paid over the rental period
    const totalRental = monthlyRate * term;
    
    // Amount paid so far
    const amountPaid = monthlyRate * month;
    
    // Remaining amount
    return totalRental - amountPaid;
}

/**
 * Update the calculator UI with new values
 */
function updateCalculator() {
    if (!currentProduct) {
        return;
    }
    
    const price = currentProduct.price;
    const monthlyRate = calculateMonthlyRate(price, selectedTerm);
    const totalRental = monthlyRate * selectedTerm;
    const premium = totalRental - price;
    const premiumPercentage = (premium / price) * 100;
    
    // Update UI
    elements.monthlyPayment.textContent = formatCurrency(monthlyRate);
    elements.purchasePrice.textContent = formatCurrency(price);
    elements.totalCost.textContent = formatCurrency(totalRental);
    elements.rentalPremium.textContent = formatPercentage(premiumPercentage);
    
    // Update buyout options
    elements.buyout3months.textContent = formatCurrency(calculateBuyoutAmount(price, monthlyRate, selectedTerm, 3));
    elements.buyout6months.textContent = formatCurrency(calculateBuyoutAmount(price, monthlyRate, selectedTerm, 6));
    elements.buyout9months.textContent = formatCurrency(calculateBuyoutAmount(price, monthlyRate, selectedTerm, 9));
    
    // Generate chart
    generateComparisonChart(price, totalRental, monthlyRate, selectedTerm);
}

/**
 * Generate the comparison chart
 * 
 * @param {number} price - Product purchase price
 * @param {number} totalRental - Total rental cost
 * @param {number} monthlyRate - Monthly payment
 * @param {number} term - Rental term
 */
async function generateComparisonChart(price, totalRental, monthlyRate, term) {
    // Only load chart.js and the chart generator module if needed
    if (!chartModuleLoaded) {
        try {
            // Load Chart.js first
            await loadScript('https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js');
            
            // Then load our chart generator module
            chartModuleLoaded = true;
        } catch (error) {
            console.error('Failed to load chart libraries:', error);
            elements.comparisonChart.innerHTML = '<p class="error">Failed to load visualization charts. Please try again later.</p>';
            return;
        }
    }
    
    try {
        // Dynamically import the chart module
        const chartModule = await import('./modules/chart-generator.js');
        
        // Generate the chart
        await chartModule.generateComparisonChart({
            container: elements.comparisonChart,
            purchasePrice: price,
            totalRental: totalRental,
            term: term,
            monthlyRate: monthlyRate
        });
        
        // Optionally generate additional charts
        const breakdownContainer = document.createElement('div');
        breakdownContainer.className = 'chart-section cost-breakdown';
        elements.comparisonChart.appendChild(breakdownContainer);
        
        await chartModule.generateCostBreakdownChart({
            container: breakdownContainer,
            purchasePrice: price,
            totalRental: totalRental
        });
        
        const scheduleContainer = document.createElement('div');
        scheduleContainer.className = 'chart-section amortization';
        elements.comparisonChart.appendChild(scheduleContainer);
        
        await chartModule.generateAmortizationChart({
            container: scheduleContainer,
            monthlyRate: monthlyRate,
            term: term
        });
        
    } catch (error) {
        console.error('Error generating chart:', error);
        elements.comparisonChart.innerHTML = '<p class="error">Failed to generate comparison chart. Please try again later.</p>';
    }
}

/**
 * Utility function to load external scripts
 * 
 * @param {string} src - Script URL
 * @returns {Promise<void>}
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
}

/**
 * Fetch product details from API
 * 
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} - Product details
 */
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/detail.php?id=${productId}&format=json`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
}

/**
 * Load rental products for the dropdown
 * 
 * @returns {Promise<void>}
 */
async function loadRentalProducts() {
    try {
        const response = await fetch('/api/products/rental-products.php?format=json');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch rental products: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Clear current options except the placeholder
        while (elements.productSelect.options.length > 1) {
            elements.productSelect.remove(1);
        }
        
        // Add new options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.dataset.price = product.price;
            option.textContent = `${product.name} (${formatCurrency(product.price)})`;
            elements.productSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading rental products:', error);
        elements.productSelect.innerHTML = '<option value="">Error loading products</option>';
    }
}

/**
 * Display product details in the UI
 * 
 * @param {Object} product - Product details
 */
function displayProductDetails(product) {
    if (!product) {
        elements.productDetails.classList.add('empty');
        return;
    }
    
    // Update UI elements
    elements.productDetails.classList.remove('empty');
    elements.productName.textContent = product.name;
    elements.productDescription.textContent = product.description;
    
    // Update condition badge
    elements.conditionRating.textContent = product.condition || 'Good';
    elements.conditionRating.className = 'condition-badge ' + (product.condition || 'good').toLowerCase();
    
    // Set product image
    if (product.image_url) {
        elements.productImage.src = product.image_url;
        elements.productImage.alt = product.name;
    } else {
        elements.productImage.src = '/img/placeholder-product.jpg';
        elements.productImage.alt = 'Product image placeholder';
    }
    
    // Display specifications
    if (product.specifications) {
        let specHtml = '<h4>Specifications</h4><ul>';
        
        if (typeof product.specifications === 'string') {
            try {
                // Try to parse JSON if it's a string
                product.specifications = JSON.parse(product.specifications);
            } catch (e) {
                // If it's not valid JSON, just show as plain text
                specHtml += `<li>${product.specifications}</li>`;
            }
        }
        
        if (typeof product.specifications === 'object') {
            for (const [key, value] of Object.entries(product.specifications)) {
                specHtml += `<li><strong>${key}:</strong> ${value}</li>`;
            }
        }
        
        specHtml += '</ul>';
        elements.productSpecifications.innerHTML = specHtml;
    } else {
        elements.productSpecifications.innerHTML = '';
    }
}

/**
 * Initialize sliders and interactive elements
 */
function initializeUI() {
    // Slider for term selection
    if (elements.termSlider) {
        noUiSlider.create(elements.termSlider, {
            start: [selectedTerm],
            connect: true,
            step: 1,
            range: {
                'min': 3,
                'max': 24
            },
            format: {
                to: value => Math.round(value),
                from: value => parseInt(value)
            }
        });
        
        elements.termSlider.noUiSlider.on('update', (values) => {
            const term = parseInt(values[0]);
            selectedTerm = term;
            elements.selectedTermDisplay.textContent = term;
            
            // Update active term option
            elements.termOptions.forEach(option => {
                const optionTerm = parseInt(option.dataset.term);
                option.classList.toggle('active', optionTerm === term);
            });
            
            updateCalculator();
        });
    }
    
    // Term option buttons
    elements.termOptions.forEach(option => {
        option.addEventListener('click', () => {
            const term = parseInt(option.dataset.term);
            selectedTerm = term;
            
            // Update UI
            elements.termOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update slider if it exists
            if (elements.termSlider && elements.termSlider.noUiSlider) {
                elements.termSlider.noUiSlider.set(term);
            } else {
                // If slider doesn't exist, update the display manually
                elements.selectedTermDisplay.textContent = term;
                updateCalculator();
            }
        });
    });
    
    // Product selection
    elements.productSelect.addEventListener('change', async () => {
        const productId = elements.productSelect.value;
        
        if (!productId) {
            currentProduct = null;
            displayProductDetails(null);
            updateCalculator();
            return;
        }
        
        // Get initial price from the select option
        const initialPrice = parseFloat(elements.productSelect.options[elements.productSelect.selectedIndex].dataset.price);
        
        // Create a temporary product object with the initial price
        currentProduct = {
            id: productId,
            name: elements.productSelect.options[elements.productSelect.selectedIndex].textContent.split(' (')[0],
            price: initialPrice
        };
        
        // Update calculator with this basic info first for immediate feedback
        updateCalculator();
        
        // Then fetch full product details
        const product = await fetchProductDetails(productId);
        
        if (product) {
            currentProduct = {
                ...product,
                price: parseFloat(product.price || initialPrice)
            };
            
            displayProductDetails(currentProduct);
            updateCalculator();
        }
    });
}

/**
 * Main initialization function
 */
async function init() {
    try {
        // Load noUiSlider for the term slider
        await loadScript('https://cdn.jsdelivr.net/npm/nouislider@14.6.3/distribute/nouislider.min.js');
        
        // Add the noUiSlider CSS
        const sliderStyles = document.createElement('link');
        sliderStyles.rel = 'stylesheet';
        sliderStyles.href = 'https://cdn.jsdelivr.net/npm/nouislider@14.6.3/distribute/nouislider.min.css';
        document.head.appendChild(sliderStyles);
        
        // Initialize UI elements
        initializeUI();
        
        // Load rental products
        await loadRentalProducts();
        
        // If there's a product param in the URL, select it
        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');
        
        if (productParam) {
            elements.productSelect.value = productParam;
            elements.productSelect.dispatchEvent(new Event('change'));
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
