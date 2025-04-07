<?php
/**
 * GigGatek Dashboard Profile Component
 * Contains the profile tab content
 */
?>
<!-- Profile Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'profile' ? 'active' : ''; ?>" id="profile-tab">
    <div class="dashboard-header">
        <h2>My Profile</h2>
    </div>
    
    <form class="profile-form">
        <div class="form-row">
            <div class="form-group">
                <label for="first-name">First Name</label>
                <input type="text" id="first-name" name="first_name" class="form-control" value="John">
            </div>
            
            <div class="form-group">
                <label for="last-name">Last Name</label>
                <input type="text" id="last-name" name="last_name" class="form-control" value="Smith">
            </div>
        </div>
        
        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" class="form-control" value="john.smith@example.com">
        </div>
        
        <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" class="form-control" value="(555) 123-4567">
        </div>
        
        <div class="form-group form-check">
            <label class="form-check-label">
                <input type="checkbox" class="form-check-input" name="marketing" checked>
                Subscribe to marketing emails
            </label>
        </div>
        
        <button type="submit" class="btn btn-primary">Save Changes</button>
    </form>
    
    <h3 class="mt-5 mb-3">Change Password</h3>
    
    <form class="password-form">
        <div class="form-group">
            <label for="current-password">Current Password</label>
            <input type="password" id="current-password" name="current_password" class="form-control">
        </div>
        
        <div class="form-group">
            <label for="new-password">New Password</label>
            <input type="password" id="new-password" name="new_password" class="form-control">
        </div>
        
        <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input type="password" id="confirm-password" name="confirm_password" class="form-control">
        </div>
        
        <button type="submit" class="btn btn-primary">Update Password</button>
    </form>
</div>
