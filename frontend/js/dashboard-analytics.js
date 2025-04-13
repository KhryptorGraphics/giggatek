/**
 * GigGatek Dashboard Analytics
 * Handles the analytics dashboard functionality
 */

class DashboardAnalytics {
    constructor() {
        this.apiBaseUrl = '/api/payment/analytics';
        this.charts = {};
        this.analyticsData = null;
        this.period = 'month';
        this.dateRange = 'last_12_months';
        this.startDate = null;
        this.endDate = null;
        
        // Initialize the dashboard
        this.init();
    }
    
    /**
     * Initialize the analytics dashboard
     */
    init() {
        // Set default date range (last 12 months)
        const today = new Date();
        this.endDate = today.toISOString().split('T')[0];
        
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);
        this.startDate = lastYear.toISOString().split('T')[0];
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load analytics data
        this.loadAnalyticsData();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Period selector
        const periodSelector = document.getElementById('analytics-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => {
                this.period = periodSelector.value;
            });
        }
        
        // Date range selector
        const dateRangeSelector = document.getElementById('analytics-date-range');
        if (dateRangeSelector) {
            dateRangeSelector.addEventListener('change', () => {
                this.dateRange = dateRangeSelector.value;
                this.updateDateRangeVisibility();
            });
        }
        
        // Apply filters button
        const applyButton = document.getElementById('apply-analytics-filters');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.updateDateRange();
                this.loadAnalyticsData();
            });
        }
        
        // Retry button
        const retryButton = document.getElementById('analytics-retry');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.loadAnalyticsData();
            });
        }
    }
    
    /**
     * Update date range visibility based on selection
     */
    updateDateRangeVisibility() {
        const customDateRange = document.getElementById('custom-date-range');
        if (customDateRange) {
            customDateRange.style.display = this.dateRange === 'custom' ? 'flex' : 'none';
        }
    }
    
    /**
     * Update date range based on selection
     */
    updateDateRange() {
        const today = new Date();
        this.endDate = today.toISOString().split('T')[0];
        
        switch (this.dateRange) {
            case 'last_30_days':
                const last30Days = new Date();
                last30Days.setDate(today.getDate() - 30);
                this.startDate = last30Days.toISOString().split('T')[0];
                break;
                
            case 'last_3_months':
                const last3Months = new Date();
                last3Months.setMonth(today.getMonth() - 3);
                this.startDate = last3Months.toISOString().split('T')[0];
                break;
                
            case 'last_6_months':
                const last6Months = new Date();
                last6Months.setMonth(today.getMonth() - 6);
                this.startDate = last6Months.toISOString().split('T')[0];
                break;
                
            case 'last_12_months':
                const lastYear = new Date();
                lastYear.setFullYear(today.getFullYear() - 1);
                this.startDate = lastYear.toISOString().split('T')[0];
                break;
                
            case 'custom':
                const startDateInput = document.getElementById('analytics-start-date');
                const endDateInput = document.getElementById('analytics-end-date');
                
                if (startDateInput && startDateInput.value) {
                    this.startDate = startDateInput.value;
                }
                
                if (endDateInput && endDateInput.value) {
                    this.endDate = endDateInput.value;
                }
                break;
        }
    }
    
    /**
     * Load analytics data from the API
     */
    async loadAnalyticsData() {
        try {
            // Show loading state
            this.showLoading();
            
            // Build URL with query parameters
            const url = `${this.apiBaseUrl}/rentals?period=${this.period}&start_date=${this.startDate}&end_date=${this.endDate}`;
            
            // Fetch data from API
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load analytics data: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load analytics data');
            }
            
            this.analyticsData = data.analytics;
            
            // Check if there's data to display
            if (this.hasData()) {
                this.renderAnalytics();
                this.showContent();
            } else {
                this.showEmpty();
            }
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Check if there's data to display
     * @returns {boolean} True if there's data, false otherwise
     */
    hasData() {
        return this.analyticsData && 
               this.analyticsData.totals && 
               this.analyticsData.totals.total_payments > 0;
    }
    
    /**
     * Render analytics data
     */
    renderAnalytics() {
        this.renderSummary();
        this.renderCharts();
        this.renderStatusBreakdown();
    }
    
    /**
     * Render summary cards
     */
    renderSummary() {
        const { totals } = this.analyticsData;
        
        // Format currency
        const totalAmount = parseFloat(totals.total_amount || 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        
        const averageAmount = parseFloat(totals.average_amount || 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
        
        // Format date
        const lastPaymentDate = totals.last_payment_date ? 
            new Date(totals.last_payment_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
        
        // Update summary cards
        document.getElementById('total-amount').textContent = totalAmount;
        document.getElementById('total-payments').textContent = totals.total_payments || 0;
        document.getElementById('average-amount').textContent = averageAmount;
        document.getElementById('last-payment-date').textContent = lastPaymentDate;
    }
    
    /**
     * Render charts
     */
    renderCharts() {
        this.renderPaymentsTrendChart();
        this.renderPaymentMethodsChart();
        this.renderPaymentSourcesChart();
        this.renderTopProductsChart();
    }
    
    /**
     * Render payments trend chart
     */
    renderPaymentsTrendChart() {
        const ctx = document.getElementById('payments-trend-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.trendChart) {
            this.charts.trendChart.destroy();
        }
        
        const { payments_by_period } = this.analyticsData;
        
        // Prepare data
        const labels = payments_by_period.map(item => item.period);
        const amounts = payments_by_period.map(item => parseFloat(item.total_amount));
        const counts = payments_by_period.map(item => parseInt(item.payment_count));
        
        // Create chart
        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Amount',
                        data: amounts,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Payment Count',
                        data: counts,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Count'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                
                                if (label === 'Total Amount') {
                                    return `${label}: $${value.toFixed(2)}`;
                                }
                                
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render payment methods chart
     */
    renderPaymentMethodsChart() {
        const ctx = document.getElementById('payment-methods-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.methodsChart) {
            this.charts.methodsChart.destroy();
        }
        
        const { payment_methods } = this.analyticsData;
        
        // Prepare data
        const labels = payment_methods.map(item => {
            // Format payment method name
            return item.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        });
        
        const data = payment_methods.map(item => parseFloat(item.total_amount));
        
        // Colors for different payment methods
        const backgroundColors = [
            'rgba(0, 123, 255, 0.7)',
            'rgba(40, 167, 69, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(220, 53, 69, 0.7)',
            'rgba(23, 162, 184, 0.7)'
        ];
        
        // Create chart
        this.charts.methodsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render payment sources chart
     */
    renderPaymentSourcesChart() {
        const ctx = document.getElementById('payment-sources-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.sourcesChart) {
            this.charts.sourcesChart.destroy();
        }
        
        const { payment_sources } = this.analyticsData;
        
        // Prepare data
        const labels = payment_sources.map(item => {
            // Format payment source name
            return item.payment_source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        });
        
        const data = payment_sources.map(item => parseInt(item.count));
        
        // Colors for different payment sources
        const backgroundColors = [
            'rgba(0, 123, 255, 0.7)',
            'rgba(40, 167, 69, 0.7)'
        ];
        
        // Create chart
        this.charts.sourcesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return `${label}: ${value} payments (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render top products chart
     */
    renderTopProductsChart() {
        const ctx = document.getElementById('top-products-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.productsChart) {
            this.charts.productsChart.destroy();
        }
        
        const { top_products } = this.analyticsData;
        
        // Prepare data
        const labels = top_products.map(item => item.product_name);
        const data = top_products.map(item => parseFloat(item.total_amount));
        
        // Create chart
        this.charts.productsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Amount',
                        data: data,
                        backgroundColor: 'rgba(0, 123, 255, 0.7)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render payment status breakdown
     */
    renderStatusBreakdown() {
        const container = document.getElementById('payment-status-breakdown');
        if (!container) return;
        
        const { payment_statuses } = this.analyticsData;
        
        // Clear container
        container.innerHTML = '';
        
        // Create status bars
        payment_statuses.forEach(status => {
            const statusName = status.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const count = parseInt(status.count);
            const amount = parseFloat(status.total_amount);
            
            // Format amount
            const formattedAmount = amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Calculate percentage
            const totalCount = this.analyticsData.totals.total_payments;
            const percentage = ((count / totalCount) * 100).toFixed(1);
            
            // Determine status color
            let statusColor = '';
            switch (status.status.toLowerCase()) {
                case 'completed':
                    statusColor = 'success';
                    break;
                case 'pending':
                    statusColor = 'warning';
                    break;
                case 'failed':
                    statusColor = 'danger';
                    break;
                default:
                    statusColor = 'secondary';
            }
            
            // Create status bar
            const statusBar = document.createElement('div');
            statusBar.className = 'status-bar';
            statusBar.innerHTML = `
                <div class="status-info">
                    <span class="status-name">${statusName}</span>
                    <span class="status-count">${count} payments</span>
                    <span class="status-amount">${formattedAmount}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-${statusColor}" role="progressbar" 
                         style="width: ${percentage}%" 
                         aria-valuenow="${percentage}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${percentage}%
                    </div>
                </div>
            `;
            
            container.appendChild(statusBar);
        });
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('analytics-loading').style.display = 'flex';
        document.getElementById('analytics-content').style.display = 'none';
        document.getElementById('analytics-error').style.display = 'none';
        document.getElementById('analytics-empty').style.display = 'none';
    }
    
    /**
     * Show content
     */
    showContent() {
        document.getElementById('analytics-loading').style.display = 'none';
        document.getElementById('analytics-content').style.display = 'block';
        document.getElementById('analytics-error').style.display = 'none';
        document.getElementById('analytics-empty').style.display = 'none';
    }
    
    /**
     * Show error
     * @param {string} message - Error message
     */
    showError(message) {
        document.getElementById('analytics-loading').style.display = 'none';
        document.getElementById('analytics-content').style.display = 'none';
        document.getElementById('analytics-error').style.display = 'block';
        document.getElementById('analytics-empty').style.display = 'none';
        
        document.getElementById('analytics-error-message').textContent = message || 'Failed to load analytics data.';
    }
    
    /**
     * Show empty state
     */
    showEmpty() {
        document.getElementById('analytics-loading').style.display = 'none';
        document.getElementById('analytics-content').style.display = 'none';
        document.getElementById('analytics-error').style.display = 'none';
        document.getElementById('analytics-empty').style.display = 'block';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on dashboard page with analytics tab
    if (document.getElementById('analytics-tab')) {
        window.dashboardAnalytics = new DashboardAnalytics();
    }
});
