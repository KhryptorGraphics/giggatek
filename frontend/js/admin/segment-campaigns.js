/**
 * Segment Campaigns Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const campaignsTableBody = document.getElementById('campaigns-table-body');
    const createCampaignBtn = document.getElementById('create-campaign-btn');
    const campaignModal = document.getElementById('campaign-modal');
    const campaignForm = document.getElementById('campaign-form');
    const campaignModalTitle = document.getElementById('campaign-modal-title');
    const campaignId = document.getElementById('campaign-id');
    const campaignName = document.getElementById('campaign-name');
    const campaignSegment = document.getElementById('campaign-segment');
    const campaignDescription = document.getElementById('campaign-description');
    const campaignTemplate = document.getElementById('campaign-template');
    const campaignDiscount = document.getElementById('campaign-discount');
    const campaignStartDate = document.getElementById('campaign-start-date');
    const campaignEndDate = document.getElementById('campaign-end-date');
    const campaignActive = document.getElementById('campaign-active');
    const statusFilter = document.getElementById('status-filter');
    const segmentFilter = document.getElementById('segment-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const executeModal = document.getElementById('execute-modal');
    const executeContent = document.getElementById('execute-content');
    const campaignInfo = document.getElementById('campaign-info');
    const executeConfirmBtn = document.getElementById('execute-confirm-btn');
    
    // State
    const state = {
        campaigns: [],
        segments: [],
        filters: {
            status: 'active',
            segment: 'all',
            search: ''
        },
        executingCampaign: null
    };
    
    // Initialize
    init();
    
    /**
     * Initialize the dashboard
     */
    function init() {
        // Load segments
        loadSegments().then(() => {
            // Load campaigns after segments are loaded
            loadCampaigns();
        });
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Create campaign button
        createCampaignBtn.addEventListener('click', () => {
            openCreateCampaignModal();
        });
        
        // Campaign form submission
        campaignForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCampaign();
        });
        
        // Filters
        statusFilter.addEventListener('change', () => {
            state.filters.status = statusFilter.value;
            loadCampaigns();
        });
        
        segmentFilter.addEventListener('change', () => {
            state.filters.segment = segmentFilter.value;
            loadCampaigns();
        });
        
        // Search
        searchBtn.addEventListener('click', () => {
            state.filters.search = searchInput.value.trim();
            loadCampaigns();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                state.filters.search = searchInput.value.trim();
                loadCampaigns();
            }
        });
        
        // Execute campaign confirmation
        executeConfirmBtn.addEventListener('click', () => {
            executeCampaign();
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
     * Load segments
     * 
     * @returns {Promise} Promise that resolves when segments are loaded
     */
    function loadSegments() {
        return fetch('/api/segmentation/segments?active=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load segments');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.segments) {
                // Update state
                state.segments = data.segments;
                
                // Update segment filters
                updateSegmentFilters();
            }
        })
        .catch(error => {
            console.error('Error loading segments:', error);
            alert('Failed to load segments. Please try again.');
        });
    }
    
    /**
     * Update segment filters
     */
    function updateSegmentFilters() {
        // Clear existing options (except "All Segments")
        while (segmentFilter.options.length > 1) {
            segmentFilter.remove(1);
        }
        
        // Clear campaign segment options (except placeholder)
        while (campaignSegment.options.length > 1) {
            campaignSegment.remove(1);
        }
        
        // Add segment options
        state.segments.forEach(segment => {
            // Add to filter
            const filterOption = document.createElement('option');
            filterOption.value = segment.id;
            filterOption.textContent = segment.name;
            segmentFilter.appendChild(filterOption);
            
            // Add to campaign form
            const formOption = document.createElement('option');
            formOption.value = segment.id;
            formOption.textContent = `${segment.name} (${segment.member_count} members)`;
            campaignSegment.appendChild(formOption);
        });
    }
    
    /**
     * Load campaigns
     */
    function loadCampaigns() {
        // Show loading state
        campaignsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-message">Loading campaigns...</td>
            </tr>
        `;
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (state.filters.status !== 'all') {
            params.append('active', state.filters.status === 'active' ? 'true' : 'false');
        }
        
        if (state.filters.segment !== 'all') {
            params.append('segment_id', state.filters.segment);
        }
        
        // Fetch campaigns from API
        fetch(`/api/segmentation/campaigns?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load campaigns');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.campaigns) {
                // Filter by search term if provided
                let campaigns = data.campaigns;
                
                if (state.filters.search) {
                    const searchTerm = state.filters.search.toLowerCase();
                    campaigns = campaigns.filter(campaign => 
                        campaign.name.toLowerCase().includes(searchTerm) || 
                        campaign.segment_name.toLowerCase().includes(searchTerm) ||
                        (campaign.description && campaign.description.toLowerCase().includes(searchTerm))
                    );
                }
                
                // Update state
                state.campaigns = campaigns;
                
                // Render campaigns
                renderCampaigns();
            }
        })
        .catch(error => {
            console.error('Error loading campaigns:', error);
            
            // Show error state
            campaignsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">Error loading campaigns. Please try again.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Render campaigns table
     */
    function renderCampaigns() {
        if (state.campaigns.length === 0) {
            campaignsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">No campaigns found.</td>
                </tr>
            `;
            return;
        }
        
        campaignsTableBody.innerHTML = state.campaigns.map(campaign => `
            <tr>
                <td>${campaign.id}</td>
                <td>${campaign.name}</td>
                <td>${campaign.segment_name}</td>
                <td>${campaign.discount_percentage > 0 ? `${campaign.discount_percentage}%` : 'None'}</td>
                <td>
                    ${campaign.start_date ? formatDate(campaign.start_date) : 'No start date'} - 
                    ${campaign.end_date ? formatDate(campaign.end_date) : 'No end date'}
                </td>
                <td>
                    ${campaign.active 
                        ? '<span class="badge badge-success">Active</span>' 
                        : '<span class="badge badge-danger">Inactive</span>'
                    }
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary edit-campaign-btn" data-id="${campaign.id}">Edit</button>
                    ${campaign.active 
                        ? `<button type="button" class="btn btn-sm btn-secondary execute-campaign-btn" data-id="${campaign.id}">Execute</button>` 
                        : ''
                    }
                    <button type="button" class="btn btn-sm btn-danger delete-campaign-btn" data-id="${campaign.id}">Delete</button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const campaignId = btn.getAttribute('data-id');
                openEditCampaignModal(campaignId);
            });
        });
        
        document.querySelectorAll('.execute-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const campaignId = btn.getAttribute('data-id');
                openExecuteCampaignModal(campaignId);
            });
        });
        
        document.querySelectorAll('.delete-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const campaignId = btn.getAttribute('data-id');
                deleteCampaign(campaignId);
            });
        });
    }
    
    /**
     * Open create campaign modal
     */
    function openCreateCampaignModal() {
        // Reset form
        campaignForm.reset();
        campaignId.value = '';
        campaignModalTitle.textContent = 'Create Campaign';
        
        // Open modal
        openModal(campaignModal);
    }
    
    /**
     * Open edit campaign modal
     * 
     * @param {string} id - Campaign ID
     */
    function openEditCampaignModal(id) {
        // Find campaign
        const campaign = state.campaigns.find(c => c.id == id);
        
        if (!campaign) {
            alert('Campaign not found');
            return;
        }
        
        // Set form values
        campaignId.value = campaign.id;
        campaignName.value = campaign.name;
        campaignSegment.value = campaign.segment_id;
        campaignDescription.value = campaign.description || '';
        campaignTemplate.value = campaign.email_template;
        campaignDiscount.value = campaign.discount_percentage;
        campaignActive.checked = campaign.active;
        
        // Set dates
        if (campaign.start_date) {
            campaignStartDate.value = formatDateTimeLocal(campaign.start_date);
        } else {
            campaignStartDate.value = '';
        }
        
        if (campaign.end_date) {
            campaignEndDate.value = formatDateTimeLocal(campaign.end_date);
        } else {
            campaignEndDate.value = '';
        }
        
        // Set modal title
        campaignModalTitle.textContent = 'Edit Campaign';
        
        // Open modal
        openModal(campaignModal);
    }
    
    /**
     * Open execute campaign modal
     * 
     * @param {string} id - Campaign ID
     */
    function openExecuteCampaignModal(id) {
        // Find campaign
        const campaign = state.campaigns.find(c => c.id == id);
        
        if (!campaign) {
            alert('Campaign not found');
            return;
        }
        
        // Set executing campaign
        state.executingCampaign = campaign;
        
        // Update campaign info
        campaignInfo.innerHTML = `
            <div class="campaign-info">
                <p><strong>Campaign:</strong> ${campaign.name}</p>
                <p><strong>Segment:</strong> ${campaign.segment_name}</p>
                <p><strong>Discount:</strong> ${campaign.discount_percentage > 0 ? `${campaign.discount_percentage}%` : 'None'}</p>
                <p><strong>Template:</strong> ${formatTemplateName(campaign.email_template)}</p>
            </div>
        `;
        
        // Open modal
        openModal(executeModal);
    }
    
    /**
     * Save campaign
     */
    function saveCampaign() {
        // Build campaign data
        const campaignData = {
            name: campaignName.value,
            segment_id: campaignSegment.value,
            description: campaignDescription.value,
            email_template: campaignTemplate.value,
            discount_percentage: parseInt(campaignDiscount.value) || 0,
            active: campaignActive.checked
        };
        
        // Add dates if provided
        if (campaignStartDate.value) {
            campaignData.start_date = new Date(campaignStartDate.value).toISOString();
        }
        
        if (campaignEndDate.value) {
            campaignData.end_date = new Date(campaignEndDate.value).toISOString();
        }
        
        // Determine if creating or updating
        const isCreating = !campaignId.value;
        
        // API endpoint and method
        const endpoint = isCreating ? '/api/segmentation/campaigns' : `/api/segmentation/campaigns/${campaignId.value}`;
        const method = isCreating ? 'POST' : 'PUT';
        
        // Show loading state
        const submitBtn = campaignForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // Send request
        fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(campaignData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save campaign');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close modal
                closeAllModals();
                
                // Reload campaigns
                loadCampaigns();
                
                // Show success message
                alert(isCreating ? 'Campaign created successfully' : 'Campaign updated successfully');
            }
        })
        .catch(error => {
            console.error('Error saving campaign:', error);
            alert('Failed to save campaign. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Campaign';
        });
    }
    
    /**
     * Delete campaign
     * 
     * @param {string} id - Campaign ID
     */
    function deleteCampaign(id) {
        if (!confirm('Are you sure you want to delete this campaign?')) {
            return;
        }
        
        fetch(`/api/segmentation/campaigns/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete campaign');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Reload campaigns
                loadCampaigns();
                
                // Show success message
                alert('Campaign deleted successfully');
            }
        })
        .catch(error => {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign. Please try again.');
        });
    }
    
    /**
     * Execute campaign
     */
    function executeCampaign() {
        if (!state.executingCampaign) {
            alert('No campaign selected');
            return;
        }
        
        // Show loading state
        executeConfirmBtn.disabled = true;
        executeConfirmBtn.textContent = 'Executing...';
        
        // Send execute request
        fetch(`/api/segmentation/campaigns/${state.executingCampaign.id}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to execute campaign');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close modal
                closeAllModals();
                
                // Show success message
                alert(`Campaign executed successfully. ${data.details.success_count} emails sent (${data.details.failed_count} failed).`);
            }
        })
        .catch(error => {
            console.error('Error executing campaign:', error);
            alert('Failed to execute campaign. Please try again.');
        })
        .finally(() => {
            // Reset button state
            executeConfirmBtn.disabled = false;
            executeConfirmBtn.textContent = 'Execute Campaign';
            
            // Clear executing campaign
            state.executingCampaign = null;
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
     * Format date for datetime-local input
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date for datetime-local input
     */
    function formatDateTimeLocal(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        
        // Format as YYYY-MM-DDThh:mm
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    /**
     * Format template name
     * 
     * @param {string} template - Template key
     * @returns {string} Formatted template name
     */
    function formatTemplateName(template) {
        switch (template) {
            case 'abandoned_cart':
                return 'Abandoned Cart Recovery';
            case 'special_offer':
                return 'Special Offer';
            case 'product_recommendation':
                return 'Product Recommendation';
            default:
                return template;
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
