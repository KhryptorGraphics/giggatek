/**
 * Customer Segments Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const segmentsTableBody = document.getElementById('segments-table-body');
    const createSegmentBtn = document.getElementById('create-segment-btn');
    const segmentModal = document.getElementById('segment-modal');
    const segmentForm = document.getElementById('segment-form');
    const segmentModalTitle = document.getElementById('segment-modal-title');
    const segmentId = document.getElementById('segment-id');
    const segmentName = document.getElementById('segment-name');
    const segmentDescription = document.getElementById('segment-description');
    const segmentActive = document.getElementById('segment-active');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const membersModal = document.getElementById('members-modal');
    const membersContent = document.getElementById('members-content');
    
    // Criteria elements
    const cartValueMin = document.getElementById('cart-value-min');
    const cartValueMax = document.getElementById('cart-value-max');
    const abandonedCountMin = document.getElementById('abandoned-count-min');
    const abandonedCountMax = document.getElementById('abandoned-count-max');
    const lastAbandonedDays = document.getElementById('last-abandoned-days');
    const purchaseCountMin = document.getElementById('purchase-count-min');
    const purchaseCountMax = document.getElementById('purchase-count-max');
    const productCategory = document.getElementById('product-category');
    
    // State
    const state = {
        segments: [],
        filters: {
            status: 'active',
            search: ''
        }
    };
    
    // Initialize
    init();
    
    /**
     * Initialize the dashboard
     */
    function init() {
        // Load initial data
        loadSegments();
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Create segment button
        createSegmentBtn.addEventListener('click', () => {
            openCreateSegmentModal();
        });
        
        // Segment form submission
        segmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSegment();
        });
        
        // Filters
        statusFilter.addEventListener('change', () => {
            state.filters.status = statusFilter.value;
            loadSegments();
        });
        
        // Search
        searchBtn.addEventListener('click', () => {
            state.filters.search = searchInput.value.trim();
            loadSegments();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                state.filters.search = searchInput.value.trim();
                loadSegments();
            }
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
     */
    function loadSegments() {
        // Show loading state
        segmentsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-message">Loading segments...</td>
            </tr>
        `;
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (state.filters.status !== 'all') {
            params.append('active', state.filters.status === 'active' ? 'true' : 'false');
        }
        
        // Fetch segments from API
        fetch(`/api/segmentation/segments?${params.toString()}`, {
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
                // Filter by search term if provided
                let segments = data.segments;
                
                if (state.filters.search) {
                    const searchTerm = state.filters.search.toLowerCase();
                    segments = segments.filter(segment => 
                        segment.name.toLowerCase().includes(searchTerm) || 
                        (segment.description && segment.description.toLowerCase().includes(searchTerm))
                    );
                }
                
                // Update state
                state.segments = segments;
                
                // Render segments
                renderSegments();
            }
        })
        .catch(error => {
            console.error('Error loading segments:', error);
            
            // Show error state
            segmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">Error loading segments. Please try again.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Render segments table
     */
    function renderSegments() {
        if (state.segments.length === 0) {
            segmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">No segments found.</td>
                </tr>
            `;
            return;
        }
        
        segmentsTableBody.innerHTML = state.segments.map(segment => `
            <tr>
                <td>${segment.id}</td>
                <td>${segment.name}</td>
                <td>${segment.description || '-'}</td>
                <td>${segment.member_count}</td>
                <td>${formatDate(segment.created_at)}</td>
                <td>
                    ${segment.active 
                        ? '<span class="badge badge-success">Active</span>' 
                        : '<span class="badge badge-danger">Inactive</span>'
                    }
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary edit-segment-btn" data-id="${segment.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-secondary view-members-btn" data-id="${segment.id}">Members</button>
                    <button type="button" class="btn btn-sm btn-danger delete-segment-btn" data-id="${segment.id}">Delete</button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const segmentId = btn.getAttribute('data-id');
                openEditSegmentModal(segmentId);
            });
        });
        
        document.querySelectorAll('.view-members-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const segmentId = btn.getAttribute('data-id');
                viewSegmentMembers(segmentId);
            });
        });
        
        document.querySelectorAll('.delete-segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const segmentId = btn.getAttribute('data-id');
                deleteSegment(segmentId);
            });
        });
    }
    
    /**
     * Open create segment modal
     */
    function openCreateSegmentModal() {
        // Reset form
        segmentForm.reset();
        segmentId.value = '';
        segmentModalTitle.textContent = 'Create Segment';
        
        // Open modal
        openModal(segmentModal);
    }
    
    /**
     * Open edit segment modal
     * 
     * @param {string} id - Segment ID
     */
    function openEditSegmentModal(id) {
        // Find segment
        const segment = state.segments.find(s => s.id == id);
        
        if (!segment) {
            alert('Segment not found');
            return;
        }
        
        // Set form values
        segmentId.value = segment.id;
        segmentName.value = segment.name;
        segmentDescription.value = segment.description || '';
        segmentActive.checked = segment.active;
        
        // Set criteria values
        const criteria = segment.criteria || {};
        
        // Cart value
        if (criteria.cart_value) {
            cartValueMin.value = criteria.cart_value.min || '';
            cartValueMax.value = criteria.cart_value.max || '';
        } else {
            cartValueMin.value = '';
            cartValueMax.value = '';
        }
        
        // Abandoned count
        if (criteria.abandoned_count) {
            abandonedCountMin.value = criteria.abandoned_count.min || '';
            abandonedCountMax.value = criteria.abandoned_count.max || '';
        } else {
            abandonedCountMin.value = '';
            abandonedCountMax.value = '';
        }
        
        // Last abandoned
        if (criteria.last_abandoned && criteria.last_abandoned.days) {
            lastAbandonedDays.value = criteria.last_abandoned.days;
        } else {
            lastAbandonedDays.value = '';
        }
        
        // Purchase count
        if (criteria.purchase_count) {
            purchaseCountMin.value = criteria.purchase_count.min || '';
            purchaseCountMax.value = criteria.purchase_count.max || '';
        } else {
            purchaseCountMin.value = '';
            purchaseCountMax.value = '';
        }
        
        // Product category
        productCategory.value = criteria.product_category || '';
        
        // Set modal title
        segmentModalTitle.textContent = 'Edit Segment';
        
        // Open modal
        openModal(segmentModal);
    }
    
    /**
     * Save segment
     */
    function saveSegment() {
        // Build criteria object
        const criteria = {};
        
        // Cart value
        if (cartValueMin.value || cartValueMax.value) {
            criteria.cart_value = {};
            
            if (cartValueMin.value) {
                criteria.cart_value.min = parseFloat(cartValueMin.value);
            }
            
            if (cartValueMax.value) {
                criteria.cart_value.max = parseFloat(cartValueMax.value);
            }
        }
        
        // Abandoned count
        if (abandonedCountMin.value || abandonedCountMax.value) {
            criteria.abandoned_count = {};
            
            if (abandonedCountMin.value) {
                criteria.abandoned_count.min = parseInt(abandonedCountMin.value);
            }
            
            if (abandonedCountMax.value) {
                criteria.abandoned_count.max = parseInt(abandonedCountMax.value);
            }
        }
        
        // Last abandoned
        if (lastAbandonedDays.value) {
            criteria.last_abandoned = {
                days: parseInt(lastAbandonedDays.value)
            };
        }
        
        // Purchase count
        if (purchaseCountMin.value || purchaseCountMax.value) {
            criteria.purchase_count = {};
            
            if (purchaseCountMin.value) {
                criteria.purchase_count.min = parseInt(purchaseCountMin.value);
            }
            
            if (purchaseCountMax.value) {
                criteria.purchase_count.max = parseInt(purchaseCountMax.value);
            }
        }
        
        // Product category
        if (productCategory.value) {
            criteria.product_category = productCategory.value;
        }
        
        // Build segment data
        const segmentData = {
            name: segmentName.value,
            description: segmentDescription.value,
            criteria: criteria,
            active: segmentActive.checked
        };
        
        // Determine if creating or updating
        const isCreating = !segmentId.value;
        
        // API endpoint and method
        const endpoint = isCreating ? '/api/segmentation/segments' : `/api/segmentation/segments/${segmentId.value}`;
        const method = isCreating ? 'POST' : 'PUT';
        
        // Show loading state
        const submitBtn = segmentForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // Send request
        fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(segmentData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save segment');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close modal
                closeAllModals();
                
                // Reload segments
                loadSegments();
                
                // Show success message
                alert(isCreating ? 'Segment created successfully' : 'Segment updated successfully');
            }
        })
        .catch(error => {
            console.error('Error saving segment:', error);
            alert('Failed to save segment. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Segment';
        });
    }
    
    /**
     * Delete segment
     * 
     * @param {string} id - Segment ID
     */
    function deleteSegment(id) {
        if (!confirm('Are you sure you want to delete this segment?')) {
            return;
        }
        
        fetch(`/api/segmentation/segments/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete segment');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Reload segments
                loadSegments();
                
                // Show success message
                alert('Segment deleted successfully');
            }
        })
        .catch(error => {
            console.error('Error deleting segment:', error);
            alert('Failed to delete segment. Please try again.');
        });
    }
    
    /**
     * View segment members
     * 
     * @param {string} id - Segment ID
     */
    function viewSegmentMembers(id) {
        // Show loading state
        membersContent.innerHTML = `<div class="loading-message">Loading members...</div>`;
        
        // Open modal
        openModal(membersModal);
        
        // Fetch segment details
        fetch(`/api/segmentation/segments/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load segment members');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const segment = data.segment;
                const members = data.members || [];
                
                // Render members
                if (members.length === 0) {
                    membersContent.innerHTML = `
                        <div class="empty-message">
                            <p>No members in this segment.</p>
                        </div>
                    `;
                } else {
                    membersContent.innerHTML = `
                        <div class="segment-info">
                            <p><strong>Segment:</strong> ${segment.name}</p>
                            <p><strong>Total Members:</strong> ${members.length}</p>
                        </div>
                        
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${members.map(member => `
                                    <tr>
                                        <td>${member.user_id}</td>
                                        <td>${member.name || '-'}</td>
                                        <td>${member.email}</td>
                                        <td>${formatDate(member.added_at)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="form-actions" style="margin-top: 20px;">
                            <button type="button" class="btn btn-primary refresh-segment-btn" data-id="${segment.id}">Refresh Segment</button>
                        </div>
                    `;
                    
                    // Add event listener to refresh button
                    const refreshBtn = membersContent.querySelector('.refresh-segment-btn');
                    if (refreshBtn) {
                        refreshBtn.addEventListener('click', () => {
                            refreshSegment(segment.id);
                        });
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error loading segment members:', error);
            
            // Show error state
            membersContent.innerHTML = `
                <div class="error-message">
                    <p>Error loading segment members. Please try again.</p>
                </div>
            `;
        });
    }
    
    /**
     * Refresh segment
     * 
     * @param {string} id - Segment ID
     */
    function refreshSegment(id) {
        // Show loading state
        membersContent.innerHTML = `<div class="loading-message">Refreshing segment members...</div>`;
        
        // Send refresh request
        fetch(`/api/segmentation/segments/${id}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to refresh segment');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                alert(`Segment refreshed successfully. ${data.member_count} members found.`);
                
                // Reload segment members
                viewSegmentMembers(id);
                
                // Reload segments list to update counts
                loadSegments();
            }
        })
        .catch(error => {
            console.error('Error refreshing segment:', error);
            alert('Failed to refresh segment. Please try again.');
            
            // Reload segment members
            viewSegmentMembers(id);
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
     * Get auth token
     * 
     * @returns {string} Auth token
     */
    function getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }
});
