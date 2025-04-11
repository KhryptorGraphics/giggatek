/**
 * Predictive Analytics Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const recommendationsTableBody = document.getElementById('recommendations-table-body');
    const trainModelsBtn = document.getElementById('train-models-btn');
    const actionFilter = document.getElementById('action-filter');
    const appliedFilter = document.getElementById('applied-filter');
    const avgRecoveryLikelihood = document.getElementById('avg-recovery-likelihood');
    const recommendationCount = document.getElementById('recommendation-count');
    const successRate = document.getElementById('success-rate');
    const modelAccuracy = document.getElementById('model-accuracy');
    
    // State
    const state = {
        recommendations: [],
        filters: {
            action: 'all',
            applied: 'false'
        }
    };
    
    // Initialize
    init();
    
    /**
     * Initialize the dashboard
     */
    function init() {
        // Load initial data
        loadStats();
        loadRecommendations();
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Train models button
        trainModelsBtn.addEventListener('click', () => {
            trainModels();
        });
        
        // Filters
        actionFilter.addEventListener('change', () => {
            state.filters.action = actionFilter.value;
            loadRecommendations();
        });
        
        appliedFilter.addEventListener('change', () => {
            state.filters.applied = appliedFilter.value;
            loadRecommendations();
        });
    }
    
    /**
     * Load dashboard stats
     */
    function loadStats() {
        fetch('/api/predictive/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load stats');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.stats) {
                // Update stats
                const stats = data.stats;
                
                // Predictions
                if (stats.predictions) {
                    avgRecoveryLikelihood.textContent = stats.predictions.avg_score 
                        ? `${(stats.predictions.avg_score * 100).toFixed(1)}%` 
                        : 'N/A';
                }
                
                // Recommendations
                if (stats.recommendations) {
                    recommendationCount.textContent = stats.recommendations.total || '0';
                    
                    const applied = stats.recommendations.applied || 0;
                    const successful = stats.recommendations.successful || 0;
                    const rate = applied > 0 ? (successful / applied) * 100 : 0;
                    
                    successRate.textContent = `${rate.toFixed(1)}%`;
                }
                
                // Models
                if (stats.models) {
                    modelAccuracy.textContent = stats.models.avg_accuracy 
                        ? `${(stats.models.avg_accuracy * 100).toFixed(1)}%` 
                        : 'N/A';
                }
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });
    }
    
    /**
     * Load recommendations
     */
    function loadRecommendations() {
        // Show loading state
        recommendationsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-message">Loading recommendations...</td>
            </tr>
        `;
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (state.filters.action !== 'all') {
            params.append('action', state.filters.action);
        }
        
        if (state.filters.applied !== 'all') {
            params.append('applied', state.filters.applied);
        }
        
        // Fetch recommendations from API
        fetch(`/api/predictive/recommendations?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recommendations');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.recommendations) {
                // Update state
                state.recommendations = data.recommendations;
                
                // Render recommendations
                renderRecommendations();
            }
        })
        .catch(error => {
            console.error('Error loading recommendations:', error);
            
            // Show error state
            recommendationsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-message">Error loading recommendations. Please try again.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Render recommendations table
     */
    function renderRecommendations() {
        if (state.recommendations.length === 0) {
            recommendationsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-message">No recommendations found.</td>
                </tr>
            `;
            return;
        }
        
        recommendationsTableBody.innerHTML = state.recommendations.map(recommendation => `
            <tr>
                <td>${recommendation.id}</td>
                <td>${recommendation.cart_id}</td>
                <td>${recommendation.email}</td>
                <td>$${recommendation.cart_value.toFixed(2)}</td>
                <td>${formatAction(recommendation.recommended_action)}</td>
                <td>${recommendation.priority}</td>
                <td>
                    ${recommendation.applied 
                        ? `<span class="badge badge-${recommendation.result === 'success' ? 'success' : recommendation.result === 'failure' ? 'danger' : 'warning'}">${formatResult(recommendation.result)}</span>` 
                        : '<span class="badge badge-secondary">Pending</span>'
                    }
                </td>
                <td>
                    ${!recommendation.applied 
                        ? `<button type="button" class="btn btn-sm btn-primary apply-btn" data-id="${recommendation.id}">Apply</button>` 
                        : '<button type="button" class="btn btn-sm btn-secondary" disabled>Applied</button>'
                    }
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const recommendationId = btn.getAttribute('data-id');
                applyRecommendation(recommendationId);
            });
        });
    }
    
    /**
     * Apply a recommendation
     * 
     * @param {string} id - Recommendation ID
     */
    function applyRecommendation(id) {
        // Find recommendation
        const recommendation = state.recommendations.find(r => r.id == id);
        
        if (!recommendation) {
            alert('Recommendation not found');
            return;
        }
        
        // Confirm application
        if (!confirm(`Are you sure you want to apply this ${formatAction(recommendation.recommended_action)} recommendation to cart ${recommendation.cart_id}?`)) {
            return;
        }
        
        // Show loading state
        const btn = document.querySelector(`.apply-btn[data-id="${id}"]`);
        btn.disabled = true;
        btn.textContent = 'Applying...';
        
        // Send request
        fetch(`/api/predictive/recommendations/${id}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to apply recommendation');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                alert('Recommendation applied successfully');
                
                // Reload recommendations
                loadRecommendations();
                
                // Reload stats
                loadStats();
            }
        })
        .catch(error => {
            console.error('Error applying recommendation:', error);
            alert('Failed to apply recommendation. Please try again.');
            
            // Reset button state
            btn.disabled = false;
            btn.textContent = 'Apply';
        });
    }
    
    /**
     * Train models
     */
    function trainModels() {
        // In a real implementation, this would open a modal to select models to train
        // For this example, we'll just train all active models
        
        if (!confirm('Are you sure you want to train all active predictive models? This may take some time.')) {
            return;
        }
        
        // Show loading state
        trainModelsBtn.disabled = true;
        trainModelsBtn.textContent = 'Training...';
        
        // Fetch active models
        fetch('/api/predictive/models?active=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load models');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.models) {
                const models = data.models;
                
                if (models.length === 0) {
                    alert('No active models found');
                    return;
                }
                
                // Train each model
                const trainPromises = models.map(model => {
                    return fetch(`/api/predictive/models/${model.id}/train`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to train model ${model.name}`);
                        }
                        return response.json();
                    });
                });
                
                // Wait for all training to complete
                return Promise.all(trainPromises);
            }
        })
        .then(() => {
            // Show success message
            alert('Models training started successfully');
            
            // Reload stats
            loadStats();
        })
        .catch(error => {
            console.error('Error training models:', error);
            alert('Failed to train models. Please try again.');
        })
        .finally(() => {
            // Reset button state
            trainModelsBtn.disabled = false;
            trainModelsBtn.textContent = 'Train Models';
        });
    }
    
    /**
     * Format action name
     * 
     * @param {string} action - Action name
     * @returns {string} Formatted action name
     */
    function formatAction(action) {
        if (!action) return 'None';
        
        switch (action) {
            case 'email':
                return 'Send Email';
            case 'discount':
                return 'Offer Discount';
            case 'personalized':
                return 'Personalized';
            case 'wait':
                return 'Wait';
            case 'none':
                return 'No Action';
            default:
                return action.charAt(0).toUpperCase() + action.slice(1);
        }
    }
    
    /**
     * Format result name
     * 
     * @param {string} result - Result name
     * @returns {string} Formatted result name
     */
    function formatResult(result) {
        if (!result) return 'Pending';
        
        switch (result) {
            case 'success':
                return 'Success';
            case 'failure':
                return 'Failed';
            case 'pending':
                return 'Pending';
            default:
                return result.charAt(0).toUpperCase() + result.slice(1);
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
