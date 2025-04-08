# GigGatek Authentication Integration Testing Guide

This document provides a comprehensive testing methodology to ensure proper integration between the frontend authentication system (`auth.js`) and the backend JWT authentication API (`auth/routes.py`).

## Prerequisites

Before beginning integration testing, ensure:

1. Backend API server is running
2. MySQL database is configured with the users table
3. Frontend is properly compiled and served
4. Network connectivity between frontend and backend is established

## API URL Configuration

### Current Configuration Discrepancy

- **Frontend** (`auth.js`): Configured to use `/backend` as API URL
- **Backend** (`auth/routes.py`): Routes defined under `/auth` endpoint

### Configuration Fix

1. **Option 1: Update Frontend Config**

   Modify `auth.js` to use the correct API URL:

   ```javascript
   // Current (incorrect)
   const API_URL = '/backend';
   
   // Updated (correct)
   const API_URL = '/api';  // Base URL
   ```

2. **Option 2: Configure Web Server**

   Set up URL rewriting in Apache/Nginx to forward requests correctly:

   ```apache
   # Apache example
   RewriteEngine On
   RewriteRule ^/backend/auth/(.*)$ /api/auth/$1 [P]
   ```

## Integration Test Cases

### 1. User Registration Flow

**Test Case: Successful User Registration**

1. **Setup**: Clear any existing authentication state (localStorage)
2. **Test Steps**:
   - Fill and submit registration form with valid data:
     ```javascript
     const userData = {
       email: "test_user@example.com",
       password: "SecurePass123!",
       first_name: "Test",
       last_name: "User"
     };
     ```
   - Submit form
3. **Expected Results**:
   - Frontend receives 201 status code
   - JWT token is stored in localStorage
   - User is redirected to dashboard
   - User data is correctly displayed in dashboard

**Test Case: Registration Validation**

1. **Test Steps**: 
   - Submit form with invalid email format
   - Submit form with weak password
   - Submit form with existing email
2. **Expected Results**:
   - Appropriate validation errors are displayed
   - No API calls for invalid data
   - Duplicate email returns 409 error

### 2. Login Flow

**Test Case: Successful Login**

1. **Setup**: Ensure test user exists in database
2. **Test Steps**:
   - Fill login form with valid credentials
   - Submit form
3. **Expected Results**:
   - Frontend receives 200 status code
   - JWT token is stored in localStorage
   - User is redirected to dashboard
   - Auth state reflects logged-in user

**Test Case: Failed Login**

1. **Test Steps**:
   - Attempt login with invalid credentials
2. **Expected Results**:
   - Frontend receives 401 status code
   - Error message is displayed
   - No token is stored
   - User remains on login page

### 3. Token Management

**Test Case: Token Refresh**

1. **Setup**: Login with valid credentials
2. **Test Steps**:
   - Modify token expiry for testing (reduce to 1 minute)
   - Wait for token to approach expiration
   - Trigger authenticated API call
3. **Expected Results**:
   - Token refresh is automatically triggered
   - New token is received and stored
   - Original API call succeeds
   - User session continues uninterrupted

**Test Case: Token Validation**

1. **Setup**: Login with valid credentials
2. **Test Steps**:
   - Manually modify token to be invalid
   - Attempt to access protected page
3. **Expected Results**:
   - Backend rejects invalid token
   - User is redirected to login page
   - Auth state is cleared

### 4. Protected Route Access

**Test Case: Protected Page Access**

1. **Setup**: Valid authentication state
2. **Test Steps**:
   - Navigate to dashboard page
   - Access profile page
   - Access orders page
3. **Expected Results**:
   - All pages load correctly
   - User data is displayed
   - Auth header is included in all API requests

**Test Case: Unauthorized Access**

1. **Setup**: Unauthenticated state
2. **Test Steps**:
   - Attempt to directly access dashboard URL
3. **Expected Results**:
   - Frontend detects missing auth
   - User is redirected to login page
   - URL includes redirect parameter

### 5. Profile Management

**Test Case: Update Profile Information**

1. **Setup**: Authenticated state
2. **Test Steps**:
   - Navigate to profile page
   - Change first name, last name, and phone
   - Submit form
3. **Expected Results**:
   - PUT request sent to correct endpoint
   - Success message displayed
   - Profile information updated in UI
   - Changes persist after page refresh

**Test Case: Change Password**

1. **Setup**: Authenticated state
2. **Test Steps**:
   - Navigate to password change form
   - Enter current password
   - Enter and confirm new password
   - Submit form
3. **Expected Results**:
   - PUT request sent to correct endpoint
   - Success message displayed
   - User remains logged in
   - Can login with new password after logout

### 6. Password Reset Flow

**Test Case: Request Password Reset**

1. **Setup**: Existing user account
2. **Test Steps**:
   - Navigate to password reset request page
   - Enter user's email
   - Submit form
3. **Expected Results**:
   - POST request sent to correct endpoint
   - Success message displayed (regardless of email existence)
   - Reset token generated in backend

**Test Case: Complete Password Reset**

1. **Setup**: Valid reset token
2. **Test Steps**:
   - Access password reset page with token parameter
   - Enter and confirm new password
   - Submit form
3. **Expected Results**:
   - POST request sent to correct endpoint
   - Success message displayed
   - Redirected to login page
   - Can login with new password

## Common Integration Issues

### API URL Mismatch

**Issue**: Frontend auth.js uses `/backend` while backend routes use `/auth`
**Solution**: Update API_URL in auth.js or set up proper URL rewriting

### CORS Errors

**Issue**: Cross-Origin Resource Sharing restrictions blocking API requests
**Solution**: Ensure backend has proper CORS headers:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

### Token Format Issues

**Issue**: Authorization header format incorrect
**Solution**: Verify token is sent correctly in headers:

```javascript
headers: {
  'Authorization': `Bearer ${auth.getToken()}`,
  'Content-Type': 'application/json'
}
```

### Session Management Issues

**Issue**: Sessions not persisting or logging out unexpectedly
**Solution**: Verify token storage and expiration handling:

1. Check localStorage for proper token storage
2. Implement token refresh before expiration
3. Verify proper error handling for expired tokens

## Integration Testing Environment

### Local Development Setup

```bash
# Terminal 1: Run Backend API
cd backend
python app.py

# Terminal 2: Run Frontend Server
cd frontend
php -S localhost:8000
```

### Browser Console Testing

Use browser console to test individual auth functions:

```javascript
// Test login
auth.login('test@example.com', 'Password123!').then(console.log);

// Test token validation
console.log(auth.isAuthenticated);

// Test user data
console.log(auth.getUser());
```

### Automated Test Suite Setup

1. Install testing framework:
   ```bash
   npm install jest puppeteer
   ```

2. Create test scripts in `/tests/integration/auth.test.js`

## Test Execution Checklist

- [ ] Backend API is running
- [ ] Database contains test users
- [ ] Frontend is properly served
- [ ] API URL configuration is correct
- [ ] CORS is properly configured
- [ ] Network requests can be monitored (DevTools)
- [ ] All test cases documented in this guide are executed
- [ ] Results are documented for any failures

## Next Steps After Authentication Integration

Once authentication integration is verified, proceed to:

1. Order Management integration testing
2. Rental System integration testing 
3. Email notification integration testing

By methodically testing the authentication integration following this guide, we will ensure a solid foundation for the rest of the application's functionality.
