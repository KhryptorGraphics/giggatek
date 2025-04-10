/**
 * GigGatek Dashboard Settings Module
 * Handles user profile management, addresses, and payment methods
 */

class DashboardSettings {
    constructor() {
        this.addresses = [];
        this.paymentMethods = [];
        
        // Initialize module when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the settings module
     */
    init() {
        // Check if profile tab exists
        const profileTab = document.getElementById('profile-tab');
        if (!profileTab) return;
        
        // Check if addresses tab exists
        const addressesTab = document.getElementById('addresses-tab');
        if (addressesTab) {
            this.setupAddressesUI();
        }
        
        // Check if payment methods tab exists
        const paymentMethodsTab = document.getElementById('payment-methods-tab');
        if (paymentMethodsTab) {
            this.setupPaymentMethodsUI();
        }
        
        // Setup profile form
        this.setupProfileForm();
        
        // Listen for dashboard tab changes
        document.addEventListener('dashboard:tabChanged', (e) => {
            if (e.detail.tab === 'profile') {
                this.loadProfileData();
            } else if (e.detail.tab === 'addresses') {
                this.loadAddresses();
            } else if (e.detail.tab === 'payment-methods') {
                this.loadPaymentMethods();
            }
        });
        
        // If any of the tabs are currently active, load corresponding data
        if (window.dashboard && window.dashboard.activeTab === 'profile') {
            this.loadProfileData();
        } else if (window.dashboard && window.dashboard.activeTab === 'addresses') {
            this.loadAddresses();
        } else if (window.dashboard && window.dashboard.activeTab === 'payment-methods') {
            this.loadPaymentMethods();
        }
    }
    
    // Profile management
    setupProfileForm() { /* Implementation omitted for brevity */ }
    showProfileMessage(type, message) { /* Implementation omitted for brevity */ }
    async loadProfileData() { /* Implementation omitted for brevity */ }
    async saveProfileData(form) { /* Implementation omitted for brevity */ }
    
    // Address management
    setupAddressesUI() { /* Implementation omitted for brevity */ }
    async loadAddresses() { /* Implementation omitted for brevity */ }
    renderAddresses() { /* Implementation omitted for brevity */ }
    createAddressModal() { /* Implementation omitted for brevity */ }
    showAddressModal(addressId = null) { /* Implementation omitted for brevity */ }
    async saveAddress(form) { /* Implementation omitted for brevity */ }
    confirmDeleteAddress(addressId) { /* Implementation omitted for brevity */ }
    async deleteAddress(addressId) { /* Implementation omitted for brevity */ }
    async setDefaultAddress(addressId) { /* Implementation omitted for brevity */ }
    
    // Payment method management
    setupPaymentMethodsUI() {
        const paymentMethodsTab = document.getElementById('payment-methods-tab');
        
        // Add new payment method button
        const addPaymentMethodBtn = paymentMethodsTab.querySelector('.add-payment-method');
        if (addPaymentMethodBtn) {
            addPaymentMethodBtn.addEventListener('click', () => {
                this.showPaymentMethodModal();
            });
        }
        
        // Create payment method modal
        this.createPaymentMethodModal();
        
        // Add event delegation for payment method actions
        paymentMethodsTab.addEventListener('click', (e) => {
            // Delete payment method button
            if (e.target.classList.contains('delete-payment-method')) {
                e.preventDefault();
                const paymentMethodId = e.target.dataset.paymentMethodId;
                if (paymentMethodId) {
                    this.confirmDeletePaymentMethod(paymentMethodId);
                }
            }
            
            // Set default payment method button
            if (e.target.classList.contains('set-default-payment-method')) {
                e.preventDefault();
                const paymentMethodId = e.target.dataset.paymentMethodId;
                if (paymentMethodId) {
                    this.setDefaultPaymentMethod(paymentMethodId);
                }
            }
        });
    }
    
    async loadPaymentMethods() {
        const paymentMethodsContainer = document.querySelector('#payment-methods-tab .payment-methods-list');
        if (!paymentMethodsContainer) return;
        
        // Show loading state
        paymentMethodsContainer.innerHTML = '<div class="loading">Loading payment methods...</div>';
        
        try {
            const response = await fetch('/api/user/payment-methods', {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load payment methods: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.paymentMethods = data.paymentMethods || [];
                
                // Render payment methods
                this.renderPaymentMethods();
            } else {
                throw new Error(data.message || 'Failed to load payment methods');
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            
            paymentMethodsContainer.innerHTML = `
                <div class="error-message">
                    <p>There was a problem loading your payment methods.</p>
                    <button id="retry-load-payment-methods" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-load-payment-methods');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.loadPaymentMethods());
            }
        }
    }
    
    renderPaymentMethods() {
        const paymentMethodsContainer = document.querySelector('#payment-methods-tab .payment-methods-list');
        if (!paymentMethodsContainer) return;
        
        // Clear container
        paymentMethodsContainer.innerHTML = '';
        
        if (this.paymentMethods.length === 0) {
            // Show empty state
            paymentMethodsContainer.innerHTML = `
                <div class="no-data">
                    <p>You don't have any saved payment methods yet.</p>
                    <p>Add a payment method to speed up checkout.</p>
                </div>
            `;
            return;
        }
        
        // Create payment methods list
        this.paymentMethods.forEach(paymentMethod => {
            const paymentCard = document.createElement('div');
            paymentCard.className = `payment-card${paymentMethod.is_default ? ' default' : ''}`;
            paymentCard.dataset.paymentMethodId = paymentMethod.id;
            
            paymentCard.innerHTML = `
                <div class="card-icon ${paymentMethod.card_type.toLowerCase()}"></div>
                <div class="payment-details">
                    <div class="card-type">${paymentMethod.card_type}</div>
                    <div class="card-number">•••• •••• •••• ${paymentMethod.last4}</div>
                    <div class="card-expiry">Expires ${paymentMethod.expiry_month}/${paymentMethod.expiry_year}</div>
                    ${paymentMethod.is_default ? '<div class="default-badge">Default</div>' : ''}
                </div>
                <div class="payment-actions">
                    <button class="btn btn-outline-secondary delete-payment-method" data-payment-method-id="${paymentMethod.id}">Remove</button>
                    ${!paymentMethod.is_default ? `<button class="btn btn-link set-default-payment-method" data-payment-method-id="${paymentMethod.id}">Set as Default</button>` : ''}
                </div>
            `;
            
            paymentMethodsContainer.appendChild(paymentCard);
        });
    }
    
    createPaymentMethodModal() {
        // Basic implementation of the payment method modal
        if (!document.getElementById('payment-method-modal')) {
            const modal = document.createElement('div');
            modal.id = 'payment-method-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div class="payment-form-container">
                        <h2>Add Payment Method</h2>
                        <form id="payment-method-form" class="form">
                            <div id="stripe-card-element"></div>
                            <div id="card-errors" role="alert"></div>
                            
                            <div class="form-group checkbox">
                                <input type="checkbox" id="payment-default" name="payment-default" checked>
                                <label for="payment-default">Set as default payment method</label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Payment Method</button>
                                <button type="button" class="btn btn-secondary cancel-payment">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add basic event listeners
            const closeBtn = modal.querySelector('.close');
            const cancelBtn = modal.querySelector('.cancel-payment');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
            
            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    showPaymentMethodModal() {
        const modal = document.getElementById('payment-method-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    confirmDeletePaymentMethod(paymentMethodId) {
        // Find payment method
        const paymentMethod = this.paymentMethods.find(p => p.id === paymentMethodId);
        if (!paymentMethod) {
            console.error('Payment method not found:', paymentMethodId);
            return;
        }
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to remove this payment method (${paymentMethod.card_type} ending in ${paymentMethod.last4})?`)) {
            this.deletePaymentMethod(paymentMethodId);
        }
    }
    
    async deletePaymentMethod(paymentMethodId) {
        try {
            const response = await fetch(`/api/user/payment-methods/${paymentMethodId}`, {
                method: 'DELETE',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete payment method: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Reload payment methods
                this.loadPaymentMethods();
            } else {
                throw new Error(data.message || 'Failed to delete payment method');
            }
        } catch (error) {
            console.error('Error deleting payment method:', error);
            alert('There was a problem removing the payment method. Please try again.');
        }
    }
    
    async setDefaultPaymentMethod(paymentMethodId) {
        try {
            const response = await fetch(`/api/user/payment-methods/${paymentMethodId}/default`, {
                method: 'PUT',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to set default payment method: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Reload payment methods
                this.loadPaymentMethods();
            } else {
                throw new Error(data.message || 'Failed to set default payment method');
            }
        } catch (error) {
            console.error('Error setting default payment method:', error);
            alert('There was a problem setting the default payment method. Please try again.');
        }
    }
}

// Initialize the DashboardSettings module
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSettings = new DashboardSettings();
});
