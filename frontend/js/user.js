/**
 * GigGatek User Management Module
 * Handles user profile, addresses, payment methods, and wishlist
 */

class User {
    constructor() {
        this.apiBaseUrl = '/api/user';
        
        // Verify auth module is available
        if (!window.auth) {
            console.error('Auth module required for User module');
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
     * Get user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get user profile');
            }
            
            return {
                success: true,
                profile: data.profile
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            return {
                success: false,
                error: error.message || 'Failed to get user profile'
            };
        }
    }
    
    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Update result
     */
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }
            
            return {
                success: true,
                profile: data.profile
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                error: error.message || 'Failed to update profile'
            };
        }
    }
    
    /**
     * Get user addresses
     * @returns {Promise<Object>} User addresses
     */
    async getAddresses() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/addresses`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get addresses');
            }
            
            return {
                success: true,
                addresses: data.addresses
            };
        } catch (error) {
            console.error('Error getting addresses:', error);
            return {
                success: false,
                error: error.message || 'Failed to get addresses'
            };
        }
    }
    
    /**
     * Add a new address
     * @param {Object} addressData - Address data
     * @returns {Promise<Object>} Result with new address
     */
    async addAddress(addressData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/addresses`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addressData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add address');
            }
            
            return {
                success: true,
                address: data.address
            };
        } catch (error) {
            console.error('Error adding address:', error);
            return {
                success: false,
                error: error.message || 'Failed to add address'
            };
        }
    }
    
    /**
     * Update an existing address
     * @param {number} addressId - ID of the address to update
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object>} Update result
     */
    async updateAddress(addressId, addressData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/addresses/${addressId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addressData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update address');
            }
            
            return {
                success: true,
                address: data.address
            };
        } catch (error) {
            console.error(`Error updating address ${addressId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to update address'
            };
        }
    }
    
    /**
     * Delete an address
     * @param {number} addressId - ID of the address to delete
     * @returns {Promise<Object>} Delete result
     */
    async deleteAddress(addressId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete address');
            }
            
            return {
                success: true,
                message: data.message || 'Address deleted successfully'
            };
        } catch (error) {
            console.error(`Error deleting address ${addressId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to delete address'
            };
        }
    }
    
    /**
     * Set default address
     * @param {number} addressId - ID of the address to set as default
     * @returns {Promise<Object>} Result
     */
    async setDefaultAddress(addressId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/addresses/${addressId}/default`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to set default address');
            }
            
            return {
                success: true,
                message: data.message || 'Default address set successfully'
            };
        } catch (error) {
            console.error(`Error setting default address ${addressId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to set default address'
            };
        }
    }
    
    /**
     * Get payment methods
     * @returns {Promise<Object>} User payment methods
     */
    async getPaymentMethods() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payment-methods`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get payment methods');
            }
            
            return {
                success: true,
                paymentMethods: data.payment_methods
            };
        } catch (error) {
            console.error('Error getting payment methods:', error);
            return {
                success: false,
                error: error.message || 'Failed to get payment methods'
            };
        }
    }
    
    /**
     * Add a new payment method
     * @param {Object} paymentData - Payment method data (stripe token)
     * @returns {Promise<Object>} Result with new payment method
     */
    async addPaymentMethod(paymentData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payment-methods`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add payment method');
            }
            
            return {
                success: true,
                paymentMethod: data.payment_method
            };
        } catch (error) {
            console.error('Error adding payment method:', error);
            return {
                success: false,
                error: error.message || 'Failed to add payment method'
            };
        }
    }
    
    /**
     * Delete a payment method
     * @param {number} paymentMethodId - ID of the payment method to delete
     * @returns {Promise<Object>} Delete result
     */
    async deletePaymentMethod(paymentMethodId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payment-methods/${paymentMethodId}`, {
                method: 'DELETE',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete payment method');
            }
            
            return {
                success: true,
                message: data.message || 'Payment method deleted successfully'
            };
        } catch (error) {
            console.error(`Error deleting payment method ${paymentMethodId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to delete payment method'
            };
        }
    }
    
    /**
     * Set default payment method
     * @param {number} paymentMethodId - ID of the payment method to set as default
     * @returns {Promise<Object>} Result
     */
    async setDefaultPaymentMethod(paymentMethodId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payment-methods/${paymentMethodId}/default`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to set default payment method');
            }
            
            return {
                success: true,
                message: data.message || 'Default payment method set successfully'
            };
        } catch (error) {
            console.error(`Error setting default payment method ${paymentMethodId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to set default payment method'
            };
        }
    }
    
    /**
     * Get wishlist items
     * @returns {Promise<Object>} User wishlist items
     */
    async getWishlist() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/wishlist`, {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get wishlist');
            }
            
            return {
                success: true,
                items: data.items
            };
        } catch (error) {
            console.error('Error getting wishlist:', error);
            return {
                success: false,
                error: error.message || 'Failed to get wishlist'
            };
        }
    }
    
    /**
     * Add item to wishlist
     * @param {number} productId - ID of the product to add
     * @returns {Promise<Object>} Add result
     */
    async addToWishlist(productId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/wishlist`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add to wishlist');
            }
            
            return {
                success: true,
                message: data.message || 'Item added to wishlist'
            };
        } catch (error) {
            console.error(`Error adding product ${productId} to wishlist:`, error);
            return {
                success: false,
                error: error.message || 'Failed to add to wishlist'
            };
        }
    }
    
    /**
     * Remove item from wishlist
     * @param {number} productId - ID of the product to remove
     * @returns {Promise<Object>} Remove result
     */
    async removeFromWishlist(productId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/wishlist/${productId}`, {
                method: 'DELETE',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove from wishlist');
            }
            
            return {
                success: true,
                message: data.message || 'Item removed from wishlist'
            };
        } catch (error) {
            console.error(`Error removing product ${productId} from wishlist:`, error);
            return {
                success: false,
                error: error.message || 'Failed to remove from wishlist'
            };
        }
    }
    
    /**
     * Format address for display
     * @param {Object} address - Address object
     * @returns {string} Formatted address string
     */
    formatAddress(address) {
        if (!address) {
            return '';
        }
        
        const parts = [];
        
        if (address.first_name || address.last_name) {
            parts.push(`${address.first_name || ''} ${address.last_name || ''}`.trim());
        }
        
        if (address.street_address) {
            parts.push(address.street_address);
        }
        
        if (address.street_address2) {
            parts.push(address.street_address2);
        }
        
        const cityStateZip = [];
        if (address.city) cityStateZip.push(address.city);
        if (address.state) cityStateZip.push(address.state);
        if (address.zip_code) cityStateZip.push(address.zip_code);
        
        if (cityStateZip.length > 0) {
            parts.push(cityStateZip.join(', '));
        }
        
        if (address.country) {
            parts.push(address.country);
        }
        
        return parts.join('<br>');
    }
    
    /**
     * Format payment method for display
     * @param {Object} paymentMethod - Payment method object
     * @returns {Object} Formatted payment method display info
     */
    formatPaymentMethod(paymentMethod) {
        if (!paymentMethod) {
            return {
                type: 'unknown',
                last4: '',
                expiryDate: '',
                cardholderName: ''
            };
        }
        
        return {
            type: paymentMethod.card_type || 'card',
            last4: paymentMethod.last4 || '****',
            expiryDate: paymentMethod.expiry_month && paymentMethod.expiry_year ? 
                `${paymentMethod.expiry_month}/${paymentMethod.expiry_year}` : '',
            cardholderName: paymentMethod.cardholder_name || ''
        };
    }
}

// Initialize the user singleton
window.user = new User();
