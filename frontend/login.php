<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - GigGatek</title>
    <meta name="description" content="Sign in to your GigGatek account to manage your orders, rentals, and profile information.">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo-link"><img src="img/logo.png" alt="GigGatek Logo" id="logo"></a>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="products.php">Products</a></li>
                    <li><a href="rent-to-own.php">Rent-to-Own</a></li>
                    <li><a href="#">Support</a></li>
                    <li><a href="login.php" class="active">Account</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="auth-container">
            <h2>Sign In</h2>
            
            <form class="auth-form" id="login-form" action="dashboard.php" method="post">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="form-control" required>
                </div>
                
                <div class="form-group form-check">
                    <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" name="remember" id="remember">
                        Remember me
                    </label>
                </div>
                
                <div class="auth-actions">
                    <button type="submit" class="btn btn-primary">Sign In</button>
                    <a href="register.php" class="btn btn-outline-primary">Create New Account</a>
                </div>
                
                <div class="auth-links">
                    <a href="#">Forgot Password?</a>
                </div>
            </form>
            
            <div class="auth-separator">
                <span>or</span>
            </div>
            
            <div class="social-login">
                <button class="btn btn-outline-secondary social-btn">
                    <img src="img/icons/google.svg" alt="Google">
                    <span>Continue with Google</span>
                </button>
                
                <button class="btn btn-outline-secondary social-btn">
                    <img src="img/icons/facebook.svg" alt="Facebook">
                    <span>Continue with Facebook</span>
                </button>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 GigGatek. All rights reserved.</p>
            <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Contact Us</a></li>
            </ul>
        </div>
    </footer>

    <!-- Include the auth.js file for authentication -->
    <script src="js/auth.js"></script>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('login-form');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const rememberInput = document.getElementById('remember');
            
            // Check if we already have a valid auth token
            if (window.auth && window.auth.isAuthenticated()) {
                // Already logged in, redirect to dashboard
                window.location.href = 'dashboard.php';
                return;
            }
            
            // Get redirect parameter from URL (if any)
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || 'dashboard.php';
            
            // Handle form submission
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Disable form during submission
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = 'Signing In...';
                
                // Clear any previous errors
                const errorElement = document.getElementById('login-error');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
                
                try {
                    // Get form values
                    const email = emailInput.value;
                    const password = passwordInput.value;
                    const remember = rememberInput ? rememberInput.checked : false;
                    
                    // Attempt login
                    const result = await window.auth.login(email, password, remember);
                    
                    if (result.success) {
                        // Redirect to dashboard or requested page
                        window.location.href = redirectUrl;
                    } else {
                        // Display error
                        displayError(result.error || 'Login failed');
                    }
                } catch (error) {
                    displayError(error.message || 'An unexpected error occurred');
                } finally {
                    // Re-enable form
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Sign In';
                }
            });
            
            // Helper to display errors
            function displayError(message) {
                let errorElement = document.getElementById('login-error');
                
                // Create error element if it doesn't exist
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.id = 'login-error';
                    errorElement.className = 'form-error alert alert-danger';
                    form.prepend(errorElement);
                }
                
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        });
    </script>
</body>
</html>
