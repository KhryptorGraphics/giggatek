/**
 * GigGatek Dashboard Rentals Module
 * Handles rental contract display and management in the user dashboard
 */

class DashboardRentals {
    constructor() {
        this.rentalContracts = [];
        this.currentRental = null;
        this.apiBaseUrl = '/api/rentals';
        this.isLoading = false;

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

        // Get DOM elements
        this.loadingElement = document.getElementById('rentals-loading');
        this.errorElement = document.getElementById('rentals-error');
        this.errorMessageElement = document.getElementById('rentals-error-message');
        this.emptyElement = document.getElementById('rentals-empty');
        this.activeRentalsContainer = document.getElementById('active-rentals-container');
        this.activeRentalsList = document.getElementById('active-rentals-list');
        this.completedRentalsContainer = document.getElementById('completed-rentals-container');
        this.completedRentalsList = document.getElementById('completed-rentals-list');

        // Get templates
        this.rentalCardTemplate = document.getElementById('rental-card-template');
        this.completedRentalCardTemplate = document.getElementById('completed-rental-card-template');

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
            // View details button
            if (e.target.classList.contains('view-details-btn') || e.target.closest('.view-details-btn')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                if (rentalCard) {
                    const rentalId = rentalCard.dataset.rentalId;
                    this.viewRentalDetails(rentalId);
                }
            }

            // Pay early button
            if (e.target.classList.contains('pay-early-btn') || e.target.closest('.pay-early-btn')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                if (rentalCard) {
                    const rentalId = rentalCard.dataset.rentalId;
                    this.showPaymentModal(rentalId);
                }
            }

            // Upgrade button
            if (e.target.classList.contains('upgrade-btn') || e.target.closest('.upgrade-btn')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                if (rentalCard) {
                    const rentalId = rentalCard.dataset.rentalId;
                    this.showUpgradeOptions(rentalId);
                }
            }

            // Review button
            if (e.target.classList.contains('review-btn') || e.target.closest('.review-btn')) {
                e.preventDefault();
                const rentalCard = e.target.closest('.rental-card');
                if (rentalCard) {
                    const rentalId = rentalCard.dataset.rentalId;
                    this.showReviewForm(rentalId);
                }
            }

            // Retry button
            if (e.target.id === 'rentals-retry') {
                e.preventDefault();
                this.loadRentals();
            }
        });

        // Process payment button
        const processPaymentBtn = document.getElementById('process-payment-btn');
        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', () => {
                this.processPayment();
            });
        }
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
        if (this.isLoading) return;

        // Show loading state
        this.showLoading(true);
        this.showError(false);
        this.showEmpty(false);

        try {
            this.isLoading = true;

            const response = await fetch(this.apiBaseUrl, {
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

            // Process the rental contracts
            this.rentalContracts = data.rentals || [];

            // Hide loading state
            this.showLoading(false);

            // Check if there are any rentals
            if (this.rentalContracts.length === 0) {
                this.showEmpty(true);
                this.activeRentalsContainer.style.display = 'none';
                this.completedRentalsContainer.style.display = 'none';
            } else {
                // Render rentals
                this.renderRentals();
            }
        } catch (error) {
            console.error('Error loading rental contracts:', error);
            this.showLoading(false);
            this.showError(true, error.message);
            this.activeRentalsContainer.style.display = 'none';
            this.completedRentalsContainer.style.display = 'none';
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show or hide the loading indicator
     */
    showLoading(show) {
        if (this.loadingElement) {
            this.loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Show/hide error message
     * @param {boolean} show - Whether to show or hide the error message
     * @param {string} message - Error message to display
     */
    showError(show, message = '') {
        if (this.errorElement) {
            this.errorElement.style.display = show ? 'block' : 'none';
            if (show && this.errorMessageElement) {
                this.errorMessageElement.textContent = message || 'Failed to load rental contracts.';
            }
        }
    }

    /**
     * Show/hide empty state
     * @param {boolean} show - Whether to show or hide the empty state
     */
    showEmpty(show) {
        if (this.emptyElement) {
            this.emptyElement.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Render rental contracts in the UI
     */
    renderRentals() {
        // Clear containers
        this.activeRentalsList.innerHTML = '';
        this.completedRentalsList.innerHTML = '';

        // Separate active and completed rentals
        const activeRentals = this.rentalContracts.filter(rental => rental.status === 'active');
        const completedRentals = this.rentalContracts.filter(rental => rental.status !== 'active');

        // Show/hide containers based on content
        this.activeRentalsContainer.style.display = activeRentals.length > 0 ? 'block' : 'none';
        this.completedRentalsContainer.style.display = completedRentals.length > 0 ? 'block' : 'none';

        // Render active rentals
        activeRentals.forEach(rental => {
            const rentalCard = this.createActiveRentalCard(rental);
            this.activeRentalsList.appendChild(rentalCard);
        });

        // Render completed rentals
        completedRentals.forEach(rental => {
            const rentalCard = this.createCompletedRentalCard(rental);
            this.completedRentalsList.appendChild(rentalCard);
        });
    }

    /**
     * Create an active rental card element
     * @param {Object} rental - Rental contract data
     * @returns {HTMLElement} Rental card element
     */
    createActiveRentalCard(rental) {
        // Clone the template
        const template = this.rentalCardTemplate.content.cloneNode(true);
        const rentalCard = template.querySelector('.rental-card');

        // Set rental ID
        rentalCard.dataset.rentalId = rental.id;

        // Set rental title
        rentalCard.querySelector('.rental-title').textContent = rental.product_name;

        // Set rental badge
        rentalCard.querySelector('.rental-badge').textContent = `${rental.total_months}-Month Plan`;

        // Calculate payment progress
        const totalPayments = rental.total_months;
        const paymentsMade = rental.payments_made || 0;
        const progressPercent = (paymentsMade / totalPayments) * 100;

        // Set payment progress
        rentalCard.querySelector('.payments-count').textContent = `${paymentsMade} of ${totalPayments} Payments`;
        rentalCard.querySelector('.progress-bar').style.width = `${progressPercent}%`;

        // Format currency
        const monthlyRate = parseFloat(rental.monthly_rate).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        const remainingAmount = parseFloat(rental.remaining_amount || 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        // Format dates
        const nextPaymentDate = rental.next_payment_date ? new Date(rental.next_payment_date).toLocaleDateString() : 'N/A';

        // Set payment details
        rentalCard.querySelector('.monthly-payment').textContent = monthlyRate;
        rentalCard.querySelector('.next-payment').textContent = nextPaymentDate;
        rentalCard.querySelector('.remaining-amount').textContent = remainingAmount;

        return rentalCard;
    }

    /**
     * Create a completed rental card element
     * @param {Object} rental - Rental contract data
     * @returns {HTMLElement} Rental card element
     */
    createCompletedRentalCard(rental) {
        // Clone the template
        const template = this.completedRentalCardTemplate.content.cloneNode(true);
        const rentalCard = template.querySelector('.rental-card');

        // Set rental ID
        rentalCard.dataset.rentalId = rental.id;

        // Set rental title
        rentalCard.querySelector('.rental-title').textContent = rental.product_name;

        // Set rental badge
        rentalCard.querySelector('.rental-badge').textContent = rental.status === 'completed' ? 'Paid Off' : 'Cancelled';

        // Format dates
        const startDate = new Date(rental.start_date).toLocaleDateString();
        const endDate = new Date(rental.end_date).toLocaleDateString();

        // Format currency
        const monthlyRate = parseFloat(rental.monthly_rate).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        const totalPaid = parseFloat(rental.total_paid || 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        // Set rental details
        rentalCard.querySelector('.start-date').textContent = startDate;
        rentalCard.querySelector('.end-date').textContent = endDate;
        rentalCard.querySelector('.monthly-payment').textContent = monthlyRate;
        rentalCard.querySelector('.total-paid').textContent = totalPaid;
        rentalCard.querySelector('.rental-status').textContent = rental.status.charAt(0).toUpperCase() + rental.status.slice(1);

        return rentalCard;
    }

    /**
     * View rental details
     * @param {string} rentalId - Rental contract ID
     */
    async viewRentalDetails(rentalId) {
        try {
            // Show loading in modal
            const modalContent = document.getElementById('rental-details-content');
            modalContent.innerHTML = '<div class="loading">Loading rental details...</div>';

            // Show modal
            $('#rental-details-modal').modal('show');

            // Fetch rental details
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}`, {
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
            const rental = data.rental;

            if (!rental) {
                throw new Error('Rental not found');
            }

            // Store current rental
            this.currentRental = rental;

            // Format dates
            const startDate = new Date(rental.start_date).toLocaleDateString();
            const endDate = new Date(rental.end_date).toLocaleDateString();
            const nextPaymentDate = rental.next_payment_date ? new Date(rental.next_payment_date).toLocaleDateString() : 'N/A';

            // Calculate payment progress
            const totalPayments = rental.total_months;
            const paymentsMade = rental.payments_made || 0;
            const progressPercent = (paymentsMade / totalPayments) * 100;

            // Format currency
            const monthlyRate = parseFloat(rental.monthly_rate).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            const totalAmount = parseFloat(rental.total_amount).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            const remainingAmount = parseFloat(rental.remaining_amount || 0).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            // Calculate early buyout price (typically remaining balance minus some discount)
            const earlyBuyoutPrice = parseFloat(rental.remaining_amount * 0.9 || 0).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            // Fetch payment history
            let paymentHistory = [];
            try {
                const paymentsResponse = await fetch(`${this.apiBaseUrl}/${rentalId}/payments`, {
                    method: 'GET',
                    headers: {
                        ...window.auth.getAuthHeaders(),
                        'Content-Type': 'application/json'
                    }
                });

                if (paymentsResponse.ok) {
                    const paymentsData = await paymentsResponse.json();
                    paymentHistory = paymentsData.payments || [];
                }
            } catch (paymentError) {
                console.error('Error loading payment history:', paymentError);
            }

            // Render rental details
            modalContent.innerHTML = `
                <div class="rental-details-container">
                    <div class="rental-product">
                        <div class="product-info">
                            ${rental.image_url ? `<img src="${rental.image_url}" alt="${rental.product_name}" class="product-image">` : ''}
                            <div>
                                <h4>${rental.product_name}</h4>
                                <div class="rental-status-badge ${rental.status}">${rental.status}</div>
                            </div>
                        </div>
                        <div class="rental-actions-container">
                            ${rental.status === 'active' ? `
                                <button class="btn btn-primary pay-now-btn" data-rental-id="${rental.id}">Make Payment</button>
                                <button class="btn btn-outline-secondary buyout-btn" data-rental-id="${rental.id}">Early Buyout</button>
                            ` : ''}
                            <button class="btn btn-outline-info download-contract-btn" data-rental-id="${rental.id}">
                                <i class="fas fa-file-download"></i> Download Contract
                            </button>
                        </div>
                    </div>

                    <div class="rental-tabs">
                        <ul class="nav nav-tabs" id="rentalDetailsTabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="details-tab" data-toggle="tab" href="#details" role="tab" aria-controls="details" aria-selected="true">Details</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="payments-tab" data-toggle="tab" href="#payments" role="tab" aria-controls="payments" aria-selected="false">Payment History</a>
                            </li>
                        </ul>

                        <div class="tab-content" id="rentalDetailsTabContent">
                            <!-- Details Tab -->
                            <div class="tab-pane fade show active" id="details" role="tabpanel" aria-labelledby="details-tab">
                                <div class="rental-info-grid">
                                    <div class="rental-info-item">
                                        <div class="info-label">Contract ID</div>
                                        <div class="info-value">${rental.id}</div>
                                    </div>
                                    <div class="rental-info-item">
                                        <div class="info-label">Start Date</div>
                                        <div class="info-value">${startDate}</div>
                                    </div>
                                    <div class="rental-info-item">
                                        <div class="info-label">End Date</div>
                                        <div class="info-value">${endDate}</div>
                                    </div>
                                    <div class="rental-info-item">
                                        <div class="info-label">Monthly Payment</div>
                                        <div class="info-value">${monthlyRate}</div>
                                    </div>
                                    <div class="rental-info-item">
                                        <div class="info-label">Total Contract Value</div>
                                        <div class="info-value">${totalAmount}</div>
                                    </div>
                                    <div class="rental-info-item">
                                        <div class="info-label">Remaining Balance</div>
                                        <div class="info-value">${remainingAmount}</div>
                                    </div>
                                    ${rental.status === 'active' ? `
                                    <div class="rental-info-item">
                                        <div class="info-label">Next Payment Date</div>
                                        <div class="info-value">${nextPaymentDate}</div>
                                    </div>
                                    <div class="rental-info-item">
                                        <div class="info-label">Early Buyout Price</div>
                                        <div class="info-value">${earlyBuyoutPrice}</div>
                                    </div>
                                    ` : ''}
                                </div>

                                <div class="rental-progress-container">
                                    <h5>Payment Progress</h5>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                                    </div>
                                    <div class="progress-text">
                                        ${paymentsMade} of ${totalPayments} payments (${Math.round(progressPercent)}%)
                                    </div>
                                </div>

                                <div class="shipping-address">
                                    <h5>Shipping Address</h5>
                                    <p>
                                        ${rental.address ? `
                                            ${rental.address.street}<br>
                                            ${rental.address.city}, ${rental.address.state} ${rental.address.zip}<br>
                                            ${rental.address.country}
                                        ` : 'No shipping address available'}
                                    </p>
                                </div>
                            </div>

                            <!-- Payments Tab -->
                            <div class="tab-pane fade" id="payments" role="tabpanel" aria-labelledby="payments-tab">
                                <div class="payment-history-container">
                                    <h5>Payment History</h5>
                                    ${paymentHistory.length > 0 ? `
                                        <div class="payment-history-table-container">
                                            <table class="table payment-history-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Amount</th>
                                                        <th>Method</th>
                                                        <th>Status</th>
                                                        <th>Transaction ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${paymentHistory.map(payment => `
                                                        <tr>
                                                            <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                                                            <td>${parseFloat(payment.amount).toLocaleString('en-US', {
                                                                style: 'currency',
                                                                currency: 'USD'
                                                            })}</td>
                                                            <td>${payment.payment_method.replace('_', ' ')}</td>
                                                            <td><span class="payment-status ${payment.status}">${payment.status}</span></td>
                                                            <td><span class="transaction-id">${payment.transaction_id}</span></td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    ` : `
                                        <div class="no-payments-message">
                                            <p>No payment records found for this rental contract.</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners for buttons in the modal
            const payNowBtn = modalContent.querySelector('.pay-now-btn');
            if (payNowBtn) {
                payNowBtn.addEventListener('click', () => {
                    $('#rental-details-modal').modal('hide');
                    this.showPaymentModal(rental.id);
                });
            }

            const buyoutBtn = modalContent.querySelector('.buyout-btn');
            if (buyoutBtn) {
                buyoutBtn.addEventListener('click', () => {
                    $('#rental-details-modal').modal('hide');
                    this.initiateEarlyBuyout(rental.id);
                });
            }

            const downloadContractBtn = modalContent.querySelector('.download-contract-btn');
            if (downloadContractBtn) {
                downloadContractBtn.addEventListener('click', () => {
                    this.downloadContract(rental.id);
                });
            }

        } catch (error) {
            console.error('Error loading rental details:', error);
            const modalContent = document.getElementById('rental-details-content');
            modalContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h4>Error Loading Details</h4>
                    <p>${error.message || 'Failed to load rental details'}</p>
                    <button id="retry-load-details" class="btn btn-primary">Try Again</button>
                </div>
            `;

            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-details');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.viewRentalDetails(rentalId);
                });
            }
        }
    }

    /**
     * Show payment modal for a rental
     * @param {string} rentalId - Rental contract ID
     */
    async showPaymentModal(rentalId) {
        try {
            // Show loading in modal
            const modalContent = document.getElementById('rental-payment-content');
            modalContent.innerHTML = '<div class="loading">Loading payment details...</div>';

            // Show modal
            $('#rental-payment-modal').modal('show');

            // Fetch rental details
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}`, {
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
            const rental = data.rental;

            if (!rental) {
                throw new Error('Rental not found');
            }

            // Store current rental
            this.currentRental = rental;

            // Format currency
            const monthlyRate = parseFloat(rental.monthly_rate).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            const remainingAmount = parseFloat(rental.remaining_amount || 0).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            // Calculate early buyout price (typically remaining balance minus some discount)
            const earlyBuyoutPrice = parseFloat(rental.remaining_amount * 0.9 || 0).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            // Render payment form
            modalContent.innerHTML = `
                <div class="payment-form">
                    <div class="rental-summary">
                        <h5>${rental.product_name}</h5>
                        <div class="rental-payment-info">
                            <div class="info-item">
                                <span class="label">Monthly Payment:</span>
                                <span class="value">${monthlyRate}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Remaining Balance:</span>
                                <span class="value">${remainingAmount}</span>
                            </div>
                        </div>
                    </div>

                    <div class="payment-options">
                        <h5>Payment Options</h5>
                        <div class="form-group">
                            <label for="payment-amount">Payment Amount</label>
                            <select id="payment-amount" class="form-control">
                                <option value="monthly">Monthly Payment (${monthlyRate})</option>
                                <option value="remaining">Full Remaining Balance (${remainingAmount})</option>
                                <option value="buyout">Early Buyout (${earlyBuyoutPrice})</option>
                                <option value="custom">Custom Amount</option>
                            </select>
                        </div>

                        <div id="custom-amount-container" class="form-group" style="display: none;">
                            <label for="custom-payment-amount">Enter Amount</label>
                            <input type="number" id="custom-payment-amount" class="form-control" min="1" step="0.01" placeholder="Enter payment amount">
                        </div>

                        <div class="form-group">
                            <label for="payment-method">Payment Method</label>
                            <select id="payment-method" class="form-control">
                                <option value="credit_card">Credit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>

                        <div id="credit-card-details" class="payment-details">
                            <div class="form-group">
                                <label for="card-number">Card Number</label>
                                <input type="text" id="card-number" class="form-control" placeholder="**** **** **** ****">
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="card-expiry">Expiry Date</label>
                                    <input type="text" id="card-expiry" class="form-control" placeholder="MM/YY">
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="card-cvv">CVV</label>
                                    <input type="text" id="card-cvv" class="form-control" placeholder="***">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add event listener for payment amount select
            const paymentAmountSelect = document.getElementById('payment-amount');
            const customAmountContainer = document.getElementById('custom-amount-container');

            if (paymentAmountSelect && customAmountContainer) {
                paymentAmountSelect.addEventListener('change', () => {
                    if (paymentAmountSelect.value === 'custom') {
                        customAmountContainer.style.display = 'block';
                    } else {
                        customAmountContainer.style.display = 'none';
                    }
                });
            }

            // Add event listener for payment method select
            const paymentMethodSelect = document.getElementById('payment-method');
            const creditCardDetails = document.getElementById('credit-card-details');

            if (paymentMethodSelect && creditCardDetails) {
                paymentMethodSelect.addEventListener('change', () => {
                    if (paymentMethodSelect.value === 'credit_card') {
                        creditCardDetails.style.display = 'block';
                    } else {
                        creditCardDetails.style.display = 'none';
                    }
                });
            }

            // Add event listener for process payment button
            const processPaymentBtn = document.getElementById('process-payment-btn');
            if (processPaymentBtn) {
                processPaymentBtn.addEventListener('click', () => this.processPayment());
            }

        } catch (error) {
            console.error('Error loading payment details:', error);
            const modalContent = document.getElementById('rental-payment-content');
            modalContent.innerHTML = `
                <div class="error-message">
                    <p>${error.message || 'Failed to load payment details'}</p>
                </div>
            `;
        }
    }

    /**
     * Process a rental payment
     */
    async processPayment() {
        if (!this.currentRental) {
            console.error('No rental selected for payment');
            return;
        }

        try {
            // Get form values
            const paymentAmountSelect = document.getElementById('payment-amount');
            const customPaymentAmount = document.getElementById('custom-payment-amount');
            const paymentMethod = document.getElementById('payment-method');

            if (!paymentAmountSelect || !paymentMethod) {
                throw new Error('Payment form is incomplete');
            }

            // Determine payment amount
            let amount = 0;
            let paymentType = 'regular';

            if (paymentAmountSelect.value === 'monthly') {
                amount = parseFloat(this.currentRental.monthly_rate);
            } else if (paymentAmountSelect.value === 'remaining') {
                amount = parseFloat(this.currentRental.remaining_amount || 0);
                paymentType = 'full_balance';
            } else if (paymentAmountSelect.value === 'buyout') {
                amount = parseFloat(this.currentRental.remaining_amount * 0.9 || 0);
                paymentType = 'early_buyout';
            } else if (paymentAmountSelect.value === 'custom') {
                if (!customPaymentAmount || !customPaymentAmount.value) {
                    throw new Error('Please enter a custom payment amount');
                }
                amount = parseFloat(customPaymentAmount.value);
                paymentType = 'custom';
            }

            if (isNaN(amount) || amount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Validate credit card details if payment method is credit card
            if (paymentMethod.value === 'credit_card') {
                const cardNumber = document.getElementById('card-number');
                const cardExpiry = document.getElementById('card-expiry');
                const cardCvv = document.getElementById('card-cvv');

                if (!cardNumber || !cardNumber.value || !cardExpiry || !cardExpiry.value || !cardCvv || !cardCvv.value) {
                    throw new Error('Please enter all credit card details');
                }

                // Basic validation
                if (cardNumber.value.replace(/\s/g, '').length < 15) {
                    throw new Error('Please enter a valid card number');
                }

                if (!cardExpiry.value.match(/^\d{2}\/\d{2}$/)) {
                    throw new Error('Please enter a valid expiry date (MM/YY)');
                }

                if (cardCvv.value.length < 3) {
                    throw new Error('Please enter a valid CVV');
                }
            }

            // Show loading state
            const modalContent = document.getElementById('rental-payment-content');
            modalContent.innerHTML = `
                <div class="loading-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Processing payment...</span>
                    </div>
                    <p>Processing your payment...</p>
                </div>
            `;

            // Disable the process payment button
            const processPaymentBtn = document.getElementById('process-payment-btn');
            if (processPaymentBtn) {
                processPaymentBtn.disabled = true;
                processPaymentBtn.textContent = 'Processing...';
            }

            // Generate a mock transaction ID (in a real app, this would come from the payment processor)
            const transactionId = 'txn_' + Math.random().toString(36).substr(2, 9);

            // Prepare payment data
            const paymentData = {
                amount: amount,
                payment_method: paymentMethod.value,
                transaction_id: transactionId,
                payment_type: paymentType
            };

            // Send payment request
            const response = await fetch(`${this.apiBaseUrl}/${this.currentRental.id}/payments`, {
                method: 'POST',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Payment failed: ${response.status}`);
            }

            const data = await response.json();

            // Show success message
            modalContent.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>Payment Successful!</h4>
                    <p>Your payment of ${amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    })} has been processed successfully.</p>
                    <p>Transaction ID: ${transactionId}</p>
                    <p>A receipt has been sent to your email.</p>
                </div>
            `;

            // Update the process payment button
            if (processPaymentBtn) {
                processPaymentBtn.textContent = 'Close';
                processPaymentBtn.disabled = false;
                processPaymentBtn.className = 'btn btn-secondary';
                processPaymentBtn.addEventListener('click', () => {
                    $('#rental-payment-modal').modal('hide');
                    // Reload rentals after payment
                    this.loadRentals();
                }, { once: true });
            }

        } catch (error) {
            console.error('Error processing payment:', error);

            // Show error message
            const modalContent = document.getElementById('rental-payment-content');
            modalContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h4>Payment Failed</h4>
                    <p>${error.message || 'An error occurred while processing your payment.'}</p>
                    <button id="retry-payment" class="btn btn-primary">Try Again</button>
                </div>
            `;

            // Add event listener to retry button
            const retryButton = document.getElementById('retry-payment');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.showPaymentModal(this.currentRental.id);
                });
            }

            // Update the process payment button
            const processPaymentBtn = document.getElementById('process-payment-btn');
            if (processPaymentBtn) {
                processPaymentBtn.textContent = 'Close';
                processPaymentBtn.disabled = false;
                processPaymentBtn.className = 'btn btn-secondary';
            }
        }
    }

    /**
     * Show upgrade options for a rental
     * @param {string} rentalId - Rental contract ID
     */
    showUpgradeOptions(rentalId) {
        // Implementation for showing upgrade options
        alert('Upgrade options feature coming soon!');
    }

    /**
     * Initiate early buyout for a rental
     * @param {string} rentalId - Rental contract ID
     */
    async initiateEarlyBuyout(rentalId) {
        try {
            // Show loading in modal
            const modalContent = document.getElementById('rental-payment-content');
            modalContent.innerHTML = '<div class="loading">Loading buyout details...</div>';

            // Show modal
            $('#rental-payment-modal').modal('show');
            $('#rental-payment-modal .modal-title').text('Early Buyout');

            // Fetch rental details
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}`, {
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
            const rental = data.rental;

            if (!rental) {
                throw new Error('Rental not found');
            }

            // Store current rental
            this.currentRental = rental;

            // Calculate early buyout price (typically remaining balance minus some discount)
            const remainingAmount = parseFloat(rental.remaining_amount || 0);
            const earlyBuyoutPrice = remainingAmount * 0.9;
            const savings = remainingAmount - earlyBuyoutPrice;

            // Format currency
            const formattedRemainingAmount = remainingAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            const formattedEarlyBuyoutPrice = earlyBuyoutPrice.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            const formattedSavings = savings.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            // Render buyout form
            modalContent.innerHTML = `
                <div class="buyout-form">
                    <div class="rental-summary">
                        <h5>${rental.product_name}</h5>
                        <div class="rental-payment-info">
                            <div class="info-item">
                                <span class="label">Remaining Balance:</span>
                                <span class="value">${formattedRemainingAmount}</span>
                            </div>
                            <div class="info-item highlight">
                                <span class="label">Early Buyout Price:</span>
                                <span class="value">${formattedEarlyBuyoutPrice}</span>
                            </div>
                            <div class="info-item savings">
                                <span class="label">Your Savings:</span>
                                <span class="value">${formattedSavings}</span>
                            </div>
                        </div>
                    </div>

                    <div class="buyout-message">
                        <p>Complete your purchase now and own this product outright! By paying the early buyout price, your rental contract will be marked as completed and you'll receive full ownership of the product.</p>
                    </div>

                    <div class="payment-options">
                        <h5>Payment Method</h5>
                        <div class="form-group">
                            <select id="payment-method" class="form-control">
                                <option value="credit_card">Credit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>

                        <div id="credit-card-details" class="payment-details">
                            <div class="form-group">
                                <label for="card-number">Card Number</label>
                                <input type="text" id="card-number" class="form-control" placeholder="**** **** **** ****">
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="card-expiry">Expiry Date</label>
                                    <input type="text" id="card-expiry" class="form-control" placeholder="MM/YY">
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="card-cvv">CVV</label>
                                    <input type="text" id="card-cvv" class="form-control" placeholder="***">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Update the process payment button
            const processPaymentBtn = document.getElementById('process-payment-btn');
            if (processPaymentBtn) {
                processPaymentBtn.textContent = 'Complete Buyout';
                processPaymentBtn.className = 'btn btn-primary';
                processPaymentBtn.addEventListener('click', () => {
                    // Set the payment amount to the buyout price
                    const paymentAmountSelect = document.createElement('select');
                    paymentAmountSelect.id = 'payment-amount';
                    paymentAmountSelect.style.display = 'none';
                    paymentAmountSelect.innerHTML = `<option value="buyout">Early Buyout</option>`;
                    document.body.appendChild(paymentAmountSelect);

                    // Process the payment
                    this.processPayment();

                    // Remove the temporary element
                    document.body.removeChild(paymentAmountSelect);
                });
            }

            // Add event listener for payment method select
            const paymentMethodSelect = document.getElementById('payment-method');
            const creditCardDetails = document.getElementById('credit-card-details');

            if (paymentMethodSelect && creditCardDetails) {
                paymentMethodSelect.addEventListener('change', () => {
                    if (paymentMethodSelect.value === 'credit_card') {
                        creditCardDetails.style.display = 'block';
                    } else {
                        creditCardDetails.style.display = 'none';
                    }
                });
            }

        } catch (error) {
            console.error('Error loading buyout details:', error);
            const modalContent = document.getElementById('rental-payment-content');
            modalContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h4>Error Loading Buyout Details</h4>
                    <p>${error.message || 'Failed to load buyout details'}</p>
                    <button id="retry-buyout" class="btn btn-primary">Try Again</button>
                </div>
            `;

            // Add event listener to retry button
            const retryButton = document.getElementById('retry-buyout');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.initiateEarlyBuyout(rentalId);
                });
            }
        }
    }

    /**
     * Download rental contract
     * @param {string} rentalId - Rental contract ID
     */
    async downloadContract(rentalId) {
        try {
            // Show loading indicator
            const loadingToast = document.createElement('div');
            loadingToast.className = 'toast loading-toast';
            loadingToast.innerHTML = `
                <div class="toast-header">
                    <strong class="mr-auto">Downloading Contract</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
                </div>
                <div class="toast-body">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <span>Preparing your contract for download...</span>
                </div>
            `;
            document.body.appendChild(loadingToast);
            $(loadingToast).toast({ delay: 3000 }).toast('show');

            // Fetch the contract
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}/contract`, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Accept': 'application/pdf'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download contract: ${response.status}`);
            }

            // Get the blob
            const blob = await response.blob();

            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `rental-contract-${rentalId}.pdf`;
            document.body.appendChild(a);

            // Trigger the download
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            document.body.removeChild(loadingToast);

            // Show success toast
            const successToast = document.createElement('div');
            successToast.className = 'toast success-toast';
            successToast.innerHTML = `
                <div class="toast-header">
                    <strong class="mr-auto">Download Complete</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
                </div>
                <div class="toast-body">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Your rental contract has been downloaded successfully.</span>
                </div>
            `;
            document.body.appendChild(successToast);
            $(successToast).toast({ delay: 3000 }).toast('show');

            // Remove the success toast after it's hidden
            $(successToast).on('hidden.bs.toast', () => {
                document.body.removeChild(successToast);
            });

        } catch (error) {
            console.error('Error downloading contract:', error);

            // Show error toast
            const errorToast = document.createElement('div');
            errorToast.className = 'toast error-toast';
            errorToast.innerHTML = `
                <div class="toast-header">
                    <strong class="mr-auto">Download Failed</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
                </div>
                <div class="toast-body">
                    <i class="fas fa-exclamation-circle text-danger"></i>
                    <span>${error.message || 'Failed to download contract'}</span>
                </div>
            `;
            document.body.appendChild(errorToast);
            $(errorToast).toast({ delay: 5000 }).toast('show');

            // Remove the error toast after it's hidden
            $(errorToast).on('hidden.bs.toast', () => {
                document.body.removeChild(errorToast);
            });
        }
    }

    /**
     * Show review form for a completed rental
     * @param {string} rentalId - Rental contract ID
     */
    showReviewForm(rentalId) {
        // Implementation for showing review form
        alert('Review form feature coming soon!');
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
