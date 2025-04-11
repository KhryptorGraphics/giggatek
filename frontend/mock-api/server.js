/**
 * Mock API Server
 *
 * This file provides a simple mock API server for testing the frontend components.
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Import mock data
const products = require('./data/products');
const orders = require('./data/orders');
const rentals = require('./data/rentals');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT Secret
const JWT_SECRET = 'giggatek-mock-api-secret';
const JWT_EXPIRES_IN = '45m'; // 45 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

// Mock data
const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'CUSTOMER'
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN'
  }
];

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authentication required',
      status: 401
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid or expired token',
      status: 401
    });
  }
};

// Authentication routes
app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Validation failed',
      status: 422,
      errors: [
        { field: !name ? 'name' : !email ? 'email' : 'password', message: 'This field is required' }
      ]
    });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Validation failed',
      status: 422,
      errors: [
        { field: 'email', message: 'Email already in use' }
      ]
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: 'CUSTOMER'
  };

  users.push(newUser);

  // Return success
  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Validation failed',
      status: 422,
      errors: [
        { field: !email ? 'email' : 'password', message: 'This field is required' }
      ]
    });
  }

  // Find user
  const user = users.find(user => user.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid email or password',
      status: 401
    });
  }

  // Generate tokens
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  // Return tokens
  res.json({
    token,
    refreshToken,
    expiresIn: 2700, // 45 minutes in seconds
    tokenType: 'Bearer',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'bad_request',
      message: 'Refresh token is required',
      status: 400
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // Find user
    const user = users.find(user => user.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid refresh token',
        status: 401
      });
    }

    // Generate new tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Return new tokens
    res.json({
      token,
      refreshToken: newRefreshToken,
      expiresIn: 2700, // 45 minutes in seconds
      tokenType: 'Bearer'
    });
  } catch (error) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid or expired refresh token',
      status: 401
    });
  }
});

app.post('/api/v1/auth/logout', authenticate, (req, res) => {
  // In a real implementation, we would invalidate the token
  // For this mock API, we just return success
  res.json({ success: true });
});

// User routes
app.get('/api/v1/users/me', authenticate, (req, res) => {
  const user = users.find(user => user.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      error: 'not_found',
      message: 'User not found',
      status: 404
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// Product routes
app.get('/api/v1/products', (req, res) => {
  // Get query parameters
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const minPrice = parseFloat(req.query.min_price) || 0;
  const maxPrice = parseFloat(req.query.max_price) || Number.MAX_SAFE_INTEGER;
  const sort = req.query.sort || 'name:asc';

  // Get advanced filter parameters
  const condition = req.query.condition ? req.query.condition.split(',') : [];
  const brand = req.query.brand ? req.query.brand.split(',') : [];
  const features = req.query.features ? req.query.features.split(',') : [];
  const inStock = req.query.in_stock === 'true';
  const minRating = parseFloat(req.query.min_rating) || 0;

  // Filter products
  let filteredProducts = [...products];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category === category
    );
  }

  // Apply price filter
  filteredProducts = filteredProducts.filter(product =>
    product.price >= minPrice && product.price <= maxPrice
  );

  // Apply condition filter
  if (condition.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      condition.includes(product.condition)
    );
  }

  // Apply brand filter
  if (brand.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      brand.includes(product.brand)
    );
  }

  // Apply features filter
  if (features.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      features.some(feature => product.features && product.features.includes(feature))
    );
  }

  // Apply in-stock filter
  if (inStock) {
    filteredProducts = filteredProducts.filter(product =>
      product.stock > 0
    );
  }

  // Apply rating filter
  if (minRating > 0) {
    filteredProducts = filteredProducts.filter(product =>
      product.rating >= minRating
    );
  };

  // Apply sorting
  const [sortField, sortDirection] = sort.split(':');
  filteredProducts.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Calculate pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Return response
  res.json({
    products: paginatedProducts,
    page,
    per_page: perPage,
    total: totalProducts,
    total_pages: totalPages
  });
});

app.get('/api/v1/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      error: 'not_found',
      message: 'Product not found',
      status: 404
    });
  }

  res.json(product);
});

// Order routes
app.get('/api/v1/orders', authenticate, (req, res) => {
  // Get query parameters
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;

  // Filter orders by user
  const userOrders = orders.filter(order => order.user_id === req.user.id);

  // Calculate pagination
  const totalOrders = userOrders.length;
  const totalPages = Math.ceil(totalOrders / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedOrders = userOrders.slice(startIndex, endIndex);

  // Return response
  res.json({
    orders: paginatedOrders,
    page,
    per_page: perPage,
    total: totalOrders,
    total_pages: totalPages
  });
});

app.get('/api/v1/orders/:id', authenticate, (req, res) => {
  const orderId = req.params.id;
  const order = orders.find(o => o.id === orderId && o.user_id === req.user.id);

  if (!order) {
    return res.status(404).json({
      error: 'not_found',
      message: 'Order not found',
      status: 404
    });
  }

  res.json(order);
});

app.post('/api/v1/orders', authenticate, (req, res) => {
  const { items, shipping_address } = req.body;

  // Validate input
  if (!items || !items.length || !shipping_address) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Validation failed',
      status: 422,
      errors: [
        { field: !items || !items.length ? 'items' : 'shipping_address', message: 'This field is required' }
      ]
    });
  }

  // Create new order
  const newOrder = {
    id: `ORD-${1000 + orders.length + 1}`,
    user_id: req.user.id,
    status: 'PENDING',
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    items,
    shipping_address,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  orders.push(newOrder);

  res.status(201).json(newOrder);
});

app.post('/api/v1/orders/:id/cancel', authenticate, (req, res) => {
  const orderId = req.params.id;
  const orderIndex = orders.findIndex(o => o.id === orderId && o.user_id === req.user.id);

  if (orderIndex === -1) {
    return res.status(404).json({
      error: 'not_found',
      message: 'Order not found',
      status: 404
    });
  }

  // Check if order can be cancelled
  if (orders[orderIndex].status !== 'PENDING' && orders[orderIndex].status !== 'PROCESSING') {
    return res.status(400).json({
      error: 'bad_request',
      message: 'Order cannot be cancelled',
      status: 400
    });
  }

  // Update order status
  orders[orderIndex].status = 'CANCELLED';
  orders[orderIndex].updated_at = new Date().toISOString();

  res.json(orders[orderIndex]);
});

// Rental routes
app.get('/api/v1/rentals', authenticate, (req, res) => {
  // Get query parameters
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;

  // Filter rentals by user
  const userRentals = rentals.filter(rental => rental.user_id === req.user.id);

  // Calculate pagination
  const totalRentals = userRentals.length;
  const totalPages = Math.ceil(totalRentals / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedRentals = userRentals.slice(startIndex, endIndex);

  // Return response
  res.json({
    rentals: paginatedRentals,
    page,
    per_page: perPage,
    total: totalRentals,
    total_pages: totalPages
  });
});

app.get('/api/v1/rentals/:id', authenticate, (req, res) => {
  const rentalId = req.params.id;
  const rental = rentals.find(r => r.id === rentalId && r.user_id === req.user.id);

  if (!rental) {
    return res.status(404).json({
      error: 'not_found',
      message: 'Rental not found',
      status: 404
    });
  }

  res.json(rental);
});

app.post('/api/v1/rentals', authenticate, (req, res) => {
  const { items, shipping_address } = req.body;

  // Validate input
  if (!items || !items.length || !shipping_address) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Validation failed',
      status: 422,
      errors: [
        { field: !items || !items.length ? 'items' : 'shipping_address', message: 'This field is required' }
      ]
    });
  }

  // Create new rental
  const newRental = {
    id: `RNT-${1000 + rentals.length + 1}`,
    user_id: req.user.id,
    status: 'PENDING',
    total: items.reduce((sum, item) => sum + (item.rental_price * item.quantity * item.days), 0),
    items,
    shipping_address,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  rentals.push(newRental);

  res.status(201).json(newRental);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
