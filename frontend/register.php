<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - GigGatek</title>
    <meta name="description" content="Create your GigGatek account to start purchasing or renting refurbished computer hardware with seamless shopping experience.">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* Additional styles for register page */
        .auth-container {
            max-width: 500px;
        }

        .password-requirements {
            font-size: 0.85rem;
            color: var(--medium);
            margin-top: 0.5rem;
        }

        .password-requirement {
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
        }

        .password-requirement.met i {
            color: var(--success);
        }

        .password-requirement.not-met i {
            color: var(--medium);
        }

        .password-requirement i {
            margin-right: 0.5rem;
            font-size: 0.9rem;
        }

        .auth-separator {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 1.5rem 0;
            color: var(--medium);
        }

        .auth-separator::before,
        .auth-separator::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #dee2e6;
        }

        .auth-separator span {
            padding: 0 1rem;
        }

        .social-login {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem;
        }

        .social-btn img {
            width: 24px;
            height: 24px;
            margin-right: 0.75rem;
        }
    </style>
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
            <h2>Create Account</h2>

            <form class="auth-form" id="register-form" action="dashboard.php" method="post">
                <div class="form-row">
                    <div class="form-group">
                        <label for="first-name">First Name</label>
                        <input type="text" id="first-name" name="first_name" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="last-name">Last Name</label>
                        <input type="text" id="last-name" name="last_name" class="form-control" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                    <div id="email-error" class="form-error"></div>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="form-control" required>

                    <div class="password-requirements">
                        <div class="password-requirement" id="req-length">
                            <i>○</i> At least 8 characters
                        </div>
                        <div class="password-requirement" id="req-uppercase">
                            <i>○</i> At least one uppercase letter
                        </div>
                        <div class="password-requirement" id="req-lowercase">
                            <i>○</i> At least one lowercase letter
                        </div>
                        <div class="password-requirement" id="req-number">
                            <i>○</i> At least one number
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" name="confirm_password" class="form-control" required>
                    <div id="password-match-error" class="form-error"></div>
                </div>

                <div class="form-group form-check">
                    <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" name="terms" id="terms" required>
                        I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </label>
                    <div id="terms-error" class="form-error"></div>
                </div>

                <div class="form-group form-check">
                    <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" name="newsletter" id="newsletter">
                        Subscribe to our newsletter to receive updates and special offers
                    </label>
                </div>

                <div class="auth-actions">
                    <button type="submit" class="btn btn-primary">Create Account</button>
                </div>

                <div class="auth-links">
                    Already have an account? <a href="login.php">Sign In</a>
                </div>
            </form>

            <div class="auth-separator">
                <span>or</span>
            </div>

            <div class="social-login">
                <button class="btn btn-outline-secondary social-btn">
                    <img src="img/icons/google.svg" alt="Google">
                    <span>Sign up with Google</span>
                </button>

                <button class="btn btn-outline-secondary social-btn">
                    <img src="img/icons/facebook.svg" alt="Facebook">
                    <span>Sign up with Facebook</span>
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

    <!-- Include configuration and authentication modules -->
    <script src="js/config.js"></script>
    <script src="js/auth.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('register-form');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirm-password');
            const passwordMatchError = document.getElementById('password-match-error');
            const terms = document.getElementById('terms');
            const termsError = document.getElementById('terms-error');
            const email = document.getElementById('email');
            const emailError = document.getElementById('email-error');
            const firstNameInput = document.getElementById('first-name');
            const lastNameInput = document.getElementById('last-name');
            const newsletterInput = document.getElementById('newsletter');

            // Check if we already have a valid auth token
            if (window.auth && window.auth.isAuthenticated()) {
                // Already logged in, redirect to dashboard
                window.location.href = 'dashboard.php';
                return;
            }

            // Password requirements
            const reqLength = document.getElementById('req-length');
            const reqUppercase = document.getElementById('req-uppercase');
            const reqLowercase = document.getElementById('req-lowercase');
            const reqNumber = document.getElementById('req-number');

            // Validate password strength on input
            password.addEventListener('input', function() {
                const value = password.value;

                // Check length
                if (value.length >= 8) {
                    reqLength.classList.add('met');
                    reqLength.classList.remove('not-met');
                    reqLength.querySelector('i').textContent = '✓';
                } else {
                    reqLength.classList.remove('met');
                    reqLength.classList.add('not-met');
                    reqLength.querySelector('i').textContent = '○';
                }

                // Check uppercase
                if (/[A-Z]/.test(value)) {
                    reqUppercase.classList.add('met');
                    reqUppercase.classList.remove('not-met');
                    reqUppercase.querySelector('i').textContent = '✓';
                } else {
                    reqUppercase.classList.remove('met');
                    reqUppercase.classList.add('not-met');
                    reqUppercase.querySelector('i').textContent = '○';
                }

                // Check lowercase
                if (/[a-z]/.test(value)) {
                    reqLowercase.classList.add('met');
                    reqLowercase.classList.remove('not-met');
                    reqLowercase.querySelector('i').textContent = '✓';
                } else {
                    reqLowercase.classList.remove('met');
                    reqLowercase.classList.add('not-met');
                    reqLowercase.querySelector('i').textContent = '○';
                }

                // Check number
                if (/\d/.test(value)) {
                    reqNumber.classList.add('met');
                    reqNumber.classList.remove('not-met');
                    reqNumber.querySelector('i').textContent = '✓';
                } else {
                    reqNumber.classList.remove('met');
                    reqNumber.classList.add('not-met');
                    reqNumber.querySelector('i').textContent = '○';
                }
            });

            // Check if passwords match
            confirmPassword.addEventListener('input', function() {
                if (password.value !== confirmPassword.value) {
                    passwordMatchError.textContent = 'Passwords do not match';
                    confirmPassword.classList.add('is-invalid');
                } else {
                    passwordMatchError.textContent = '';
                    confirmPassword.classList.remove('is-invalid');
                    confirmPassword.classList.add('is-valid');
                }
            });

            // Validate email format
            email.addEventListener('blur', function() {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.value)) {
                    emailError.textContent = 'Please enter a valid email address';
                    email.classList.add('is-invalid');
                } else {
                    emailError.textContent = '';
                    email.classList.remove('is-invalid');
                    email.classList.add('is-valid');
                }
            });

            // Form submission
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                let isValid = true;

                // Check terms agreement
                if (!terms.checked) {
                    termsError.textContent = 'You must agree to the Terms of Service and Privacy Policy';
                    isValid = false;
                } else {
                    termsError.textContent = '';
                }

                // Check passwords match
                if (password.value !== confirmPassword.value) {
                    passwordMatchError.textContent = 'Passwords do not match';
                    isValid = false;
                }

                // Check email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.value)) {
                    emailError.textContent = 'Please enter a valid email address';
                    isValid = false;
                }

                // Check password requirements
                if (
                    password.value.length < 8 ||
                    !/[A-Z]/.test(password.value) ||
                    !/[a-z]/.test(password.value) ||
                    !/\d/.test(password.value)
                ) {
                    isValid = false;
                }

                if (isValid) {
                    // Disable form during submission
                    const submitButton = form.querySelector('button[type="submit"]');
                    submitButton.disabled = true;
                    submitButton.innerHTML = 'Creating Account...';

                    // Clear any previous errors
                    const generalError = document.getElementById('general-error');
                    if (generalError) {
                        generalError.textContent = '';
                        generalError.style.display = 'none';
                    }

                    try {
                        // Prepare user data
                        const userData = {
                            email: email.value,
                            password: password.value,
                            first_name: firstNameInput.value,
                            last_name: lastNameInput.value,
                            newsletter: newsletterInput.checked
                        };

                        // Register user
                        const result = await window.auth.register(userData);

                        if (result.success) {
                            // Registration successful
                            window.location.href = 'dashboard.php';
                        } else {
                            // Display error
                            displayError(result.error || 'Registration failed');
                        }
                    } catch (error) {
                        displayError(error.message || 'An unexpected error occurred');
                    } finally {
                        // Re-enable form
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Create Account';
                    }
                }
            });

            // Helper to display errors
            function displayError(message) {
                let errorElement = document.getElementById('general-error');

                // Create error element if it doesn't exist
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.id = 'general-error';
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
