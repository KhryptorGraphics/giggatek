/**
 * GigGatek Authentication Module
 * 
 * Handles user authentication, registration, token management,
 * and authenticated state across the application.
 */

const auth = (function() {
    // Auth state
    let currentUser = null;
    let authToken = null;
    let isAuthenticated = false;
    
    // Event callbacks
    const callbacks = {
        onLogin: [],
        onLogout: [],
        onAuthChange: []
    };
    
    // API URL - should be configured based on environment
    const API_URL = '/api';  // Updated to match correct backend configuration
    
    /**
     * Initialize the auth module
     * Checks for stored token and tries to authenticate
     */
    function init() {
        // Try to get token from localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            authToken = token;
            // Validate token and get user info
            getCurrentUser()
                .then(() => {
                    console.log('User authenticated from stored token');
                })
                .catch(err => {
                    console.error('Stored token is invalid:', err);
                    logout();
                });
        }
        
        // Handle restricted pages
        const requiresAuth = document.body.getAttribute('data-require-auth') === 'true';
        if (requiresAuth && !isAuthenticated) {
            redirectToLogin();
        }
    }
    
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} - API response
     */
    async function register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Store auth token and user data
            authToken = data.token;
            currentUser = data.user;
            isAuthenticated = true;
            
            // Save token to localStorage
            localStorage.setItem('auth_token', authToken);
            
            // Trigger callbacks
            triggerCallbacks('onLogin', currentUser);
            triggerCallbacks('onAuthChange', true);
            
            return { success: true, user: currentUser };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Log in an existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - API response
     */
    async function login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store auth token and user data
            authToken = data.token;
            currentUser = data.user;
            isAuthenticated = true;
            
            // Save token to localStorage
            localStorage.setItem('auth_token', authToken);
            
            // Trigger callbacks
            triggerCallbacks('onLogin', currentUser);
            triggerCallbacks('onAuthChange', true);
            
            return { success: true, user: currentUser };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Log out the current user
     */
    function logout() {
        // Clear auth state
        authToken = null;
        currentUser = null;
        isAuthenticated = false;
        
        // Remove token from localStorage
        localStorage.removeItem('auth_token');
        
        // Trigger callbacks
        triggerCallbacks('onLogout');
        triggerCallbacks('onAuthChange', false);
        
        // Redirect to login page if on a restricted page
        const requiresAuth = document.body.getAttribute('data-require-auth') === 'true';
        if (requiresAuth) {
            redirectToLogin();
        }
    }
    
    /**
     * Get current authenticated user
     * @returns {Promise} - User data
     */
    async function getCurrentUser() {
        if (!authToken) {
            return { success: false, error: 'No authentication token' };
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get user');
            }
            
            // Update user data and auth state
            currentUser = data.user;
            isAuthenticated = true;
            
            // Trigger auth change callback
            triggerCallbacks('onAuthChange', true);
            
            return { success: true, user: currentUser };
        } catch (error) {
            console.error('Error getting current user:', error);
            
            // Clear invalid auth state
            if (error.message === 'Token has expired' || error.message === 'Invalid token') {
                logout();
            }
            
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Update user profile
     * @param {Object} userData - User data to update
     * @returns {Promise} - API response
     */
    async function updateProfile(userData) {
        if (!authToken) {
            return { success: false, error: 'Not authenticated' };
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }
            
            // Update current user data
            currentUser = { ...currentUser, ...data.user };
            
            return { success: true, user: currentUser };
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise} - API response
     */
    async function changePassword(currentPassword, newPassword) {
        if (!authToken) {
            return { success: false, error: 'Not authenticated' };
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }
            
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error changing password:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise} - API response
     */
    async function requestPasswordReset(email) {
        try {
            const response = await fetch(`${API_URL}/auth/password-reset-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to request password reset');
            }
            
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error requesting password reset:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise} - API response
     */
    async function resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${API_URL}/auth/password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }
            
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error resetting password:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Refresh the auth token
     * @returns {Promise} - New token
     */
    async function refreshToken() {
        if (!authToken) {
            return { success: false, error: 'Not authenticated' };
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to refresh token');
            }
            
            // Update token
            authToken = data.token;
            localStorage.setItem('auth_token', authToken);
            
            return { success: true, token: authToken };
        } catch (error) {
            console.error('Error refreshing token:', error);
            
            // If token refresh fails due to auth issues, log out
            if (error.message === 'Token has expired' || error.message === 'Invalid token') {
                logout();
            }
            
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Subscribe to auth events
     * @param {string} event - Event name (onLogin, onLogout, onAuthChange)
     * @param {Function} callback - Callback function
     */
    function subscribe(event, callback) {
        if (callbacks[event] && typeof callback === 'function') {
            callbacks[event].push(callback);
        }
    }
    
    /**
     * Unsubscribe from auth events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    function unsubscribe(event, callback) {
        if (callbacks[event] && typeof callback === 'function') {
            callbacks[event] = callbacks[event].filter(cb => cb !== callback);
        }
    }
    
    /**
     * Trigger event callbacks
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     */
    function triggerCallbacks(event, data) {
        if (callbacks[event]) {
            callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
    
    /**
     * Redirect to login page
     */
    function redirectToLogin() {
        const currentPath = encodeURIComponent(window.location.pathname);
        window.location.href = `/login.php?redirect=${currentPath}`;
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    function checkAuth() {
        return isAuthenticated;
    }
    
    /**
     * Get the current auth token
     * @returns {string|null} - Auth token
     */
    function getToken() {
        return authToken;
    }
    
    /**
     * Get the current user
     * @returns {Object|null} - User data
     */
    function getUser() {
        return currentUser;
    }
    
    // Initialize auth on script load
    setTimeout(init, 0);
    
    // Public API
    return {
        register,
        login,
        logout,
        getCurrentUser,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        refreshToken,
        subscribe,
        unsubscribe,
        checkAuth,
        getToken,
        getUser,
        get user() { return currentUser; },
        get isAuthenticated() { return isAuthenticated; }
    };
})();

// Make auth globally available
window.auth = auth;

// If forms exist, set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitButton = this.querySelector('button[type="submit"]');
            const errorContainer = document.getElementById('login-error');
            
            // UI feedback
            submitButton.disabled = true;
            submitButton.innerHTML = 'Signing in...';
            if (errorContainer) errorContainer.textContent = '';
            
            const result = await auth.login(email, password);
            
            // Reset UI
            submitButton.disabled = false;
            submitButton.innerHTML = 'Sign In';
            
            if (result.success) {
                // Check if there's a redirect parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                
                // Redirect to dashboard or specified page
                window.location.href = redirect || 'dashboard.php';
            } else {
                // Show error
                if (errorContainer) {
                    errorContainer.textContent = result.error || 'Login failed';
                } else {
                    alert(result.error || 'Login failed');
                }
            }
        });
    }
    
    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
                first_name: document.getElementById('register-first-name').value,
                last_name: document.getElementById('register-last-name').value
            };
            
            const passwordConfirm = document.getElementById('register-confirm-password').value;
            const submitButton = this.querySelector('button[type="submit"]');
            const errorContainer = document.getElementById('register-error');
            
            // Validate passwords match
            if (userData.password !== passwordConfirm) {
                if (errorContainer) {
                    errorContainer.textContent = 'Passwords do not match';
                } else {
                    alert('Passwords do not match');
                }
                return;
            }
            
            // UI feedback
            submitButton.disabled = true;
            submitButton.innerHTML = 'Creating Account...';
            if (errorContainer) errorContainer.textContent = '';
            
            const result = await auth.register(userData);
            
            // Reset UI
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
            
            if (result.success) {
                // Redirect to dashboard
                window.location.href = 'dashboard.php';
            } else {
                // Show error
                if (errorContainer) {
                    errorContainer.textContent = result.error || 'Registration failed';
                } else {
                    alert(result.error || 'Registration failed');
                }
            }
        });
    }
    
    // Password reset request form
    const resetRequestForm = document.getElementById('password-reset-request-form');
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('reset-email').value;
            const submitButton = this.querySelector('button[type="submit"]');
            const messageContainer = document.getElementById('reset-message');
            
            // UI feedback
            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending...';
            
            const result = await auth.requestPasswordReset(email);
            
            // Reset UI
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Reset Link';
            
            // Always show success message, even if email doesn't exist (security)
            if (messageContainer) {
                messageContainer.className = 'alert alert-success';
                messageContainer.textContent = 'If the email exists, a password reset link has been sent';
                messageContainer.style.display = 'block';
            } else {
                alert('If the email exists, a password reset link has been sent');
            }
        });
    }
    
    // Password reset form
    const resetForm = document.getElementById('password-reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (!token) {
                alert('Reset token is missing');
                return;
            }
            
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitButton = this.querySelector('button[type="submit"]');
            const messageContainer = document.getElementById('reset-message');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                if (messageContainer) {
                    messageContainer.className = 'alert alert-danger';
                    messageContainer.textContent = 'Passwords do not match';
                    messageContainer.style.display = 'block';
                } else {
                    alert('Passwords do not match');
                }
                return;
            }
            
            // UI feedback
            submitButton.disabled = true;
            submitButton.innerHTML = 'Resetting...';
            
            const result = await auth.resetPassword(token, password);
            
            // Reset UI
            submitButton.disabled = false;
            submitButton.innerHTML = 'Reset Password';
            
            if (result.success) {
                if (messageContainer) {
                    messageContainer.className = 'alert alert-success';
                    messageContainer.textContent = 'Password reset successful. You can now login with your new password.';
                    messageContainer.style.display = 'block';
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 3000);
                } else {
                    alert('Password reset successful');
                    window.location.href = 'login.php';
                }
            } else {
                if (messageContainer) {
                    messageContainer.className = 'alert alert-danger';
                    messageContainer.textContent = result.error || 'Failed to reset password';
                    messageContainer.style.display = 'block';
                } else {
                    alert(result.error || 'Failed to reset password');
                }
            }
        });
    }
    
    // Dashboard profile form
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                first_name: document.getElementById('first-name').value,
                last_name: document.getElementById('last-name').value
            };
            
            // Add phone if it exists
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                userData.phone = phoneInput.value;
            }
            
            const submitButton = this.querySelector('button[type="submit"]');
            
            // UI feedback
            submitButton.disabled = true;
            submitButton.innerHTML = 'Saving...';
            
            const result = await auth.updateProfile(userData);
            
            // Reset UI
            submitButton.disabled = false;
            submitButton.innerHTML = 'Save Changes';
            
            if (result.success) {
                // Show success message
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-success';
                messageDiv.textContent = 'Profile updated successfully';
                
                // Insert message before the form
                profileForm.parentNode.insertBefore(messageDiv, profileForm);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
            } else {
                // Show error message
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-danger';
                messageDiv.textContent = result.error || 'Failed to update profile';
                
                // Insert message before the form
                profileForm.parentNode.insertBefore(messageDiv, profileForm);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
            }
        });
    }
    
    // Dashboard password form
    const passwordForm = document.querySelector('.password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-danger';
                messageDiv.textContent = 'Passwords do not match';
                
                // Insert message before the form
                passwordForm.parentNode.insertBefore(messageDiv, passwordForm);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
                
                return;
            }
            
            // UI feedback
            submitButton.disabled = true;
            submitButton.innerHTML = 'Updating...';
            
            const result = await auth.changePassword(currentPassword, newPassword);
            
            // Reset UI
            submitButton.disabled = false;
            submitButton.innerHTML = 'Update Password';
            
            if (result.success) {
                // Clear form
                passwordForm.reset();
                
                // Show success message
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-success';
                messageDiv.textContent = 'Password updated successfully';
                
                // Insert message before the form
                passwordForm.parentNode.insertBefore(messageDiv, passwordForm);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
            } else {
                // Show error message
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-danger';
                messageDiv.textContent = result.error || 'Failed to update password';
                
                // Insert message before the form
                passwordForm.parentNode.insertBefore(messageDiv, passwordForm);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
            }
        });
    }
});
