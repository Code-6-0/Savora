/**
 * Orders API Helper
 * Handles order creation and retrieval for Savora checkout flow
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create order and get Xendit invoice
 * @param {Object} orderData - Order data from checkout form
 * @returns {Promise<Object>} Order response with invoice URL
 */
export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: orderData.productId,
      quantity: orderData.quantity,
      billing_name: orderData.billingName,
      billing_email: orderData.billingEmail,
      billing_phone: orderData.billingPhone,
      customer_note: orderData.customerNote || '',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get order detail by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order detail with payment status
 */
export async function getOrderDetail(orderId) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Normalize order response for frontend consumption
 * @param {Object} order - Raw order from API
 * @returns {Object} Normalized order data
 */
export function normalizeOrder(order) {
  return {
    id: order.id || order.order_id,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentUrl: order.payment_url || order.invoice_url,
    pickupCode: order.pickup_code,
    pickupDeadline: order.pickup_deadline,
    reservedUntil: order.reserved_until,
    subtotal: order.subtotal,
    serviceFee: order.service_fee,
    totalPrice: order.total_price,
    product: order.product ? {
      id: order.product.id,
      name: order.product.name,
      rescuePrice: order.product.rescue_price,
      pickupAddress: order.product.pickup_address,
      photoUrl: order.product.photo_url,
    } : null,
  };
}
