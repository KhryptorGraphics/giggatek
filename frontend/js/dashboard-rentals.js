/**
 * GigGatek Dashboard Rentals Module
 * Handles rental contract display and management in the user dashboard
 */

class DashboardRentals {
    constructor() {
        this.rentalContracts = [];
        this.currentRental = null;
        
        // Initialize module when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the rentals module
     */
    init() {
        // Check if rentals tab exists
        const rentalsTab = document.getElementById('rentals-tab');
        if (!rentalsTab) return;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Listen for dashboard tab changes
        document.addEventListener('dashboard:tabChanged', (e) => {
            if (e.detail.tab === 'rentals') {
                this.loadRentals();
            }
        });
        
        // Load rentals if tab is active on init
        if (window.dashboard && window.dashboard.activeTab === 'rentals') {
            this.loadRentals();
        }
    }
    
    /**
     * Setup event listeners for rental-related actions
     */
    setupEventListeners() {
        const rentalsTab = document.getElementById('rentals-tab');
        if (!rentalsTab) return;
        
        // Event delegation for rental actions
        rentalsTab.addEventListener('click', (e) => {
            // Rental card click
            if (e.target.closest('.rental-card')) {
                const rentalCard = e.target.closest('.rental-card');
                const rentalId = rentalCard.dataset.rentalId;
                
                if (rentalId) {
                    this.displayRentalDetails(rentalId);
                }
            }
            
            // Back to rentals list button
            if (e.target.matches('.back-to-rentals')) {
                this.showRentalsList();
            }
            
            // Make payment button
            if (e.target.matches('.make-payment')) {
                const rentalId = e.target.dataset.rentalId;
                if (rentalId) {
                    this.makePayment(rentalId);
                }
            }
            
            // Early buyout button
            if (e.target.matches('.early-buyout')) {
                const rentalId = e.target.dataset.rentalId;
                if (rentalId) {
                    this.initiateEarlyBuyout(rentalId);
                }
            }
            
            // Download contract button
            if (e.target.matches('.download-contract')) {
                const rentalId = e.target.dataset.rentalId;
                if (rentalId) {
                    this.downloadContract(rentalId);
                }
            }
            
            // View payment history button
            if (e.target.matches('.view-payment-history')) {
                const rentalId = e.target.dataset.rentalId;
                if (rentalId) {
                    this.viewPaymentHistory(rentalId);
                }
            }
        });
        
        // Rental status filter
        const rentalFilterSelect = document.getElementById('rental-filter');
        if (rentalFilterSelect) {
            rentalFilterSelect.addEventListener('change', () => {
                this.filterRentals(rentalFilterSelect.value);
            });
        }
        
        // Rental search
        const rentalSearchInput = document.getElementById('rental-search');
        if (rentalSearchInput) {
            rentalSearchInput.addEventListener('input', () => {
                this.searchRentals(rentalSearchInput.value);
            });
        }
    }
    
    /**
     * Load user rental contracts from API
     */
    async loadRentals() {
        const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
        if (!rentalsContainer) return;
        
        // Show loading state
        rentalsContainer.innerHTML = '<div class="loading">Loading rental contracts...</div>';
        
        try {
            const response = await fetch('/api/user/rentals', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load rental contracts: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.rentalContracts = data.rentalContracts || [];
                
                // Render rentals
                this.renderRentals();
            } else {
                throw new Error(data.message || 'Failed to load rental contracts');
            }
        } catch (error) {
            console.error('Error loading rental contracts:', error);
            
            rentalsContainer.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading your rental contracts.</p>
                    <button id="retry-load-rentals" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-rentals');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.loadRentals());
            }
        }
    }
    
    /**
     * Render rental contracts in the rentals list container
     */
    renderRentals() {
        const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
        if (!rentalsContainer) return;
        
        // Clear container
        rentalsContainer.innerHTML = '';
        
        // Show empty state if no rentals
        if (this.rentalContracts.length === 0) {
            rentalsContainer.innerHTML = `
                <div class="no-data">
                    <p>You don't have any active rental contracts.</p>
                    <a href="/rent-to-own.php" class="btn btn-primary">Browse Rent-to-Own Options</a>
                </div>
            `;
            return;
        }
        
        // Add filters & search if we have rentals
        let filtersHtml = '';
        if (this.rentalContracts.length > 0) {
            filtersHtml = `
                <div class="rentals-filter-container">
                    <div class="rental-search">
                        <input type="text" id="rental-search" placeholder="Search rentals" class="form-control">
                    </div>
                    <div class="rental-filter">
                        <select id="rental-filter" class="form-control">
                            <option value="all">All Contracts</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            `;
            rentalsContainer.innerHTML = filtersHtml;
        }
        
        // Create rentals list
        const rentalsList = document.createElement('div');
        rentalsList.className = 'rentals-cards-container';
        
        this.rentalContracts.forEach(rental => {
            const rentalCard = document.createElement('div');
            rentalCard.className = `rental-card status-${rental.status.toLowerCase()}`;
            rentalCard.dataset.rentalId = rental.id;
            
            // Format dates
            const startDate = new Date(rental.start_date);
            const formattedStartDate = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const nextPaymentDate = new Date(rental.next_payment_date);
            const formattedNextPaymentDate = nextPaymentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Status badge class based on status
            let statusBadgeClass = 'status-badge ';
            switch (rental.status.toLowerCase()) {
                case 'active':
                    statusBadgeClass += 'status-active';
                    break;
                case 'completed':
                    statusBadgeClass += 'status-completed';
                    break;
                case 'cancelled':
                    statusBadgeClass += 'status-cancelled';
                    break;
                default:
                    statusBadgeClass += 'status-active';
            }
            
            // Calculate progress percentage
            const progressPercent = (rental.payments_made / rental.total_payments) * 100;
            
            rentalCard.innerHTML = `
                <div class="rental-header">
                    <div class="contract-number">Contract #${rental.contract_number}</div>
                    <div class="${statusBadgeClass}">${rental.status}</div>
                </div>
                <div class="rental-content">
                    <div class="product-info">
                        <div class="product-image">
                            <img src="${rental.product_image}" alt="${rental.product_name}">
                        </div>
                        <div class="product-details">
                            <div class="product-name">${rental.product_name}</div>
                            <div class="rental-start-date">Started: ${formattedStartDate}</div>
                            <div class="monthly-payment">$${rental.monthly_payment}/month</div>
                        </div>
                    </div>
                    <div class="rental-progress">
                        <div class="progress-bar">
                            <div class="progress-filled" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${rental.payments_made} of ${rental.total_payments} payments</span>
                        </div>
                    </div>
                    ${rental.status === 'active' ? `
                        <div class="next-payment">
                            Next payment: ${formattedNextPaymentDate}
                        </div>
                    ` : ''}
                </div>
                <div class="rental-actions">
                    <span class="rental-details-link">View Details</span>
                </div>
            `;
            
            rentalsList.appendChild(rentalCard);
        });
        
        rentalsContainer.appendChild(rentalsList);
    }
    
    /**
     * Display rental contract details
     * @param {string} rentalId - Rental ID to display
     */
    async displayRentalDetails(rentalId) {
        const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
        if (!rentalsContainer) return;
        
        // Show loading state
        rentalsContainer.innerHTML = '<div class="loading">Loading rental details...</div>';
        
        try {
            const response = await fetch(`/api/user/rentals/${rentalId}`, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load rental details: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.rentalContract) {
                this.currentRental = data.rentalContract;
                
                // Render rental details
                this.renderRentalDetails();
            } else {
                throw new Error(data.message || 'Failed to load rental details');
            }
        } catch (error) {
            console.error('Error loading rental details:', error);
            
            rentalsContainer.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading the rental details.</p>
                    <button class="back-to-rentals btn btn-secondary">Back to Rentals</button>
                    <button id="retry-load-rental-details" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-rental-details');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.displayRentalDetails(rentalId));
            }
        }
    }
    
    /**
     * Render rental contract details
     */
    renderRentalDetails() {
        const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
        if (!rentalsContainer || !this.currentRental) return;
        
        const rental = this.currentRental;
        
        // Format dates
        const startDate = new Date(rental.start_date);
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const endDate = new Date(rental.end_date);
        const formattedEndDate = endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const nextPaymentDate = new Date(rental.next_payment_date);
        const formattedNextPaymentDate = nextPaymentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status badge class based on status
        let statusBadgeClass = 'status-badge ';
        switch (rental.status.toLowerCase()) {
            case 'active':
                statusBadgeClass += 'status-active';
                break;
            case 'completed':
                statusBadgeClass += 'status-completed';
                break;
            case 'cancelled':
                statusBadgeClass += 'status-cancelled';
                break;
            default:
                statusBadgeClass += 'status-active';
        }
        
        // Calculate progress percentage
        const progressPercent = (rental.payments_made / rental.total_payments) * 100;
        
        // Calculate total cost and savings
        const totalCost = parseFloat(rental.monthly_payment) * rental.total_payments;
        const originalPrice = parseFloat(rental.original_price);
        const savings = originalPrice > totalCost ? originalPrice - totalCost : 0;
        
        // Calculate remaining balance
        const remainingBalance = this.calculateRemainingBalance(rental);
        
        // Determine rental actions based on status
        let rentalActionsHtml = '';
        if (rental.status.toLowerCase() === 'active') {
            rentalActionsHtml = `
                <button class="btn btn-primary make-payment" data-rental-id="${rental.id}">Make Payment</button>
            `;
            
            if (rental.purchase_option_available) {
                rentalActionsHtml += `
                    <button class="btn btn-secondary early-buyout" data-rental-id="${rental.id}">Early Buyout</button>
                `;
            }
        }
        
        // Add download contract button for all contracts
        rentalActionsHtml += `
            <button class="btn btn-link download-contract" data-rental-id="${rental.id}">Download Contract</button>
        `;
        
        // Build the final HTML
        rentalsContainer.innerHTML = `
            <div class="rental-details-container">
                <div class="rental-details-header">
                    <button class="back-to-rentals btn btn-link"><i class="icon-chevron-left"></i> Back to Rentals</button>
                    <h2>Contract #${rental.contract_number}</h2>
                    <div class="rental-details-meta">
                        <div class="rental-date">Started: ${formattedStartDate}</div>
                        <div class="${statusBadgeClass}">${rental.status}</div>
                    </div>
                </div>
                
                <div class="rental-product-container">
                    <div class="product-image">
                        <img src="${rental.product_image}" alt="${rental.product_name}">
                    </div>
                    <div class="product-details">
                        <h3 class="product-name">${rental.product_name}</h3>
                        <div class="original-price">Original Price: $${rental.original_price}</div>
                        <div class="monthly-payment">Monthly Payment: $${rental.monthly_payment}</div>
                        <div class="contract-term">Term: ${rental.total_payments} months</div>
                    </div>
                </div>
                
                <div class="rental-progress-container">
                    <h3>Payment Progress</h3>
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-filled" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${rental.payments_made} of ${rental.total_payments} payments completed</span>
                            <span>${Math.round(progressPercent)}% complete</span>
                        </div>
                    </div>
                    
                    <div class="payment-info-grid">
                        <div class="payment-info-card">
                            <h4>Remaining Balance</h4>
                            <div class="amount">$${remainingBalance.toFixed(2)}</div>
                        </div>
                        
                        <div class="payment-info-card">
                            <h4>Total Cost</h4>
                            <div class="amount">$${totalCost.toFixed(2)}</div>
                        </div>
                        
                        ${savings > 0 ? `
                            <div class="payment-info-card savings">
                                <h4>Your Savings</h4>
                                <div class="amount">$${savings.toFixed(2)}</div>
                            </div>
                        ` : ''}
                        
                        ${rental.status === 'active' ? `
                            <div class="payment-info-card next-payment">
                                <h4>Next Payment</h4>
                                <div class="date">${formattedNextPaymentDate}</div>
                                <div class="amount">$${rental.monthly_payment}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${rental.purchase_option_available ? `
                        <div class="early-buyout-option">
                            <h4>Early Buyout Option</h4>
                            <p>You can complete your purchase now for a one-time payment of $${rental.purchase_price}.</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="contract-details-container">
                    <h3>Contract Details</h3>
                    <div class="contract-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Contract Number:</span>
                            <span class="detail-value">${rental.contract_number}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Start Date:</span>
                            <span class="detail-value">${formattedStartDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">End Date:</span>
                            <span class="detail-value">${formattedEndDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${rental.status}</span>
                        </div>
                    </div>
                    
                    <div class="payment-history-link">
                        <button class="btn btn-link view-payment-history" data-rental-id="${rental.id}">View Payment History</button>
                    </div>
                </div>
                
                <div class="rental-actions-container">
                    ${rentalActionsHtml}
                </div>
            </div>
        `;
    }
    
    /**
     * Calculate remaining balance for a rental contract
     * @param {Object} rental - Rental contract
     * @returns {number} - Remaining balance
     */
    calculateRemainingBalance(rental) {
        return rental.remaining_payments * parseFloat(rental.monthly_payment);
    }
    
    /**
     * Show rentals list (go back from rental details)
     */
    showRentalsList() {
        this.currentRental = null;
        this.renderRentals();
    }
    
    /**
     * Filter rental contracts by status
     * @param {string} status - Status to filter by
     */
    filterRentals(status) {
        const rentalCards = document.querySelectorAll('.rental-card');
        
        if (status === 'all') {
            rentalCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        rentalCards.forEach(card => {
            if (card.classList.contains(`status-${status}`)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Search rental contracts by text
     * @param {string} searchText - Text to search for
     */
    searchRentals(searchText) {
        const rentalCards = document.querySelectorAll('.rental-card');
        const lowerSearchText = searchText.toLowerCase();
        
        if (!searchText.trim()) {
            rentalCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        rentalCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(lowerSearchText)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Make a payment on a rental contract
     * @param {string} rentalId - Rental ID to make payment on
     */
    makePayment(rentalId) {
        // In a real app, this would redirect to a payment page or open a payment modal
        // For this demo, we'll redirect to a payment page
        window.location.href = `/rental-payment.php?rental_id=${rentalId}`;
    }
    
    /**
     * Initiate early buyout process
     * @param {string} rentalId - Rental ID to buy out
     */
    initiateEarlyBuyout(rentalId) {
        const rental = this.rentalContracts.find(r => r.id === rentalId) || this.currentRental;
        
        if (!rental || !rental.purchase_option_available) {
            alert('Early buyout option is not available for this rental contract.');
            return;
        }
        
        if (confirm(`Would you like to complete your purchase for a one-time payment of $${rental.purchase_price}?`)) {
            // In a real app, this would redirect to a payment page or open a payment modal
            window.location.href = `/rental-buyout.php?rental_id=${rentalId}`;
        }
    }
    
    /**
     * Download rental contract PDF
     * @param {string} rentalId - Rental ID to download contract for
     */
    async downloadContract(rentalId) {
        try {
            const response = await fetch(`/api/user/rentals/${rentalId}/contract`, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders()
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to download contract: ${response.status}`);
            }
            
            // Get the blob from the response
            const blob = await response.blob();
            
            // Create object URL for the blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link and click it to download
            const a = document.createElement('a');
            a.href = url;
            a.download = `contract-${rentalId}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading contract:', error);
            alert('There was a problem downloading the contract. Please try again later.');
        }
    }
    
    /**
     * View payment history for a rental contract
     * @param {string} rentalId - Rental ID to view payment history for
     */
    async viewPaymentHistory(rentalId) {
        // In this implementation, we load payment history dynamically
        const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
        if (!rentalsContainer) return;
        
        // Get the rental details container
        const rentalDetailsContainer = rentalsContainer.querySelector('.rental-details-container');
        if (!rentalDetailsContainer) return;
        
        // Create or update payment history section
        let paymentHistorySection = rentalsContainer.querySelector('.payment-history-section');
        
        if (!paymentHistorySection) {
            paymentHistorySection = document.createElement('div');
            paymentHistorySection.className = 'payment-history-section';
            rentalDetailsContainer.appendChild(paymentHistorySection);
        }
        
        // Show loading state
        paymentHistorySection.innerHTML = '<div class="loading">Loading payment history...</div>';
        
        try {
            const response = await fetch(`/api/user/rentals/${rentalId}/payments`, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load payment history: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.payments) {
                // Render payment history
                this.renderPaymentHistory(paymentHistorySection, data.payments);
            } else {
                throw new Error(data.message || 'Failed to load payment history');
            }
        } catch (error) {
            console.error('Error loading payment history:', error);
            
            paymentHistorySection.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading the payment history.</p>
                    <button id="retry-load-payment-history" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-payment-history');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.viewPaymentHistory(rentalId));
            }
        }
    }
    
    /**
     * Render payment history
     * @param {HTMLElement} container - Container to render payment history in
     * @param {Array} payments - Array of payment objects
     */
    renderPaymentHistory(container, payments) {
        if (!container || !payments) return;
        
        // Build payment history HTML
        let paymentHistoryHtml = `
            <h3>Payment History</h3>
            <button class="close-payment-history btn btn-link">Close</button>
        `;
        
        if (payments.length === 0) {
            paymentHistoryHtml += `
                <div class="no-data">
                    <p>No payment records found.</p>
                </div>
            `;
        } else {
            paymentHistoryHtml += `
                <div class="payment-history-table">
                    <div class="payment-history-header">
                        <div class="payment-date">Date</div>
                        <div class="payment-amount">Amount</div>
                        <div class="payment-method">Payment Method</div>
                        <div class="payment-status">Status</div>
                    </div>
                    <div class="payment-history-rows">
            `;
            
            payments.forEach(payment => {
                // Format payment date
                const paymentDate = new Date(payment.date);
                const formattedDate = paymentDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Determine status class
                let statusClass = '';
                switch (payment.status.toLowerCase()) {
                    case 'paid':
                        statusClass = 'status-success';
                        break;
                    case 'pending':
                        statusClass = 'status-pending';
                        break;
                    case 'failed':
                        statusClass = 'status-failed';
                        break;
                    default:
                        statusClass = '';
                }
                
                paymentHistoryHtml += `
                    <div class="payment-row">
                        <div class="payment-date">${formattedDate}</div>
                        <div class="payment-amount">$${payment.amount}</div>
                        <div class="payment-method">${payment.payment_method}</div>
                        <div class="payment-status ${statusClass}">${payment.status}</div>
                    </div>
                `;
            });
            
            paymentHistoryHtml += `
                    </div>
                </div>
            `;
        }
        
        // Set the HTML
        container.innerHTML = paymentHistoryHtml;
        
        // Add close button event listener
        const closeButton = container.querySelector('.close-payment-history');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                container.remove();
            });
        }
    }
}

// Initialize the DashboardRentals module
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardRentals = new DashboardRentals();
});
