<?php
/**
 * GigGatek Dashboard Analytics Component
 * Contains the analytics tab content
 */
?>
<!-- Analytics Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'analytics' ? 'active' : ''; ?>" id="analytics-tab">
    <div class="dashboard-header">
        <h2>Payment Analytics</h2>
        <div class="dashboard-actions">
            <div class="analytics-filters">
                <div class="form-group">
                    <label for="analytics-period">Period</label>
                    <select id="analytics-period" class="form-control form-control-sm">
                        <option value="month">Monthly</option>
                        <option value="week">Weekly</option>
                        <option value="day">Daily</option>
                        <option value="year">Yearly</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="analytics-date-range">Date Range</label>
                    <select id="analytics-date-range" class="form-control form-control-sm">
                        <option value="last_12_months">Last 12 Months</option>
                        <option value="last_6_months">Last 6 Months</option>
                        <option value="last_3_months">Last 3 Months</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                <div id="custom-date-range" class="form-row" style="display: none;">
                    <div class="form-group col-md-6">
                        <label for="analytics-start-date">Start Date</label>
                        <input type="date" id="analytics-start-date" class="form-control form-control-sm">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="analytics-end-date">End Date</label>
                        <input type="date" id="analytics-end-date" class="form-control form-control-sm">
                    </div>
                </div>
                <button id="apply-analytics-filters" class="btn btn-primary btn-sm">Apply</button>
            </div>
        </div>
    </div>
    
    <!-- Loading indicator -->
    <div id="analytics-loading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
        </div>
        <p>Loading analytics data...</p>
    </div>
    
    <!-- Error message -->
    <div id="analytics-error" class="error-container" style="display: none;">
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i>
            <span id="analytics-error-message">Failed to load analytics data.</span>
        </div>
        <button id="analytics-retry" class="btn btn-primary">Try Again</button>
    </div>
    
    <!-- Analytics content -->
    <div id="analytics-content" class="analytics-content" style="display: none;">
        <!-- Summary cards -->
        <div class="analytics-summary">
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="summary-data">
                    <h3 id="total-amount">$0.00</h3>
                    <p>Total Payments</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="summary-data">
                    <h3 id="total-payments">0</h3>
                    <p>Payment Count</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-calculator"></i>
                </div>
                <div class="summary-data">
                    <h3 id="average-amount">$0.00</h3>
                    <p>Average Payment</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="summary-data">
                    <h3 id="last-payment-date">N/A</h3>
                    <p>Last Payment</p>
                </div>
            </div>
        </div>
        
        <!-- Charts -->
        <div class="analytics-charts">
            <div class="chart-container">
                <h3>Payment Trends</h3>
                <canvas id="payments-trend-chart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Payment Methods</h3>
                <canvas id="payment-methods-chart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Payment Sources</h3>
                <canvas id="payment-sources-chart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Top Products</h3>
                <canvas id="top-products-chart"></canvas>
            </div>
        </div>
        
        <!-- Payment status breakdown -->
        <div class="analytics-status">
            <h3>Payment Status Breakdown</h3>
            <div id="payment-status-breakdown" class="status-breakdown">
                <!-- Will be populated dynamically -->
            </div>
        </div>
    </div>
    
    <!-- Empty state -->
    <div id="analytics-empty" class="empty-container" style="display: none;">
        <div class="empty-state">
            <i class="fas fa-chart-bar empty-icon"></i>
            <h3>No Payment Data</h3>
            <p>You don't have any payment data yet. Make a payment to see analytics.</p>
            <a href="/rent-to-own.php" class="btn btn-primary">Explore Rent-to-Own Options</a>
        </div>
    </div>
</div>
