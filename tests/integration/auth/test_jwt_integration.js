/**
 * GigGatek JWT Authentication Integration Test
 * 
 * This test verifies the integration between the frontend auth.js module
 * and the backend JWT authentication system.
 */

// Mock localStorage for testing
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
})();

// Mock fetch API for testing
const fetchMock = (url, options) => {
    console.log(`Mock fetch called with URL: ${url}`);
    console.log('Options:', options);
    
    // Simulate login response
    if (url.includes('/auth/login')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User'
                }
            })
        });
    }
    
    // Simulate getCurrentUser response
    if (url.includes('/auth/me')) {
        // Check if Authorization header is present
        if (options.headers && options.headers.Authorization) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 1,
                        email: 'test@example.com',
                        first_name: 'Test',
                        last_name: 'User'
                    }
                })
            });
        } else {
            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    error: 'Token is missing'
                })
            });
        }
    }
    
    // Simulate refresh token response
    if (url.includes('/auth/refresh-token')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                token: 'new-mock-jwt-token'
            })
        });
    }
    
    // Default response for unhandled URLs
    return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
            error: 'Endpoint not mocked'
        })
    });
};

// Test suite
describe('JWT Authentication Integration', () => {
    // Setup before tests
    beforeEach(() => {
        // Mock window objects
        global.localStorage = localStorageMock;
        global.fetch = fetchMock;
        global.window = {
            localStorage: localStorageMock,
            GigGatekConfig: {
                apiUrl: 'http://test-api.giggatek.com/api',
                getApiEndpoint: (path) => `http://test-api.giggatek.com/api/${path}`
            }
        };
        
        // Clear localStorage
        localStorage.clear();
    });
    
    // Test login functionality
    test('Login should store JWT token and user data', async () => {
        // Import auth module
        const auth = require('../../../frontend/js/auth');
        
        // Perform login
        const result = await auth.login('test@example.com', 'password123');
        
        // Verify result
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe('test@example.com');
        
        // Verify token is stored in localStorage
        expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
        
        // Verify auth state
        expect(auth.isAuthenticated).toBe(true);
        expect(auth.user).toBeDefined();
        expect(auth.user.id).toBe(1);
    });
    
    // Test token refresh functionality
    test('Token refresh should update stored token', async () => {
        // Import auth module
        const auth = require('../../../frontend/js/auth');
        
        // Set initial token
        localStorage.setItem('auth_token', 'initial-token');
        
        // Refresh token
        const result = await auth.refreshToken();
        
        // Verify result
        expect(result.success).toBe(true);
        expect(result.token).toBe('new-mock-jwt-token');
        
        // Verify token is updated in localStorage
        expect(localStorage.getItem('auth_token')).toBe('new-mock-jwt-token');
    });
    
    // Test getCurrentUser functionality
    test('getCurrentUser should retrieve user data with valid token', async () => {
        // Import auth module
        const auth = require('../../../frontend/js/auth');
        
        // Set token
        localStorage.setItem('auth_token', 'valid-token');
        
        // Get current user
        const result = await auth.getCurrentUser();
        
        // Verify result
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe('test@example.com');
        
        // Verify auth state
        expect(auth.isAuthenticated).toBe(true);
        expect(auth.user).toBeDefined();
    });
    
    // Test logout functionality
    test('Logout should clear token and user data', async () => {
        // Import auth module
        const auth = require('../../../frontend/js/auth');
        
        // Set initial state
        localStorage.setItem('auth_token', 'valid-token');
        
        // Perform logout
        auth.logout();
        
        // Verify token is removed from localStorage
        expect(localStorage.getItem('auth_token')).toBeNull();
        
        // Verify auth state
        expect(auth.isAuthenticated).toBe(false);
        expect(auth.user).toBeNull();
    });
});
