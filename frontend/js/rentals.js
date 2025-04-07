/**
 * GigGatek Rental Management Module
 * Handles rental creation, retrieval, payments, and management functions
 */

class Rentals {
    constructor() {
        this.apiBaseUrl = '/api/rentals';
        
        // Verify auth module is available
        if (!window.auth) {
            console.error('Auth module required for Rentals module');
        }
    }
    
    /**
     * Get authentication headers for API requests
     * @returns {Object} Headers object with Authorization header
     */
    getAuthHeaders() {
        return window.auth ? window.auth.getAuthHeaders() : {};
    }
    
    /**
     * Get all rentals for the current user
     * @returns {Promise<Object>} Rentals data
     */
    async getUserRentals() {
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch rentals');
            }
            
            return {
                success: true,
                rentals: data.rentals
            };
        } catch (error) {
            console.error('Error fetching rentals:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch rentals'
            };
        }
    }
    
    /**
     * Get details for a specific rental
     * @param {number} rentalId - ID of the rental to retrieve
     * @returns {Promise<Object>} Rental details
     */
    async getRentalDetails(rentalId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch rental details');
            }
            
            return {
                success: true,
                rental: data.rental,
                payments: data.payments,
                status_history: data.status_history
            };
        } catch (error) {
            console.error(`Error fetching rental details for rental ${rentalId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to fetch rental details'
            };
        }
    }
    
    /**
     * Create a new rental
     * @param {Object} rentalData - Rental data
     * @param {number} rentalData.product_id - Product ID to rent
     * @param {number} rentalData.term_months - Rental term in months (3, 6, or 12)
     * @param {string} rentalData.start_date - Start date (YYYY-MM-DD)
     * @param {number} rentalData.order_id - Original order ID (optional)
     * @returns {Promise<Object>} Created rental data
     */
    async createRental(rentalData) {
        try {
            // Validate required fields
            if (!rentalData.product_id) {
                throw new Error('Product ID is required');
            }
            
            // Default term to 12 months if not specified
            if (!rentalData.term_months) {
                rentalData.term_months = 12;
            }
            
            // Validate term months (must be 3, 6, or 12)
            if (![3, 6, 12].includes(rentalData.term_months)) {
                throw new Error('Term months must be 3, 6, or 12');
            }
            
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rentalData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create rental');
            }
            
            return {
                success: true,
                rental_id: data.rental_id,
                rental: data.rental,
                message: data.message
            };
        } catch (error) {
            console.error('Error creating rental:', error);
            return {
                success: false,
                error: error.message || 'Failed to create rental'
            };
        }
    }
    
    /**
     * Record a payment for a rental
     * @param {number} rentalId - ID of the rental
     * @param {Object} paymentData - Payment data
     * @param {number} paymentData.payment_id - ID of the payment to record
     * @param {number} paymentData.amount - Payment amount
     * @param {string} paymentData.payment_method - Payment method
     * @param {string} paymentData.transaction_id - Transaction ID
     * @returns {Promise<Object>} Payment result
     */
    async recordPayment(rentalId, paymentData) {
        try {
            // Validate required fields
            if (!paymentData.payment_id) {
                throw new Error('Payment ID is required');
            }
            
            if (!paymentData.payment_method) {
                throw new Error('Payment method is required');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}/payments`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to record payment');
            }
            
            return {
                success: true,
                payment: data.payment,
                message: data.message
            };
        } catch (error) {
            console.error(`Error recording payment for rental ${rentalId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to record payment'
            };
        }
    }
    
    /**
     * Process a rental buyout
     * @param {number} rentalId - ID of the rental to buy out
     * @param {Object} buyoutData - Buyout data
     * @param {string} buyoutData.payment_method - Payment method
     * @param {string} buyoutData.transaction_id - Transaction ID
     * @returns {Promise<Object>} Buyout result
     */
    async processBuyout(rentalId, buyoutData) {
        try {
            // Validate required fields
            if (!buyoutData.payment_method) {
                throw new Error('Payment method is required');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}/buyout`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(buyoutData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to process buyout');
            }
            
            return {
                success: true,
                message: data.message,
                buyout_amount: data.buyout_amount,
                completion_date: data.completion_date
            };
        } catch (error) {
            console.error(`Error processing buyout for rental ${rentalId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to process buyout'
            };
        }
    }
    
    /**
     * Request a rental extension
     * @param {number} rentalId - ID of the rental to extend
     * @param {Object} extensionData - Extension data
     * @param {number} extensionData.additional_months - Number of additional months
     * @param {string} extensionData.reason - Reason for extension
     * @returns {Promise<Object>} Extension result
     */
    async requestExtension(rentalId, extensionData) {
        try {
            // Validate required fields
            if (!extensionData.additional_months) {
                throw new Error('Additional months is required');
            }
            
            if (!extensionData.reason) {
                throw new Error('Reason for extension is required');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/${rentalId}/extend`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(extensionData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to request extension');
            }
            
            return {
                success: true,
                message: data.message,
                extension_id: data.extension_id,
                new_end_date: data.new_end_date,
                awaiting_approval: data.awaiting_approval
            };
        } catch (error) {
            console.error(`Error requesting extension for rental ${rentalId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to request extension'
            };
        }
    }
    
    /**
     * Format currency for display
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            return '$0.00';
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Calculate payments remaining for a rental
     * @param {Object} rental - Rental object
     * @param {Array} payments - Payments array
     * @returns {Object} Payment summary
     */
    calculatePaymentSummary(rental, payments) {
        if (!rental || !payments || !Array.isArray(payments)) {
            return {
                totalPayments: 0,
                completedPayments: 0,
                remainingPayments: 0,
                nextPaymentDate: null,
                nextPaymentAmount: 0,
                progressPercentage: 0
            };
        }
        
        const totalPayments = payments.length;
        const completedPayments = payments.filter(p => p.status === 'paid').length;
        const remainingPayments = totalPayments - completedPayments;
        
        // Find next payment
        const now = new Date();
        const pendingPayments = payments
            .filter(p => p.status !== 'paid')
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        
        const nextPayment = pendingPayments.length > 0 ? pendingPayments[0] : null;
        const nextPaymentDate = nextPayment ? nextPayment.due_date : null;
        const nextPaymentAmount = nextPayment ? nextPayment.amount : 0;
        
        // Calculate progress percentage
        const progressPercentage = totalPayments > 0 
            ? (completedPayments / totalPayments) * 100 
            : 0;
        
        return {
            totalPayments,
            completedPayments,
            remainingPayments,
            nextPaymentDate,
            nextPaymentAmount,
            progressPercentage
        };
    }
    
    /**
     * Get styled badge HTML for rental status
     * @param {string} status - Rental status
     * @returns {string} HTML for status badge
     */
    getStatusBadgeHtml(status) {
        const statusClasses = {
            'active': 'badge-success',
            'pending': 'badge-warning',
            'on_hold': 'badge-info',
            'completed': 'badge-primary',
            'terminated': 'badge-danger',
            'default': 'badge-secondary'
        };
        
        const statusClass = statusClasses[status] || statusClasses['default'];
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        
        return `<span class="badge ${statusClass}">${statusLabel}</span>`;
    }
    
    /**
     * Get HTML for a payment progress bar
     * @param {number} progressPercentage - Progress percentage (0-100)
     * @param {string} label - Progress label text
     * @returns {string} HTML for progress bar
     */
    getProgressBarHtml(progressPercentage, label) {
        return `
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
                <div class="progress-label">${label}</div>
            </div>
        `;
    }
}

// Initialize the rentals singleton
window.rentals = new Rentals();
