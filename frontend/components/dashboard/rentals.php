<?php
/**
 * GigGatek Dashboard Rentals Component
 * Contains the rentals tab content
 */
?>
<!-- Rentals Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'rentals' ? 'active' : ''; ?>" id="rentals-tab">
    <div class="dashboard-header">
        <h2>My Rentals</h2>
        <div class="dashboard-actions">
            <div class="search-filter-container">
                <input type="text" id="rental-search" placeholder="Search rentals..." class="form-control form-control-sm">
                <select id="rental-filter" class="form-control form-control-sm">
                    <option value="all">All Rentals</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
    </div>

    <div class="rental-section">
        <!-- Loading indicator -->
        <div id="rentals-loading" class="loading-container">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p>Loading your rental contracts...</p>
        </div>

        <!-- Error message -->
        <div id="rentals-error" class="error-container" style="display: none;">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span id="rentals-error-message">Failed to load rental contracts.</span>
            </div>
            <button id="rentals-retry" class="btn btn-primary">Try Again</button>
        </div>

        <!-- Empty state -->
        <div id="rentals-empty" class="empty-container" style="display: none;">
            <div class="empty-state">
                <i class="fas fa-laptop-house empty-icon"></i>
                <h3>No Rental Contracts</h3>
                <p>You don't have any rental contracts yet.</p>
                <a href="/rent-to-own.php" class="btn btn-primary">Explore Rent-to-Own Options</a>
            </div>
        </div>

        <!-- Active rentals section -->
        <div id="active-rentals-container">
            <h3>Active Rentals</h3>
            <div id="active-rentals-list" class="rentals-list"></div>
        </div>

        <!-- Completed rentals section -->
        <div id="completed-rentals-container">
            <h3 class="mt-4">Completed Rentals</h3>
            <div id="completed-rentals-list" class="rentals-list"></div>
        </div>
    </div>

    <!-- Rental details modal -->
    <div class="modal fade" id="rental-details-modal" tabindex="-1" role="dialog" aria-labelledby="rental-details-title" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="rental-details-title">Rental Contract Details</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="rental-details-content">
                    <!-- Content will be loaded dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment modal -->
    <div class="modal fade" id="rental-payment-modal" tabindex="-1" role="dialog" aria-labelledby="rental-payment-title" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="rental-payment-title">Make a Payment</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="rental-payment-content">
                    <!-- Content will be loaded dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="process-payment-btn">Process Payment</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Rental card template -->
<template id="rental-card-template">
    <div class="rental-card" data-rental-id="">
        <div class="rental-header">
            <div class="rental-title"></div>
            <div class="rental-badge"></div>
        </div>

        <div class="payment-progress">
            <div class="progress-header">
                <span>Payment Progress</span>
                <span class="payments-count"></span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
            <div class="progress-details">
                <div class="progress-detail">
                    <div class="progress-label">Monthly Payment</div>
                    <div class="progress-value monthly-payment"></div>
                </div>
                <div class="progress-detail">
                    <div class="progress-label">Next Payment</div>
                    <div class="progress-value next-payment"></div>
                </div>
                <div class="progress-detail">
                    <div class="progress-label">Remaining</div>
                    <div class="progress-value remaining-amount"></div>
                </div>
            </div>
        </div>

        <div class="rental-actions">
            <a href="#" class="btn btn-sm btn-outline-primary view-details-btn">View Details</a>
            <a href="#" class="btn btn-sm btn-outline-secondary pay-early-btn">Pay Early</a>
            <a href="#" class="btn btn-sm btn-outline-info upgrade-btn">Upgrade Hardware</a>
        </div>
    </div>
</template>

<!-- Completed rental card template -->
<template id="completed-rental-card-template">
    <div class="rental-card" data-rental-id="">
        <div class="rental-header">
            <div class="rental-title"></div>
            <div class="rental-badge completed"></div>
        </div>

        <div class="rental-details">
            <div class="rental-row">
                <span>Start Date:</span>
                <span class="start-date"></span>
            </div>
            <div class="rental-row">
                <span>End Date:</span>
                <span class="end-date"></span>
            </div>
            <div class="rental-row">
                <span>Monthly Payment:</span>
                <span class="monthly-payment"></span>
            </div>
            <div class="rental-row">
                <span>Total Paid:</span>
                <span class="total-paid"></span>
            </div>
            <div class="rental-row">
                <span>Status:</span>
                <span class="rental-status completed"></span>
            </div>
        </div>

        <div class="rental-actions">
            <a href="#" class="btn btn-sm btn-outline-primary view-details-btn">View Details</a>
            <a href="#" class="btn btn-sm btn-outline-secondary review-btn">Write Review</a>
        </div>
    </div>
</template>
