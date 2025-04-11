/**
 * Data Models
 * 
 * This module provides data models and normalization functions for the application.
 */

/**
 * Normalize product data from API
 * 
 * @param {Object} product - Product data from API
 * @returns {Object} Normalized product data
 */
function normalizeProduct(product) {
  if (!product) return null;
  
  return {
    id: product.id,
    name: product.name || '',
    description: product.description || '',
    price: parseFloat(product.price) || 0,
    rental_price: product.rental_price ? parseFloat(product.rental_price) : null,
    category: product.category || '',
    image_url: product.image_url || '',
    stock: parseInt(product.stock) || 0,
    created_at: product.created_at || null,
    updated_at: product.updated_at || null,
    
    // Additional fields that might be in the real API
    sku: product.sku || '',
    brand: product.brand || '',
    weight: product.weight || null,
    dimensions: product.dimensions || null,
    features: Array.isArray(product.features) ? product.features : [],
    specifications: product.specifications || {},
    related_products: Array.isArray(product.related_products) ? product.related_products : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    is_featured: !!product.is_featured,
    discount_percentage: product.discount_percentage || 0,
    rating: product.rating || null,
    review_count: product.review_count || 0
  };
}

/**
 * Normalize order data from API
 * 
 * @param {Object} order - Order data from API
 * @returns {Object} Normalized order data
 */
function normalizeOrder(order) {
  if (!order) return null;
  
  return {
    id: order.id,
    user_id: order.user_id,
    status: order.status || 'PENDING',
    total: parseFloat(order.total) || 0,
    items: Array.isArray(order.items) ? order.items.map(item => ({
      id: item.id,
      name: item.name || '',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      subtotal: parseFloat(item.subtotal) || 0,
      product_id: item.product_id || null,
      image_url: item.image_url || null
    })) : [],
    shipping_address: order.shipping_address || {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    created_at: order.created_at || null,
    updated_at: order.updated_at || null,
    
    // Additional fields that might be in the real API
    order_number: order.order_number || order.id,
    payment_status: order.payment_status || 'PENDING',
    payment_method: order.payment_method || null,
    shipping_method: order.shipping_method || null,
    shipping_cost: parseFloat(order.shipping_cost) || 0,
    tax: parseFloat(order.tax) || 0,
    discount: parseFloat(order.discount) || 0,
    notes: order.notes || '',
    tracking_number: order.tracking_number || null,
    estimated_delivery: order.estimated_delivery || null,
    billing_address: order.billing_address || order.shipping_address || null,
    customer_name: order.customer_name || '',
    customer_email: order.customer_email || '',
    customer_phone: order.customer_phone || ''
  };
}

/**
 * Normalize rental data from API
 * 
 * @param {Object} rental - Rental data from API
 * @returns {Object} Normalized rental data
 */
function normalizeRental(rental) {
  if (!rental) return null;
  
  return {
    id: rental.id,
    user_id: rental.user_id,
    status: rental.status || 'PENDING',
    total: parseFloat(rental.total) || 0,
    items: Array.isArray(rental.items) ? rental.items.map(item => ({
      id: item.id,
      name: item.name || '',
      rental_price: parseFloat(item.rental_price) || 0,
      quantity: parseInt(item.quantity) || 1,
      days: parseInt(item.days) || 1,
      subtotal: parseFloat(item.subtotal) || 0,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      product_id: item.product_id || null,
      image_url: item.image_url || null
    })) : [],
    shipping_address: rental.shipping_address || {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    created_at: rental.created_at || null,
    updated_at: rental.updated_at || null,
    
    // Additional fields that might be in the real API
    rental_number: rental.rental_number || rental.id,
    payment_status: rental.payment_status || 'PENDING',
    payment_method: rental.payment_method || null,
    shipping_method: rental.shipping_method || null,
    shipping_cost: parseFloat(rental.shipping_cost) || 0,
    tax: parseFloat(rental.tax) || 0,
    discount: parseFloat(rental.discount) || 0,
    notes: rental.notes || '',
    deposit_amount: parseFloat(rental.deposit_amount) || 0,
    deposit_status: rental.deposit_status || 'PENDING',
    late_fee_rate: parseFloat(rental.late_fee_rate) || 0,
    damage_waiver: !!rental.damage_waiver,
    customer_name: rental.customer_name || '',
    customer_email: rental.customer_email || '',
    customer_phone: rental.customer_phone || ''
  };
}

/**
 * Normalize user data from API
 * 
 * @param {Object} user - User data from API
 * @returns {Object} Normalized user data
 */
function normalizeUser(user) {
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'CUSTOMER',
    
    // Additional fields that might be in the real API
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    company: user.company || '',
    profile_image: user.profile_image || null,
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
    payment_methods: Array.isArray(user.payment_methods) ? user.payment_methods : [],
    preferences: user.preferences || {},
    created_at: user.created_at || null,
    updated_at: user.updated_at || null,
    last_login: user.last_login || null,
    status: user.status || 'ACTIVE'
  };
}

/**
 * Prepare order data for API
 * 
 * @param {Object} orderData - Order data from frontend
 * @returns {Object} Prepared order data for API
 */
function prepareOrderData(orderData) {
  const prepared = {
    items: Array.isArray(orderData.items) ? orderData.items.map(item => ({
      product_id: item.product_id || (item.product ? item.product.id : null),
      quantity: parseInt(item.quantity) || 1
    })) : [],
    shipping_address: orderData.shipping_address || {},
    payment_method: orderData.payment_method || 'credit_card',
    payment_details: orderData.payment_details || {}
  };
  
  // Add optional fields if present
  if (orderData.billing_address) {
    prepared.billing_address = orderData.billing_address;
  }
  
  if (orderData.notes) {
    prepared.notes = orderData.notes;
  }
  
  if (orderData.shipping_method) {
    prepared.shipping_method = orderData.shipping_method;
  }
  
  return prepared;
}

/**
 * Prepare rental data for API
 * 
 * @param {Object} rentalData - Rental data from frontend
 * @returns {Object} Prepared rental data for API
 */
function prepareRentalData(rentalData) {
  const prepared = {
    items: Array.isArray(rentalData.items) ? rentalData.items.map(item => ({
      product_id: item.product_id || (item.product ? item.product.id : null),
      quantity: parseInt(item.quantity) || 1,
      start_date: item.start_date || item.rentalDates?.startDate,
      end_date: item.end_date || item.rentalDates?.endDate
    })) : [],
    shipping_address: rentalData.shipping_address || {},
    payment_method: rentalData.payment_method || 'credit_card',
    payment_details: rentalData.payment_details || {}
  };
  
  // Add optional fields if present
  if (rentalData.damage_waiver !== undefined) {
    prepared.damage_waiver = !!rentalData.damage_waiver;
  }
  
  if (rentalData.notes) {
    prepared.notes = rentalData.notes;
  }
  
  if (rentalData.shipping_method) {
    prepared.shipping_method = rentalData.shipping_method;
  }
  
  return prepared;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeProduct,
    normalizeOrder,
    normalizeRental,
    normalizeUser,
    prepareOrderData,
    prepareRentalData
  };
}
