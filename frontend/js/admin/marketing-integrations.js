/**
 * Marketing Integrations Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const integrationsTableBody = document.getElementById('integrations-table-body');
    const createIntegrationBtn = document.getElementById('create-integration-btn');
    const integrationModal = document.getElementById('integration-modal');
    const integrationForm = document.getElementById('integration-form');
    const integrationModalTitle = document.getElementById('integration-modal-title');
    const integrationId = document.getElementById('integration-id');
    const integrationName = document.getElementById('integration-name');
    const integrationProvider = document.getElementById('integration-provider');
    const integrationApiKey = document.getElementById('integration-api-key');
    const integrationApiSecret = document.getElementById('integration-api-secret');
    const integrationApiEndpoint = document.getElementById('integration-api-endpoint');
    const integrationConfig = document.getElementById('integration-config');
    const integrationActive = document.getElementById('integration-active');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const testModal = document.getElementById('test-modal');
    const testContent = document.getElementById('test-content');
    const syncModal = document.getElementById('sync-modal');
    const syncContent = document.getElementById('sync-content');
    const startSyncBtn = document.getElementById('start-sync-btn');
    
    // State
    const state = {
        integrations: [],
        filters: {
            status: 'active',
            search: ''
        },
        currentIntegration: null
    };
    
    // Initialize
    init();
    
    /**
     * Initialize the dashboard
     */
    function init() {
        // Load initial data
        loadIntegrations();
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Create integration button
        createIntegrationBtn.addEventListener('click', () => {
            openCreateIntegrationModal();
        });
        
        // Integration form submission
        integrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveIntegration();
        });
        
        // Provider change
        integrationProvider.addEventListener('change', () => {
            updateFormFields();
        });
        
        // Filters
        statusFilter.addEventListener('change', () => {
            state.filters.status = statusFilter.value;
            loadIntegrations();
        });
        
        // Search
        searchBtn.addEventListener('click', () => {
            state.filters.search = searchInput.value.trim();
            loadIntegrations();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                state.filters.search = searchInput.value.trim();
                loadIntegrations();
            }
        });
        
        // Start sync button
        startSyncBtn.addEventListener('click', () => {
            startSync();
        });
        
        // Close modals
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(el => {
            el.addEventListener('click', () => {
                closeAllModals();
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
    }
    
    /**
     * Update form fields based on selected provider
     */
    function updateFormFields() {
        const provider = integrationProvider.value;
        
        // Reset fields
        integrationApiEndpoint.value = '';
        
        // Set default values based on provider
        switch (provider) {
            case 'mailchimp':
                integrationApiEndpoint.value = 'https://us1.api.mailchimp.com/3.0';
                integrationConfig.value = JSON.stringify({
                    store_id: '',
                    list_id: '',
                    from_name: 'GigGatek',
                    reply_to: 'noreply@giggatek.com'
                }, null, 2);
                break;
            case 'klaviyo':
                integrationApiEndpoint.value = 'https://a.klaviyo.com/api';
                integrationConfig.value = JSON.stringify({
                    public_api_key: '',
                    from_email: 'noreply@giggatek.com',
                    from_name: 'GigGatek',
                    abandoned_cart_template_id: ''
                }, null, 2);
                break;
            case 'hubspot':
                integrationApiEndpoint.value = 'https://api.hubapi.com';
                integrationConfig.value = JSON.stringify({
                    portal_id: '',
                    abandoned_cart_workflow_id: ''
                }, null, 2);
                break;
            case 'sendgrid':
                integrationApiEndpoint.value = 'https://api.sendgrid.com/v3';
                integrationConfig.value = JSON.stringify({
                    from_email: 'noreply@giggatek.com',
                    from_name: 'GigGatek',
                    template_id: ''
                }, null, 2);
                break;
            case 'custom':
                integrationConfig.value = JSON.stringify({
                    // Custom configuration
                }, null, 2);
                break;
            default:
                integrationConfig.value = '{}';
                break;
        }
    }
    
    /**
     * Load integrations
     */
    function loadIntegrations() {
        // Show loading state
        integrationsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-message">Loading integrations...</td>
            </tr>
        `;
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (state.filters.status !== 'all') {
            params.append('active', state.filters.status === 'active' ? 'true' : 'false');
        }
        
        // Fetch integrations from API
        fetch(`/api/marketing/integrations?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load integrations');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.integrations) {
                // Filter by search term if provided
                let integrations = data.integrations;
                
                if (state.filters.search) {
                    const searchTerm = state.filters.search.toLowerCase();
                    integrations = integrations.filter(integration => 
                        integration.name.toLowerCase().includes(searchTerm) || 
                        integration.provider.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Update state
                state.integrations = integrations;
                
                // Render integrations
                renderIntegrations();
            }
        })
        .catch(error => {
            console.error('Error loading integrations:', error);
            
            // Show error state
            integrationsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">Error loading integrations. Please try again.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Render integrations table
     */
    function renderIntegrations() {
        if (state.integrations.length === 0) {
            integrationsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">No integrations found.</td>
                </tr>
            `;
            return;
        }
        
        integrationsTableBody.innerHTML = state.integrations.map(integration => `
            <tr>
                <td>${integration.id}</td>
                <td>${integration.name}</td>
                <td>${formatProviderName(integration.provider)}</td>
                <td>${integration.api_endpoint || '-'}</td>
                <td>${formatDate(integration.created_at)}</td>
                <td>
                    ${integration.active 
                        ? '<span class="badge badge-success">Active</span>' 
                        : '<span class="badge badge-danger">Inactive</span>'
                    }
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary edit-integration-btn" data-id="${integration.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-secondary test-integration-btn" data-id="${integration.id}">Test</button>
                    <button type="button" class="btn btn-sm btn-info sync-integration-btn" data-id="${integration.id}">Sync</button>
                    <button type="button" class="btn btn-sm btn-danger delete-integration-btn" data-id="${integration.id}">Delete</button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-integration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const integrationId = btn.getAttribute('data-id');
                openEditIntegrationModal(integrationId);
            });
        });
        
        document.querySelectorAll('.test-integration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const integrationId = btn.getAttribute('data-id');
                testIntegration(integrationId);
            });
        });
        
        document.querySelectorAll('.sync-integration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const integrationId = btn.getAttribute('data-id');
                openSyncModal(integrationId);
            });
        });
        
        document.querySelectorAll('.delete-integration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const integrationId = btn.getAttribute('data-id');
                deleteIntegration(integrationId);
            });
        });
    }
    
    /**
     * Open create integration modal
     */
    function openCreateIntegrationModal() {
        // Reset form
        integrationForm.reset();
        integrationId.value = '';
        integrationApiKey.value = '';
        integrationApiSecret.value = '';
        integrationConfig.value = '{}';
        integrationModalTitle.textContent = 'Add Integration';
        
        // Open modal
        openModal(integrationModal);
    }
    
    /**
     * Open edit integration modal
     * 
     * @param {string} id - Integration ID
     */
    function openEditIntegrationModal(id) {
        // Find integration
        const integration = state.integrations.find(i => i.id == id);
        
        if (!integration) {
            alert('Integration not found');
            return;
        }
        
        // Set form values
        integrationId.value = integration.id;
        integrationName.value = integration.name;
        integrationProvider.value = integration.provider;
        integrationApiEndpoint.value = integration.api_endpoint || '';
        integrationActive.checked = integration.active;
        
        // Clear sensitive fields
        integrationApiKey.value = '';
        integrationApiSecret.value = '';
        
        // Set modal title
        integrationModalTitle.textContent = 'Edit Integration';
        
        // Get full integration details
        fetch(`/api/marketing/integrations/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load integration details');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.integration) {
                // Set config
                integrationConfig.value = JSON.stringify(data.integration.config, null, 2);
            }
        })
        .catch(error => {
            console.error('Error loading integration details:', error);
            alert('Failed to load integration details. Please try again.');
        });
        
        // Open modal
        openModal(integrationModal);
    }
    
    /**
     * Save integration
     */
    function saveIntegration() {
        // Validate config JSON
        let config;
        try {
            config = JSON.parse(integrationConfig.value);
        } catch (e) {
            alert('Invalid JSON in configuration field');
            return;
        }
        
        // Build integration data
        const integrationData = {
            name: integrationName.value,
            provider: integrationProvider.value,
            api_endpoint: integrationApiEndpoint.value,
            config: config,
            active: integrationActive.checked
        };
        
        // Add API key and secret if provided
        if (integrationApiKey.value) {
            integrationData.api_key = integrationApiKey.value;
        }
        
        if (integrationApiSecret.value) {
            integrationData.api_secret = integrationApiSecret.value;
        }
        
        // Determine if creating or updating
        const isCreating = !integrationId.value;
        
        // API endpoint and method
        const endpoint = isCreating ? '/api/marketing/integrations' : `/api/marketing/integrations/${integrationId.value}`;
        const method = isCreating ? 'POST' : 'PUT';
        
        // Show loading state
        const submitBtn = integrationForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // Send request
        fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(integrationData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save integration');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close modal
                closeAllModals();
                
                // Reload integrations
                loadIntegrations();
                
                // Show success message
                alert(isCreating ? 'Integration created successfully' : 'Integration updated successfully');
            }
        })
        .catch(error => {
            console.error('Error saving integration:', error);
            alert('Failed to save integration. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Integration';
        });
    }
    
    /**
     * Delete integration
     * 
     * @param {string} id - Integration ID
     */
    function deleteIntegration(id) {
        if (!confirm('Are you sure you want to delete this integration? This will remove all associated data.')) {
            return;
        }
        
        fetch(`/api/marketing/integrations/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete integration');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Reload integrations
                loadIntegrations();
                
                // Show success message
                alert('Integration deleted successfully');
            }
        })
        .catch(error => {
            console.error('Error deleting integration:', error);
            alert('Failed to delete integration. Please try again.');
        });
    }
    
    /**
     * Test integration
     * 
     * @param {string} id - Integration ID
     */
    function testIntegration(id) {
        // Find integration
        const integration = state.integrations.find(i => i.id == id);
        
        if (!integration) {
            alert('Integration not found');
            return;
        }
        
        // Show loading state
        testContent.innerHTML = `<div class="loading-message">Testing connection to ${formatProviderName(integration.provider)}...</div>`;
        
        // Open modal
        openModal(testModal);
        
        // Send test request
        fetch(`/api/marketing/integrations/${id}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                testContent.innerHTML = `
                    <div class="success-message">
                        <h3>Connection Successful!</h3>
                        <p>${data.message}</p>
                        ${renderTestDetails(data.details, integration.provider)}
                    </div>
                `;
            } else {
                // Show error message
                testContent.innerHTML = `
                    <div class="error-message">
                        <h3>Connection Failed</h3>
                        <p>${data.error || data.message}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error testing integration:', error);
            
            // Show error message
            testContent.innerHTML = `
                <div class="error-message">
                    <h3>Connection Failed</h3>
                    <p>An error occurred while testing the connection. Please try again.</p>
                </div>
            `;
        });
    }
    
    /**
     * Render test details
     * 
     * @param {Object} details - Test details
     * @param {string} provider - Provider name
     * @returns {string} HTML for test details
     */
    function renderTestDetails(details, provider) {
        if (!details) return '';
        
        let html = '<div class="test-details">';
        
        switch (provider) {
            case 'mailchimp':
                html += `
                    <p><strong>Account Name:</strong> ${details.account_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${details.email || 'N/A'}</p>
                    <p><strong>Username:</strong> ${details.username || 'N/A'}</p>
                    <p><strong>Industry:</strong> ${details.industry || 'N/A'}</p>
                    <p><strong>Total Subscribers:</strong> ${details.total_subscribers || '0'}</p>
                `;
                break;
            case 'klaviyo':
                html += `
                    <p><strong>Account Name:</strong> ${details.account_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${details.email || 'N/A'}</p>
                    <p><strong>Timezone:</strong> ${details.timezone || 'N/A'}</p>
                    <p><strong>Public API Key:</strong> ${details.public_api_key || 'N/A'}</p>
                `;
                break;
            default:
                // Generic details rendering
                Object.keys(details).forEach(key => {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    html += `<p><strong>${formattedKey}:</strong> ${details[key] || 'N/A'}</p>`;
                });
                break;
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * Open sync modal
     * 
     * @param {string} id - Integration ID
     */
    function openSyncModal(id) {
        // Find integration
        const integration = state.integrations.find(i => i.id == id);
        
        if (!integration) {
            alert('Integration not found');
            return;
        }
        
        // Set current integration
        state.currentIntegration = integration;
        
        // Open modal
        openModal(syncModal);
    }
    
    /**
     * Start sync
     */
    function startSync() {
        if (!state.currentIntegration) {
            alert('No integration selected');
            return;
        }
        
        // Get sync type
        const syncType = document.querySelector('input[name="sync-type"]:checked').value;
        
        // Show loading state
        startSyncBtn.disabled = true;
        startSyncBtn.textContent = 'Syncing...';
        
        // Send sync request
        fetch(`/api/marketing/integrations/${state.currentIntegration.id}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ sync_type: syncType })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to start sync');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close modal
                closeAllModals();
                
                // Show success message
                alert(`Sync started successfully. ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error starting sync:', error);
            alert('Failed to start sync. Please try again.');
        })
        .finally(() => {
            // Reset button state
            startSyncBtn.disabled = false;
            startSyncBtn.textContent = 'Start Sync';
            
            // Clear current integration
            state.currentIntegration = null;
        });
    }
    
    /**
     * Open modal
     * 
     * @param {HTMLElement} modal - Modal element
     */
    function openModal(modal) {
        closeAllModals();
        modal.style.display = 'block';
    }
    
    /**
     * Close all modals
     */
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    /**
     * Format date
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    /**
     * Format provider name
     * 
     * @param {string} provider - Provider name
     * @returns {string} Formatted provider name
     */
    function formatProviderName(provider) {
        if (!provider) return 'N/A';
        
        switch (provider) {
            case 'mailchimp':
                return 'Mailchimp';
            case 'klaviyo':
                return 'Klaviyo';
            case 'hubspot':
                return 'HubSpot';
            case 'sendgrid':
                return 'SendGrid';
            case 'custom':
                return 'Custom';
            default:
                return provider.charAt(0).toUpperCase() + provider.slice(1);
        }
    }
    
    /**
     * Get auth token
     * 
     * @returns {string} Auth token
     */
    function getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }
});
