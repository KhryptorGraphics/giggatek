# GigGatek Integration Guide

## Overview

This document provides a comprehensive guide for integrating the various components of the GigGatek e-commerce platform. It focuses on the connections between frontend and backend systems, explains data flows, and provides guidance for testing and validation.

## System Architecture

### High-Level Architecture

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│               │      │               │      │               │
│   Frontend    │◄────►│     API       │◄────►│   Database    │
│   (PHP/JS)    │      │   (Flask)     │      │   (MySQL)     │
│               │      │               │      │               │
└───────────────┘      └───────┬───────┘      └───────────────┘
                              │
                      ┌───────▼───────┐
                      │               │
                      │ External APIs │
                      │  (e.g. Stripe)│
                      │               │
                      └───────────────┘
```

### Component Details

1. **Frontend Layer**
   - PHP-based page rendering
   - JavaScript for client-side interactions
   - Communicates with backend API via AJAX/fetch
   - Manages user authentication state
   - Handles form validation and submission

2. **API Layer**
   - Flask-based RESTful API
   - Handles request validation and processing
   - Manages business logic
   - Provides JWT-based authentication
   - Interfaces with database and external services

3. **Database Layer**
   - MySQL database
   - Stores user, product, order, and rental data
   - Maintains relational integrity
   - Handles transaction processing

4. **External Services**
   - Stripe for payment processing
   - Email service for notifications
   - Monitoring and analytics services

## Data Flow Diagrams

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  User    │────►│ Frontend │────►│  API     │────►│ Database │
│          │     │          │     │          │     │          │
└──────────┘     └────┬─────┘     └────┬─────┘     └──────────┘
                      │                │                ▲
                      │                │                │
                      ▼                ▼                │
                 ┌──────────┐    ┌──────────┐          │
                 │ Store    │    │ Generate │          │
                 │ JWT      │◄───┤ JWT      ├──────────┘
                 │ Token    │    │ Token    │
                 └──────────┘    └──────────┘
```

### Order Creation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  User    │────►│ Cart     │────►│ Checkout │────►│ Payment  │
│          │     │ Page     │     │ Page     │     │ Gateway  │
└──────────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
                      │                │                 │
                      │                │                 │
                      │                ▼                 ▼
                      │           ┌──────────┐     ┌──────────┐
                      │           │ Order    │     │ Stripe   │
                      └──────────►│ API      │────►│ API      │
                                  │          │     │          │
                                  └────┬─────┘     └────┬─────┘
                                       │                 │
                                       ▼                 │
                                  ┌──────────┐          │
                                  │ Database │◄─────────┘
                                  │          │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │ Email    │
                                  │ Service  │
                                  │          │
                                  └──────────┘
```

### Rental Contract Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  User    │────►│ Product  │────►│ Rental   │────►│ Contract │
│          │     │ Page     │     │ Form     │     │ Signing  │
└──────────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
                      │                │                 │
                      │                │                 │
                      │                ▼                 ▼
                      │           ┌──────────┐     ┌──────────┐
                      │           │ Rental   │     │ Payment  │
                      └──────────►│ API      │────►│ Schedule │
                                  │          │     │          │
                                  └────┬─────┘     └────┬─────┘
                                       │                 │
                                       ▼                 │
                                  ┌──────────┐          │
                                  │ Database │◄─────────┘
                                  │          │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │ Email    │
                                  │ Service  │
                                  │          │
                                  └──────────┘
```

## Frontend-Backend Integration

### API Communication

All frontend components communicate with the backend using RESTful API calls. The primary methods for making these requests are:

#### JavaScript (browser)

```javascript
// Example: Authentication
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Store authentication token
    localStorage.setItem('auth_token', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

#### PHP (server-side)

```php
// Example: Fetching product details
function getProductDetails($productId) {
    $url = 'http://localhost:5000/api/products/' . $productId;
    
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    
    // Add authentication if required
    $token = $_SESSION['auth_token'] ?? '';
    if ($token) {
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token
        ]);
    }
    
    $response = curl_exec($curl);
    $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    if ($statusCode !== 200) {
        throw new Exception('Failed to fetch product details');
    }
    
    return json_decode($response, true);
}
```

### Authentication Integration

The frontend and backend use JWT (JSON Web Tokens) for authentication:

1. **Token Storage**
   - Frontend stores JWT in localStorage (JavaScript) or session (PHP)
   - Token includes user ID and expiration time

2. **Token Usage**
   - All authenticated API requests include the token in the Authorization header
   - Backend validates token for protected endpoints

3. **Token Refresh**
   - Frontend monitors token expiration
   - Auto-refreshes token before expiration using the refresh endpoint
   - Redirects to login if refresh fails

#### Implementation Example

```javascript
// auth.js - Authentication Manager
const auth = {
  getToken() {
    return localStorage.getItem('auth_token');
  },
  
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  },
  
  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh token');
      }
      
      localStorage.setItem('auth_token', data.token);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
};
```

### Form Submission and Validation

1. **Client-side Validation**
   - Frontend performs initial validation for quick feedback
   - Uses HTML5 validation attributes and JavaScript validation
   
2. **Server-side Validation**
   - Backend API revalidates all data for security
   - Returns structured validation errors

3. **Error Handling**
   - Frontend displays field-specific error messages
   - Backend provides detailed error responses

#### Implementation Example

```javascript
// frontend/js/validation.js
const validators = {
  email: (value) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value) ? null : 'Please enter a valid email address';
  },
  
  password: (value) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must include a number';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Password must include a special character';
    return null;
  }
};

function validateForm(formData, fields) {
  const errors = {};
  
  for (const field of fields) {
    const value = formData.get(field.name);
    const validator = validators[field.type];
    
    if (validator) {
      const error = validator(value);
      if (error) errors[field.name] = error;
    }
  }
  
  return errors;
}
```

## Integration Points

### 1. Authentication System

#### Frontend Components
- `frontend/login.php` - Login page
- `frontend/register.php` - Registration page
- `frontend/js/auth.js` - Authentication logic

#### Backend Endpoints
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

#### Integration Points
- Login form submission → auth.js → backend login endpoint → JWT token storage
- Registration form submission → auth.js → backend register endpoint → redirect to dashboard
- Protected page load → auth.js token verification → redirect to login if invalid
- Auth state checking → auth.js isAuthenticated() → conditionally display UI elements

### 2. Order Management System

#### Frontend Components
- `frontend/checkout.php` - Checkout page
- `frontend/components/dashboard/orders.php` - Order history component
- `frontend/js/checkout.js` - Checkout logic
- `frontend/js/orders.js` - Order management logic

#### Backend Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

#### Integration Points
- Checkout form submission → checkout.js → Stripe payment → backend create order endpoint
- Order history page load → orders.js → backend list orders endpoint → render order list
- Order detail view → orders.js → backend order details endpoint → render order details
- Order cancellation → orders.js → backend cancel order endpoint → update UI

### 3. Rental Management System

#### Frontend Components
- `frontend/components/dashboard/rentals.php` - Rental management component
- `frontend/js/rentals.js` - Rental management logic

#### Backend Endpoints
- `POST /api/rentals` - Create rental
- `GET /api/rentals` - List user rentals
- `GET /api/rentals/:id` - Get rental details
- `POST /api/rentals/:id/make-payment` - Make rental payment
- `POST /api/rentals/:id/sign-contract` - Sign rental contract

#### Integration Points
- Rental creation → rentals.js → backend create rental endpoint → contract signing UI
- Rental history page load → rentals.js → backend list rentals endpoint → render rental list
- Rental detail view → rentals.js → backend rental details endpoint → render rental details
- Payment processing → rentals.js → Stripe → backend make payment endpoint → update UI

### 4. Email Notification System

#### Frontend Integration
- Handling "resend email" requests
- Email preference management

#### Backend Integration
- Order status changes trigger email notifications
- Rental payment reminders are scheduled
- Account-related actions send verification emails

## Environment Setup for Integration Testing

### Local Development Environment

1. **Prerequisites**
   - PHP 8.1+
   - Python 3.10+
   - MySQL 8.0+
   - Node.js 16+ (for frontend tools)

2. **Backend Setup**
   ```bash
   # Clone repository
   git clone https://github.com/giggatek/giggatek-platform.git
   cd giggatek-platform
   
   # Set up Python virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r backend/requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Run database migrations
   cd backend
   python manage.py migrate
   
   # Start backend server
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   # In a new terminal, navigate to project directory
   cd giggatek-platform
   
   # Install frontend dependencies
   npm install
   
   # Build frontend assets
   npm run build
   
   # Configure Apache/PHP
   # Point document root to the frontend directory
   ```

4. **Docker Setup (Alternative)**
   ```bash
   # Start all services with Docker Compose
   docker-compose up -d
   
   # Access the application at http://localhost
   ```

### Configuration

#### Environment Variables

```
# Backend Environment (.env)
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=mysql://username:password@localhost/giggatek
JWT_SECRET_KEY=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=notifications@giggatek.com
EMAIL_HOST_PASSWORD=your-password
EMAIL_USE_TLS=True
```

#### Frontend Configuration

```javascript
// frontend/js/config.js
const config = {
  apiUrl: 'http://localhost:5000/api',
  stripePublishableKey: 'pk_test_...',
  debug: true
};
```

## Integration Testing

### Test Environment Setup

1. Set up a dedicated test database
2. Configure test environment variables
3. Prepare test fixtures for users, products, orders, and rentals

### Authentication Testing

1. **Test User Registration**
   - Submit registration form with valid data
   - Verify user is created in database
   - Verify JWT token is received and stored

2. **Test User Login**
   - Submit login form with valid credentials
   - Verify JWT token is received and stored
   - Verify redirect to dashboard

3. **Test Token Refresh**
   - Create expired token
   - Attempt token refresh
   - Verify new token is received

### Order Flow Testing

1. **Test Order Creation**
   - Add products to cart
   - Complete checkout process with test payment
   - Verify order is created in database
   - Verify email notification is sent

2. **Test Order Status Updates**
   - Create test order
   - Update order status through admin interface
   - Verify frontend displays updated status
   - Verify email notification is sent

### Rental Flow Testing

1. **Test Rental Creation**
   - Complete rental creation process
   - Sign rental contract
   - Verify rental is created in database
   - Verify email notification is sent

2. **Test Rental Payments**
   - Make test payment on existing rental
   - Verify payment is recorded
   - Verify rental status is updated
   - Verify email receipt is sent

### API Integration Testing

1. **Authentication Headers**
   - Verify protected endpoints require valid JWT
   - Verify expired tokens are rejected
   - Verify proper error responses

2. **Request/Response Format**
   - Verify all endpoints return expected data structures
   - Verify error responses follow standard format
   - Test pagination for list endpoints

## Common Integration Issues and Solutions

### 1. CORS Configuration

**Issue**: Frontend cannot access backend API due to CORS restrictions.

**Solution**: 
```python
# In Flask backend
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost", "https://giggatek.com"]}})
```

### 2. Authentication Token Management

**Issue**: Token expiration causing unexpected logouts or auth failures.

**Solution**: Implement token refresh logic that refreshes the token before it expires.

```javascript
// Check token expiration before API requests
function checkTokenExpiration() {
  if (auth.isTokenExpiringSoon()) {
    return auth.refreshToken();
  }
  return Promise.resolve();
}

// Use before API calls
async function fetchData(url) {
  await checkTokenExpiration();
  // Proceed with fetch...
}
```

### 3. Form Data Validation

**Issue**: Inconsistent validation between frontend and backend.

**Solution**: Extract validation rules into a shared configuration that both frontend and backend can reference.

### 4. API Response Handling

**Issue**: Inconsistent error handling in the frontend.

**Solution**: Create a centralized API client with standard error handling:

```javascript
// api.js - Centralized API client
const api = {
  async request(endpoint, options = {}) {
    const url = `${config.apiUrl}/${endpoint}`;
    
    // Add authentication token if available
    if (auth.getToken()) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${auth.getToken()}`
      };
    }
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || 'Unknown error',
          data
        };
      }
      
      return data;
    } catch (error) {
      // Log error for debugging
      if (config.debug) {
        console.error(`API Error (${endpoint}):`, error);
      }
      
      // Handle specific error conditions
      if (error.status === 401) {
        auth.logout();
        window.location.href = '/login.php';
      }
      
      throw error;
    }
  },
  
  // Convenience methods
  get(endpoint) {
    return this.request(endpoint);
  },
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
  },
  
  // Additional methods...
};
```

## Deployment Integration

### Staging Environment

1. **Setup**
   - Configure separate database
   - Use test Stripe keys
   - Disable real email sending

2. **Deployment Process**
   - Deploy backend API first
   - Verify API endpoints with Postman/curl
   - Deploy frontend components
   - Run integration tests

### Production Environment

1. **Configuration**
   - Use production database credentials
   - Use production Stripe keys
   - Configure production email service

2. **Health Checks**
   - Implement API health check endpoint
   - Configure monitoring for API and frontend
   - Set up alerting for critical failures

3. **Deployment Checklist**
   - Database migrations run successfully
   - Static assets properly bundled
   - SSL certificates valid
   - Environment variables properly set
   - Backend services running
   - Integration tests passing

## Conclusion

Successful integration of the GigGatek platform components requires careful attention to the interaction points between frontend and backend systems. By following this guide, developers can ensure that these systems work together seamlessly to provide a cohesive user experience.

The key to successful integration is consistent communication patterns, standardized error handling, and thorough testing of all interaction flows. Regular integration testing should be performed whenever changes are made to either the frontend or backend systems.

For additional assistance, refer to the API Documentation and individual component documentation.
