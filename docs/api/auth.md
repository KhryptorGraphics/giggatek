# Authentication API

This document describes the authentication API endpoints for the GigGatek platform.

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

### Register a new user

```
POST /auth/register
```

Register a new user account.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-123-4567"
}
```

#### Response

```json
{
  "message": "User registered successfully",
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Login

```
POST /auth/login
```

Authenticate a user and get a JWT token.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Response

```json
{
  "message": "Login successful",
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Refresh Token

```
POST /auth/refresh
```

Refresh an authentication token before it expires.

#### Request Headers

```
Authorization: Bearer <token>
```

#### Response

```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Get Authentication Status

```
GET /auth/status
```

Check if the user is authenticated and get user information.

#### Request Headers

```
Authorization: Bearer <token>
```

#### Response

```json
{
  "authenticated": true,
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CUSTOMER"
  }
}
```

### Get User Permissions

```
GET /auth/user/permissions
```

Get the permissions for the authenticated user.

#### Request Headers

```
Authorization: Bearer <token>
```

#### Response

```json
{
  "permissions": [
    "VIEW_PRODUCTS",
    "VIEW_OWN_ORDERS",
    "CANCEL_ORDERS",
    "VIEW_OWN_RENTALS",
    "CANCEL_RENTALS",
    "VIEW_OWN_PROFILE",
    "EDIT_OWN_PROFILE"
  ]
}
```

### Logout

```
POST /auth/logout
```

Log out the authenticated user.

#### Request Headers

```
Authorization: Bearer <token>
```

#### Response

```json
{
  "message": "Logout successful"
}
```

### Request Password Reset

```
POST /auth/password/reset
```

Request a password reset link.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response

```json
{
  "message": "If your email is registered, you will receive a password reset link"
}
```

### Reset Password

```
POST /auth/password/reset/confirm
```

Reset a password using a reset token.

#### Request Body

```json
{
  "token": "reset_token_123",
  "password": "NewSecurePassword123!"
}
```

#### Response

```json
{
  "message": "Password reset successful"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "error": "Missing required field: email"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid email or password"
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
  "error": "User not found"
}
```

### 409 Conflict

```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error

```json
{
  "error": "An unexpected error occurred"
}
```
