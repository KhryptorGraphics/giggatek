/**
 * GigGatek Rentals Module
 * Handles rental contracts, payments, and related functionality for the user dashboard
 */

class RentalsManager {
    constructor() {
        this.rentalsApiUrl = '/api/rentals';
        this.rentalsPerPage = 5;
        this.currentPage = 1;
        
        // Initialize module when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the module
     */
    init() {
        // Get rentals container
        const rentalsContainer = document.getElementById('rentals-tab');
        if (!rentalsContainer) return;
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Load rentals
        this.loadRentals();
    }
    
    /**
     * Setup all event handlers for the rentals panel
     */
    setupEventHandlers() {
        // Handle pagination buttons
        document.addEventListener('click', (e) => {
            // Next page
            if (e.target.classList.contains('rental-pagination-next') || e.target.closest('.rental-pagination-next')) {
                e.preventDefault();
                this.nextPage();
            }
            
            // Previous page
            if (e.target.classList.contains('rental-pagination-prev') || e.target.closest('.rental-pagination-prev')) {
                e.preventDefault();
                this.prevPage();
            }
            
            // View rental details
            if (e.target.classList.contains('view-rental') || e.target.closest('.view-rental')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                const rentalId = rentalCard ? rentalCard.dataset.rentalId : null;
                if (rentalId) {
                    this.viewRentalDetails(rentalId);
                }
            }
            
            // Pay early
            if (e.target.classList.contains('pay-early') || e.target.closest('.pay-early')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                const rentalId = rentalCard ? rentalCard.dataset.rentalId : null;
                if (rentalId) {
                    this.initiateEarlyPayment(rentalId);
                }
            }
            
            // Upgrade hardware
            if (e.target.classList.contains('upgrade-hardware') || e.target.closest('.upgrade-hardware')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                const rentalId = rentalCard ? rentalCard.dataset.rentalId : null;
                if (rentalId) {
                    this.viewUpgradeOptions(rentalId);
                }
            }
        });
        
        // Filter by status
        const statusFilter = document.getElementById('rental-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.loadRentals();
            });
        }
        
        // Search rentals
        const searchForm = document.getElementById('rental-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.currentPage = 1;
                this.loadRentals();
            });
        }
    }
    
    /**
     * Get authentication headers for API requests (from auth module)
     * @returns {Object} Headers object with Authorization header
     */
    getAuthHeaders() {
        return window.auth ? window.auth.getAuthHeaders() : {};
    }
    
    /**
     * Load rentals from API
     */
    async loadRentals() {
        const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
        if (!rentalsContainer) return;
        
        try {
            // Show loading state
            rentalsContainer.innerHTML = '<div class="loading">Loading rental contracts...</div>';
            
            // Get filter and search values
            const statusFilter = document.getElementById('rental-status-filter');
            const status = statusFilter ? statusFilter.value : '';
            
            const searchInput = document.getElementById('rental-search');
            const search = searchInput ? searchInput.value : '';
            
            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.rentalsPerPage
            });
            
            if (status && status !== 'all') {
                params.append('status', status);
            }
            
            if (search) {
                params.append('search', search);
            }
            
            // Make API request
            const response = await fetch(`${this.rentalsApiUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load rental contracts');
            }
            
            // Clear container
            rentalsContainer.innerHTML = '';
            
            // Render rentals
            if (data.rentals && data.rentals.length > 0) {
                data.rentals.forEach(rental => {
                    const rentalHtml = this.renderRentalCard(rental);
                    rentalsContainer.insertAdjacentHTML('beforeend', rentalHtml);
                });
                
                // Update pagination
                this.updatePagination(data.pagination);
            } else {
                rentalsContainer.innerHTML = `
                    <div class="no-data">
                        <p>No rental contracts found.</p>
                        ${search || (status && status !== 'all') ? 
                            '<p>Try adjusting your search criteria or view all rentals.</p>' : ''}
                        <p><a href="/rent-to-own.php" class="btn btn-primary">Explore Rent-to-Own Options</a></p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading rentals:', error);
            // Show error message
            const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
            if (rentalsContainer) {
                rentalsContainer.innerHTML = `
                    <div class="error">
                        <p>Error loading rental contracts. Please try again later.</p>
                        <button class="btn btn-primary retry-btn">Retry</button>
                    </div>
                `;
                
                // Add retry button handler
                const retryBtn = rentalsContainer.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => this.loadRentals());
                }
            }
        }
    }
    
    /**
     * Render a rental card
     * @param {Object} rental - Rental contract data
     * @returns {string} HTML for the rental card
     */
    renderRentalCard(rental) {
        // Format dates
        const startDate = new Date(rental.start_date);
        const endDate = new Date(rental.end_date);
        
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const formattedEndDate = endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Format pricing
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        
        const formattedMonthlyPayment = formatter.format(rental.monthly_payment);
        const formattedRemainingBalance = formatter.format(rental.remaining_balance);
        const formattedTotalValue = formatter.format(rental.total_value);
        
        // Calculate payment progress
        const totalPayments = rental.term_months;
        const completedPayments = rental.payments ? rental.payments.filter(p => p.status === 'paid').length : 0;
        const progressPercent = Math.round((completedPayments / totalPayments) * 100);
        
        // Get next payment info
        const nextPayment = this.getNextPayment(rental.payments);
        
        // Get status badge class
        const statusClass = this.getStatusBadgeClass(rental.status);
        
        return `
            <div class="rental-card" data-rental-id="${rental.id}">
                <div class="rental-header">
                    <div class="rental-title">${rental.product_name}</div>
                    <div class="rental-status">
                        <span class="status-badge ${statusClass}">${this.formatStatus(rental.status)}</span>
                    </div>
                </div>
                <div class="rental-body">
                    <div class="rental-details">
                        <div class="rental-dates">
                            <span class="label">Term:</span> ${formattedStartDate} - ${formattedEndDate} (${rental.term_months} months)
                        </div>
                        <div class="rental-payment">
                            <span class="label">Monthly Payment:</span> ${formattedMonthlyPayment}
                        </div>
                        <div class="rental-remaining">
                            <span class="label">Remaining Balance:</span> ${formattedRemainingBalance}
                        </div>
                        <div class="rental-value">
                            <span class="label">Total Value:</span> ${formattedTotalValue}
                        </div>
                    </div>
                    <div class="rental-progress">
                        <div class="progress-label">
                            <span>Payment Progress: ${completedPayments} of ${totalPayments} payments</span>
                            <span>${progressPercent}%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    ${nextPayment ? `
                        <div class="next-payment">
                            <div class="payment-label">Next Payment:</div>
                            <div class="payment-details">
                                <div class="payment-amount">${formatter.format(nextPayment.amount)}</div>
                                <div class="payment-date">Due on ${new Date(nextPayment.due_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="rental-footer">
                    <button class="btn btn-sm btn-outline-primary view-rental">View Details</button>
                    ${rental.status === 'active' ? `<button class="btn btn-sm btn-outline-success pay-early">Pay Early</button>` : ''}
                    ${rental.status === 'active' ? `<button class="btn btn-sm btn-outline-info upgrade-hardware">Upgrade Hardware</button>` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Get the next upcoming payment
     * @param {Array} payments - Array of payment objects
     * @returns {Object|null} Next payment or null if no upcoming payments
     */
    getNextPayment(payments) {
        if (!payments || !payments.length) return null;
        
        const upcomingPayments = payments.filter(payment => payment.status === 'due' || payment.status === 'pending');
        if (!upcomingPayments.length) return null;
        
        // Sort by due date ascending
        upcomingPayments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        
        return upcomingPayments[0];
    }
    
    /**
     * Format rental status
     * @param {string} status - Rental status
     * @returns {string} Formatted status label
     */
    formatStatus(status) {
        const statusLabels = {
            'active': 'Active',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'pending': 'Pending Activation',
            'overdue': 'Payment Overdue'
        };
        
        return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    /**
     * Get the CSS class for the status badge
     * @param {string} status - Rental status
     * @returns {string} CSS class name
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'active': 'status-active',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled',
            'pending': 'status-pending',
            'overdue': 'status-overdue'
        };
        
        return statusClasses[status] || 'status-default';
    }
    
    /**
     * Update pagination controls
     * @param {Object} pagination - Pagination data from API
     */
    updatePagination(pagination) {
        const paginationContainer = document.querySelector('#rentals-tab .pagination');
        if (!paginationContainer) return;
        
        // Set total pages
        this.totalPages = pagination.total_pages || 1;
        
        // Update pagination text
        const paginationText = paginationContainer.querySelector('.pagination-text');
        if (paginationText) {
            paginationText.textContent = `Page ${pagination.page} of ${pagination.total_pages}`;
        }
        
        // Update previous button
        const prevButton = paginationContainer.querySelector('.rental-pagination-prev');
        if (prevButton) {
            prevButton.disabled = pagination.page <= 1;
        }
        
        // Update next button
        const nextButton = paginationContainer.querySelector('.rental-pagination-next');
        if (nextButton) {
            nextButton.disabled = pagination.page >= pagination.total_pages;
        }
    }
    
    /**
     * Go to next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadRentals();
            
            // Scroll to top of rentals container
            const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
            if (rentalsContainer) {
                rentalsContainer.scrollTop = 0;
            }
        }
    }
    
    /**
     * Go to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadRentals();
            
            // Scroll to top of rentals container
            const rentalsContainer = document.querySelector('#rentals-tab .rentals-list');
            if (rentalsContainer) {
                rentalsContainer.scrollTop = 0;
            }
        }
    }
    
    /**
     * View rental details
     * @param {string} rentalId - The rental ID to view
     */
    async viewRentalDetails(rentalId) {
        try {
            // Create modal if it doesn't exist
            let rentalModal = document.getElementById('rental-details-modal');
            if (!rentalModal) {
                rentalModal = document.createElement('div');
                rentalModal.id = 'rental-details-modal';
                rentalModal.className = 'modal';
                rentalModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="rental-details-container">
                            <div class="loading">Loading rental details...</div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(rentalModal);
                
                // Close button functionality
                const closeBtn = rentalModal.querySelector('.close');
                closeBtn.addEventListener('click', () => {
                    rentalModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', (event) => {
                    if (event.target === rentalModal) {
                        rentalModal.style.display = 'none';
                    }
                });
            }
            
            // Show modal
            rentalModal.style.display = 'block';
            
            // Get rental details container
            const rentalDetailsContainer = rentalModal.querySelector('.rental-details-container');
            
            // Show loading
            rentalDetailsContainer.innerHTML = '<div class="loading">Loading rental details...</div>';
            
            // Fetch rental details
            const response = await fetch(`${this.rentalsApiUrl}/${rentalId}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load rental details');
            }
            
            const rental = data.rental;
            
            // Format dates
            const startDate = new Date(rental.start_date);
            const endDate = new Date(rental.end_date);
            
            const formattedStartDate = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const formattedEndDate = endDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Format prices
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Get status badge class
            const statusClass = this.getStatusBadgeClass(rental.status);
            
            // Calculate payment progress
            const totalPayments = rental.term_months;
            const completedPayments = rental.payments ? rental.payments.filter(p => p.status === 'paid').length : 0;
            const progressPercent = Math.round((completedPayments / totalPayments) * 100);
            
            // Get next payment
            const nextPayment = this.getNextPayment(rental.payments);
            
            // Render rental details
            rentalDetailsContainer.innerHTML = `
                <h2>Rental Contract Details</h2>
                <div class="rental-meta">
                    <div class="rental-id">
                        <strong>Contract #:</strong> ${rental.contract_number || rental.id}
                    </div>
                    <div class="rental-term">
                        <strong>Term:</strong> ${rental.term_months} months (${formattedStartDate} - ${formattedEndDate})
                    </div>
                    <div class="rental-status">
                        <strong>Status:</strong> <span class="status-badge ${statusClass}">${this.formatStatus(rental.status)}</span>
                    </div>
                </div>
                
                <h3>Product Information</h3>
                <div class="product-details">
                    <div class="product-image">
                        <img src="${rental.product_image || '/img/product-placeholder.jpg'}" alt="${rental.product_name}">
                    </div>
                    <div class="product-info">
                        <h4>${rental.product_name}</h4>
                        <div class="product-specs">
                            ${rental.product_specs ? rental.product_specs.map(spec => `<div class="spec">${spec}</div>`).join('') : ''}
                        </div>
                        <div class="product-description">${rental.product_description || ''}</div>
                    </div>
                </div>
                
                <h3>Payment Information</h3>
                <div class="payment-details">
                    <div class="payment-terms">
                        <div><strong>Monthly Payment:</strong> ${formatter.format(rental.monthly_payment)}</div>
                        <div><strong>Remaining Balance:</strong> ${formatter.format(rental.remaining_balance)}</div>
                        <div><strong>Total Contract Value:</strong> ${formatter.format(rental.total_value)}</div>
                        ${rental.early_payoff_balance ? `<div><strong>Early Payoff Balance:</strong> ${formatter.format(rental.early_payoff_balance)}</div>` : ''}
                    </div>
                    
                    <div class="rental-progress">
                        <div class="progress-label">
                            <span>Payment Progress: ${completedPayments} of ${totalPayments} payments</span>
                            <span>${progressPercent}%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    
                    ${nextPayment ? `
                        <div class="next-payment-box">
                            <h4>Next Payment</h4>
                            <div class="next-payment-amount">${formatter.format(nextPayment.amount)}</div>
                            <div class="next-payment-date">Due on ${new Date(nextPayment.due_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</div>
                            <button class="btn btn-primary make-payment" data-payment-id="${nextPayment.id}">Make Payment</button>
                        </div>
                    ` : ''}
                </div>
                
                <h3>Payment History</h3>
                <div class="payment-history">
                    ${rental.payments && rental.payments.length ? `
                        <table class="payment-table">
                            <thead>
                                <tr>
                                    <th>Payment #</th>
                                    <th>Due Date</th>
                                    <th>Payment Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rental.payments.map((payment, index) => `
                                    <tr class="payment-row ${payment.status}">
                                        <td>${index + 1}</td>
                                        <td>${new Date(payment.due_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</td>
                                        <td>${payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : '-'}</td>
                                        <td>${formatter.format(payment.amount)}</td>
                                        <td><span class="payment-status ${payment.status}">${this.formatPaymentStatus(payment.status)}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<div class="no-data">No payment history available.</div>'}
                </div>
                
                <div class="rental-actions">
                    <button class="btn btn-secondary close-modal">Close</button>
                    ${rental.status === 'active' ? `
                        <button class="btn btn-success pay-early" data-rental-id="${rental.id}">Pay Off Early</button>
                        <button class="btn btn-info upgrade-hardware" data-rental-id="${rental.id}">Upgrade Hardware</button>
                    ` : ''}
                    ${rental.status === 'active' && nextPayment ? `
                        <button class="btn btn-primary make-payment" data-payment-id="${nextPayment.id}">Make Payment</button>
                    ` : ''}
                </div>
            `;
            
            // Add close button functionality
            const closeModalBtn = rentalDetailsContainer.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    rentalModal.style.display = 'none';
                });
            }
            
            // Pay early button
            const payEarlyBtn = rentalDetailsContainer.querySelector('.pay-early');
            if (payEarlyBtn) {
                payEarlyBtn.addEventListener('click', () => {
                    this.initiateEarlyPayment(rental.id);
                });
            }
            
            // Upgrade hardware button
            const upgradeBtn = rentalDetailsContainer.querySelector('.upgrade-hardware');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    this.viewUpgradeOptions(rental.id);
                });
            }
            
            // Make payment button
            const makePaymentBtn = rentalDetailsContainer.querySelector('.make-payment');
            if (makePaymentBtn) {
                makePaymentBtn.addEventListener('click', () => {
                    const paymentId = makePaymentBtn.dataset.paymentId;
                    this.makePayment(paymentId);
                });
            }
            
        } catch (error) {
            console.error('Error viewing rental details:', error);
            
            // Show error message in modal
            const rentalModal = document.getElementById('rental-details-modal');
            if (rentalModal) {
                const rentalDetailsContainer = rentalModal.querySelector('.rental-details-container');
                if (rentalDetailsContainer) {
                    rentalDetailsContainer.innerHTML = `
                        <div class="error">
                            <p>Error loading rental details. Please try again later.</p>
                            <button class="btn btn-primary retry-btn">Retry</button>
                            <button class="btn btn-secondary close-modal">Close</button>
                        </div>
                    `;
                    
                    // Add retry button handler
                    const retryBtn = rentalDetailsContainer.querySelector('.retry-btn');
                    if (retryBtn) {
                        retryBtn.addEventListener('click', () => this.viewRentalDetails(rentalId));
                    }
                    
                    // Add close button handler
                    const closeModalBtn = rentalDetailsContainer.querySelector('.close-modal');
                    if (closeModalBtn) {
                        closeModalBtn.addEventListener('click', () => {
                            rentalModal.style.display = 'none';
                        });
                    }
                }
            }
        }
    }
    
    /**
     * Format payment status
     * @param {string} status - Payment status
     * @returns {string} Formatted status label
     */
    formatPaymentStatus(status) {
        const statusLabels = {
            'paid': 'Paid',
            'due': 'Due',
            'pending': 'Processing',
            'overdue': 'Overdue',
            'cancelled': 'Cancelled'
        };
        
        return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    /**
     * Initiate early payment for a rental
     * @param {string} rentalId - The rental ID to pay early
     */
    async initiateEarlyPayment(rentalId) {
        try {
            // Get early payoff information
            const response = await fetch(`${this.rentalsApiUrl}/${rentalId}/early-payoff`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get early payoff information');
            }
            
            // Create modal if it doesn't exist
            let payoffModal = document.getElementById('early-payoff-modal');
            if (!payoffModal) {
                payoffModal = document.createElement('div');
                payoffModal.id = 'early-payoff-modal';
                payoffModal.className = 'modal';
                payoffModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="early-payoff-container"></div>
                    </div>
                `;
                
                document.body.appendChild(payoffModal);
                
                // Close button functionality
                const closeBtn = payoffModal.querySelector('.close');
                closeBtn.addEventListener('click', () => {
                    payoffModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', (event) => {
                    if (event.target === payoffModal) {
                        payoffModal.style.display = 'none';
                    }
                });
            }
            
            // Format prices
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Update payoff container
            const payoffContainer = payoffModal.querySelector('.early-payoff-container');
            if (!payoffContainer) return;
            
            // Get discount info
            const regularPayoff = data.regular_payoff_amount;
            const discountedPayoff = data.early_payoff_amount;
            const discount = regularPayoff - discountedPayoff;
            const discountPercent = Math.round((discount / regularPayoff) * 100);
            
            // Render payoff information
            payoffContainer.innerHTML = `
                <h2>Early Payoff Options</h2>
                <div class="payoff-product">
                    <strong>Product:</strong> ${data.product_name}
                </div>
                
                <div class="payoff-info">
                    <p>You can save money by paying off your rental early! Here are your options:</p>
                    
                    <div class="payoff-options">
                        <div class="payoff-option early">
                            <h3>Early Payoff</h3>
                            <div class="payoff-amount">${formatter.format(data.early_payoff_amount)}</div>
                            <div class="payoff-discount">Save ${formatter.format(discount)} (${discountPercent}% off)</div>
                            <button class="btn btn-primary process-early-payoff" data-rental-id="${rentalId}">Pay Now</button>
                        </div>
                        
                        <div class="payoff-option regular">
                            <h3>Continue Monthly Payments</h3>
                            <div class="remaining-payments">${data.remaining_payments} payments remaining</div>
                            <div class="monthly-amount">${formatter.format(data.monthly_payment)} per month</div>
                            <div class="total-remaining">Total: ${formatter.format(data.regular_payoff_amount)}</div>
                        </div>
                    </div>
                    
                    <div class="payoff-terms">
                        <p>By paying off early:</p>
                        <ul>
                            <li>You'll own the product immediately</li>
                            <li>No more monthly payments</li>
                            <li>Full warranty remains in effect</li>
                            <li>You'll save ${formatter.format(discount)} compared to remaining payments</li>
                        </ul>
                    </div>
                </div>
                
                <div class="payoff-actions">
                    <button class="btn btn-secondary close-modal">Close</button>
                    <button class="btn btn-primary process-early-payoff" data-rental-id="${rentalId}">Proceed with Early Payoff</button>
                </div>
            `;
            
            // Show the modal
            payoffModal.style.display = 'block';
            
            // Add close button functionality
            const closeModalBtn = payoffContainer.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    payoffModal.style.display = 'none';
                });
            }
            
            // Process early payoff button
            const processPayoffBtn = payoffContainer.querySelector('.process-early-payoff');
            if (processPayoffBtn) {
                processPayoffBtn.addEventListener('click', () => {
                    this.processEarlyPayoff(rentalId);
                });
            }
            
        } catch (error) {
            console.error('Error getting early payoff information:', error);
            alert('Failed to get early payoff information. Please try again later.');
        }
    }
    
    /**
     * Process an early payoff for a rental
     * @param {string} rentalId - The rental ID to pay off early
     */
    async processEarlyPayoff(rentalId) {
        // Confirm early payoff
        if (!confirm('Are you sure you want to pay off this rental early? This action cannot be undone.')) {
            return;
        }
        
        try {
            // Make API request to process early payoff
            const response = await fetch(`${this.rentalsApiUrl}/${rentalId}/early-payoff`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to process early payoff');
            }
            
            // Close modals
            const payoffModal = document.getElementById('early-payoff-modal');
            if (payoffModal) {
                payoffModal.style.display = 'none';
            }
            
            const rentalModal = document.getElementById('rental-details-modal');
            if (rentalModal) {
                rentalModal.style.display = 'none';
            }
            
            // Show success message
            alert(data.message || 'Rental paid off successfully! You now own this product.');
            
            // Reload rentals
            this.loadRentals();
        } catch (error) {
            console.error('Error processing early payoff:', error);
            alert(`Failed to process early payoff: ${error.message || 'Please try again later.'}`);
        }
    }
    
    /**
     * View hardware upgrade options for a rental
     * @param {string} rentalId - The rental ID to upgrade
     */
    async viewUpgradeOptions(rentalId) {
        try {
            // Get upgrade options
            const response = await fetch(`${this.rentalsApiUrl}/${rentalId}/upgrade-options`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get upgrade options');
            }
            
            // Create modal if it doesn't exist
            let upgradeModal = document.getElementById('upgrade-modal');
            if (!upgradeModal) {
                upgradeModal = document.createElement('div');
                upgradeModal.id = 'upgrade-modal';
                upgradeModal.className = 'modal';
                upgradeModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="upgrade-container"></div>
                    </div>
                `;
                
                document.body.appendChild(upgradeModal);
                
                // Close button functionality
                const closeBtn = upgradeModal.querySelector('.close');
                closeBtn.addEventListener('click', () => {
                    upgradeModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', (event) => {
                    if (event.target === upgradeModal) {
                        upgradeModal.style.display = 'none';
                    }
                });
            }
            
            // Format prices
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Update upgrade container
            const upgradeContainer = upgradeModal.querySelector('.upgrade-container');
            if (!upgradeContainer) return;
            
            // Render upgrade information
            upgradeContainer.innerHTML = `
                <h2>Hardware Upgrade Options</h2>
                <div class="current-product">
                    <h3>Current Product</h3>
                    <div class="product-name">${data.current_product.name}</div>
                    <div class="product-specs">
                        ${data.current_product.specs.map(spec => `<div class="spec">${spec}</div>`).join('')}
                    </div>
                    <div class="product-price">
                        <span class="label">Monthly Payment:</span> ${formatter.format(data.current_product.monthly_payment)}
                    </div>
                </div>
                
                <h3>Available Upgrades</h3>
                ${data.upgrade_options && data.upgrade_options.length ? `
                    <div class="upgrade-options">
                        ${data.upgrade_options.map(option => `
                            <div class="upgrade-option" data-option-id="${option.id}">
                                <div class="option-name">${option.name}</div>
                                <div class="option-specs">
                                    ${option.specs.map(spec => `<div class="spec">${spec}</div>`).join('')}
                                </div>
                                <div class="option-difference">
                                    ${this.renderUpgradeDifferences(data.current_product, option)}
                                </div>
                                <div class="option-price">
                                    <div class="price-difference">
                                        <span class="label">Additional Monthly:</span> 
                                        <span class="value">+${formatter.format(option.additional_monthly)}</span>
                                    </div>
                                    <div class="new-monthly">
                                        <span class="label">New Monthly Payment:</span> 
                                        <span class="value">${formatter.format(option.new_monthly_payment)}</span>
                                    </div>
                                    ${option.one_time_fee > 0 ? `
                                        <div class="one-time-fee">
                                            <span class="label">One-time Upgrade Fee:</span> 
                                            <span class="value">${formatter.format(option.one_time_fee)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="option-actions">
                                    <button class="btn btn-primary select-upgrade" data-option-id="${option.id}">Select Upgrade</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-data">No upgrade options available at this time.</div>'}
                
                <div class="upgrade-terms">
                    <p>Important Information:</p>
                    <ul>
                        <li>Hardware upgrades may extend your rental term</li>
                        <li>One-time fees are charged immediately</li>
                        <li>New monthly payments begin with your next billing cycle</li>
                        <li>Technical support is available to help with data transfer</li>
                    </ul>
                </div>
                
                <div class="upgrade-actions">
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            `;
            
            // Show the modal
            upgradeModal.style.display = 'block';
            
            // Add close button functionality
            const closeModalBtn = upgradeContainer.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    upgradeModal.style.display = 'none';
                });
            }
            
            // Add select upgrade button functionality
            const selectUpgradeBtns = upgradeContainer.querySelectorAll('.select-upgrade');
            if (selectUpgradeBtns.length) {
                selectUpgradeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const optionId = btn.dataset.optionId;
                        this.processUpgrade(rentalId, optionId);
                    });
                });
            }
            
        } catch (error) {
            console.error('Error viewing upgrade options:', error);
            alert('Failed to get upgrade options. Please try again later.');
        }
    }
    
    /**
     * Render the differences between current product and upgrade option
     * @param {Object} current - Current product data
     * @param {Object} upgrade - Upgrade option data
     * @returns {string} HTML for the differences
     */
    renderUpgradeDifferences(current, upgrade) {
        // Compare specs and highlight differences/improvements
        const differences = [];
        
        // Extract spec categories and values using regex
        const extractSpecInfo = (specString) => {
            const match = specString.match(/^(.*?):\s(.*)$/);
            return match ? { category: match[1].trim(), value: match[2].trim() } : null;
        };
        
        // Convert current specs to map for easy lookup
        const currentSpecsMap = {};
        current.specs.forEach(spec => {
            const specInfo = extractSpecInfo(spec);
            if (specInfo) {
                currentSpecsMap[specInfo.category] = specInfo.value;
            }
        });
        
        // Compare each upgrade spec to current
        upgrade.specs.forEach(spec => {
            const specInfo = extractSpecInfo(spec);
            if (!specInfo) return;
            
            const currentValue = currentSpecsMap[specInfo.category];
            
            if (currentValue && currentValue !== specInfo.value) {
                differences.push(`
                    <div class="spec-difference">
                        <span class="spec-category">${specInfo.category}:</span>
                        <span class="spec-from">${currentValue}</span>
                        <span class="spec-arrow">→</span>
                        <span class="spec-to">${specInfo.value}</span>
                    </div>
                `);
            } else if (!currentValue) {
                differences.push(`
                    <div class="spec-difference new-feature">
                        <span class="spec-category">${specInfo.category}:</span>
                        <span class="spec-to">${specInfo.value}</span>
                        <span class="spec-new">(New)</span>
                    </div>
                `);
            }
        });
        
        return differences.length ? `
            <div class="differences-title">Improvements:</div>
            <div class="differences-list">
                ${differences.join('')}
            </div>
        ` : '<div class="no-differences">No significant spec changes</div>';
    }
    
    /**
     * Process a hardware upgrade for a rental
     * @param {string} rentalId - The rental ID to upgrade
     * @param {string} optionId - The selected upgrade option ID
     */
    async processUpgrade(rentalId, optionId) {
        // Confirm upgrade
        if (!confirm('Are you sure you want to upgrade your rental? This will update your monthly payments and may extend your rental term.')) {
            return;
        }
        
        try {
            // Make API request to process upgrade
            const response = await fetch(`${this.rentalsApiUrl}/${rentalId}/upgrade`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ option_id: optionId })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to process upgrade');
            }
            
            // Close modals
            const upgradeModal = document.getElementById('upgrade-modal');
            if (upgradeModal) {
                upgradeModal.style.display = 'none';
            }
            
            const rentalModal = document.getElementById('rental-details-modal');
            if (rentalModal) {
                rentalModal.style.display = 'none';
            }
            
            // Show success message
            alert(data.message || 'Upgrade processed successfully! Your account has been updated.');
            
            // Reload rentals
            this.loadRentals();
        } catch (error) {
            console.error('Error processing upgrade:', error);
            alert(`Failed to process upgrade: ${error.message || 'Please try again later.'}`);
        }
    }
    
    /**
     * Make a payment for a rental
     * @param {string} paymentId - The payment ID to process
     */
    async makePayment(paymentId) {
        try {
            // Get payment details
            const response = await fetch(`${this.rentalsApiUrl}/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get payment details');
            }
            
            // Create modal if it doesn't exist
            let paymentModal = document.getElementById('payment-modal');
            if (!paymentModal) {
                paymentModal = document.createElement('div');
                paymentModal.id = 'payment-modal';
                paymentModal.className = 'modal';
                paymentModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="payment-container"></div>
                    </div>
                `;
                
                document.body.appendChild(paymentModal);
                
                // Close button functionality
                const closeBtn = paymentModal.querySelector('.close');
                closeBtn.addEventListener('click', () => {
                    paymentModal.style.display = 'none';
                });
                
                // Close when clicking outside modal
                window.addEventListener('click', (event) => {
                    if (event.target === paymentModal) {
                        paymentModal.style.display = 'none';
                    }
                });
            }
            
            // Format price
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Update payment container
            const paymentContainer = paymentModal.querySelector('.payment-container');
            if (!paymentContainer) return;
            
            // Render payment form
            paymentContainer.innerHTML = `
                <h2>Make Payment</h2>
                <div class="payment-details">
                    <div class="payment-product">
                        <strong>Product:</strong> ${data.product_name}
                    </div>
                    <div class="payment-amount">
                        <strong>Payment Amount:</strong> ${formatter.format(data.amount)}
                    </div>
                    <div class="payment-due-date">
                        <strong>Due Date:</strong> ${new Date(data.due_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
                
                <div class="payment-method-selection">
                    <h3>Select Payment Method</h3>
                    ${data.payment_methods && data.payment_methods.length ? `
                        <div class="saved-payment-methods">
                            ${data.payment_methods.map(method => `
                                <div class="payment-method">
                                    <input type="radio" name="payment_method" id="method-${method.id}" value="${method.id}" ${method.is_default ? 'checked' : ''}>
                                    <label for="method-${method.id}">
                                        <span class="method-info">
                                            <span class="method-card">${method.card_type} •••• ${method.last_four}</span>
                                            <span class="method-expiry">Exp: ${method.expiry_month}/${method.expiry_year}</span>
                                        </span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                        <div class="new-payment-method">
                            <div class="payment-method">
                                <input type="radio" name="payment_method" id="method-new" value="new">
                                <label for="method-new">
                                    <span class="method-info">
                                        <span class="method-card">Add new payment method</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    ` : `
                        <div class="no-payment-methods">
                            <p>No saved payment methods found.</p>
                            <div id="card-element" class="card-element"></div>
                            <div id="card-errors" class="card-errors" role="alert"></div>
                        </div>
                    `}
                </div>
                
                <div class="payment-actions">
                    <button class="btn btn-secondary close-modal">Cancel</button>
                    <button class="btn btn-primary process-payment" data-payment-id="${paymentId}">Make Payment</button>
                </div>
            `;
            
            // Show the modal
            paymentModal.style.display = 'block';
            
            // Add close button functionality
            const closeModalBtn = paymentContainer.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    paymentModal.style.display = 'none';
                });
            }
            
            // Process payment button
            const processPaymentBtn = paymentContainer.querySelector('.process-payment');
            if (processPaymentBtn) {
                processPaymentBtn.addEventListener('click', () => {
                    const selectedMethod = document.querySelector('input[name="payment_method"]:checked');
                    const paymentMethodId = selectedMethod ? selectedMethod.value : null;
                    
                    this.processPayment(paymentId, paymentMethodId);
                });
            }
            
            // If Stripe elements are integrated
            if (window.stripe && data.payment_methods && data.payment_methods.length === 0) {
                this.setupStripeElements();
            }
            
        } catch (error) {
            console.error('Error getting payment details:', error);
            alert('Failed to get payment details. Please try again later.');
        }
    }
    
    /**
     * Setup Stripe elements for card input
     */
    setupStripeElements() {
        const stripe = window.stripe;
        const elements = stripe.elements();
        
        // Create card element
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');
        
        // Handle validation errors
        cardElement.addEventListener('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
        // Store for later use
        this.cardElement = cardElement;
    }
    
    /**
     * Process a payment
     * @param {string} paymentId - The payment ID to process
     * @param {string} paymentMethodId - The payment method ID to use
     */
    async processPayment(paymentId, paymentMethodId) {
        try {
            // Prepare payment data
            const paymentData = { payment_method_id: paymentMethodId };
            
            // If using a new card via Stripe
            if (paymentMethodId === 'new' && this.cardElement) {
                const result = await window.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.cardElement,
                });
                
                if (result.error) {
                    throw new Error(result.error.message);
                }
                
                paymentData.stripe_payment_method_id = result.paymentMethod.id;
                delete paymentData.payment_method_id;
            }
            
            // Make API request to process payment
            const response = await fetch(`${this.rentalsApiUrl}/payments/${paymentId}/process`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to process payment');
            }
            
            // Close modal
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.style.display = 'none';
            }
            
            // Close rental details modal
            const rentalModal = document.getElementById('rental-details-modal');
            if (rentalModal) {
                rentalModal.style.display = 'none';
            }
            
            // Show success message
            alert(data.message || 'Payment processed successfully!');
            
            // Reload rentals
            this.loadRentals();
        } catch (error) {
            console.error('Error processing payment:', error);
            
            const errorDisplay = document.getElementById('card-errors');
            if (errorDisplay) {
                errorDisplay.textContent = error.message || 'Payment processing failed. Please try again.';
            } else {
                alert(`Failed to process payment: ${error.message || 'Please try again later.'}`);
            }
        }
    }
}

// Initialize RentalsManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create an instance of the RentalsManager class
    window.rentalsManager = new RentalsManager();
});
