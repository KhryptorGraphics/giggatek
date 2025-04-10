/**
 * GigGatek Authentication Module
 * Handles user authentication, session management, and API authorization
 */

class Auth {
    constructor() {
        this.tokenKey = 'giggatek_auth_token';
        this.userKey = 'giggatek_user';
        this.tokenExpKey = 'giggatek_token_exp';
        this.apiBaseUrl = '/api/auth';
        
        // Initialize user data from local storage
        this.initFromStorage();
        
        // Set up token refresh interval if user is logged in
        if (this.isLoggedIn()) {
            this.setupTokenRefresh();
        }
    }
    
    /**
     * Initialize auth state from local storage
     */
    initFromStorage() {
        try {
            const token = localStorage.getItem(this.tokenKey);
            const userJson = localStorage.getItem(this.userKey);
            const tokenExp = localStorage.getItem(this.tokenExpKey);
            
            if (token && userJson) {
                this.token = token;
                this.user = JSON.parse(userJson);
                this.tokenExp = tokenExp ? new Date(parseInt(tokenExp)) : null;
            }
        } catch (error) {
            console.error('Error initializing auth from storage:', error);
            this.clearAuth();
        }
    }
    
    /**
     * Set up automatic token refresh
     */
    setupTokenRefresh() {
        // Clear any existing refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Calculate time until token expiration
        const expiresIn = this.tokenExp ? this.tokenExp.getTime() - Date.now() : 3600000; // Default 1 hour
        const refreshTime = Math.max(0, expiresIn - 300000); // Refresh 5 minutes before expiration
        
        // Set up refresh interval
        this.refreshInterval = setTimeout(() => {
            this.refreshToken();
        }, refreshTime);
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} Whether user is logged in
     */
    isLoggedIn() {
        return !!this.token && !!this.user;
    }
    
    /**
     * Get current user
     * @returns {Object|null} User object or null if not logged in
     */
    getUser() {
        return this.user || null;
    }
    
    /**
     * Get authentication token
     * @returns {string|null} Auth token or null if not logged in
     */
    getToken() {
        return this.token || null;
    }
    
    /**
     * Get authentication headers for API requests
     * @returns {Object} Headers object with Authorization header
     */
    getAuthHeaders() {
        return this.isLoggedIn() ? 
            { 'Authorization': `Bearer ${this.token}` } : {};
    }
    
    /**
     * Store authentication state in local storage
     * @param {string} token - Authentication token
     * @param {Object} user - User object
     * @param {Date} expiration - Token expiration date
     */
    storeAuth(token, user, expiration) {
        this.token = token;
        this.user = user;
        this.tokenExp = expiration;
        
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem(this.tokenExpKey, expiration ? expiration.getTime().toString() : '');
        
        this.setupTokenRefresh();
    }
    
    /**
     * Clear authentication state
     */
    clearAuth() {
        this.token = null;
        this.user = null;
        this.tokenExp = null;
        
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenExpKey);
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            const { token, user, expires_in } = data;
            
            // Calculate token expiration
            const expiresIn = expires_in || 3600; // Default 1 hour
            const expirationDate = new Date(Date.now() + expiresIn * 1000);
            
            // Store authentication state
            this.storeAuth(token, user, expirationDate);
            
            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }
    
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration result
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            return {
                success: true,
                message: data.message || 'Registration successful'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
    }
    
    /**
     * Logout the current user
     * @returns {Promise<Object>} Logout result
     */
    async logout() {
        try {
            if (this.isLoggedIn()) {
                try {
                    // Attempt to invalidate token on server
                    await fetch(`${this.apiBaseUrl}/logout`, {
                        method: 'POST',
                        headers: {
                            ...this.getAuthHeaders(),
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (e) {
                    // Continue with logout even if server request fails
                    console.warn('Error during server logout:', e);
                }
            }
            
            // Clear authentication state
            this.clearAuth();
            
            // Redirect to login page
            window.location.href = 'login.php';
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Logout error:', error);
            
            // Clear auth anyway on logout failure
            this.clearAuth();
            
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }
    }
    
    /**
     * Refresh authentication token
     * @returns {Promise<Object>} Refresh result
     */
    async refreshToken() {
        try {
            if (!this.isLoggedIn()) {
                throw new Error('Not logged in');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/refresh-token`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }
            
            const { token, expires_in } = data;
            
            // Calculate token expiration
            const expiresIn = expires_in || 3600; // Default 1 hour
            const expirationDate = new Date(Date.now() + expiresIn * 1000);
            
            // Store authentication state (keep the same user data)
            this.storeAuth(token, this.user, expirationDate);
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Token refresh error:', error);
            
            // If token refresh fails, log out
            this.clearAuth();
            
            // Redirect to login page if token refresh fails
            window.location.href = 'login.php?session_expired=1';
            
            return {
                success: false,
                error: error.message || 'Token refresh failed'
            };
        }
    }
    
    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile() {
        try {
            if (!this.isLoggedIn()) {
                throw new Error('Not logged in');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/me`, {
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
            
            // Update stored user data
            this.user = data.user;
            localStorage.setItem(this.userKey, JSON.stringify(this.user));
            
            return {
                success: true,
                user: data.user
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
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} Update result
     */
    async updateProfile(profileData) {
        try {
            if (!this.isLoggedIn()) {
                throw new Error('Not logged in');
            }
            
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
            
            // Update stored user data
            this.user = { ...this.user, ...profileData };
            localStorage.setItem(this.userKey, JSON.stringify(this.user));
            
            return {
                success: true,
                user: this.user,
                message: data.message || 'Profile updated successfully'
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
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Password change result
     */
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.isLoggedIn()) {
                throw new Error('Not logged in');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/change-password`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }
            
            return {
                success: true,
                message: data.message || 'Password changed successfully'
            };
        } catch (error) {
            console.error('Error changing password:', error);
            return {
                success: false,
                error: error.message || 'Failed to change password'
            };
        }
    }
    
    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset request result
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/password-reset-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to request password reset');
            }
            
            return {
                success: true,
                message: data.message || 'Password reset email sent'
            };
        } catch (error) {
            console.error('Error requesting password reset:', error);
            return {
                success: false,
                error: error.message || 'Failed to request password reset'
            };
        }
    }
    
    /**
     * Reset password with token
     * @param {string} token - Password reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Password reset result
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }
            
            return {
                success: true,
                message: data.message || 'Password reset successfully'
            };
        } catch (error) {
            console.error('Error resetting password:', error);
            return {
                success: false,
                error: error.message || 'Failed to reset password'
            };
        }
    }
}

// Initialize the auth singleton
window.auth = new Auth();
