# GigGatek Mock API

This is a simple mock API server for testing the GigGatek frontend components.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server will run on http://localhost:3000.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (requires authentication)

### Users

- `GET /api/v1/users/me` - Get current user (requires authentication)

### Products

- `GET /api/v1/products` - Get products with filtering, sorting, and pagination
- `GET /api/v1/products/:id` - Get product by ID

### Orders

- `GET /api/v1/orders` - Get user orders (requires authentication)
- `GET /api/v1/orders/:id` - Get order by ID (requires authentication)
- `POST /api/v1/orders` - Create a new order (requires authentication)
- `POST /api/v1/orders/:id/cancel` - Cancel an order (requires authentication)

### Rentals

- `GET /api/v1/rentals` - Get user rentals (requires authentication)
- `GET /api/v1/rentals/:id` - Get rental by ID (requires authentication)
- `POST /api/v1/rentals` - Create a new rental (requires authentication)

## Test Users

- Customer: `john@example.com` / `password123`
- Admin: `admin@example.com` / `admin123`

## Query Parameters

### Products

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)
- `search` - Search term for name and description
- `category` - Filter by category (cameras, audio, lighting, accessories)
- `min_price` - Minimum price
- `max_price` - Maximum price
- `sort` - Sort field and direction (e.g., name:asc, price:desc)

### Orders and Rentals

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)

## Authentication

The API uses JWT for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens expire after 45 minutes. Use the refresh token to get a new access token.
