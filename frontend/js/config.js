/**
 * GigGatek Frontend Configuration
 *
 * Central configuration for the frontend application.
 * Environment-specific settings should be managed here.
 */

const GigGatekConfig = (function() {
    // Detect environment
    const hostname = window.location.hostname;
    let environment = 'production';

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        environment = 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        environment = 'staging';
    }

    // Environment-specific configurations
    const configs = {
        development: {
            apiUrl: '', // Use direct PHP files
            debug: true,
            tokenRefreshInterval: 45 * 60 * 1000, // 45 minutes in milliseconds
        },
        staging: {
            apiUrl: 'https://staging-api.giggatek.com/api',
            debug: true,
            tokenRefreshInterval: 45 * 60 * 1000,
        },
        production: {
            apiUrl: '', // Use direct PHP files
            debug: false,
            tokenRefreshInterval: 45 * 60 * 1000,
        }
    };

    // Get current environment config
    const currentConfig = configs[environment];

    // Public API
    return {
        apiUrl: currentConfig.apiUrl,
        debug: currentConfig.debug,
        environment: environment,
        tokenRefreshInterval: currentConfig.tokenRefreshInterval,

        // Helper method to get API endpoint URL
        getApiEndpoint: function(path) {
            // Map API paths to PHP files
            const apiMap = {
                '/products': '/api_products.php',
                '/db-test': '/api_db_test.php'
                // Add more mappings as needed
            };

            // Check if we have a direct mapping for this path
            const cleanPath = path.startsWith('/') ? path : '/' + path;
            if (apiMap[cleanPath]) {
                return apiMap[cleanPath];
            }

            // Fall back to the old approach if no mapping exists
            return this.apiUrl + cleanPath;
        }
    };
})();

// Make config globally available
window.GigGatekConfig = GigGatekConfig;
