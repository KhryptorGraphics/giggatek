# GigGatek Frontend Deployment Guide

This document provides instructions for deploying the GigGatek frontend to different environments and integrating with the real backend API.

## Environments

The GigGatek frontend supports three environments:

1. **Development** - Local development environment with mock API
2. **Staging** - Testing environment with real backend API
3. **Production** - Production environment with real backend API

## Prerequisites

- Node.js 14+ and npm
- Access to the backend API endpoints
- Proper authentication credentials for the backend API

## Building for Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit the `js/env.js` file to set the correct API endpoints for each environment:

```javascript
// Environment-specific configuration
development: {
  apiBaseUrl: 'http://localhost:3000/api/v1',
  enableMocks: true,
  debug: true,
  analyticsEnabled: false
},

staging: {
  apiBaseUrl: 'https://staging-api.giggatek.com/api/v1',
  enableMocks: false,
  debug: true,
  analyticsEnabled: true
},

production: {
  apiBaseUrl: 'https://api.giggatek.com/api/v1',
  enableMocks: false,
  debug: false,
  analyticsEnabled: true
}
```

### 3. Build for Production

```bash
npm run build
```

This will:
- Compile Sass to CSS
- Apply autoprefixer for cross-browser compatibility
- Minify JavaScript and CSS files
- Set the environment to production
- Copy all necessary files to the `dist` directory

### 4. Deploy the Build

Copy the contents of the `dist` directory to your web server.

## Integration with Real Backend

### Authentication

The real backend API uses JWT authentication. The frontend handles this through the `api-client.js` file, which:

1. Sends login/register requests to the backend
2. Stores the JWT token in localStorage
3. Includes the token in all authenticated requests
4. Refreshes the token before it expires
5. Handles authentication errors

### API Endpoints

The frontend uses the following API endpoints:

- **Authentication**
  - Login: `POST /auth/login`
  - Register: `POST /auth/register`
  - Refresh Token: `POST /auth/refresh`
  - Logout: `POST /auth/logout`
  - Current User: `GET /users/me`

- **Products**
  - List Products: `GET /products`
  - Get Product: `GET /products/:id`

- **Orders**
  - List Orders: `GET /orders`
  - Get Order: `GET /orders/:id`
  - Create Order: `POST /orders`
  - Cancel Order: `POST /orders/:id/cancel`
  - Review Order: `POST /orders/:id/review`

- **Rentals**
  - List Rentals: `GET /rentals`
  - Get Rental: `GET /rentals/:id`
  - Create Rental: `POST /rentals`
  - Cancel Rental: `POST /rentals/:id/cancel`
  - Extend Rental: `POST /rentals/:id/extend`

### Data Models

The frontend uses data models to normalize API responses and prepare data for API requests. These models handle differences between the mock API and the real backend API.

### Error Handling

The frontend includes comprehensive error handling for API requests, including:

- Authentication errors (401)
- Permission errors (403)
- Validation errors (422)
- Rate limiting (429)
- Server errors (500)

## Testing the Integration

1. Build the frontend with the staging environment:
   ```bash
   # Edit js/env.js to set current: 'staging'
   npm run build
   ```

2. Deploy to the staging server

3. Test all functionality:
   - User authentication
   - Product browsing and filtering
   - Order creation and management
   - Rental creation and management

4. If everything works correctly, build for production and deploy

## Troubleshooting

### Authentication Issues

- Check that the JWT token is being stored correctly in localStorage
- Verify that the token is being included in API requests
- Check that the token refresh mechanism is working

### API Request Issues

- Check the browser console for error messages
- Verify that the API endpoints are correct
- Check that the data being sent to the API is in the correct format

### CORS Issues

- Ensure that the backend API has CORS configured to allow requests from the frontend domain
- Check for any CORS errors in the browser console

## Monitoring

Once deployed, monitor the application for:

- JavaScript errors
- API request failures
- Performance issues
- User feedback

Use browser developer tools and any integrated analytics to identify and fix issues.
