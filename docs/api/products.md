# Products API

This document describes the product management API endpoints for the GigGatek platform.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.giggatek.com/v1
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Get All Products

```
GET /products
```

Get a list of products. This endpoint does not require authentication.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| condition | string | Filter by condition (e.g., "new", "refurbished", "used") |
| min_price | number | Minimum price filter |
| max_price | number | Maximum price filter |
| search | string | Search term for product name or description |
| sort | string | Sort field (e.g., "price", "name", "created_at") |
| order | string | Sort order ("asc" or "desc") |
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 20, max: 100) |

#### Response

```json
{
  "products": [
    {
      "id": 101,
      "name": "Refurbished Laptop",
      "sku": "RL-101",
      "price": 99.99,
      "rental_price": 19.99,
      "condition": "refurbished",
      "condition_rating": 4.5,
      "category": "laptops",
      "image_url": "https://example.com/images/laptop.jpg",
      "in_stock": true
    },
    {
      "id": 102,
      "name": "Wireless Mouse",
      "sku": "WM-102",
      "price": 19.99,
      "rental_price": 4.99,
      "condition": "new",
      "condition_rating": 5.0,
      "category": "accessories",
      "image_url": "https://example.com/images/mouse.jpg",
      "in_stock": true
    }
  ],
  "pagination": {
    "total": 150,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 8
  }
}
```

### Get Product Details

```
GET /products/{product_id}
```

Get detailed information about a specific product. This endpoint does not require authentication.

#### Response

```json
{
  "product": {
    "id": 101,
    "name": "Refurbished Laptop",
    "sku": "RL-101",
    "description": "High-quality refurbished laptop with 1-year warranty. Intel Core i5, 8GB RAM, 256GB SSD.",
    "price": 99.99,
    "rental_price": 19.99,
    "condition": "refurbished",
    "condition_rating": 4.5,
    "category": "laptops",
    "specifications": {
      "processor": "Intel Core i5-10210U",
      "ram": "8GB DDR4",
      "storage": "256GB SSD",
      "display": "15.6-inch Full HD",
      "graphics": "Intel UHD Graphics",
      "battery": "Up to 8 hours",
      "ports": ["2x USB 3.0", "1x USB-C", "HDMI", "Ethernet", "Audio jack"],
      "os": "Windows 10 Pro"
    },
    "image_urls": [
      "https://example.com/images/laptop_front.jpg",
      "https://example.com/images/laptop_side.jpg",
      "https://example.com/images/laptop_back.jpg"
    ],
    "in_stock": true,
    "inventory": 15,
    "rental_available": true,
    "rental_terms": [
      {
        "months": 3,
        "monthly_price": 24.99,
        "buyout_price": 74.99
      },
      {
        "months": 6,
        "monthly_price": 19.99,
        "buyout_price": 49.99
      },
      {
        "months": 12,
        "monthly_price": 14.99,
        "buyout_price": 24.99
      }
    ],
    "average_rating": 4.7,
    "review_count": 42,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-04-05T14:45:00Z"
  }
}
```

### Get Product Reviews

```
GET /products/{product_id}/reviews
```

Get reviews for a specific product. This endpoint does not require authentication.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| rating | integer | Filter by rating (1-5) |
| sort | string | Sort field (e.g., "date", "rating", "helpful") |
| order | string | Sort order ("asc" or "desc") |
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 10, max: 50) |

#### Response

```json
{
  "reviews": [
    {
      "id": 456,
      "product_id": 101,
      "user_id": 789,
      "user_name": "John D.",
      "rating": 5,
      "title": "Excellent refurbished laptop",
      "content": "This laptop works like new. Great performance for the price and the battery life is impressive.",
      "helpful_count": 12,
      "verified_purchase": true,
      "created_at": "2025-03-20T09:15:00Z"
    },
    {
      "id": 457,
      "product_id": 101,
      "user_id": 790,
      "user_name": "Sarah M.",
      "rating": 4,
      "title": "Good value",
      "content": "Very happy with this purchase. The laptop is in great condition and runs all my software smoothly.",
      "helpful_count": 8,
      "verified_purchase": true,
      "created_at": "2025-03-15T16:30:00Z"
    }
  ],
  "summary": {
    "average_rating": 4.7,
    "total_reviews": 42,
    "rating_breakdown": {
      "5": 30,
      "4": 8,
      "3": 3,
      "2": 1,
      "1": 0
    }
  },
  "pagination": {
    "total": 42,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 5
  }
}
```

### Submit Product Review

```
POST /products/{product_id}/reviews
```

Submit a review for a product. Requires authentication.

#### Request Body

```json
{
  "rating": 5,
  "title": "Excellent refurbished laptop",
  "content": "This laptop works like new. Great performance for the price and the battery life is impressive."
}
```

#### Response

```json
{
  "message": "Review submitted successfully",
  "review": {
    "id": 458,
    "product_id": 101,
    "user_id": 791,
    "user_name": "Michael B.",
    "rating": 5,
    "title": "Excellent refurbished laptop",
    "content": "This laptop works like new. Great performance for the price and the battery life is impressive.",
    "helpful_count": 0,
    "verified_purchase": true,
    "created_at": "2025-04-10T14:30:00Z"
  }
}
```

### Mark Review as Helpful

```
POST /products/{product_id}/reviews/{review_id}/helpful
```

Mark a review as helpful. Requires authentication.

#### Response

```json
{
  "message": "Review marked as helpful",
  "helpful_count": 13
}
```

### Get Related Products

```
GET /products/{product_id}/related
```

Get products related to a specific product. This endpoint does not require authentication.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Maximum number of related products to return (default: 5, max: 20) |

#### Response

```json
{
  "related_products": [
    {
      "id": 103,
      "name": "Refurbished Desktop PC",
      "sku": "RD-103",
      "price": 149.99,
      "rental_price": 29.99,
      "condition": "refurbished",
      "condition_rating": 4.3,
      "category": "desktops",
      "image_url": "https://example.com/images/desktop.jpg",
      "in_stock": true
    },
    {
      "id": 104,
      "name": "Laptop Cooling Pad",
      "sku": "LCP-104",
      "price": 24.99,
      "rental_price": 5.99,
      "condition": "new",
      "condition_rating": 5.0,
      "category": "accessories",
      "image_url": "https://example.com/images/cooling-pad.jpg",
      "in_stock": true
    }
  ]
}
```

### Create Product (Admin Only)

```
POST /products
```

Create a new product. Requires admin permissions.

#### Request Body

```json
{
  "name": "Refurbished Tablet",
  "sku": "RT-105",
  "description": "High-quality refurbished tablet with 1-year warranty. 10-inch display, 64GB storage.",
  "price": 79.99,
  "rental_price": 14.99,
  "condition": "refurbished",
  "condition_rating": 4.2,
  "category": "tablets",
  "specifications": {
    "processor": "Octa-core 2.0 GHz",
    "ram": "4GB",
    "storage": "64GB",
    "display": "10-inch Full HD",
    "battery": "Up to 10 hours",
    "camera": "8MP rear, 5MP front"
  },
  "image_urls": [
    "https://example.com/images/tablet_front.jpg",
    "https://example.com/images/tablet_back.jpg"
  ],
  "inventory": 10,
  "rental_available": true,
  "rental_terms": [
    {
      "months": 3,
      "monthly_price": 19.99,
      "buyout_price": 59.99
    },
    {
      "months": 6,
      "monthly_price": 14.99,
      "buyout_price": 39.99
    },
    {
      "months": 12,
      "monthly_price": 9.99,
      "buyout_price": 19.99
    }
  ]
}
```

#### Response

```json
{
  "message": "Product created successfully",
  "product": {
    "id": 105,
    "name": "Refurbished Tablet",
    "sku": "RT-105",
    "price": 79.99,
    "rental_price": 14.99,
    "condition": "refurbished",
    "condition_rating": 4.2,
    "category": "tablets",
    "image_url": "https://example.com/images/tablet_front.jpg",
    "in_stock": true,
    "created_at": "2025-04-10T14:30:00Z"
  }
}
```

### Update Product (Admin Only)

```
PUT /products/{product_id}
```

Update an existing product. Requires admin permissions.

#### Request Body

Same as the create product endpoint, but all fields are optional.

#### Response

```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 105,
    "name": "Refurbished Tablet Pro",
    "sku": "RT-105",
    "price": 89.99,
    "rental_price": 16.99,
    "condition": "refurbished",
    "condition_rating": 4.2,
    "category": "tablets",
    "image_url": "https://example.com/images/tablet_front.jpg",
    "in_stock": true,
    "updated_at": "2025-04-10T15:45:00Z"
  }
}
```

### Delete Product (Admin Only)

```
DELETE /products/{product_id}
```

Delete a product. Requires admin permissions.

#### Response

```json
{
  "message": "Product deleted successfully"
}
```

## Product Condition Values

| Condition | Description |
|-----------|-------------|
| new | Brand new product |
| refurbished | Professionally restored to like-new condition |
| used_like_new | Used but in like-new condition |
| used_good | Used with minor signs of wear |
| used_fair | Used with noticeable signs of wear but fully functional |

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "error": "Missing required field: name"
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Permission denied"
}
```

### 404 Not Found

```json
{
  "error": "Product not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create product"
}
```
