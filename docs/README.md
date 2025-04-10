# GigGatek Documentation

## Overview

GigGatek is an e-commerce platform specializing in refurbished computer hardware with both purchase and rent-to-own options. This documentation provides information about the project structure, features, and how to set up and maintain the application.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Features](#features)
3. [Setup Instructions](#setup-instructions)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [API Documentation](#api-documentation)

## Project Structure

The project is organized into two main directories:

- `frontend/`: Contains all client-side code
  - `css/`: Stylesheets
  - `js/`: JavaScript files
  - `img/`: Images and assets
  - `tests/`: Frontend tests
  - `dist/`: Compiled and optimized assets (generated)

- `backend/`: Contains all server-side code
  - `api/`: API endpoints
  - `config/`: Configuration files
  - `utils/`: Utility functions
  - `models/`: Data models
  - `tests/`: Backend tests

## Features

### User Features

- **Product Browsing**: Browse and search for refurbished computer hardware
- **Product Details**: View detailed information about products
- **Shopping Cart**: Add products to cart and manage quantities
- **Checkout**: Secure checkout process with Stripe integration
- **User Dashboard**: Manage orders, rentals, and account settings
- **Wishlist**: Save products for later
- **Rent-to-Own**: Option to rent products with monthly payments

### Admin Features

- **Product Management**: Add, edit, and remove products
- **Order Management**: View and manage customer orders
- **Rental Management**: Track rental payments and status
- **User Management**: Manage user accounts and permissions
- **Analytics**: View sales and performance metrics

## Setup Instructions

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Node.js 14 or higher
- Composer
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/giggatek.git
   cd giggatek
   ```

2. Set up the backend:
   ```
   cd backend
   composer install
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   php setup.php
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   npm run build
   ```

4. Configure your web server to point to the project directory.

## Frontend Development

### Directory Structure

- `css/`: Contains all CSS files
  - `style.css`: Main stylesheet
  - `framework.css`: Base framework styles
  - `dashboard.css`: Dashboard-specific styles
  - `stripe-elements.css`: Stripe payment form styles
  - `notifications.css`: Notification system styles

- `js/`: Contains all JavaScript files
  - `main.js`: Main JavaScript file
  - `cart.js`: Shopping cart functionality
  - `checkout.js`: Checkout process
  - `dashboard.js`: User dashboard functionality
  - `wishlist.js`: Wishlist functionality
  - `stripe-integration.js`: Stripe payment integration
  - `notifications.js`: Notification system
  - `auth.js`: Authentication functionality

### Building Assets

To build the frontend assets:

```
cd frontend
npm run build
```

For development with automatic rebuilding:

```
npm run dev
```

### CSS Architecture

The CSS follows a component-based architecture with the following principles:

- Base styles in `framework.css`
- Component-specific styles in separate files
- Responsive design with mobile-first approach
- CSS variables for consistent theming

## Backend Development

### Directory Structure

- `api/`: Contains API endpoints
  - `products/`: Product-related endpoints
  - `orders/`: Order-related endpoints
  - `users/`: User-related endpoints
  - `payment/`: Payment-related endpoints
  - `wishlist/`: Wishlist-related endpoints

- `config/`: Configuration files
  - `config.php`: Main configuration file
  - `database.php`: Database configuration

- `utils/`: Utility functions
  - `auth.php`: Authentication utilities
  - `db.php`: Database utilities
  - `validation.php`: Input validation utilities

### API Endpoints

The backend provides RESTful API endpoints for the frontend to interact with:

- `/api/products`: Product management
- `/api/orders`: Order management
- `/api/users`: User management
- `/api/payment`: Payment processing
- `/api/wishlist`: Wishlist management

## Testing

### Frontend Testing

Frontend tests are written using Jest and can be run with:

```
cd frontend
npm test
```

For test coverage:

```
npm run test:coverage
```

### Backend Testing

Backend tests are written using PHPUnit and can be run with:

```
cd backend
composer test
```

## Deployment

### Production Build

To create a production build:

```
cd frontend
NODE_ENV=production npm run build
```

### Server Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache or Nginx web server
- SSL certificate for secure connections

### Deployment Steps

1. Set up a production database
2. Configure the `.env` file with production settings
3. Build the frontend assets for production
4. Upload the files to your production server
5. Set up the web server configuration
6. Run any necessary database migrations

## API Documentation

### Authentication

All API requests (except public endpoints) require authentication using JWT tokens.

To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Products API

- `GET /api/products`: Get all products
- `GET /api/products/{id}`: Get a specific product
- `POST /api/products`: Create a new product (admin only)
- `PUT /api/products/{id}`: Update a product (admin only)
- `DELETE /api/products/{id}`: Delete a product (admin only)

### Orders API

- `GET /api/orders`: Get user's orders
- `GET /api/orders/{id}`: Get a specific order
- `POST /api/orders`: Create a new order
- `PUT /api/orders/{id}`: Update an order (admin only)

### Payment API

- `POST /api/payment/create-payment-intent`: Create a Stripe payment intent
- `POST /api/payment/confirm-payment-intent`: Confirm a payment intent
- `GET /api/payment/payment-methods`: Get user's saved payment methods
- `POST /api/payment/payment-methods`: Add a new payment method
- `DELETE /api/payment/payment-methods/{id}`: Remove a payment method

### Wishlist API

- `GET /api/wishlist`: Get user's wishlist
- `POST /api/wishlist`: Add item to wishlist
- `DELETE /api/wishlist/{id}`: Remove item from wishlist
